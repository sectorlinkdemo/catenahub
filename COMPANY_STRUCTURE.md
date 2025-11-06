# Company Structure & Multi-User System

## Overview

Complete multi-user company management system with departments, roles, and company types.

---

## Database Schema

### Company Types

Companies can be one of the following types:
- **LLC** — Limited Liability Company
- **Corporation** — Corporate entity
- **Sole Proprietor** — Individual business owner
- **Freelancer** — Independent contractor
- **Partnership** — Business partnership
- **Non-Profit** — Non-profit organization
- **Other** — Other business types

### User Roles

Users within a company have hierarchical roles:

1. **Owner** — Company founder/owner (full access)
   - Can manage all settings
   - Can add/remove users
   - Can appoint representatives
   - Can manage departments

2. **Admin** — Administrator
   - Can manage users and settings
   - Can create departments
   - Cannot remove owner

3. **Representative** — Authorized representative
   - Can approve matches and meetings
   - Can represent company in negotiations
   - Typically board members or executives

4. **Manager** — Department manager
   - Can manage their department
   - Can assign employees to their department

5. **Employee** — Regular employee
   - Can view company profile
   - Can participate in assigned departments

6. **Viewer** — Read-only access
   - Can only view information

---

## Features

### 1. Company Profile Management

**Fields:**
- Company name and legal name
- Company type (LLC, Corporation, etc.)
- Tax ID and registration number
- Website and LinkedIn URLs
- Address and location
- Employee count
- Founded year

**Access:**
- Owners and Admins can edit
- All members can view

### 2. Team Management

**Add Team Members:**
- Invite by email
- Assign role (Employee, Manager, Admin, etc.)
- Set job title
- Assign to departments

**Manage Members:**
- View all team members
- Edit roles and permissions
- Deactivate/remove members
- View activity history

**Team Invitations:**
- Generate unique invite tokens
- Set expiration dates
- Track invitation status

### 3. Department System

**Create Departments:**
- Name and description
- Assign department head
- Nested departments (sub-departments)
- Department capabilities

**Department Features:**
- Multiple users per department
- Users can be in multiple departments
- Primary department assignment
- Department-specific services/capabilities

**Use Cases:**
- Sales department offers "B2B Sales Services"
- Engineering department offers "Custom Software Development"
- Marketing department offers "Digital Marketing Campaigns"

When companies match, they can see which specific departments can help them.

### 4. Company Representatives

**Authorized Representatives:**
- Designated signatories
- Can approve contracts
- Can approve matches and meetings
- Authorization levels (1-5)
- Title (CEO, Managing Director, Board Member)

**Permissions:**
- `can_sign_contracts` — Legal authority
- `can_approve_matches` — Business development
- `can_approve_meetings` — Scheduling authority

### 5. Activity Logging

All company changes are logged:
- User additions/removals
- Role changes
- Department creations
- Representative appointments
- Profile updates

**Log Fields:**
- Action type
- User who performed action
- Entity affected (user, department, etc.)
- Timestamp
- Details (JSON)

---

## UI Components

### Company Settings Page

**3 Tabs:**

1. **Overview Tab**
   - Company information form
   - Edit company details
   - Save changes button

2. **Team Tab**
   - Grid of team member cards
   - Shows avatar, name, email, role
   - "Invite Member" button
   - Edit/remove actions (for admins)

3. **Departments Tab**
   - Grid of department cards
   - Shows name, description, member count
   - "Create Department" button
   - Manage button for each department

### Modals

**Invite Member Modal:**
- Email input
- Role selector
- Send invitation button

**Create Department Modal:**
- Department name
- Description textarea
- Create button

---

## Row Level Security (RLS)

### Departments
- Company members can view their company's departments
- Admins and owners can manage departments

### User Departments
- Users can view their own assignments
- Admins can manage assignments

### Department Capabilities
- Public read for verified companies
- Company admins can manage

### Company Representatives
- Company members can view
- Only owners can manage

### Team Invitations
- Admins can manage invitations

### Activity Log
- Company members can view their company's log

---

## Migration Instructions

1. **Run the migration:**
   ```sql
   -- In Supabase SQL Editor
   -- Copy/paste: db/migrations/003-COMPANY-STRUCTURE.sql
   -- Click "Run"
   ```

2. **Update existing companies:**
   ```sql
   -- Set company types for existing companies
   UPDATE companies 
   SET company_type = 'llc' 
   WHERE company_type IS NULL;
   ```

3. **Update existing users:**
   ```sql
   -- Ensure primary contacts are owners
   UPDATE users 
   SET role = 'owner' 
   WHERE is_primary_contact = true;
   ```

---

## Usage Examples

### Scenario 1: LLC with Board Members

**Company:** TechCorp LLC
- **Owner:** John Doe (CEO)
- **Representatives:**
  - Jane Smith (CFO) — can approve contracts
  - Bob Johnson (CTO) — can approve technical partnerships
- **Departments:**
  - Engineering (15 employees)
  - Sales (8 employees)
  - Marketing (5 employees)

### Scenario 2: Freelancer

**Company:** Maria's Design Studio
- **Type:** Freelancer
- **Owner:** Maria Garcia (Designer)
- **No departments** — Solo operation
- **Services:** Graphic Design, Branding

### Scenario 3: Corporation with Complex Structure

**Company:** GlobalTech Corporation
- **Type:** Corporation
- **Owner:** Board of Directors
- **Representatives:**
  - CEO (authorization level 5)
  - Regional Directors (authorization level 3)
- **Departments:**
  - North America Sales
    - East Coast Sales (sub-department)
    - West Coast Sales (sub-department)
  - Europe Operations
  - Product Development
  - Customer Success

---

## Matching with Departments

When Company A needs help from Company B:

1. **View Match:**
   - See Company B's departments
   - See what each department offers

2. **Request Specific Department:**
   - "We need help from your Engineering department"
   - Representative from that department gets notified

3. **Book Meeting:**
   - Select department
   - Meeting request goes to department head
   - Representative can approve

---

## API Endpoints (Future)

### Get Company Structure
```typescript
GET /api/companies/:id/structure
Response: {
  company: {...},
  departments: [...],
  representatives: [...]
}
```

### Invite Team Member
```typescript
POST /api/companies/:id/invite
Body: { email, role, department_id }
```

### Create Department
```typescript
POST /api/companies/:id/departments
Body: { name, description, head_user_id }
```

---

## Next Steps

1. **Implement invite system** — Send email invitations
2. **Department management UI** — Assign users to departments
3. **Representative approval flow** — Workflow for match approvals
4. **Department-specific matching** — Match based on department capabilities
5. **Activity feed UI** — Show recent company activity
6. **Permission checks** — Enforce role-based access in UI

---

## Security Notes

- All tables have RLS enabled
- Users can only access their own company data
- Owners have full control
- Admins have limited management access
- Representatives have approval authority only
- Regular employees have read access
