import express from "express";
import { register, login, logout } from "../controllers/userController.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", upload.single("avatar"), register);

router.post("/login", login);

router.post("/logout", logout);

export default router;
