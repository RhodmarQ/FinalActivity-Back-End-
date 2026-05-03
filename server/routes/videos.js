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
    const videos = await Video.find().sort({ timestamp: -1 }).limit(20).populate('channelId', 'username email profilePic');
    const videosWithChannel = videos.map(video => ({
      ...video._doc,
      channel: video.channelId?.username || 'Unknown Channel',
      channelId: video.channelId?._id,
      id: video._id
    }));
    res.json(videosWithChannel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET videos by title search
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const searchQuery = { title: { $regex: q.trim(), $options: 'i' } };
    const videos = await Video.find(searchQuery)
      .populate('channelId', 'username email profilePic')
      .sort({ views: -1 })
      .limit(20);
    const videosWithChannel = videos.map(video => ({
      ...video._doc,
      channel: video.channelId?.username || 'Unknown Channel',
      channelId: video.channelId?._id,
      id: video._id
    }));
    res.json(videosWithChannel);
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
    const video = await Video.findById(req.params.id).populate('channelId', 'username email profilePic');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    res.json({
      ...video._doc,
      id: video._id,
      channel: video.channelId?.username || 'Unknown Channel',
      channelId: video.channelId?._id
    });
  } catch (err) {
    console.log('Video ID error:', err.message);
    res.status(404).json({ message: 'Video not found' });
  }
});

// POST new video
router.post('/', auth, async (req, res) => {
  const video = new Video({
    ...req.body,
    channelId: new mongoose.Types.ObjectId(req.userId)
  });
  try {
    const newVideo = await video.save();
    res.status(201).json({ ...newVideo._doc, id: newVideo._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



// Toggle like - per user
router.put('/:id/likes', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('channelId');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    

    const user = await User.findById(req.userId);
    const isLiked = req.body.like;
    
    if (isLiked) {
      // Like: add to likes, remove from dislikes
      if (!user.likes.some(id => id.toString() === req.params.id)) {
        user.likes.push(new mongoose.Types.ObjectId(req.params.id));
        video.likesCount += 1;
      }
      user.dislikes = user.dislikes.filter(id => id.toString() !== req.params.id.toString());
      if (video.dislikesCount > 0) video.dislikesCount -= 1;
    } else {
      // Unlike
      user.likes = user.likes.filter(id => id.toString() !== req.params.id.toString());
      if (video.likesCount > 0) video.likesCount -= 1;
    }

    
    await user.save();
    await video.save();
    
    res.json({ 
      likesCount: video.likesCount, 
      dislikesCount: video.dislikesCount,
      userLiked: isLiked 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Toggle dislike - per user

router.put('/:id/dislikes', auth, async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate('channelId');
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const user = await User.findById(req.userId);
    const isDisliked = req.body.dislike;
    
    if (isDisliked) {
      // Dislike: add to dislikes, remove from likes
      if (!user.dislikes.some(id => id.toString() === req.params.id.toString())) {
        user.dislikes.push(new mongoose.Types.ObjectId(req.params.id));
        video.dislikesCount += 1;
      }
      user.likes = user.likes.filter(id => id.toString() !== req.params.id.toString());
      if (video.likesCount > 0) video.likesCount -= 1;
    } else {
      // Undislike
      user.dislikes = user.dislikes.filter(id => id.toString() !== req.params.id.toString());
      if (video.dislikesCount > 0) video.dislikesCount -= 1;
    }
    
    await user.save();
    await video.save();
    
    res.json({ 
      likesCount: video.likesCount, 
      dislikesCount: video.dislikesCount,
      userDisliked: isDisliked 
    });
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

// GET user action on video (auth)
router.get('/:id/action', auth, async (req, res) => {
  try {
    const videoId = req.params.id;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const isLiked = user.likes.some(id => id.toString() === videoId);
    const isDisliked = user.dislikes.some(id => id.toString() === videoId);
    
    res.json({
      isLiked,
      isDisliked,
      likesCount: video.likesCount,
      dislikesCount: video.dislikesCount
    });
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

// Subscribe to channel
router.post('/channels/:channelId/subscribe', auth, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const userId = req.userId;

    if (channelId === userId) {
      return res.status(400).json({ message: 'Cannot subscribe to yourself' });
    }

    // Check if channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Check if already subscribed
    const user = await User.findById(userId);
    const isSubscribed = user.subscriptions.some(sub => sub.channelId.toString() === channelId);

    if (isSubscribed) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    // Add subscription
    user.subscriptions.push({ channelId });
    await user.save();

    // Add subscriber to channel
    channel.subscribers.push({ userId });
    await channel.save();

    res.json({ message: 'Subscribed successfully', subscribed: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Unsubscribe from channel
router.delete('/channels/:channelId/subscribe', auth, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const userId = req.userId;

    const user = await User.findById(userId);
    const channel = await User.findById(channelId);

    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    // Remove subscription
    user.subscriptions = user.subscriptions.filter(sub => sub.channelId.toString() !== channelId);
    await user.save();

    // Remove subscriber from channel
    channel.subscribers = channel.subscribers.filter(sub => sub.userId.toString() !== userId);
    await channel.save();

    res.json({ message: 'Unsubscribed successfully', subscribed: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check subscription status
router.get('/channels/:channelId/subscription', auth, async (req, res) => {
  try {
    const channelId = req.params.channelId;
    const userId = req.userId;

    const user = await User.findById(userId);
    const isSubscribed = user.subscriptions.some(sub => sub.channelId.toString() === channelId);

    res.json({ subscribed: isSubscribed });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's subscriptions
router.get('/users/:userId/subscriptions', auth, async (req, res) => {
  try {
    if (req.userId !== req.params.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.userId).populate('subscriptions.channelId', 'username email profilePic');
    const subscriptions = user.subscriptions.map(sub => ({
      channelId: sub.channelId._id,
      username: sub.channelId.username,
      email: sub.channelId.email,
      profilePic: sub.channelId.profilePic,
      subscribedAt: sub.subscribedAt
    }));

    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get channel subscribers count
router.get('/channels/:channelId/subscribers', async (req, res) => {
  try {
    const channel = await User.findById(req.params.channelId);
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    res.json({ subscribersCount: channel.subscribers.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get channel data and videos by channel ID
router.get('/channels/:channelId', async (req, res) => {
  try {
    const channelId = req.params.channelId;
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(404).json({ message: 'Invalid channel ID' });
    }
    const channel = await User.findById(channelId).select('username email profilePic subscribers');
    if (!channel) {
      return res.status(404).json({ message: 'Channel not found' });
    }
    const videos = await Video.find({ channelId }).populate('channelId', 'username email profilePic')
      .sort({ createdAt: -1 }).limit(20);
    const videosWithChannel = videos.map(video => ({
      ...video._doc,
      channel: video.channelId?.username || channel.username,
      channelPic: video.channelId?.profilePic || channel.profilePic,
      channelId: video.channelId?._id || channel._id,
      id: video._id
    }));
    res.json({
      channel: {
        id: channel._id,
        username: channel.username,
        email: channel.email || '',
        profilePic: channel.profilePic || '',
        subscribersCount: channel.subscribers.length
      },
      videos: videosWithChannel
    });
  } catch (err) {
    console.error('Channel fetch error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
