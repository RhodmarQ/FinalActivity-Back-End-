const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');

// GET all videos
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ timestamp: -1 }).limit(20);
    res.json(videos.map(v => ({ ...v._doc, id: v._id })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET video by id
router.get('/:id', async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined') {
    return res.status(404).json({ message: 'Invalid video ID' });
  }
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ ...video._doc, id: video._id });
  } catch (err) {
    console.log('Video ID error:', err.message);
    res.status(404).json({ message: 'Video not found' });
  }
});

// POST new video
router.post('/', auth, async (req, res) => {
  const video = new Video({
    ...req.body,
    channelId: req.userId
  });
  try {
    const newVideo = await video.save();
    res.status(201).json({ ...newVideo._doc, id: newVideo._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Toggle like
router.put('/:id/likes', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    const delta = req.body.like ? 1 : -1;
    video.likesCount = Math.max(0, video.likesCount + delta);
    await video.save();
    res.json({ likesCount: video.likesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE video (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.channelId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Increment view count
router.post('/:id/view', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({ ...video._doc, id: video._id, views: video.views });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// User routes for history
router.get('/users/:userId/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('watchHistory.videoId');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Deduplicate: latest entry per videoId
    const historyMap = new Map();
    user.watchHistory.slice(-50).reverse().forEach(entry => {  // Check more to get latest
      if (!historyMap.has(entry.videoId._id.toString())) {
        historyMap.set(entry.videoId._id.toString(), entry);
      }
    });
    const dedupedHistory = Array.from(historyMap.values()).slice(0, 20);
    res.json(dedupedHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/users/:userId/history', auth, async (req, res) => {
  try {
    console.log('History POST:', { userId: req.userId, paramsUserId: req.params.userId, videoId: req.body.videoId });
    if (req.userId !== req.params.userId) return res.status(403).json({ message: 'Unauthorized' });
    const { videoId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(videoId)) return res.status(400).json({ message: 'Invalid video ID' });
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    console.log('Video found:', video.title);
    
    const user = await User.findById(req.userId);
    user.watchHistory = user.watchHistory.filter(entry => entry.videoId.toString() !== videoId);
    user.watchHistory.unshift({ videoId: video._id, watchedAt: new Date() });
    await user.save();
    console.log('History updated successfully');
    res.json({ success: true });
  } catch (err) {
    console.error('History add error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Comments
router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.id })
      .populate('userId', 'username')
      .sort({ timestamp: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comments', auth, async (req, res) => {
  try {
    const comment = new Comment({
      text: req.body.text,
      videoId: req.params.id,
      userId: req.userId
  });
    const newComment = await comment.save().populate('userId', 'username');
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
