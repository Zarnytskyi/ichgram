import { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    caption: { type: String, default: '', maxlength: 2200 },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true },
      }
    ],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
