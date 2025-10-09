import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import styles from "../styles/pages/SignUp.module.scss";

import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.email || !form.password || !form.gender) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/register", form);
      toast.success(res.data.message || "Регистрация прошла успешно!");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка регистрации. Попробуйте снова.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      
      <div className={styles.signUpBox}>
        <h2 className={styles.logo}>ICHGRAM</h2> 
        <p className={styles.subtitle}>
            Зарегистрируйтесь, чтобы смотреть фото и видео ваших друзей.
        </p>
        
        <form onSubmit={handleSubmit} className={styles.signUpForm}>
          
          <Input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Электронный адрес"
            required
          />

          <Input
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Имя и фамилия (необязательно)"
          />

          <Input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            placeholder="Имя пользователя"
            required
          />

          <Input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Пароль"
            required
          />

          <div className={styles.inputGroup}>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className={styles.selectField}
              required
            >
              <option value="" disabled>Выберите пол</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
              <option value="other">Другой</option>
            </select>
          </div>
          
          <p className={styles.policyText}>
              Люди, которые пользуются нашим сервисом, могли загрузить вашу
              контактную информацию в Instagram. <a href="#">Подробнее.</a>
          </p>

          <Button type="submit" disabled={loading}>
            {loading ? "Регистрация..." : "Зарегистрироваться"}
          </Button>
          
          <p className={styles.policyText}>
              Регистрируясь, вы принимаете наши 
              <a href="#"> Условия</a>, <a href="#">Политику конфиденциальности</a> 
              и <a href="#">Политику в отношении файлов cookie.</a>
          </p>
          
        </form>
      </div>

      <div className={styles.redirectBox}>
        <p className={styles.redirectText}>
          Уже есть аккаунт?{" "}
          <span onClick={() => navigate("/login")}>Войти</span>
        </p>
      </div>
      
    </div>
  );
};

export default SignUp;