// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Nicht autorisiert – kein Token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token ungültig' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ message: 'Nicht berechtigt (Admin erforderlich)' });
  next();
};
