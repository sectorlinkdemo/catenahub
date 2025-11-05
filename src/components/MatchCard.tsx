import { useState } from 'react';
import styles from './MatchCard.module.css';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  size: string;
  sector: string;
  services_offered: string;
  needs: string;
  description?: string;
}

interface Match {
  id: string;
  match_score: number;
  match_reason: string;
  status: string;
}

interface MatchCardProps {
  match: Match;
  otherCompany: Company;
  currentCompanyId: string;
}

export default function MatchCard({ match, otherCompany }: MatchCardProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '',
    time: '',
    type: 'virtual' as 'virtual' | 'in-person',
    notes: ''
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      pending: { label: 'New Match', color: '#3b82f6' },
      company_a_liked: { label: 'Interested', color: '#f59e0b' },
      company_b_liked: { label: 'Interested', color: '#f59e0b' },
      mutual_match: { label: 'Mutual Match', color: '#10b981' },
      company_a_passed: { label: 'Passed', color: '#6b7280' },
      company_b_passed: { label: 'Passed', color: '#6b7280' }
    };

    const badge = badges[status] || { label: status, color: '#6b7280' };
    return (
      <span className={styles.badge} style={{ backgroundColor: badge.color }}>
        {badge.label}
      </span>
    );
  };

  const handleBookMeeting = () => {
    setShowBooking(!showBooking);
  };

  const handleSubmitMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save meeting to Supabase
    console.log('Booking meeting:', meetingForm);
    alert('Meeting request sent! (This will be implemented with Supabase)');
    setShowBooking(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          {otherCompany.logo_url && (
            <img src={otherCompany.logo_url} alt={otherCompany.name} className={styles.logo} />
          )}
          <div>
            <h3 className={styles.companyName}>{otherCompany.name}</h3>
            <p className={styles.sector}>{otherCompany.sector}</p>
          </div>
        </div>
        {getStatusBadge(match.status)}
      </div>

      <div className={styles.matchScore}>
        <div className={styles.scoreCircle}>
          <svg className={styles.scoreRing} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeDasharray={`${match.match_score * 2.827} 282.7`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff6b35" />
                <stop offset="100%" stopColor="#f7931e" />
              </linearGradient>
            </defs>
          </svg>
          <div className={styles.scoreValue}>{match.match_score}%</div>
        </div>
        <p className={styles.scoreLabel}>Match Score</p>
      </div>

      <div className={styles.details}>
        <div className={styles.detailItem}>
          <strong>Size:</strong> {otherCompany.size} employees
        </div>
        <div className={styles.detailItem}>
          <strong>Offers:</strong> {otherCompany.services_offered}
        </div>
        <div className={styles.detailItem}>
          <strong>Needs:</strong> {otherCompany.needs}
        </div>
      </div>

      <div className={styles.reason}>
        <strong>Why this match?</strong>
        <p>{match.match_reason}</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnPrimary} onClick={handleBookMeeting}>
          📅 Book Meeting
        </button>
        <button className={styles.btnSecondary}>💬 Message</button>
      </div>

      {showBooking && (
        <div className={styles.bookingForm}>
          <h4>Schedule a Meeting</h4>
          <form onSubmit={handleSubmitMeeting}>
            <input
              type="text"
              placeholder="Meeting title"
              required
              className={styles.input}
              value={meetingForm.title}
              onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
            />
            <div className={styles.formRow}>
              <input
                type="date"
                required
                className={styles.input}
                value={meetingForm.date}
                onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
              />
              <input
                type="time"
                required
                className={styles.input}
                value={meetingForm.time}
                onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
              />
            </div>
            <select
              className={styles.input}
              value={meetingForm.type}
              onChange={(e) =>
                setMeetingForm({ ...meetingForm, type: e.target.value as 'virtual' | 'in-person' })
              }
            >
              <option value="virtual">Virtual Meeting</option>
              <option value="in-person">In-Person Meeting</option>
            </select>
            <textarea
              placeholder="Additional notes (optional)"
              rows={3}
              className={styles.textarea}
              value={meetingForm.notes}
              onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
            />
            <div className={styles.formActions}>
              <button type="submit" className={styles.btnPrimary}>
                Send Request
              </button>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => setShowBooking(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
