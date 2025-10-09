import React from 'react';
import styles from '../styles/components/Footer.module.scss';

const Footer = () => {
  const links = ['Home', 'Search', 'Explore', 'Messages', 'Notifications', 'Create'];

  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {links.map(link => (
          <a href="#" key={link} className={styles.link}>{link}</a>
        ))}
      </div>
      <p className={styles.copyright}>
        &copy; 2025 ICHCRAM
      </p>
    </footer>
  );
};

export default Footer;