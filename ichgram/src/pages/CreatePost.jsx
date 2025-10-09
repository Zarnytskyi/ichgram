import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UploadCloud, Smile } from 'lucide-react';
import API from '../api/axios';
import { addPost } from '../redux/slices/postSlice';
import useUser from '../hooks/useUser';
import styles from '../styles/pages/CreatePost.module.scss';

const CreatePost = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username, avatarUrl, loading: userLoading } = useUser();

  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (userLoading) return <div>Loading user...</div>;

  const openFileDialog = () => {
    const input = document.getElementById('imageUpload');
    if (!input) return;
    input.value = null;
    input.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Пожалуйста, выберите изображение.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('caption', caption);

    try {
      const res = await API.post('/posts/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPost = res.data.post;
      dispatch(addPost(newPost));

      toast.success('Пост успешно создан!');
      setCaption('');
      setImageFile(null);
      const input = document.getElementById('imageUpload');
      if (input) input.value = null;

      navigate('/home');
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка при создании поста.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPostWrapper}>
      <header className={styles.header}>
        <h2>Создать новый пост</h2>
        <button
          onClick={handleSubmit}
          className={styles.shareButton}
          disabled={loading || !imageFile}
        >
          {loading ? 'Публикация...' : 'Поделиться'}
        </button>
      </header>

      <div className={styles.contentContainer}>
        <div className={styles.imageSection}>
          {imageFile ? (
            <>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Предпросмотр"
                className={styles.imagePreview}
              />
              <button
                type="button"
                onClick={openFileDialog}
                className={styles.reselectButton}
              >
                Выбрать другую фотографию
              </button>
            </>
          ) : (
            <div className={styles.uploadBox} onClick={openFileDialog}>
              <UploadCloud size={64} color="#dbdbdb" />
              <p>Загрузите фотографию здесь</p>
            </div>
          )}
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatar}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Аватар" />
              ) : (
                <div className={styles.defaultAvatar}></div>
              )}
            </div>
            <span className={styles.username}>{username}</span>
          </div>

          <textarea
            value={caption}
            onChange={(e) => {
              if (e.target.value.length <= 200) setCaption(e.target.value);
            }}
            placeholder="Добавьте подпись..."
            className={styles.captionInput}
          />
          <div className={styles.footer}>
            <span className={styles.charCount}>{caption.length}/200</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
