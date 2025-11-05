-- Fix infinite recursion in users table RLS policies

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their company members" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create fixed policies that don't cause recursion
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth_id = auth.uid());

-- For viewing company members, we'll handle this in the application layer
-- or create a separate view/function to avoid recursion
-- For now, users can only see their own profile via RLS
