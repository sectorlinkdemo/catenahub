import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companySize: '',
    sector: '',
    servicesOffered: '',
    operationsOverview: '',
    needs: '',
    email: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Insert company with pending verification status
      const { error: insertError } = await supabase.from('companies').insert([
        {
          name: formData.companyName,
          size: formData.companySize,
          sector: formData.sector,
          services_offered: formData.servicesOffered,
          operations_overview: formData.operationsOverview,
          needs: formData.needs,
          email: formData.email,
          website: formData.website,
          verification_status: 'pending',
          active: false
        }
      ]);

      if (insertError) throw insertError;

      alert(
        'Company application submitted successfully! You will receive an email once your company is verified.'
      );
      navigate('/auth/register');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Apply to Join Catena Hub</h1>
        <p className={styles.subtitle}>
          Submit your company details for verification. Once approved, you'll be able to create an
          account and start networking.
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="company-name" className={styles.label}>
            Company Name *
          </label>
          <input
            type="text"
            id="company-name"
            placeholder="Enter your company name"
            required
            className={styles.input}
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <label htmlFor="email" className={styles.label}>
            Company Email *
          </label>
          <input
            type="email"
            id="email"
            placeholder="contact@company.com"
            required
            className={styles.input}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <label htmlFor="website" className={styles.label}>
            Website
          </label>
          <input
            type="url"
            id="website"
            placeholder="https://yourcompany.com"
            className={styles.input}
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />

          <label htmlFor="company-size" className={styles.label}>
            Company Size (employees) *
          </label>
          <select
            id="company-size"
            required
            className={styles.select}
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="1-10">1–10</option>
            <option value="11-50">11–50</option>
            <option value="51-200">51–200</option>
            <option value="201-500">201–500</option>
            <option value="500+">500+</option>
          </select>

          <label htmlFor="sector" className={styles.label}>
            Sector/Industry *
          </label>
          <input
            type="text"
            id="sector"
            placeholder="e.g., Technology, Education, Finance"
            required
            className={styles.input}
            value={formData.sector}
            onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
          />

          <label htmlFor="services-offered" className={styles.label}>
            Services Offered *
          </label>
          <textarea
            id="services-offered"
            rows={3}
            placeholder="Describe what your company offers"
            required
            className={styles.textarea}
            value={formData.servicesOffered}
            onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
          />

          <label htmlFor="operations-overview" className={styles.label}>
            General Operations Overview *
          </label>
          <textarea
            id="operations-overview"
            rows={3}
            placeholder="Briefly describe your general operations"
            required
            className={styles.textarea}
            value={formData.operationsOverview}
            onChange={(e) => setFormData({ ...formData, operationsOverview: e.target.value })}
          />

          <label htmlFor="needs" className={styles.label}>
            What Are You Looking For? *
          </label>
          <textarea
            id="needs"
            rows={3}
            placeholder="What partnerships or services would benefit your company?"
            required
            className={styles.textarea}
            value={formData.needs}
            onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
