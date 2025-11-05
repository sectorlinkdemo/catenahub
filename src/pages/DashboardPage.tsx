import { useState } from 'react';
import { mockPeople, mockMessages, mockCompanies } from '../data/mockData';
import styles from './DashboardPage.module.css';

type Section = 'people' | 'chat' | 'profile' | 'announcements' | 'calendar' | 'files';

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<Section>('people');
  const [searchQuery, setSearchQuery] = useState('');

  const currentCompany = mockCompanies.find((c) => c.id === 'teachify');

  const filteredPeople = mockPeople.filter((person) =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.profile}>
          <img src="/assets/user.jpg" alt="Profile" />
        </div>
        <nav className={styles.navIcons} aria-label="Dashboard navigation">
          <button
            onClick={() => setActiveSection('people')}
            title="People"
            className={activeSection === 'people' ? styles.active : ''}
          >
            👥
          </button>
          <button
            onClick={() => setActiveSection('chat')}
            title="Chat"
            className={activeSection === 'chat' ? styles.active : ''}
          >
            🤝
          </button>
          <button
            onClick={() => setActiveSection('announcements')}
            title="Announcements"
            className={activeSection === 'announcements' ? styles.active : ''}
          >
            📣
          </button>
          <button
            onClick={() => setActiveSection('calendar')}
            title="Calendar"
            className={activeSection === 'calendar' ? styles.active : ''}
          >
            🗓️
          </button>
          <button
            onClick={() => setActiveSection('files')}
            title="Files"
            className={activeSection === 'files' ? styles.active : ''}
          >
            📂
          </button>
          <button
            onClick={() => setActiveSection('profile')}
            title="Company Profile"
            className={activeSection === 'profile' ? styles.active : ''}
          >
            <img src="/assets/teachify_logo.png" alt="Teachify" />
          </button>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        {activeSection === 'people' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>People</div>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <select className={styles.sortSelect}>
                <option value="A-Z">Sort A–Z</option>
                <option value="Z-A">Sort Z–A</option>
              </select>
            </div>
            {filteredPeople.map((person) => (
              <article key={person.id} className={styles.personCard}>
                <h4 className={styles.personName}>{person.name}</h4>
                <p>
                  Email: <a href={`mailto:${person.email}`}>{person.email}</a>
                </p>
                <p>Company: {person.company}</p>
                <p>Sector: {person.sector}</p>
                <p>Offers: {person.offers}</p>
                <p>Needs: {person.needs}</p>
              </article>
            ))}
          </section>
        )}

        {activeSection === 'chat' && (
          <section className={styles.section}>
            <div className={styles.chatHeader}>Chat with CloudNet Provider</div>
            {mockMessages.map((msg) => (
              <div key={msg.id} className={styles.message}>
                <span
                  className={styles.sender}
                  style={{
                    color: msg.senderId === 'teachify' ? '#d846a0' : '#ff6b35'
                  }}
                >
                  {msg.sender}
                </span>
                <span className={styles.time}>{msg.timestamp}</span>
                <p>{msg.content}</p>
              </div>
            ))}
          </section>
        )}

        {activeSection === 'profile' && currentCompany && (
          <section className={styles.section}>
            <div className={styles.profileSection}>
              <h3 className={styles.profileTitle}>{currentCompany.name}</h3>
              <p>
                <strong>Company Name:</strong> {currentCompany.name}
              </p>
              <p>
                <strong>Size:</strong> {currentCompany.size} employees
              </p>
              <p>
                <strong>Sector:</strong> {currentCompany.sector}
              </p>
              <p>
                <strong>Offers:</strong> {currentCompany.offers}
              </p>
              <p>
                <strong>Needs:</strong> {currentCompany.needs}
              </p>
              <p>
                <strong>Description:</strong> {currentCompany.description}
              </p>
            </div>
          </section>
        )}

        {activeSection === 'announcements' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Announcements</div>
            <p className={styles.placeholder}>No announcements yet.</p>
          </section>
        )}

        {activeSection === 'calendar' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Calendar</div>
            <p className={styles.placeholder}>Your upcoming events will appear here.</p>
          </section>
        )}

        {activeSection === 'files' && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>Files</div>
            <p className={styles.placeholder}>No files shared yet.</p>
          </section>
        )}
      </main>
    </div>
  );
}
