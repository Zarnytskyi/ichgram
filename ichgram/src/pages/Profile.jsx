import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { setPosts } from "../redux/slices/postSlice";
import useUser from "../hooks/useUser";
import styles from "../styles/pages/Profile.module.scss";

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: userLoading, data: currentUser } = useUser(); // { loading, data }

  const [bio, setBio] = useState("");
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);

      // Получаем данные пользователя
      const res = await API.get(`/users/me`);
      const data = res.data?.data || res.data?.user || res.data;

      if (!data) throw new Error("Пользователь не найден");

      setBio(data.bio || "");
      setFollowersCount(data.followers?.length || 0);
      setFollowingCount(data.following?.length || 0);

      // Получаем посты пользователя
      const postsRes = await API.get(`/posts/user/${userId}`);
      const postsData =
        postsRes.data?.data?.posts || postsRes.data?.posts || [];
      setUserPosts(postsData);

      dispatch(setPosts(postsData));
    } catch (err) {
      console.error("Ошибка загрузки профиля:", err);
      toast.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?._id) fetchProfile(currentUser._id);
  }, [currentUser?._id]);

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
      window.location.reload();
    } catch (err) {
      console.error("Ошибка логаута:", err);
      toast.error("Не удалось выйти");
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile"); // React Router
  };

  if (userLoading || loading)
    return <div className={styles.loader}>Загрузка...</div>;

  if (!currentUser)
    return <div className={styles.loader}>Профиль не найден</div>;

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <img
          src={currentUser.avatarUrl || "/default-avatar.png"}
          alt={currentUser.username || "avatar"}
          className={styles.avatar}
        />
        <div className={styles.info}>
          <h2>{currentUser.username || "Неизвестный"}</h2>
          <p>{bio || "Био не заполнено"}</p>
          <div className={styles.stats}>
            <span>{userPosts.length} постов</span>
            <span>{followersCount} подписчиков</span>
            <span>{followingCount} подписок</span>
          </div>
          <div className={styles.actions}>
            <button onClick={handleEditProfile}>Изменить профиль</button>
            <button onClick={handleLogout}>Выйти</button>
          </div>
        </div>
      </div>

      <div className={styles.posts}>
        {userPosts.length === 0 ? (
          <p>У вас пока нет постов</p>
        ) : (
          <div className={styles.postsGrid}>
            {userPosts.map((post) => (
              <div key={post._id} className={styles.postMini}>
                <img
                  src={post.image || post.images?.[0]?.url || "/no-image.png"}
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;