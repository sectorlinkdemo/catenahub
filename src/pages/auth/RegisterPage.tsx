import { FormEvent, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import styles from './LoginPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([]);

  // Fetch verified companies on mount
  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase
        .from('companies')
        .select('id, name')
        .eq('verification_status', 'verified')
        .eq('active', true)
        .order('name');

      if (data) setCompanies(data);
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.companyId) {
      setError('Please select a company');
      setLoading(false);
      return;
    }

    // Sign up with Supabase Auth
    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.fullName
    );

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Get the newly created auth user
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      // Create user record in public.users table
      const { error: userError } = await supabase.from('users').insert([
        {
          auth_id: user.id,
          email: formData.email,
          full_name: formData.fullName,
          company_id: formData.companyId,
          is_primary_contact: false,
          can_approve_matches: true
        }
      ]);

      if (userError) {
        console.error('Error creating user record:', userError);
        setError('Account created but failed to link to company. Please contact support.');
        setLoading(false);
        return;
      }

      alert('Account created successfully!');
      navigate('/auth/login');
    } else {
      setError('Failed to create account. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join Catena Hub and start networking</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="fullName" className={styles.label}>
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            placeholder="John Doe"
            required
            className={styles.input}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="you@company.com"
            required
            className={styles.input}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <label htmlFor="companyId" className={styles.label}>
            Company
          </label>
          <select
            id="companyId"
            required
            className={styles.input}
            value={formData.companyId}
            onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
          >
            <option value="">Select your company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>

          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            required
            minLength={6}
            className={styles.input}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="••••••••"
            required
            minLength={6}
            className={styles.input}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/auth/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
