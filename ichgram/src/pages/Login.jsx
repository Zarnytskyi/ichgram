import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api/axios";
import styles from "../styles/pages/Login.module.scss";

import Input from "../components/Input"; 
import Button from "../components/Button";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.login || !form.password) {
      toast.error("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/auth/login", form);
      toast.success(res.data.message || "Вход выполнен успешно!");
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message || "Ошибка входа. Попробуйте снова.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.loginBox}>
        <h2 className={styles.logo}>ICHGRAM</h2>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          
          <Input
            name="login"
            type="text"
            value={form.login}
            onChange={handleChange}
            placeholder="Имя пользователя или эл. адрес"
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

          <Button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : "Войти"}
          </Button>

          <a href="#" className={styles.forgotPassword}>Забыли пароль?</a>
        </form>
      </div>

      <div className={styles.redirectBox}>
        <p className={styles.redirectText}>
          У вас нет аккаунта?{" "}
          <span onClick={() => navigate("/signup")}>Зарегистрироваться</span>
        </p>
      </div>
      
    </div>
  );
};

export default Login;