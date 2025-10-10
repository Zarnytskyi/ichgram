import { useState, useEffect } from "react";
import API from "../api/axios.js";

const useUser = () => {
  const [user, setUser] = useState({ loading: true, data: null });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/me"); // убедись, что роут такой
        setUser({
          loading: false,
          data: {
            _id: res.data._id,          // обязательно _id
            username: res.data.username,
            avatarUrl: res.data.profilePicture || "/default-avatar.png",
          },
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        setUser({ loading: false, data: null });
      }
    };
    fetchUser();
  }, []);

  return user;
};

export default useUser;
