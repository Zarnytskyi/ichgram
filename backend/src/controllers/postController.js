import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import User from "../models/User.js";
import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";
import { getDataUri } from "../utilits/datauri.js";
import { successResponse, errorResponse } from "../utilits/response.js";

export const addNewPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { caption } = req.body;
    const image = req.file;

    if (!image) return errorResponse(res, "Image is required", 400);

    const optimized = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = getDataUri({
      buffer: optimized,
      mimetype: "image/jpeg",
    });

    const cloud = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption,
      image: cloud.secure_url,
      imagePublicId: cloud.public_id,
      author: userId,
    });

    await User.findByIdAndUpdate(userId, { $push: { posts: post._id } });

    await post.populate({ path: "author", select: "username profilePicture" });

    return successResponse(res, "New post added", post, 201);
  } catch (err) {
    console.error("addNewPost error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1", 10);
    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "username profilePicture")
        .populate({
          path: "comments",
          options: { sort: { createdAt: -1 } },
          populate: { path: "author", select: "username profilePicture" },
        })
        .lean(),
      Post.countDocuments({}),
    ]);

    return successResponse(res, "Posts fetched successfully", {
      total,
      page,
      posts,
    });
  } catch (err) {
    console.error("getAllPosts error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.user?.id;

    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" },
      });

    return successResponse(res, "User posts fetched", posts);
  } catch (err) {
    console.error("getUserPosts error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id: postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) return errorResponse(res, "Post not found", 404);

    const alreadyLiked = post.likes.includes(userId);
    const update = alreadyLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    await Post.updateOne({ _id: postId }, update);

    return successResponse(
      res,
      alreadyLiked ? "Post unliked" : "Post liked",
      null
    );
  } catch (err) {
    console.error("toggleLikePost error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user?.id;

    if (!text?.trim()) return errorResponse(res, "Comment text required", 400);

    const post = await Post.findById(postId);
    if (!post) return errorResponse(res, "Post not found", 404);

    const comment = await Comment.create({
      text: text.trim(),
      author: userId,
      post: postId,
    });

    await Post.updateOne({ _id: postId }, { $push: { comments: comment._id } });
    await comment.populate("author", "username profilePicture");

    return successResponse(res, "Comment added", comment, 201);
  } catch (err) {
    console.error("addComment error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    console.log("Deleting commentId:", commentId);

    const comment = await Comment.findById(commentId);
    if (!comment) return errorResponse(res, "Comment not found", 404);
    console.log("Found comment:", comment);

    const post = await Post.findById(comment.post);
    if (!post) return errorResponse(res, "Post not found", 404);

    if (comment.author.toString() !== userId && post.author.toString() !== userId) {
      return errorResponse(res, "Not authorized to delete this comment", 403);
    }

    await Comment.findByIdAndDelete(commentId);

    if (post.comments) {
      post.comments = post.comments.filter(id => id.toString() !== commentId);
      await post.save();
    }

    return successResponse(res, "Comment deleted successfully");
  } catch (error) {
    console.error("deleteComment error:", error);
    return errorResponse(res, error.message, 500);
  }
};


export const getPostComments = async (req, res) => {
  try {
    const { id: postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate("author", "username profilePicture");

    return successResponse(res, "Comments fetched", comments);
  } catch (err) {
    console.error("getPostComments error:", err);
    return errorResponse(res, err.message, 500);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user?.id;

    const post = await Post.findById(postId);
    if (!post) return errorResponse(res, "Post not found", 404);
    if (String(post.author) !== String(userId))
      return errorResponse(res, "Unauthorized", 403);

    if (post.imagePublicId) await cloudinary.uploader.destroy(post.imagePublicId);

    await Comment.deleteMany({ post: postId });
    await Post.findByIdAndDelete(postId);
    await User.updateOne({ _id: userId }, { $pull: { posts: postId } });

    return successResponse(res, "Post deleted");
  } catch (err) {
    console.error("deletePost error:", err);
    return errorResponse(res, err.message, 500);
  }
};