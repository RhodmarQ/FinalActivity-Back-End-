import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: String,

    subscriptions: [
      {
        channelId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        subscribedAt: { type: Date, default: Date.now }
      }
    ],

    subscribers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        subscribedAt: { type: Date, default: Date.now }
      }
    ],

    watchHistory: [
      {
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
        watchedAt: { type: Date, default: Date.now }
      }
    ],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;