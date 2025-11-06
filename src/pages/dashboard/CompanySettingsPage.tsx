import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import styles from './CompanySettingsPage.module.css';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  job_title?: string;
  avatar_url?: string;
  is_active: boolean;
}

interface Department {
  id: string;
  name: string;
  description?: string;
  head_user_id?: string;
  is_active: boolean;
  member_count?: number;
}

interface Company {
  id: string;
  name: string;
  company_type: string;
  legal_name?: string;
  website_url?: string;
  employee_count?: number;
}

export default function CompanySettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'departments'>('overview');
  const [company, setCompany] = useState<Company | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('employee');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchCompanyData();
  }, [user]);

  const fetchCompanyData = async () => {
    try {
      // Get current user's profile and role
      const { data: profile } = await supabase
        .from('users')
        .select('company_id, role')
        .eq('auth_id', user!.id)
        .single();

      if (!profile) return;
      setCurrentUserRole(profile.role);

      // Fetch company details
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyData) setCompany(companyData);

      // Fetch team members
      const { data: members } = await supabase
        .from('users')
        .select('id, full_name, email, role, job_title, avatar_url, is_active')
        .eq('company_id', profile.company_id)
        .order('created_at');

      if (members) setTeamMembers(members);

      // Fetch departments
      const { data: depts } = await supabase
        .from('departments')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('name');

      if (depts) setDepartments(depts);
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const canManageTeam = ['owner', 'admin'].includes(currentUserRole);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!company) {
    return <div className={styles.loading}>Company not found</div>;
  }

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <h1>Company Settings</h1>
        <p className={styles.subtitle}>Manage your company profile, team, and departments</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'team' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Team ({teamMembers.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'departments' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('departments')}
        >
          Departments ({departments.length})
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className={styles.section}>
          <div className={styles.card}>
            <h2>Company Information</h2>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Company Name</label>
                <input type="text" value={company.name} readOnly className={styles.input} />
              </div>
              <div className={styles.field}>
                <label>Company Type</label>
                <select value={company.company_type} disabled className={styles.input}>
                  <option value="llc">LLC</option>
                  <option value="corporation">Corporation</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="partnership">Partnership</option>
                  <option value="nonprofit">Non-Profit</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Legal Name</label>
                <input
                  type="text"
                  value={company.legal_name || ''}
                  placeholder="Legal company name"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label>Website</label>
                <input
                  type="url"
                  value={company.website_url || ''}
                  placeholder="https://company.com"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label>Employee Count</label>
                <input
                  type="number"
                  value={company.employee_count || ''}
                  placeholder="Number of employees"
                  className={styles.input}
                />
              </div>
            </div>
            {canManageTeam && (
              <button className={styles.btnPrimary}>Save Changes</button>
            )}
          </div>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Team Members</h2>
            {canManageTeam && (
              <button className={styles.btnPrimary} onClick={() => setShowInviteModal(true)}>
                + Invite Member
              </button>
            )}
          </div>

          <div className={styles.teamGrid}>
            {teamMembers.map((member) => (
              <div key={member.id} className={styles.memberCard}>
                <div className={styles.memberAvatar}>
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.full_name} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {member.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={styles.memberInfo}>
                  <h3>{member.full_name}</h3>
                  <p className={styles.memberEmail}>{member.email}</p>
                  {member.job_title && <p className={styles.memberTitle}>{member.job_title}</p>}
                  <span className={`${styles.roleBadge} ${styles[member.role]}`}>
                    {member.role}
                  </span>
                </div>
                {canManageTeam && member.role !== 'owner' && (
                  <div className={styles.memberActions}>
                    <button className={styles.btnIcon} title="Edit">
                      ✏️
                    </button>
                    <button className={styles.btnIcon} title="Remove">
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments Tab */}
      {activeTab === 'departments' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Departments</h2>
            {canManageTeam && (
              <button className={styles.btnPrimary} onClick={() => setShowDeptModal(true)}>
                + Create Department
              </button>
            )}
          </div>

          <div className={styles.deptGrid}>
            {departments.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No departments yet. Create one to organize your team.</p>
              </div>
            ) : (
              departments.map((dept) => (
                <div key={dept.id} className={styles.deptCard}>
                  <h3>{dept.name}</h3>
                  {dept.description && <p className={styles.deptDesc}>{dept.description}</p>}
                  <div className={styles.deptMeta}>
                    <span>👥 {dept.member_count || 0} members</span>
                  </div>
                  {canManageTeam && (
                    <div className={styles.deptActions}>
                      <button className={styles.btnSecondary}>Manage</button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} companyId={company.id} />
      )}

      {/* Department Modal */}
      {showDeptModal && (
        <DepartmentModal
          onClose={() => setShowDeptModal(false)}
          companyId={company.id}
          onSuccess={fetchCompanyData}
        />
      )}
    </div>
  );
}

// Invite Modal Component
function InviteModal({ onClose, companyId }: { onClose: () => void; companyId: string }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement invite logic with Supabase
    console.log('Inviting:', { email, role, companyId });
    alert('Invite sent! (This will be implemented)');
    onClose();
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Invite Team Member</h2>
        <form onSubmit={handleInvite}>
          <div className={styles.field}>
            <label>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="colleague@company.com"
            />
          </div>
          <div className={styles.field}>
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={styles.input}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="representative">Representative</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              Send Invitation
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Department Modal Component
function DepartmentModal({
  onClose,
  companyId,
  onSuccess
}: {
  onClose: () => void;
  companyId: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('departments').insert([
        {
          company_id: companyId,
          name,
          description,
          is_active: true
        }
      ]);

      if (error) throw error;

      alert('Department created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating department:', error);
      alert('Failed to create department: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Create Department</h2>
        <form onSubmit={handleCreate}>
          <div className={styles.field}>
            <label>Department Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
              placeholder="e.g., Sales, Engineering, Marketing"
            />
          </div>
          <div className={styles.field}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="What does this department do?"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              Create Department
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
