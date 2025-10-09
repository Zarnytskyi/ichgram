import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import API from "./api/axios.js";

import Layout from "./components/Layout";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";
import CreatePost from "./pages/CreatePost.jsx";

import useUser from "./hooks/useUser";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const user = useUser();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await API.get("/auth/check");
        setIsAuthenticated(res.data.authenticated);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAuthenticated(false);
      } finally {
        setLoadingAuth(false);
      }
    };
    checkAuth();
  }, []);

  if (loadingAuth || user.loading) return <div>Loading...</div>;

  const ProtectedRoutes = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/search" element={<div>Страница поиска</div>} />
          <Route path="/explore" element={<div>Страница интересного</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    );
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/" replace /> : <SignUp />}
      />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default App;