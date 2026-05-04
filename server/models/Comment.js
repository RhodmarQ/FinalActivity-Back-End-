import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;