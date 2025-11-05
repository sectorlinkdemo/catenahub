import { PropsWithChildren } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className={styles.dashboardShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/dashboard" className={styles.brand}>
            <img src="/assets/logo_catena.png" alt="Catena Hub" className={styles.logo} />
            <span className={styles.brandText}>Catena Hub</span>
          </Link>
          <div className={styles.headerActions}>
            <span className={styles.userEmail}>{user?.email}</span>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
