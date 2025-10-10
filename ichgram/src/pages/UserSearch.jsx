import React, { useState, useEffect } from "react";
import API from "../api/axios";
import styles from "../styles/pages/UserSearch.module.scss";
import { toast } from "react-toastify";

const UserSearch = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/users/all");
      setUsers(res.data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  const handleFollow = async (userId) => {
    try {
      setSubscribing(userId);
      const res = await API.post(`/users/${userId}/follow`);
      toast.success(`Вы подписались на ${res.data.data.followedUser.username}`);
      
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isFollowing: true } : u
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при подписке");
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className={styles.userSearch}>
      <input
        type="text"
        placeholder="Поиск пользователей..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <div className={styles.userList}>
          {filteredUsers.length === 0 ? (
            <p className={styles.empty}>
              {query
                ? "По запросу никого не найдено."
                : "Нет пользователей для отображения."}
            </p>
          ) : (
            filteredUsers.map((user) => (
              <div key={user._id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <img
                    src={user.avatarUrl || "/default-avatar.png"}
                    alt={user.username || "user"}
                    className={styles.avatar}
                  />
                  <span>{user.username || "Неизвестный"}</span>
                </div>

                <div className={styles.buttons}>
                  <button
                    className={styles.profileBtn}
                    onClick={() =>
                      (window.location.href = `/profile/${user._id}`)
                    }
                  >
                    Профиль
                  </button>

                  {user.isFollowing ? (
                    <span className={styles.isFollowingText}>Вы подписаны</span>
                  ) : (
                    <button
                      className={styles.followBtn}
                      onClick={() => handleFollow(user._id)}
                      disabled={subscribing === user._id}
                    >
                      {subscribing === user._id ? "Подписка..." : "Подписаться"}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearch;