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
      .sort({ views: -1 });

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

/* =========================
   GET USER SUBSCRIPTIONS
========================= */
router.get("/users/:userId/subscriptions", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'subscriptions.channelId',
      select: 'username email profilePic'
    }).select('subscriptions');
    
    const subscriptions = user.subscriptions.map(sub => ({
      channelId: sub.channelId._id,
      subscribedAt: sub.subscribedAt,
      username: sub.channelId.username,
      email: sub.channelId.email
    }));
    
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   SUBSCRIBE TO CHANNEL
========================= */
router.post("/channels/:channelId/subscribe", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const channel = await User.findById(req.params.channelId);
    
    if (!user || !channel) {
      return res.status(404).json({ message: "User or channel not found" });
    }
    
    // Check if already subscribed
    const alreadySubscribed = user.subscriptions.some(sub => 
      sub.channelId.toString() === req.params.channelId
    );
    
    if (alreadySubscribed) {
      return res.status(400).json({ message: "Already subscribed" });
    }
    
    // Add subscription
    user.subscriptions.push({ 
      channelId: req.params.channelId 
    });
    channel.subscribers.push({ 
      userId: req.userId 
    });
    
    await user.save();
    await channel.save();
    
    res.json({ message: "Subscribed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   UNSUBSCRIBE FROM CHANNEL
========================= */
router.delete("/channels/:channelId/subscribe", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const channel = await User.findById(req.params.channelId);
    
    if (!user || !channel) {
      return res.status(404).json({ message: "User or channel not found" });
    }
    
    // Remove subscription
    user.subscriptions = user.subscriptions.filter(sub => 
      sub.channelId.toString() !== req.params.channelId
    );
    channel.subscribers = channel.subscribers.filter(sub => 
      sub.userId.toString() !== req.userId
    );
    
    await user.save();
    await channel.save();
    
    res.json({ message: "Unsubscribed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET CHANNEL DATA (for Channel page)
========================= */
router.get("/channels/:channelId", async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const channel = await User.findById(channelId).select('username profilePic subscribers');
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const videos = await Video.find({ channelId })
      .populate("channelId", "username profilePic")
      .sort({ createdAt: -1 });

    res.json({
      videos: videos.map(v => ({
        ...v._doc,
        id: v._id,
        channel: v.channelId.username,
        channelId: v.channelId._id
      })),
      channel: {
        username: channel.username,
        profilePic: channel.profilePic,
        subscribersCount: channel.subscribers.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   CHECK SUBSCRIPTION STATUS
========================= */
router.get("/channels/:channelId/subscription", auth, async (req, res) => {
  try {
    const channel = await User.findById(req.params.channelId).select('subscribers');
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isSubscribed = channel.subscribers.some(sub => 
      sub.userId.toString() === req.userId
    );

    res.json({ subscribed: isSubscribed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET SUBSCRIBERS COUNT (optional)
========================= */
router.get("/channels/:channelId/subscribers", async (req, res) => {
  try {
    const channel = await User.findById(req.params.channelId).select('subscribers');
    
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

res.json({ count: channel.subscribers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   GET USER WATCH HISTORY
========================= */
router.get("/users/:userId/history", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate({
      path: 'watchHistory.videoId',
      select: 'title thumbnail youtubeUrl channel channelId views likesCount'
    }).select('watchHistory');
    
    const history = user.watchHistory.map(entry => ({
      videoId: entry.videoId,
      watchedAt: entry.watchedAt
    }));
    
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   ADD TO WATCH HISTORY
========================= */
router.post("/users/:userId/history", auth, async (req, res) => {
  try {
    const { videoId } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove existing entry for this video (keep latest)
    user.watchHistory = user.watchHistory.filter(entry => 
      entry.videoId.toString() !== videoId
    );
    
    // Add new entry at front
    user.watchHistory.unshift({ 
      videoId,
      watchedAt: new Date()
    });
    
    // Keep only recent 50
    user.watchHistory = user.watchHistory.slice(0, 50);
    
    await user.save();
    
    res.json({ message: "Added to history" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE VIDEO
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    // Only allow owner to delete
    if (String(video.channelId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized to delete this video" });
    }
    await Video.findByIdAndDelete(req.params.id);
    // Delete all comments for this video
    await Comment.deleteMany({ videoId: req.params.id });
    res.json({ message: "Video deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =========================
   DELETE COMMENT
========================= */
router.delete("/:videoId/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    // Only allow owner to delete
    if (String(comment.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    await Comment.findByIdAndDelete(req.params.commentId);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
