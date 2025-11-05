import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import styles from './DashboardPage.module.css';

type Section = 'people' | 'chat' | 'profile' | 'announcements' | 'calendar' | 'files';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
}

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  size: string;
  sector: string;
  services_offered: string;
  needs: string;
  description?: string;
  points: number;
  level: number;
}

interface Match {
  id: string;
  company_a_id: string;
  company_b_id: string;
  match_score: number;
  match_reason: string;
  status: string;
  company_a: Company;
  company_b: Company;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);

          // Fetch company
          const { data: company } = await supabase
            .from('companies')
            .select('*')
            .eq('id', profile.company_id)
            .single();

          if (company) {
            setCurrentCompany(company);

            // Fetch matches for this company
            const { data: matchesData } = await supabase
              .from('matches')
              .select(
                `
                *,
                company_a:companies!matches_company_a_id_fkey(*),
                company_b:companies!matches_company_b_id_fkey(*)
              `
              )
              .or(`company_a_id.eq.${company.id},company_b_id.eq.${company.id}`)
              .order('created_at', { ascending: false });

            if (matchesData) {
              setMatches(matchesData as Match[]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const filteredMatches = matches.filter((match) => {
    const otherCompany =
      match.company_a_id === currentCompany?.id ? match.company_b : match.company_a;
    return otherCompany.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!currentCompany) {
    return (
      <div className={styles.loading}>
        <p>No company profile found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.profile}>
          <img src="/assets/user.jpg" alt="Profile" />
        </div>
        <nav className={styles.navIcons} aria-label="Dashboard navigation">
          <button
            onClick={() => setActiveSection('people')}
            title="People"
            className={activeSection === 'people' ? styles.active : ''}
          >
            👥
          </button>
          <button
            onClick={() => setActiveSection('chat')}
            title="Chat"
            className={activeSection === 'chat' ? styles.active : ''}
          >
            🤝
          </button>
          <button
            onClick={() => setActiveSection('announcements')}
            title="Announcements"
            className={activeSection === 'announcements' ? styles.active : ''}
          >
            📣
          </button>
          <button
            onClick={() => setActiveSection('calendar')}
            title="Calendar"
            className={activeSection === 'calendar' ? styles.active : ''}
          >
            🗓️
          </button>
          <button
            onClick={() => setActiveSection('files')}
            title="Files"
            className={activeSection === 'files' ? styles.active : ''}
          >
            📂
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            title="Company Profile"
            className={activeSection === 'profile' ? styles.active : ''}
          >
            <img src="/assets/teachify_logo.png" alt="Teachify" />
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {activeSection === 'people' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Matches ({matches.length})</div>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <select className={styles.sortSelect}>
                <option value="score">Sort by Score</option>
                <option value="recent">Most Recent</option>
              </select>
            </div>
            {filteredMatches.length === 0 ? (
              <p className={styles.placeholder}>No matches found. Check back soon!</p>
            ) : (
              filteredMatches.map((match) => {
                const otherCompany =
                  match.company_a_id === currentCompany.id ? match.company_b : match.company_a;
                return (
                  <article key={match.id} className={styles.personCard}>
                    <h4 className={styles.personName}>{otherCompany.name}</h4>
                    <p>
                      <strong>Match Score:</strong> {match.match_score}%
                    </p>
                    <p>
                      <strong>Sector:</strong> {otherCompany.sector}
                    </p>
                    <p>
                      <strong>Offers:</strong> {otherCompany.services_offered}
                    </p>
                    <p>
                      <strong>Needs:</strong> {otherCompany.needs}
                    </p>
                    <p>
                      <strong>Reason:</strong> {match.match_reason}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span style={{ textTransform: 'capitalize' }}>
                        {match.status.replace(/_/g, ' ')}
                      </span>
                    </p>
                  </article>
                );
              })
            )}
          </section>
        )}

        {activeSection === 'chat' && (
          <section className={styles.section}>
            <div className={styles.chatHeader}>Messages</div>
            <p className={styles.placeholder}>
              Chat feature coming soon. Select a match to start messaging.
            </p>
          </section>
        )}

        {activeSection === 'profile' && (
          <section className={styles.section}>
            <div className={styles.profileSection}>
              <h3 className={styles.profileTitle}>{currentCompany.name}</h3>
              {currentCompany.logo_url && (
                <img
                  src={currentCompany.logo_url}
                  alt={currentCompany.name}
                  style={{ width: '100px', marginBottom: '1rem' }}
                />
              )}
              <p>
                <strong>Size:</strong> {currentCompany.size} employees
              </p>
              <p>
                <strong>Sector:</strong> {currentCompany.sector}
              </p>
              <p>
                <strong>Services Offered:</strong> {currentCompany.services_offered}
              </p>
              <p>
                <strong>Needs:</strong> {currentCompany.needs}
              </p>
              {currentCompany.description && (
                <p>
                  <strong>Description:</strong> {currentCompany.description}
                </p>
              )}
              <p>
                <strong>Points:</strong> {currentCompany.points}
              </p>
              <p>
                <strong>Level:</strong> {currentCompany.level}
              </p>
            </div>
          </section>
        )}

        {activeSection === 'announcements' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Announcements</div>
            <p className={styles.placeholder}>No announcements yet.</p>
          </section>
        )}

        {activeSection === 'calendar' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Calendar</div>
            <p className={styles.placeholder}>Your upcoming events will appear here.</p>
          </section>
        )}

        {activeSection === 'files' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Files</div>
            <p className={styles.placeholder}>No files shared yet.</p>
          </section>
        )}
      </main>
    </div>
  );
}
