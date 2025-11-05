# Catena Hub Database Schema Overview

## Core Concept

Catena Hub is a B2B social networking platform with:
- **Company verification workflow** (pending → verified)
- **AI-powered matching** (Tinder-style swipe mechanism)
- **Gamification system** (points, levels, leaderboard)
- **Meeting scheduling & tracking**
- **Points-based currency** for rewarding collaboration

---

## Table Relationships

```
companies (1) ──< users (many)
    │
    ├──< matches (many, as company_a or company_b)
    │     │
    │     ├──< meetings (many)
    │     └──< messages (many)
    │
    ├──< points_transactions (many)
    ├──< leaderboard_snapshots (many)
    ├──< company_tags (many)
    └──< ai_match_queue (many)

users (1) ──< notifications (many)
users (1) ──< messages (many, as sender)
```

---

## Table Descriptions

### `companies`
**Purpose**: Core business entity  
**Key Fields**:
- `verification_status`: pending | verified | rejected | suspended
- `points`: Gamification score
- `level`: Derived from points
- `services_offered`, `needs`: Used by AI matching
- `search_vector`: Full-text search optimization

**Workflow**:
1. Company submits application → `verification_status = 'pending'`
2. Admin reviews → sets to `verified` or `rejected`
3. Only verified companies appear in matching pool

---

### `users`
**Purpose**: People representing companies (linked to Supabase Auth)  
**Key Fields**:
- `auth_id`: Links to `auth.users` (Supabase Auth)
- `company_id`: Which company they represent
- `is_primary_contact`: Main decision-maker
- `can_approve_matches`: Permission to accept/reject matches

**Usage**:
- Multiple users per company
- Primary contact gets notifications for matches/meetings

---

### `matches`
**Purpose**: Tinder-style company pairing system  
**Key Fields**:
- `company_a_id`, `company_b_id`: The two companies
- `match_score`: AI confidence (0-100)
- `status`: pending | company_a_liked | company_b_liked | mutual_match | passed | expired
- `company_a_action`, `company_b_action`: like | pass | pending
- `ai_generated`: True if created by n8n automation

**Workflow**:
1. AI/n8n creates match → `status = 'pending'`
2. Company A swipes → `company_a_action = 'like'` → `status = 'company_a_liked'`
3. Company B swipes → `company_b_action = 'like'` → trigger updates `status = 'mutual_match'`
4. If either passes → match expires

**Trigger**: `update_match_status()` auto-updates status based on actions

---

### `meetings`
**Purpose**: Scheduled meetings between matched companies  
**Key Fields**:
- `match_id`: Which match this meeting is for
- `status`: scheduled | confirmed | completed | cancelled | no-show
- `company_a_attended`, `company_b_attended`: Attendance tracking
- `points_awarded`: Whether points were given
- `outcome`: successful | neutral | unsuccessful

**Points Logic**:
- Both attend → each company gets points (via `points_transactions`)
- No-show → potential penalty
- Successful outcome → bonus points

---

### `messages`
**Purpose**: Chat between matched companies  
**Key Fields**:
- `match_id`: Conversation context
- `sender_id`: User who sent message
- `sender_company_id`: Which company the sender represents
- `message_type`: text | system | meeting_invite | file

**RLS**: Users can only see messages in their company's matches

---

### `points_transactions`
**Purpose**: Ledger for all point movements  
**Key Fields**:
- `company_id`: Who earned/spent points
- `points`: Amount (positive or negative)
- `transaction_type`: meeting_attended | profile_completed | referral | bonus | penalty | redemption
- `balance_after`: Running total

**Trigger**: `update_company_points()` syncs `companies.points` on insert

**Use Cases**:
- Meeting attended: +50 points
- Profile completed: +10 points
- Referral: +25 points
- Future: Redeem points for premium features

---

### `leaderboard_snapshots`
**Purpose**: Periodic rankings for performance  
**Key Fields**:
- `period_type`: weekly | monthly | quarterly | yearly | all-time
- `rank`: Position in leaderboard
- `points`: Total for period
- `meetings_attended`: Count for period

**Usage**:
- Cron job creates snapshots at period end
- Display "Top 10 This Month" in UI
- Historical tracking

---

### `notifications`
**Purpose**: In-app alerts for users  
**Key Fields**:
- `notification_type`: new_match | meeting_scheduled | meeting_reminder | points_earned | message_received
- `related_match_id`, `related_meeting_id`: Context links
- `action_url`: Deep link to relevant page

