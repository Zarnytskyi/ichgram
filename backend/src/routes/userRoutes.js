import express from "express";
import { editProfile, followUser, unfollowUser, getProfile, getCurrentUser } from "../controllers/userController.js";
import { isAuth } from "../middleware/auth.js";
import upload from "../middleware/multer.js";

const router = express.Router();

router.get("/me", isAuth, getCurrentUser);

router.get("/:id", getProfile);

router.post(
  '/edit',
  isAuth,
  (req, res, next) => {
    upload.single('avatar')(req, res, function(err) {
      if (err) return res.status(500).json({ message: err.message, success: false });
      next();
    });
  },
  editProfile
);

router.post("/:id/follow", isAuth, followUser);

router.post("/:id/unfollow", isAuth, unfollowUser);

export default router;