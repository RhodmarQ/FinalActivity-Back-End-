const mongoose = require('mongoose');


const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  thumbnail: { type: String, required: true },
  youtubeUrl: { type: String, required: true },
  channel: { type: String, required: true },
  views: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  categories: [{ type: String }],
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // uploader
  comments: [{
    text: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = mongoose.model('Video', videoSchema);

