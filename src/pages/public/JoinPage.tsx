import { Link } from 'react-router-dom';
import styles from './JoinPage.module.css';

export default function JoinPage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Join Catena Hub / Únete a Catena Hub</h1>
        <div className={styles.formContainer}>
          <iframe
            src="https://forms.gle/REPLACE_WITH_FORM_URL"
            width="100%"
            height="900"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Join Catena Hub Form"
          >
            Loading…
          </iframe>
        </div>
        <p className={styles.backLink}>
          <Link to="/" className="btn btn-outline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
}
