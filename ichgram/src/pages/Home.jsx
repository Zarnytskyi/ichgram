import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../api/axios";
import { toast } from "react-toastify";
import { setPosts } from "../redux/slices/postSlice";
import { toggleLike } from "../redux/slices/likeSlice";
import useUser from "../hooks/useUser";
import styles from "../styles/pages/HomePage.module.scss";

const Home = () => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts.posts || []);
  const likes = useSelector((state) => state.likes.likedPostIds || {});
  const { loading: userLoading, data: currentUser } = useUser();
  const currentUserId = currentUser?._id;

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState({});
  const [postingComment, setPostingComment] = useState({});
  const [subscribing, setSubscribing] = useState(null);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await API.get("/posts/feed");
      const feedPosts = res.data?.data?.posts || [];
      const recs = res.data?.data?.recommendations || [];

      const normalized = feedPosts.map((p) => ({
        ...p,
        author: {
          _id: p.author?._id || null,
          username: p.author?.username || "Неизвестный",
          avatarUrl: p.author?.avatarUrl || p.author?.profilePicture || "/default-avatar.png",
        },
        comments: p.comments?.map((c) => ({
          _id: c._id,
          text: c.text,
          author: {
            _id: c.user?._id || null,
            username: c.user?.username || "Неизвестный",
            avatarUrl: c.user?.avatarUrl || c.user?.profilePicture || "/default-avatar.png",
          },
        })) || [],
        likes: p.likes || [],
        images: p.images || [],
      }));

      dispatch(setPosts(normalized));
      setRecommendations(recs);
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить ленту.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handleLike = async (postId) => {
    dispatch(toggleLike(postId));
    dispatch({
      type: "posts/setPosts",
      payload: posts.map((p) =>
        p._id === postId
          ? {
              ...p,
              likes: likes[postId]
                ? (p.likes || []).slice(0, -1)
                : [...(p.likes || []), currentUserId],
            }
          : p
      ),
    });

    try {
      await API.post(`/posts/${postId}/like`);
    } catch (err) {
      console.error(err);
      dispatch(toggleLike(postId));
      fetchFeed();
      toast.error("Не удалось поставить лайк");
    }
  };

  const handleAddComment = async (postId) => {
    const text = (commentText[postId] || "").trim();
    if (!text) return;

    setPostingComment((s) => ({ ...s, [postId]: true }));

    try {
      const res = await API.post(`/comments/${postId}`, { text });
      const updatedPost = res.data?.data;

      dispatch({
        type: "posts/setPosts",
        payload: posts.map((p) => (p._id === postId ? updatedPost : p)),
      });

      setCommentText((s) => ({ ...s, [postId]: "" }));
    } catch (err) {
      console.error("Ошибка добавления комментария:", err);
      toast.error("Не удалось добавить комментарий");
    } finally {
      setPostingComment((s) => ({ ...s, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await API.delete(`/comments/${postId}/${commentId}`);
      if (res.data?.data) {
        dispatch({
          type: "posts/setPosts",
          payload: posts.map((p) => (p._id === postId ? res.data.data : p)),
        });
      } else {
        fetchFeed();
      }
      toast.success("Комментарий удалён");
    } catch (err) {
      console.error("Ошибка удаления комментария:", err);
      toast.error("Не удалось удалить комментарий");
    }
  };

  const handleFollow = async (userId) => {
    try {
      setSubscribing(userId);
      const res = await API.post(`/users/${userId}/follow`);
      toast.success(`Вы подписались на ${res.data.data.followedUser.username}`);
      setRecommendations((prev) => prev.filter((u) => u._id !== userId));
      fetchFeed();
    } catch (err) {
      console.error(err);
      toast.error("Ошибка при подписке");
    } finally {
      setSubscribing(null);
    }
  };

  if (userLoading || loading) return <div className={styles.loader}>Загрузка...</div>;

  const postFeedContent = (
    <div>
      {posts.map((post) => (
        <div key={post._id} className={styles.post}>
          <div className={styles.header}>
            <img src={post.author?.avatarUrl || "/default-avatar.png"} alt={post.author?.username || "avatar"} className={styles.avatar} />
            <span className={styles.username}>{post.author?.username || "Неизвестный"}</span>
          </div>

          <img src={post.images?.[0]?.url || "/no-image.png"} alt="" className={styles.postImage} />
          <p className={styles.caption}>{post.caption}</p>

          <div className={styles.actions}>
            <button onClick={() => handleLike(post._id)}>
              {likes[post._id] ? "💖" : "🤍"} {(post.likes || []).length}
            </button>
          </div>

          <div className={styles.comments}>
            {(post.comments || []).map((c) => (
              <div key={c._id} className={styles.comment}>
                <b>{c.author?.username || "Неизвестный"}:</b> {c.text}
                {currentUserId &&
                  (String(c.author?._id) === String(currentUserId) ||
                    String(post.author?._id) === String(currentUserId)) && (
                      <button onClick={() => handleDeleteComment(post._id, c._id)} className={styles.deleteCommentBtn}>
                        Удалить
                      </button>
                    )}
              </div>
            ))}

            <div className={styles.addComment}>
              <input
                type="text"
                placeholder="Написать комментарий..."
                value={commentText[post._id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [post._id]: e.target.value })}
              />
              <button onClick={() => handleAddComment(post._id)} disabled={postingComment[post._id]}>
                {postingComment[post._id] ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const recommendationsSidebar = (
    <div className={styles.sidebar}>
      <h3>Рекомендации для вас</h3>
      <div className={styles.recommendations}>
        {recommendations.map((user) => (
          <div key={user._id} className={styles.userCard}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={user.avatarUrl || "/default-avatar.png"} alt={user.username || "user"} className={styles.avatar} />
              <p>{user.username || "Неизвестный"}</p>
            </div>
            <button onClick={() => handleFollow(user._id)} disabled={subscribing === user._id}>
              {subscribing === user._id ? "Подписка..." : "Подписаться"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.feed}>
      {posts.length === 0 ? (
        <div className={styles.emptyFeed}>
          <h2>Тут пока тихо 😴</h2>
          <p>Подпишитесь на пользователей, чтобы видеть их посты.</p>
          {recommendations.length > 0 && recommendationsSidebar}
        </div>
      ) : (
        <>
          {postFeedContent}
          {recommendations.length > 0 && recommendationsSidebar}
        </>
      )}
    </div>
  );
};

export default Home;