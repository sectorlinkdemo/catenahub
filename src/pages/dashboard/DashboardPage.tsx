import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import MatchCard from '../../components/MatchCard';
import CompanyProfile from '../../components/CompanyProfile';
import styles from './DashboardPage.module.css';

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
  const [activeTab, setActiveTab] = useState<'matches' | 'profile'>('matches');
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
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
      <div className={styles.container}>
        {/* Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🎯</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{matches.length}</div>
              <div className={styles.statLabel}>Total Matches</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⭐</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{currentCompany.points}</div>
              <div className={styles.statLabel}>Points</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>Level {currentCompany.level}</div>
              <div className={styles.statLabel}>Current Level</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🤝</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>
                {matches.filter((m) => m.status === 'mutual_match').length}
              </div>
              <div className={styles.statLabel}>Active Connections</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'matches' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('matches')}
          >
            <span>🎯</span> Matches
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>🏢</span> Company Profile
          </button>
        </div>

        {/* Content */}
        {activeTab === 'matches' && (
          <div className={styles.matchesGrid}>
            {matches.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>No matches yet</h3>
                <p>Check back soon for AI-generated company matches!</p>
              </div>
            ) : (
              matches.map((match) => {
                const otherCompany =
                  match.company_a_id === currentCompany.id ? match.company_b : match.company_a;
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    otherCompany={otherCompany}
                    currentCompanyId={currentCompany.id}
                  />
                );
              })
            )}
          </div>
        )}

        {activeTab === 'profile' && <CompanyProfile company={currentCompany} />}
      </div>
    </div>
  );
}
