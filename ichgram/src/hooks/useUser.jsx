import { useState, useEffect } from "react";
import API from "../api/axios.js";

const useUser = () => {
  const [user, setUser] = useState({
    username: null,
    avatarUrl: null,
    loading: true,
    error: null,
  });

  const fetchUser = async () => {
    setUser(prev => ({ ...prev, loading: true }));
    try {
      const res = await API.get("/users/me");
      setUser({
        username: res.data.username,
        avatarUrl: res.data.avatarUrl || null,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser({
        username: "Гость",
        avatarUrl: null,
        loading: false,
        error: err.response?.data?.message || "Ошибка при получении пользователя",
      });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { ...user, refreshUser: fetchUser };
};

export default useUser;