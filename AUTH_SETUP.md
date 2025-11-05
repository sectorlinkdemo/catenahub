# Authentication Setup Guide

## Overview

The app now has a complete authentication system with:
- Login/Register pages
- Protected routes (dashboard requires auth)
- Auth context for global user state
- Integration with Supabase Auth + custom users table

---

## How to Test

### 1. Run the Migration

First, execute the database migration in Supabase:

1. Open Supabase dashboard → **SQL Editor**
2. Copy/paste `db/migrations/001-INIT.sql`
3. Click "Run"
4. Verify all tables created successfully

This will create:
- 5 sample companies (Teachify, CloudNet, AlphaTech, GreenLeaf, FinTech)
- Sample matches between companies
- Points transactions
- Leaderboard data

### 2. Enable Email Auth in Supabase

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. **Disable** email confirmation for testing:
   - Go to **Authentication** > **Email Templates**
   - Under "Confirm signup", toggle **Enable email confirmations** to OFF
4. This allows instant login without email verification

### 3. Create a Test User

**Option A: Via Register Page**

1. Navigate to `http://localhost:8080/auth/register`
2. Fill in the form:
   - **Full Name**: John Doe
   - **Email**: john@teachify.com
   - **Company**: Select "Teachify" from dropdown
   - **Password**: password123
   - **Confirm Password**: password123
3. Click "Sign Up"
4. The app will:
   - Create auth user in `auth.users`
   - Create user record in `public.users` linked to Teachify
   - Redirect to login page

**Option B: Manual SQL Insert**

If you want to link an existing Supabase auth user:

```sql
-- First, sign up via Supabase Auth UI or the register page
-- Then get the auth user ID from auth.users table
-- Finally, insert into public.users:

INSERT INTO users (auth_id, email, full_name, company_id, is_primary_contact, can_approve_matches)
VALUES (
  'YOUR_AUTH_UUID_HERE',  -- Get from auth.users after signup
  'john@teachify.com',
  'John Doe',
  '11111111-1111-1111-1111-111111111111',  -- Teachify company ID
  true,
  true
);
```

### 4. Login and Test

1. Navigate to `http://localhost:8080/auth/login`
2. Enter credentials:
   - **Email**: john@teachify.com
   - **Password**: password123
3. Click "Sign In"
4. You'll be redirected to `/dashboard`

### 5. Verify Dashboard Data

Once logged in, the dashboard will show:

- **Matches tab**: 
  - Shows 2 matches for Teachify (with CloudNet and AlphaTech)
  - Match scores, reasons, and status
  - Search functionality

- **Profile tab**:
  - Teachify company details
  - Points: 150
  - Level: 1
  - Services offered and needs

- **Header**:
  - "Sign Out" button (replaces "Login")

---

## Authentication Flow

### Registration
1. User fills form on `/auth/register`
2. `signUp()` creates Supabase auth user
3. App inserts record into `public.users` table linking auth_id → company_id
4. User redirected to login

### Login
1. User enters credentials on `/auth/login`
2. `signIn()` authenticates with Supabase
3. Auth context updates with user session
4. User redirected to `/dashboard`

### Protected Routes
1. `ProtectedRoute` component checks auth state
2. If not logged in → redirect to `/auth/login`
3. If logged in → render protected page

### Dashboard Data Loading
1. Get current auth user from context
2. Query `users` table by `auth_id` to get user profile
3. Query `companies` table by `company_id` to get company data
4. Query `matches` table for company's matches
5. Display real data in UI

---

## Row Level Security (RLS)

The migration includes RLS policies:

- **Companies**: Public can view verified companies
- **Users**: Can only see own profile and company members
- **Matches**: Can only see matches involving their company
- **Messages**: Can only see messages in their matches

This ensures users can only access their own data.

---

## Testing Different Companies

To test with different companies:

1. Register multiple users with different company selections
2. Each user will see their company's matches
3. For example:
   - User A → Teachify → sees matches with CloudNet, AlphaTech
   - User B → CloudNet → sees matches with Teachify, FinTech

---

## Seed Data Summary

### Companies (5 total)
- **Teachify** (Education) - 150 points
- **CloudNet Solutions** (Tech) - 200 points
- **AlphaTech AI** (Tech) - 120 points
- **GreenLeaf Consulting** (Consulting) - 80 points
- **FinTech Innovators** (Finance) - 180 points

### Matches (4 total)
- Teachify ↔ CloudNet (85.5% match, pending)
- Teachify ↔ AlphaTech (78% match, pending)
- CloudNet ↔ FinTech (92% match, CloudNet liked)
- AlphaTech ↔ GreenLeaf (65% match, pending)

---

## Next Steps

1. **Test the full flow**: Register → Login → View Dashboard
2. **Verify RLS**: Try accessing other companies' data (should fail)
3. **Add more features**:
   - Swipe actions (like/pass on matches)
   - Real-time chat
   - Meeting scheduling
   - Points system UI
   - Leaderboard page
4. **Setup n8n automation** for AI matching

---

## Troubleshooting

### "No company profile found"
- Make sure you selected a company during registration
- Check `users` table has `company_id` set
- Verify company exists in `companies` table

### "Cannot read properties of null"
- Supabase credentials missing in `.env`
- Auth session expired (sign out and back in)

### RLS errors
- Check policies are created correctly
- Verify user has `auth_id` matching `auth.users`
- Try disabling RLS temporarily for debugging

### Email confirmation required
- Disable email confirmations in Supabase dashboard
- Or check spam folder for confirmation email
