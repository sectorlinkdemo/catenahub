import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copyright}>© {currentYear} Catena Hub</span>
        <nav className={styles.links} aria-label="Footer navigation">
          <Link to="/privacy" className={styles.link}>
            Privacy
          </Link>
          <Link to="/terms" className={styles.link}>
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
