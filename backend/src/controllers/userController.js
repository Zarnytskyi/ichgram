import dotenv from 'dotenv';
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { getDataUri } from "../utilits/datauri.js";
import { successResponse, errorResponse } from "../utilits/response.js";
import { formatUser } from "../utilits/formatUser.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const register = async(req, res)=>{
    try {
        const { username, email, password, gender, fullName } = req.body || {};
        if(!username || !email || !password || !gender) return res.status(400).json({ message: "All fields are required" });

        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(409).json({ message: "Email already in use" });
        const hasedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            username ,
            email,
            fullName,
            password: hasedPassword,
            gender
        });
        await user.save();
        
                const token = jwt.sign(
            {id: user._id,username: user.username},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRES_IN}
        );
        res.cookie("token", token, { httpOnly: true, secure: false })

        return successResponse(res, "User registered successfully", {
            user: formatUser(user),
            token,
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const login = async (req, res) => {
  try {
    const { login, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: login }, { username: login }],
    });

    if (!user)
      return res.status(404).json({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials", success: false });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, "Login successful", {
      user: formatUser(user),
      token,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};


export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return successResponse(res, "Logged out successfully");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized", success: false });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found", success: false });

    const { bio, gender, fullName } = req.body || {};
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (fullName) user.fullName = fullName;

    if (req.file) {
      if (user.profilePicturePublicId) {
        try {
          await cloudinary.uploader.destroy(user.profilePicturePublicId);
        } catch (err) {
          console.error("Error deleting old photo:", err.message);
        }
      }

      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri);

      user.profilePicture = cloudResponse.secure_url;
      user.profilePicturePublicId = cloudResponse.public_id;
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.error("editProfile error:", error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate({ path: 'posts', options: { sort: { createdAt: -1 } } })

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found", success: false });

    return successResponse(res, "User found successfully", {
      user: formatUser(user),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === id)
      return errorResponse(res, "You cannot follow yourself");

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow) return errorResponse(res, "User not found", 404);

    if (!currentUser.following.some(f => f.toString() === userToFollow._id.toString())) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();
    }

    return successResponse(res, "User followed", {
      currentUser: formatUser(currentUser),
      followedUser: formatUser(userToFollow),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === id)
      return errorResponse(res, "You cannot unfollow yourself");

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow) return errorResponse(res, "User not found", 404);

    const wasFollowing = currentUser.following.some(f => f.toString() === userToUnfollow._id.toString());

    if (wasFollowing) {
      currentUser.following = currentUser.following.filter(
        f => f.toString() !== userToUnfollow._id.toString()
      );
      userToUnfollow.followers = userToUnfollow.followers.filter(
        f => f.toString() !== currentUser._id.toString()
      );

      await currentUser.save();
      await userToUnfollow.save();
    }

    return successResponse(res, "User unfollowed", {
      currentUser: formatUser(currentUser),
      unfollowedUser: formatUser(userToUnfollow),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};