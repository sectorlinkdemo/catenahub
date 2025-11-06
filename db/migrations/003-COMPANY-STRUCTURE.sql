-- =====================================================
-- COMPANY STRUCTURE & MULTI-USER MANAGEMENT
-- =====================================================

-- Create enum types first
CREATE TYPE company_type_enum AS ENUM (
  'llc',
  'corporation', 
  'sole_proprietor',
  'freelancer',
  'partnership',
  'nonprofit',
  'other'
);

-- Add company type and structure fields to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS company_type company_type_enum DEFAULT 'llc',
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Poland';

-- User roles within a company
CREATE TYPE user_role_enum AS ENUM (
  'owner',           -- Company owner/founder (full access)
  'admin',           -- Administrator (can manage users and settings)
  'representative',  -- Authorized representative (can approve matches, meetings)
  'manager',         -- Department manager
  'employee',        -- Regular employee
  'viewer'           -- Read-only access
);

-- Update users table with enhanced fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role user_role_enum DEFAULT 'employee',
ADD COLUMN IF NOT EXISTS job_title VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing primary contacts to be owners
UPDATE users 
SET role = 'owner' 
WHERE is_primary_contact = true;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  head_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_departments_company ON departments(company_id);
CREATE INDEX idx_departments_head ON departments(head_user_id);
CREATE INDEX idx_departments_parent ON departments(parent_department_id);

-- User-Department assignments (users can be in multiple departments)
CREATE TABLE IF NOT EXISTS user_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

CREATE INDEX idx_user_departments_user ON user_departments(user_id);
CREATE INDEX idx_user_departments_dept ON user_departments(department_id);

-- Department capabilities/services (what each department offers)
CREATE TABLE IF NOT EXISTS department_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  capability_name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dept_capabilities ON department_capabilities(department_id);

-- Company representatives (authorized signatories)
CREATE TABLE IF NOT EXISTS company_representatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255), -- e.g., "CEO", "Managing Director", "Board Member"
  can_sign_contracts BOOLEAN DEFAULT false,
  can_approve_matches BOOLEAN DEFAULT true,
  can_approve_meetings BOOLEAN DEFAULT true,
  authorization_level INTEGER DEFAULT 1, -- 1=low, 5=high
  appointed_date DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_reps_company ON company_representatives(company_id);
CREATE INDEX idx_company_reps_user ON company_representatives(user_id);

-- Team invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role_enum DEFAULT 'employee',
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_invitations_company ON team_invitations(company_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);

-- Activity log for company changes
CREATE TABLE IF NOT EXISTS company_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g., 'user_added', 'department_created', 'role_changed'
  entity_type VARCHAR(50), -- 'user', 'department', 'representative'
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_company ON company_activity_log(company_id);
CREATE INDEX idx_activity_log_created ON company_activity_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Departments: Company members can view their company's departments
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view departments"
  ON departments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can manage departments"
  ON departments FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- User departments: Users can view their assignments
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view department assignments"
  ON user_departments FOR SELECT
  USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR department_id IN (
      SELECT d.id FROM departments d
      JOIN users u ON d.company_id = u.company_id
      WHERE u.auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage department assignments"
  ON user_departments FOR ALL
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN users u ON d.company_id = u.company_id
      WHERE u.auth_id = auth.uid() AND u.role IN ('owner', 'admin', 'manager')
    )
  );

-- Department capabilities: Public read for verified companies
ALTER TABLE department_capabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view department capabilities"
  ON department_capabilities FOR SELECT
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN companies c ON d.company_id = c.id
      WHERE c.verification_status = 'verified' AND c.active = true
    )
  );

CREATE POLICY "Company admins can manage capabilities"
  ON department_capabilities FOR ALL
  USING (
    department_id IN (
      SELECT d.id FROM departments d
      JOIN users u ON d.company_id = u.company_id
      WHERE u.auth_id = auth.uid() AND u.role IN ('owner', 'admin')
    )
  );

-- Company representatives: Company members can view
ALTER TABLE company_representatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view representatives"
  ON company_representatives FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage representatives"
  ON company_representatives FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE auth_id = auth.uid() AND role = 'owner'
    )
  );

-- Team invitations: Admins can manage
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
  ON team_invitations FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE auth_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Activity log: Company members can view
ALTER TABLE company_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company members can view activity log"
  ON company_activity_log FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_enum;
  v_is_rep BOOLEAN;
BEGIN
  -- Get user role
  SELECT role INTO v_role FROM users WHERE id = p_user_id;
  
  -- Check if user is a representative
  SELECT EXISTS(
    SELECT 1 FROM company_representatives 
    WHERE user_id = p_user_id AND is_active = true
  ) INTO v_is_rep;
  
  -- Permission logic
  CASE p_permission
    WHEN 'manage_users' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'approve_matches' THEN
      RETURN v_role IN ('owner', 'admin', 'representative') OR v_is_rep;
    WHEN 'manage_departments' THEN
      RETURN v_role IN ('owner', 'admin');
    WHEN 'view_company' THEN
      RETURN TRUE; -- All company members
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log activity
CREATE OR REPLACE FUNCTION log_company_activity(
  p_company_id UUID,
  p_user_id UUID,
  p_action VARCHAR,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO company_activity_log (
    company_id, user_id, action, entity_type, entity_id, details
  ) VALUES (
    p_company_id, p_user_id, p_action, p_entity_type, p_entity_id, p_details
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update users.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
