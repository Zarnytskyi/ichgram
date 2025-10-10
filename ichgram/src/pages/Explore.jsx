import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import { Link } from "react-router-dom";
import styles from "../styles/pages/Explore.module.scss";

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const res = await API.get("/posts/all");
      setPosts(res.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchPosts();
}, []);


  if (loading) return <p>Loading...</p>;
  if (!posts.length) return <p>Тут пуста 😢 Создайте новый пост!</p>;

  return (
    <div className={styles.exploreContainer}>
      <div className={styles.exploreGrid}>
        {posts.map((post) => (
          <div key={post._id} className={styles.postCard}>
            <Link to={`/post/${post._id}`}>
              {post.images && post.images.length > 0 && (
                <img
                  src={post.images[0].url}
                  alt="Post"
                  className={styles.postImage}
                />
              )}
              <p>{post.caption || "Без описания"}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;