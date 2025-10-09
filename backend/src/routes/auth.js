import express from "express";
import jwt from "jsonwebtoken"; // ← этого не хватало
import { register, login, logout } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(200).json({ authenticated: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ authenticated: true });
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(200).json({ authenticated: false });
  }
});

export default router;
