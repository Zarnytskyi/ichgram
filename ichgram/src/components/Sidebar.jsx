import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/components/Sidebar.module.scss';
import { 
    Home, Search, Compass, MessageCircle, Heart, PlusSquare, User 
} from 'lucide-react';

const navItems = [
  { name: 'Главная', icon: Home, path: '/' },
  { name: 'Поиск', icon: Search, path: '/search' },
  { name: 'Интересное', icon: Compass, path: '/explore' },
  { name: 'Сообщения', icon: MessageCircle, path: '/messages' },
  { name: 'Уведомления', icon: Heart, path: '/notifications' },
  { name: 'Создать', icon: PlusSquare, path: '/create' },
  { name: 'Профиль', icon: User, path: '/profile' },
];

const Sidebar = () => {
  return (
    <nav className={styles.sidebar}>
      <h1 className={styles.logo}>ICHCRAM</h1>
      <ul className={styles.navList}>
        {navItems.map((item) => (
          <li key={item.name} className={styles.navItem}>
            <NavLink 
              to={item.path} 
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
            >
              <item.icon size={24} className={styles.icon} />
              <span className={styles.text}>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;