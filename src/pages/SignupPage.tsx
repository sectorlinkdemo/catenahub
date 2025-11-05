import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import styles from './SignupPage.module.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    companySize: '',
    servicesOffered: '',
    operationsOverview: '',
    connections: '',
    benefits: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Example: Insert into a 'companies' table in Supabase
      const { error: insertError } = await supabase.from('companies').insert([
        {
          name: formData.companyName,
          size: formData.companySize,
          services_offered: formData.servicesOffered,
          operations_overview: formData.operationsOverview,
          desired_connections: formData.connections,
          benefits: formData.benefits
        }
      ]);

      if (insertError) throw insertError;

      alert('Company profile submitted successfully!');
      navigate('/dashboard');
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
        <h1 className={styles.title}>Join Catena Hub</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="company-name" className={styles.label}>
            Company Name
          </label>
          <input
            type="text"
            id="company-name"
            name="company-name"
            placeholder="Enter your company name"
            required
            className={styles.input}
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          />

          <label htmlFor="company-size" className={styles.label}>
            Company Size (employees)
          </label>
          <select
            id="company-size"
            name="company-size"
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
            <option value="200+">200+</option>
          </select>

          <label htmlFor="services-offered" className={styles.label}>
            Services Offered
          </label>
          <textarea
            id="services-offered"
            name="services-offered"
            rows={3}
            placeholder="Describe what your company offers"
            required
            className={styles.textarea}
            value={formData.servicesOffered}
            onChange={(e) => setFormData({ ...formData, servicesOffered: e.target.value })}
          />

          <label htmlFor="operations-overview" className={styles.label}>
            General Operations Overview
          </label>
          <textarea
            id="operations-overview"
            name="operations-overview"
            rows={3}
            placeholder="Briefly describe your general operations"
            required
            className={styles.textarea}
            value={formData.operationsOverview}
            onChange={(e) => setFormData({ ...formData, operationsOverview: e.target.value })}
          />

          <label htmlFor="connections" className={styles.label}>
            Desired Connections (by industry)
          </label>
          <textarea
            id="connections"
            name="connections"
            rows={3}
            placeholder="Who would you like to connect with?"
            required
            className={styles.textarea}
            value={formData.connections}
            onChange={(e) => setFormData({ ...formData, connections: e.target.value })}
          />

          <label htmlFor="benefits" className={styles.label}>
            What Could Benefit Your Company?
          </label>
          <textarea
            id="benefits"
            name="benefits"
            rows={3}
            placeholder="Explain what you're looking for"
            required
            className={styles.textarea}
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}
