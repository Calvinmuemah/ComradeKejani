const { GoogleGenerativeAI } = require("@google/generative-ai");
const ForumPost = require('../models/forumPost');
require("dotenv").config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI verification function (multilingual)
async function verifyTextWithAI(text) {
  try {
    const systemPrompt = `
You are a content moderator AI. Determine if a user submission is appropriate.
The text may be in English, Kiswahili, or Sheng.
Answer ONLY "YES" if the content is appropriate and does NOT contain offensive language, nonsense, or spam.
Answer "NO" otherwise.
`;

    const userPrompt = `Text: "${text}"`;

    const result = await model.generateContent([systemPrompt, userPrompt]);
    const responseText = result.response.text().trim();

    console.log("Gemini AI raw output:", responseText);

    return responseText.toUpperCase().startsWith("YES");

  } catch (err) {
    console.error("Gemini AI verification error:", err);
    return true; // allow submission if AI fails
  }
}

// Create a new forum post
exports.createPost = async (req, res) => {
  try {
    const { title, category, content, author } = req.body;

    if (!title || !category || !content || !author) {
      return res.status(400).json({ error: 'Title, category, content, and author are required.' });
    }

    // AI moderation for post title
    const isTitleValid = await verifyTextWithAI(title);
    if (!isTitleValid) {
      return res.status(400).json({ error: 'Post title contains offensive or inappropriate content.' });
    }

    // AI moderation for post content
    const isContentValid = await verifyTextWithAI(content);
    if (!isContentValid) {
      return res.status(400).json({ error: 'Post content contains offensive or inappropriate content.' });
    }

    const post = new ForumPost({ title, category, content, author });
    await post.save();
    res.status(201).json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find().sort({ timestamp: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to a post
exports.replyToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, author } = req.body;

    if (!content || !author) return res.status(400).json({ error: 'Content and author are required.' });

    // AI moderation for reply content
    const isReplyValid = await verifyTextWithAI(content);
    if (!isReplyValid) {
      return res.status(400).json({ error: 'Reply contains offensive or inappropriate content.' });
    }

    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    post.replies.push({ content, author });
    await post.save();

    res.status(200).json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Like/unlike a post
// Like/unlike a post
exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    // Check if user already liked
    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json(post);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

