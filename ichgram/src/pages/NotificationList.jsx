import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import styles from "../styles/components/NotificationsList.module.scss";

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("/notifications"); // путь /notifications
        setNotifications(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, []);

  if (!notifications.length) return <p className={styles.empty}>Уведомлений нет</p>;

  return (
    <div className={styles.notificationsList}>
      {notifications.map((n) => (
        <div key={n._id} className={styles.notificationItem}>
          <img 
            src={n.sender?.avatarUrl || "/default-avatar.png"} 
            alt={n.sender?.username || "Аватар"} 
            className={styles.avatar} 
          />
          <div className={styles.content}>
            <p className={styles.message}>{n.message}</p>
            <small className={styles.timestamp}>
              {new Date(n.createdAt).toLocaleString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationsList;
