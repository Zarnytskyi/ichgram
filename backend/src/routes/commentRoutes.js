import express from "express";
import { addComment, deleteComment} from "../controllers/postController.js";
import { isAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/:id", isAuth, addComment);

router.delete("/:commentId", isAuth, deleteComment);

export default router;
