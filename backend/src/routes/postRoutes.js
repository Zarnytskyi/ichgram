import express from "express";
import { addNewPost, getAllPosts, getUserPosts, toggleLikePost, deletePost } from "../controllers/postController.js";
import { isAuth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/all", isAuth, getAllPosts);

router.get("/user/:userId", isAuth, getUserPosts);

router.post("/add", isAuth, upload.single("image"), addNewPost);

router.post("/:id/like", isAuth, toggleLikePost);

router.delete("/:id", isAuth, deletePost);

export default router;
