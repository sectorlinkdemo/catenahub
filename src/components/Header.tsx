import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/join', label: 'Join' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/signup', label: 'Signup' }
];

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          <img src="/assets/logo_catena.png" alt="Catena Hub" className={styles.logo} />
          <span className={styles.brandText}>Catena Hub</span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : undefined]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <a
          href="https://app.supabase.com/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.loginBtn}
        >
          Login
        </a>
      </div>
    </header>
  );
}
