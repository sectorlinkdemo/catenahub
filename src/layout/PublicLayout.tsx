import { PropsWithChildren } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './PublicLayout.module.css';

export default function PublicLayout({ children }: PropsWithChildren) {
  return (
    <div className={styles.publicShell}>
      <Header />
      <main className={styles.main}>{children}</main>
      <Footer />
    </div>
  );
}
