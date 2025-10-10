import React, { useState, useEffect } from "react";
import API from "../api/axios";
import { toast } from "react-toastify";
import styles from "../styles/pages/EditProfile.module.scss";

const EditProfile = () => {
  const [userData, setUserData] = useState({
    username: "",
    website: "",
    about: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const fetchUser = async () => {
    try {
      const res = await API.get("/users/me");
      const data = res.data?.data?.user || res.data?.user || {};
      setUserData({
        username: data.username || "",
        website: data.website || "",
        about: data.about || "",
        avatarUrl: data.avatarUrl || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const preview = URL.createObjectURL(selectedFile);
      setPreviewUrl(preview);
    }
  };

  const handleSave = async () => {
  setSaving(true);
  const formData = new FormData();
  formData.append("username", userData.username);
  formData.append("website", userData.website);
  formData.append("about", userData.about);
  if (file) formData.append("avatar", file);

  try {
    await API.post("/users/edit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    toast.success("Профиль обновлён");
    fetchUser();
  } catch (err) {
    console.error(err);
    toast.error("Не удалось обновить профиль");
  } finally {
    setSaving(false);
  }
};


  if (loading) return <div className={styles.loader}>Загрузка...</div>;

  return (
    <div className={styles.editProfile}>
      <h2>Edit profile</h2>

      <div className={styles.avatarSection}>
        <img
          src={previewUrl || userData.avatarUrl || "/default-avatar.png"}
          alt="avatar"
          className={styles.avatar}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <label>Username</label>
      <input
        type="text"
        name="username"
        value={userData.username}
        onChange={handleChange}
      />

      <label>About</label>
      <textarea
        name="about"
        maxLength={150}
        value={userData.about}
        onChange={handleChange}
      />

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
};

export default EditProfile;
