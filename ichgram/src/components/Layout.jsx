import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import styles from '../styles/components/Layout.module.scss';

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />

      <div className={styles.mainArea}>
        <main className={styles.mainContent}>{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
