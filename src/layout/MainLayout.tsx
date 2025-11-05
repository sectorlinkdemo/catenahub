import { PropsWithChildren } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: PropsWithChildren) {
  const location = useLocation();

  return (
    <div className={styles.appShell} data-route={location.pathname}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
