import styles from './CompanyProfile.module.css';

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

interface CompanyProfileProps {
  company: Company;
}

export default function CompanyProfile({ company }: CompanyProfileProps) {
  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        {company.logo_url && (
          <img src={company.logo_url} alt={company.name} className={styles.logo} />
        )}
        <div>
          <h2 className={styles.name}>{company.name}</h2>
          <p className={styles.sector}>{company.sector}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.section}>
          <h3>Company Details</h3>
          <div className={styles.field}>
            <strong>Size:</strong> {company.size} employees
          </div>
          <div className={styles.field}>
            <strong>Sector:</strong> {company.sector}
          </div>
          <div className={styles.field}>
            <strong>Level:</strong> {company.level}
          </div>
          <div className={styles.field}>
            <strong>Points:</strong> {company.points}
          </div>
        </div>

        <div className={styles.section}>
          <h3>Services Offered</h3>
          <p>{company.services_offered}</p>
        </div>

        <div className={styles.section}>
          <h3>What We're Looking For</h3>
          <p>{company.needs}</p>
        </div>

        {company.description && (
          <div className={styles.section}>
            <h3>About Us</h3>
            <p>{company.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
