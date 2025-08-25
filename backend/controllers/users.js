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

// Unified update (supports JSON or multipart/form-data). For multipart you can send text fields and optional file field 'avatar'.
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error: 'User not found' });

    // Optimistic concurrency: client supplies previous updatedAt timestamp (ms)
    if (req.body && req.body.updatedAtVersion) {
      const clientVersion = parseInt(req.body.updatedAtVersion, 10);
      if (!isNaN(clientVersion)) {
        const serverVersion = new Date(user.updatedAt).getTime();
        if (serverVersion !== clientVersion) {
          return res.status(409).json({ error: 'conflict', message: 'Profile was updated elsewhere. Reload and try again.' });
        }
      }
    }

    // Text fields may come from req.body (either JSON or multer processed)
    const { name, email, phone, avatar: manualAvatar, removeAvatar } = req.body;

    if (name !== undefined && name !== '') user.name = name;
    if (email !== undefined && email !== '') user.email = email;
    if (phone !== undefined && phone !== '') user.phone = phone;

    // Handle avatar removal request (only if not simultaneously uploading new file)
    if (removeAvatar === 'true' && !req.file) {
      if (user.avatarPublicId) {
        try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (e) { console.warn('Failed to delete avatar during removal', e.message); }
      }
      user.avatar = undefined;
      user.avatarPublicId = undefined;
    }

    // If a file is uploaded, treat it as new avatar (overrides manualAvatar string)
    let oldPublicIdForCleanup = null;
    let newPublicIdCreated = null;
    if (req.file) {
      // Upload already completed by multer-storage-cloudinary (req.file.*)
      let secureUrl = req.file.path;
      let publicId = req.file.filename || req.file.public_id;
      if (!secureUrl || !publicId) {
        // Manual upload fallback
        const uploadResp = await cloudinary.uploader.upload(req.file.path, {
          folder: 'avatars',
          transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'face' }]
        });
        secureUrl = uploadResp.secure_url;
        publicId = uploadResp.public_id;
      }
      oldPublicIdForCleanup = user.avatarPublicId || null; // mark old to delete after successful save
      user.avatar = secureUrl;
      user.avatarPublicId = publicId;
      newPublicIdCreated = publicId;
    } else if (manualAvatar !== undefined) {
      // Manual avatar URL provided (and no new file). Setting manual clears publicId tracking.
      if (manualAvatar === '') {
        // Empty string indicates clearing (if removeAvatar flag not used)
        if (user.avatarPublicId) {
          try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch (e) { console.warn('Failed to delete avatar (manual clear)', e.message); }
        }
        user.avatar = undefined;
        user.avatarPublicId = undefined;
      } else {
        user.avatar = manualAvatar;
        // manual external URL => remove publicId so deletion attempts don't target unknown asset
        if (user.avatarPublicId) {
          try { await cloudinary.uploader.destroy(user.avatarPublicId); } catch {/* ignore */}
        }
        user.avatarPublicId = undefined;
      }
    }

    try {
      await user.save();
    } catch (saveErr) {
      // Rollback: if a new avatar was created but save failed, try delete new to avoid orphan
      if (newPublicIdCreated) {
        try { await cloudinary.uploader.destroy(newPublicIdCreated); } catch {/* ignore */}
      }
      throw saveErr;
    }

    // Only after successful save delete old avatar (reduces risk of losing avatar on failure)
    if (oldPublicIdForCleanup && oldPublicIdForCleanup !== user.avatarPublicId) {
      try { await cloudinary.uploader.destroy(oldPublicIdForCleanup); } catch (e) { console.warn('Failed to delete old avatar post-save', e.message); }
    }

    const sanitized = await User.findById(userId).select('-__v -password');
    res.status(200).json(sanitized);
  } catch (err) {
    console.error('Update user error', err);
    res.status(400).json({ error: err.message || 'Update failed' });
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
