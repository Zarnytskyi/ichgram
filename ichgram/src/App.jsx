import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import Home from "./pages/Home.jsx";

function App() {
const isAuthenticated = document.cookie.includes("token=");

const ProtectedRoutes = () => {
if (!isAuthenticated) {
return <Navigate to="/login" replace />;
}

return (
  <Layout>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<div>Страница поиска</div>} />
      <Route path="/explore" element={<div>Страница интересного</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
);

};

return ( <Routes>
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