**Workflow**:
- Trigger on match creation → notify both companies
- Trigger on meeting scheduled → notify attendees
- Trigger on points earned → notify company

---

### `company_tags`
**Purpose**: Categorization for filtering/search  
**Key Fields**:
- `tag`: e.g., "SaaS", "AI", "Healthcare", "B2B"
- `tag_type`: industry | service | technology | interest

**Usage**:
- Filter matches by tags
- AI uses tags for better matching

---

### `ai_match_queue`
**Purpose**: Queue for n8n automation to process  
**Key Fields**:
- `company_id`: Company to find matches for
- `status`: pending | processing | completed | failed
- `priority`: 1-10 (higher = process first)

**Workflow**:
1. New verified company → insert into queue with `priority = 10`
2. n8n polls queue → picks highest priority pending
3. n8n runs AI matching → creates `matches` records
4. Updates queue status to `completed`

---

## Key Triggers & Functions

### `update_updated_at_column()`
Auto-updates `updated_at` timestamp on row changes.

### `update_company_points()`
Syncs `companies.points` when `points_transactions` inserted.

### `update_match_status()`
Auto-transitions match status based on swipe actions:
- Both like → `mutual_match`
- One pass → `company_x_passed`

---

## Row Level Security (RLS)

### Companies
- **Read**: Public can view verified companies
- **Write**: Users can update their own company

### Matches
- **Read**: Companies see matches involving them
- **Write**: Companies can update their swipe action

### Messages
- **Read/Write**: Only participants in the match

### Points Transactions
- **Read**: Companies see their own transactions

### Leaderboard
- **Read**: Public (for transparency)

### AI Match Queue
- **All**: Service role only (for n8n)

---

## Integration Points

### n8n Automation
1. **New Company Verification**:
   - Webhook on `companies.verification_status = 'verified'`
   - Insert into `ai_match_queue`

2. **Match Generation**:
   - Poll `ai_match_queue` where `status = 'pending'`
   - Run AI scoring algorithm
   - Insert top matches into `matches` table

3. **Meeting Reminders**:
   - Cron job checks `meetings` where `scheduled_at` is in 24h
   - Insert `notifications` for attendees

### Frontend Integration
- **Signup**: Insert into `companies` with `verification_status = 'pending'`
- **Dashboard**: Query `matches` where `status IN ('pending', 'company_a_liked', 'company_b_liked')`
- **Swipe**: Update `matches.company_x_action` → trigger handles status
- **Chat**: Insert/query `messages` by `match_id`
- **Leaderboard**: Query `leaderboard_snapshots` for current period

---

## Next Steps

1. **Run Migration**: Execute `001-INIT.sql` in Supabase SQL Editor
2. **Verify Tables**: Check all tables created with correct schema
3. **Test RLS**: Try queries as authenticated user
4. **Seed Data**: Add sample companies for testing
5. **Update Frontend**: Replace mock data with Supabase queries
6. **Setup n8n**: Configure webhooks and cron jobs
7. **Deploy**: Test end-to-end workflow

---

## Sample Queries

### Get pending matches for a company
```sql
SELECT m.*, 
       ca.name as company_a_name,
       cb.name as company_b_name
FROM matches m
JOIN companies ca ON m.company_a_id = ca.id
JOIN companies cb ON m.company_b_id = cb.id
WHERE (m.company_a_id = 'YOUR_COMPANY_ID' OR m.company_b_id = 'YOUR_COMPANY_ID')
  AND m.status = 'pending'
ORDER BY m.match_score DESC;
```

### Get leaderboard for current month
```sql
SELECT l.rank, c.name, l.points, l.meetings_attended
FROM leaderboard_snapshots l
JOIN companies c ON l.company_id = c.id
WHERE l.period_type = 'monthly'
  AND l.period_start = date_trunc('month', CURRENT_DATE)
ORDER BY l.rank ASC
LIMIT 10;
```

### Award points for meeting attendance
```sql
-- Insert transaction
INSERT INTO points_transactions (company_id, points, transaction_type, meeting_id, balance_after)
SELECT company_id, 50, 'meeting_attended', meeting_id, 
       (SELECT points FROM companies WHERE id = company_id) + 50
FROM (VALUES ('company_uuid', 'meeting_uuid')) AS v(company_id, meeting_id);

-- Trigger automatically updates companies.points
```
