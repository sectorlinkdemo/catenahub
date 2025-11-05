-- =====================================================
-- Catena Hub Database Schema
-- Social platform for B2B networking with AI matching
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Companies table: Main entity for businesses on the platform
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic Information
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  
  -- Company Details
  size TEXT CHECK (size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  sector TEXT NOT NULL,
  industry TEXT,
  location_country TEXT,
  location_city TEXT,
  
  -- Business Profile
  description TEXT,
  services_offered TEXT NOT NULL,
  operations_overview TEXT,
  desired_connections TEXT,
  needs TEXT,
  benefits TEXT,
  
  -- Verification & Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  
  -- Gamification
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(sector, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(services_offered, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) STORED
);

-- Users/Contacts table: People representing companies
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Auth (links to Supabase auth.users)
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Info
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT,
  avatar_url TEXT,
  
  -- Company Relationship
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  is_primary_contact BOOLEAN DEFAULT false,
  
  -- Permissions
  can_approve_matches BOOLEAN DEFAULT false,
  can_schedule_meetings BOOLEAN DEFAULT true,
  
  -- Metadata
  active BOOLEAN DEFAULT true,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table: AI-generated or manual company pairings (Tinder-style)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Companies involved
  company_a_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_b_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Match Details
  match_score DECIMAL(5,2) CHECK (match_score >= 0 AND match_score <= 100),
  match_reason TEXT,
  ai_generated BOOLEAN DEFAULT true,
  generated_by UUID REFERENCES users(id),
  
  -- Status tracking (Tinder-style swipe logic)
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'company_a_liked', 'company_b_liked', 'mutual_match', 'company_a_passed', 'company_b_passed', 'expired')),
  company_a_action TEXT CHECK (company_a_action IN ('like', 'pass', 'pending')),
  company_b_action TEXT CHECK (company_b_action IN ('like', 'pass', 'pending')),
  company_a_action_at TIMESTAMP WITH TIME ZONE,
  company_b_action_at TIMESTAMP WITH TIME ZONE,
  
  -- Match lifecycle
  matched_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  
  -- Notes
  notes TEXT,
  
  CONSTRAINT different_companies CHECK (company_a_id != company_b_id),
  CONSTRAINT unique_match UNIQUE (company_a_id, company_b_id)
);

-- Meetings table: Scheduled meetings between matched companies
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Related match
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- Meeting Details
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  location TEXT,
  meeting_url TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('virtual', 'in-person', 'hybrid')),
  
  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no-show')),
  cancelled_reason TEXT,
  
  -- Attendance tracking
  company_a_attended BOOLEAN,
  company_b_attended BOOLEAN,
  company_a_confirmed BOOLEAN DEFAULT false,
  company_b_confirmed BOOLEAN DEFAULT false,
  
  -- Points awarded
  points_awarded BOOLEAN DEFAULT false,
  points_amount INTEGER DEFAULT 0,
  
  -- Follow-up
  follow_up_notes TEXT,
  outcome TEXT CHECK (outcome IN ('successful', 'neutral', 'unsuccessful', 'pending'))
);

-- Messages table: Chat between matched companies
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Conversation context
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  
  -- Sender
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Content
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'meeting_invite', 'file')),
  
  -- Attachments
  attachment_url TEXT,
  attachment_type TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE
);

-- Points Transactions table: Track all point movements
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Company
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Transaction details
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('meeting_attended', 'meeting_hosted', 'profile_completed', 'referral', 'bonus', 'penalty', 'redemption')),
  description TEXT,
  
  -- Related entities
  meeting_id UUID REFERENCES meetings(id),
  related_company_id UUID REFERENCES companies(id),
  
  -- Balance tracking
  balance_after INTEGER NOT NULL
);

-- Leaderboard table: Periodic snapshots for performance
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Period
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly', 'quarterly', 'yearly', 'all-time')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Company ranking
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  points INTEGER NOT NULL,
  meetings_attended INTEGER DEFAULT 0,
  matches_made INTEGER DEFAULT 0,
  
  CONSTRAINT unique_company_period UNIQUE (company_id, period_type, period_start)
);

-- Notifications table: System notifications for users
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('new_match', 'meeting_scheduled', 'meeting_reminder', 'points_earned', 'message_received', 'verification', 'system')),
  
  -- Related entities
  related_match_id UUID REFERENCES matches(id),
  related_meeting_id UUID REFERENCES meetings(id),
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Action
  action_url TEXT
);

-- Company Tags table: For categorization and filtering
CREATE TABLE company_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  tag_type TEXT CHECK (tag_type IN ('industry', 'service', 'technology', 'interest', 'custom')),
  
  CONSTRAINT unique_company_tag UNIQUE (company_id, tag)
);

