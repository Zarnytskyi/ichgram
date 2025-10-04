import dotenv from 'dotenv';
dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../config/cloudinary.js";
import { getDataUri } from "../utilits/datauri.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { formatUser } from "../utils/formatUser.js";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const register = async(req, res)=>{
    try {
        const { username, email, password, gender, fullName } = req.body;
        if(!username || !email || !password || !gender) return res.status(400).json({ message: "All fields are required" });

        let profilePicture =""
        if(req.file){
            const fileUri = getDataUri(req.file);
            const uploadResponse = await cloudinary.uploader.upload(fileUri,{
                folder:"avatars",
            });
            avatarUrl= uploadResponse.secure_url;
        }

        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(409).json({ message: "Email already in use" });
        const hasedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            username ,
            email,
            fullName,
            password: hasedPassword,
            gender,
            profilePicture
        });
        await user.save();
        
                const token = jwt.sign(
            {id: user._id,username: user.username},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRES_IN}
        );
        res.cookies("token", token, { httpOnly: true, secure: false })

        return successResponse(res, "User registered successfully", {
            user: formatUser(user),
            token,
        });
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const login = async(res,req)=>{
    try {
        const {login, password} = req.body;
        const user = await User.findOne({
            $or: [{email:login},{username:login}]
        });
        if(!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            {id: user._id,username: user.username},
            JWT_SECRET,
            {expiresIn: JWT_EXPIRES_IN}
        );
        res.cookies("token", token, { httpOnly: true, secure: false })
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
        const { bio, gender, fullName } = req.body;
        let profilePicture =""

        if(req.file){
            const fileUri = getDataUri(req.file);
            const uploadResponse = await cloudinary.uploader.upload(fileUri,{
                folder:"avatars",
            });
            profilePicture = uploadResponse.secure_url;
        };
        const userUpdate = User.findOneAndUpdate(req.user.id,
            { bio, gender, fullName, ...(profilePicture && { profilePicture }) },
            { new: true }
        )
    return successResponse(res, "Profile updated", {
      user: formatUser(updatedUser),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) return errorResponse(res, "You cannot follow yourself");

    const userToFollow = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return errorResponse(res, "User not found", 404);

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await currentUser.save();
      await userToFollow.save();
    }

    return successResponse(res, "User followed", {
      user: formatUser(userToFollow),
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userToUnfollow = await User.findById(id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow) return errorResponse(res, "User not found", 404);

    currentUser.following = currentUser.following.filter(
      (f) => f.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (f) => f.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    return successResponse(res, "User unfollowed");
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};
