import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    caption: { type: String, default: '', maxlength: 2200 },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      }
    ],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);
