import React from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import styles from '../styles/components/Layout.module.scss';

const Layout = ({ children }) => {
  return (
    <div className={styles.layoutWrapper}>
      <Sidebar />

      <main className={styles.mainContent}>
        {children}
      </main>

      <Footer /> 
    </div>
  );
};

export default Layout;