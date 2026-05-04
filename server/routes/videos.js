import express from "express";
import mongoose from "mongoose";

import Video from "../models/Video.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* =========================
   GET ALL VIDEOS
========================= */
router.get("/", async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate("channelId", "username email profilePic");

    const result = videos.map(video => ({
      ...video._doc,
      channel: video.channelId?.username || "Unknown Channel",
      channelId: video.channelId?._id,
      id: video._id
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   SEARCH VIDEOS
========================= */
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q?.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const videos = await Video.find({
      title: { $regex: q.trim(), $options: "i" }
    })
      .populate("channelId", "username email profilePic")
      .sort({ views: -1 })
      .limit(20);

    res.json(
      videos.map(video => ({
        ...video._doc,
        channel: video.channelId?.username || "Unknown Channel",
        channelId: video.channelId?._id,
        id: video._id
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET VIDEO BY ID
========================= */
router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate("channelId", "username email profilePic");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      ...video._doc,
      id: video._id,
      channel: video.channelId?.username || "Unknown Channel",
      channelId: video.channelId?._id
    });
  } catch (err) {
    res.status(404).json({ message: "Video not found" });
  }
});

/* =========================
   CREATE VIDEO
========================= */
router.post("/", auth, async (req, res) => {
  try {
    const video = new Video({
      ...req.body,
      channelId: new mongoose.Types.ObjectId(req.userId)
    });

    const saved = await video.save();
    res.status(201).json({ ...saved._doc, id: saved._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* =========================
   LIKE / DISLIKE
========================= */
router.put("/:id/likes", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    const user = await User.findById(req.userId);

    if (!video || !user) {
      return res.status(404).json({ message: "Not found" });
    }

    const isLiked = req.body.like;

    if (isLiked) {
      if (!user.likes.includes(req.params.id)) {
        user.likes.push(req.params.id);
        video.likesCount += 1;
      }
    } else {
      user.likes = user.likes.filter(id => id.toString() !== req.params.id);
      if (video.likesCount > 0) video.likesCount -= 1;
    }

    await user.save();
    await video.save();

    res.json({ likesCount: video.likesCount, userLiked: isLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   INCREMENT VIEW
========================= */
router.post("/:id/view", async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    res.json(video);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   COMMENTS
========================= */
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.id })
      .populate("userId", "username profilePic")
      .sort({ timestamp: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/comments", auth, async (req, res) => {
  try {
    const comment = new Comment({
      text: req.body.text,
      videoId: req.params.id,
      userId: req.userId
    });

    await comment.save();
    await comment.populate("userId", "username profilePic");

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;