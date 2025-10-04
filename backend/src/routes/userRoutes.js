import express from "express";
import { updateUser, followUser, unfollowUser, getUserProfile } from "../controllers/userController.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.get("/:id", getUserProfile);

router.put("/update", isAuth, updateUser);

router.post("/:id/follow", isAuth, followUser);

router.post("/:id/unfollow", isAuth, unfollowUser);

export default router;