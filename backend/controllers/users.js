const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');

// Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password || !name || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword, phone});

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const sanitized = { 
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      avatar: newUser.avatar || null,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      token
    };
    res.status(201).json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Delete current avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (e) { console.warn('Failed to delete avatar from Cloudinary', e.message); }
    }
    user.avatar = undefined;
    user.avatarPublicId = undefined;
    await user.save();
    const sanitized = await User.findById(userId).select('-__v -password');
    res.status(200).json(sanitized);
  } catch (err) {
    console.error('Avatar delete error', err);
    res.status(500).json({ error: 'Failed to delete avatar' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    const sanitized = { 
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token
    };
    res.json(sanitized);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        // Exclude __v and password
        const user = await User.findById(userId).select('-__v -password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, phone, avatar } = req.body;
    // Basic field update (avatar string allowed for backward compatibility)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, ...(avatar ? { avatar } : {}) },
      { new: true, runValidators: true, context: 'query' }
    ).select('-__v -password');
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Upload / replace avatar (multipart/form-data with field name 'avatar')
exports.uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove previous avatar from Cloudinary if public id stored
    if (user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (e) { console.warn('Failed to delete old avatar', e.message); }
    }

    // Multer-Cloudinary storage (if used) provides path and filename/public_id on file
    // Support two cases: using CloudinaryStorage (file.path is secure_url) or local storage requiring manual upload
    let secureUrl = req.file.path;
    let publicId = req.file.filename || req.file.public_id;

    // If storage not cloudinary, manually upload
    if (!secureUrl || !publicId) {
      const uploadResp = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
        transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }]
      });
      secureUrl = uploadResp.secure_url;
      publicId = uploadResp.public_id;
    }

    user.avatar = secureUrl;
    user.avatarPublicId = publicId;
    await user.save();

    const sanitized = await User.findById(userId).select('-__v -password');
    res.status(200).json(sanitized);
  } catch (err) {
    console.error('Avatar upload error', err);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};

// List all admins (users) - minimal fields
exports.listAdmins = async (_req, res) => {
  try {
    const users = await User.find({}, 'name email phone avatar createdAt updatedAt');
    res.status(200).json(users);
  } catch(err){
    res.status(500).json({ error: err.message });
  }
};
