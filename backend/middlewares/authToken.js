const jwt = require('jsonwebtoken');
const User = require('../models/users');
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return res.status(401).json({ message: 'Token missing' });

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;
