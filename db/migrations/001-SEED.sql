- =====================================================
-- INITIAL DATA / SEED
-- =====================================================

-- Insert sample companies (verified for testing)
INSERT INTO companies (id, name, logo_url, size, sector, services_offered, needs, description, verification_status, verified_at, points, active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Teachify', '/assets/teachify_logo.png', '11-50', 'Education', 'Corporate English training, online language courses for businesses', 'Cloud hosting solutions, CRM software', 'We provide English language training for businesses across Europe with custom programmes for employees.', 'verified', NOW(), 150, true),
  ('22222222-2222-2222-2222-222222222222', 'CloudNet Solutions', NULL, '51-200', 'Technology', 'Cloud infrastructure, hosting, DevOps consulting', 'Marketing services, sales training', 'Enterprise cloud solutions provider specializing in scalable infrastructure for growing businesses.', 'verified', NOW(), 200, true),
  ('33333333-3333-3333-3333-333333333333', 'AlphaTech AI', NULL, '11-50', 'Technology', 'AI-powered language tools, NLP solutions', 'HR software partnerships, recruitment platforms', 'Building next-generation AI tools for language learning and business communication.', 'verified', NOW(), 120, true),
  ('44444444-4444-4444-4444-444444444444', 'GreenLeaf Consulting', NULL, '1-10', 'Consulting', 'Sustainability consulting, ESG reporting', 'Legal services, accounting software', 'Helping businesses transition to sustainable practices with data-driven insights.', 'verified', NOW(), 80, true),
  ('55555555-5555-5555-5555-555555555555', 'FinTech Innovators', NULL, '51-200', 'Finance', 'Payment processing, financial APIs', 'Cybersecurity services, compliance tools', 'Modern payment infrastructure for digital businesses.', 'verified', NOW(), 180, true);

-- Note: Users will be created via Supabase Auth signup, then linked to companies
-- After a user signs up through Supabase Auth, you'll need to insert a record into the users table
-- Example for manual testing (replace auth_id with actual Supabase auth.users UUID after signup):
-- INSERT INTO users (auth_id, email, full_name, company_id, is_primary_contact, can_approve_matches)
-- VALUES ('YOUR_AUTH_UUID', 'john@teachify.com', 'John Doe', '11111111-1111-1111-1111-111111111111', true, true);

-- Insert sample matches (for testing the swipe system)
INSERT INTO matches (company_a_id, company_b_id, match_score, match_reason, ai_generated, status, company_a_action, company_b_action) VALUES
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 85.5, 'Teachify needs cloud hosting, CloudNet needs training services', true, 'pending', 'pending', 'pending'),
  ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 78.0, 'Both in education/language space, potential partnership', true, 'pending', 'pending', 'pending'),
  ('22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 92.0, 'CloudNet can provide infrastructure for FinTech payment systems', true, 'company_a_liked', 'like', 'pending'),
  ('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 65.0, 'AI tools could help with ESG data analysis', true, 'pending', 'pending', 'pending');

-- Insert sample company tags
INSERT INTO company_tags (company_id, tag, tag_type) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Education', 'industry'),
  ('11111111-1111-1111-1111-111111111111', 'B2B', 'service'),
  ('11111111-1111-1111-1111-111111111111', 'SaaS', 'technology'),
  ('22222222-2222-2222-2222-222222222222', 'Cloud', 'technology'),
  ('22222222-2222-2222-2222-222222222222', 'DevOps', 'service'),
  ('22222222-2222-2222-2222-222222222222', 'Infrastructure', 'service'),
  ('33333333-3333-3333-3333-333333333333', 'AI', 'technology'),
  ('33333333-3333-3333-3333-333333333333', 'NLP', 'technology'),
  ('44444444-4444-4444-4444-444444444444', 'Sustainability', 'industry'),
  ('44444444-4444-4444-4444-444444444444', 'ESG', 'service'),
  ('55555555-5555-5555-5555-555555555555', 'FinTech', 'industry'),
  ('55555555-5555-5555-5555-555555555555', 'Payments', 'service');

-- Insert sample points transactions
INSERT INTO points_transactions (company_id, points, transaction_type, description, balance_after) VALUES
  ('11111111-1111-1111-1111-111111111111', 100, 'profile_completed', 'Completed company profile', 100),
  ('11111111-1111-1111-1111-111111111111', 50, 'meeting_attended', 'Attended meeting with CloudNet', 150),
  ('22222222-2222-2222-2222-222222222222', 100, 'profile_completed', 'Completed company profile', 100),
  ('22222222-2222-2222-2222-222222222222', 50, 'meeting_attended', 'Attended meeting with Teachify', 150),
  ('22222222-2222-2222-2222-222222222222', 50, 'meeting_attended', 'Attended meeting with FinTech Innovators', 200),
  ('33333333-3333-3333-3333-333333333333', 100, 'profile_completed', 'Completed company profile', 100),
  ('33333333-3333-3333-3333-333333333333', 20, 'bonus', 'Early adopter bonus', 120),
  ('44444444-4444-4444-4444-444444444444', 80, 'profile_completed', 'Completed company profile', 80),
  ('55555555-5555-5555-5555-555555555555', 100, 'profile_completed', 'Completed company profile', 100),
  ('55555555-5555-5555-5555-555555555555', 50, 'meeting_attended', 'Attended meeting with CloudNet', 150),
  ('55555555-5555-5555-5555-555555555555', 30, 'referral', 'Referred GreenLeaf Consulting', 180);

-- Insert sample leaderboard snapshot (current month)
INSERT INTO leaderboard_snapshots (period_type, period_start, period_end, company_id, rank, points, meetings_attended, matches_made) VALUES
  ('monthly', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, '22222222-2222-2222-2222-222222222222', 1, 200, 2, 1),
  ('monthly', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, '55555555-5555-5555-5555-555555555555', 2, 180, 1, 0),
  ('monthly', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, '11111111-1111-1111-1111-111111111111', 3, 150, 1, 2),
  ('monthly', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, '33333333-3333-3333-3333-333333333333', 4, 120, 0, 2),
  ('monthly', date_trunc('month', CURRENT_DATE), (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date, '44444444-4444-4444-4444-444444444444', 5, 80, 0, 1);
