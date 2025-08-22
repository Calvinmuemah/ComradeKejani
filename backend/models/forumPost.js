const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: String, required: true }, // user id or username
  timestamp: { type: Date, default: Date.now }
});

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  replies: { type: [replySchema], default: [] },
  likes: { type: [String], default: [] } // store userIds
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