-- AI Match Queue table: For n8n automation processing
CREATE TABLE ai_match_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Company to process
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Results
  matches_generated INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Priority
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Companies
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_verification ON companies(verification_status);
CREATE INDEX idx_companies_active ON companies(active) WHERE active = true;
CREATE INDEX idx_companies_points ON companies(points DESC);
CREATE INDEX idx_companies_search ON companies USING gin(search_vector);

-- Users
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_auth ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- Matches
CREATE INDEX idx_matches_company_a ON matches(company_a_id);
CREATE INDEX idx_matches_company_b ON matches(company_b_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_created ON matches(created_at DESC);
CREATE INDEX idx_matches_pending ON matches(status) WHERE status = 'pending';

-- Meetings
CREATE INDEX idx_meetings_match ON meetings(match_id);
CREATE INDEX idx_meetings_scheduled ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);

-- Messages
CREATE INDEX idx_messages_match ON messages(match_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Points Transactions
CREATE INDEX idx_points_company ON points_transactions(company_id);
CREATE INDEX idx_points_created ON points_transactions(created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- Company Tags
CREATE INDEX idx_company_tags_company ON company_tags(company_id);
CREATE INDEX idx_company_tags_tag ON company_tags(tag);

-- AI Match Queue
CREATE INDEX idx_ai_queue_status ON ai_match_queue(status) WHERE status = 'pending';
CREATE INDEX idx_ai_queue_priority ON ai_match_queue(priority DESC, created_at ASC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update company points when transaction is added
CREATE OR REPLACE FUNCTION update_company_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies
  SET points = NEW.balance_after
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_points_on_transaction AFTER INSERT ON points_transactions
  FOR EACH ROW EXECUTE FUNCTION update_company_points();

-- Auto-update match status when both companies act
CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If both liked, set to mutual_match
  IF NEW.company_a_action = 'like' AND NEW.company_b_action = 'like' THEN
    NEW.status = 'mutual_match';
    NEW.matched_at = NOW();
  -- If either passed, mark accordingly
  ELSIF NEW.company_a_action = 'pass' THEN
    NEW.status = 'company_a_passed';
  ELSIF NEW.company_b_action = 'pass' THEN
    NEW.status = 'company_b_passed';
  -- If only one liked
  ELSIF NEW.company_a_action = 'like' AND NEW.company_b_action = 'pending' THEN
    NEW.status = 'company_a_liked';
  ELSIF NEW.company_b_action = 'like' AND NEW.company_a_action = 'pending' THEN
    NEW.status = 'company_b_liked';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER match_status_trigger BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_match_status();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_queue ENABLE ROW LEVEL SECURITY;

-- Companies: Public read for verified, authenticated write
CREATE POLICY "Public can view verified companies"
  ON companies FOR SELECT
  USING (verification_status = 'verified' AND active = true);

CREATE POLICY "Authenticated users can insert companies"
  ON companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own company"
  ON companies FOR UPDATE
  USING (id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

-- Users: Can read own profile and company members
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Users can view their company members"
  ON users FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- Matches: Can view matches involving their company
CREATE POLICY "Companies can view their matches"
  ON matches FOR SELECT
  USING (
    company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Companies can update their match actions"
  ON matches FOR UPDATE
  USING (
    company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
  );

-- Meetings: Can view meetings for their matches
CREATE POLICY "Users can view their meetings"
  ON meetings FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
         OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can create meetings for their matches"
  ON meetings FOR INSERT
  WITH CHECK (
    match_id IN (
      SELECT id FROM matches
      WHERE company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
         OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their meetings"
  ON meetings FOR UPDATE
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
         OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Messages: Can read/write messages in their matches
CREATE POLICY "Users can view messages in their matches"
  ON messages FOR SELECT
  USING (
    match_id IN (
      SELECT id FROM matches
      WHERE company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
         OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT id FROM users WHERE auth_id = auth.uid())
    AND match_id IN (
      SELECT id FROM matches
      WHERE company_a_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
         OR company_b_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid())
    )
  );

-- Points Transactions: Can view own company transactions
CREATE POLICY "Companies can view their points transactions"
  ON points_transactions FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));

-- Leaderboard: Public read
CREATE POLICY "Public can view leaderboard"
  ON leaderboard_snapshots FOR SELECT
  USING (true);

-- Notifications: Can view own notifications
CREATE POLICY "Users can view their notifications"
  ON notifications FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update their notifications"
  ON notifications FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Company Tags: Can view tags for visible companies
CREATE POLICY "Public can view tags for verified companies"
  ON company_tags FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE verification_status = 'verified' AND active = true));

-- AI Match Queue: Service role only (for n8n automation)
CREATE POLICY "Service role can manage AI queue"
  ON ai_match_queue FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Users can view their company members"
  ON users FOR SELECT
  USING (company_id IN (SELECT company_id FROM users WHERE auth_id = auth.uid()));