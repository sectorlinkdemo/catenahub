import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Unlock Cross-Sector
            <br />
            Partnerships
          </h1>
          <p className={styles.heroLead}>
            Connect with 50 businesses across industries. Collaborate, learn and grow together.
          </p>
          <Link to="/join" className="btn btn-primary">
            Join the first 25 free
          </Link>
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className="section-title">How It Works / Cómo funciona</h2>

          <div className={styles.cards}>
            <article className={styles.card}>
              <div className={styles.cardIcon}>🚀</div>
              <h3 className={styles.cardTitle}>Join / Únete</h3>
              <p className={styles.cardText}>
                Complete your company profile (1 minute).
                <br />
                Completa el perfil de tu empresa (1 minuto).
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardIcon}>🤝</div>
              <h3 className={styles.cardTitle}>Get Matched / Conexiones</h3>
              <p className={styles.cardText}>
                Every month, we pair your sector with another industry.
                <br />
                Cada mes, conectamos tu sector con otro diferente.
              </p>
            </article>

            <article className={styles.card}>
              <div className={styles.cardIcon}>💼</div>
              <h3 className={styles.cardTitle}>Meet & Collaborate / Reunirte</h3>
              <p className={styles.cardText}>
                We introduce you to 3–5 companies with potential synergies.
                <br />
                Te presentamos entre 3 y 5 empresas con posibles sinergias.
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
