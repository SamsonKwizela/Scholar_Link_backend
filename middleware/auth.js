const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return next(new AppError('Not authorized', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in User model first
    let user = await User.findById(decoded.id).select('-password');
    
    // If not found in User, try Admin model
    if (!user) {
      user = await Admin.findById(decoded.id).select('-password');
    }

    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Not authorized', 401));
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Forbidden', 403));
  }

  next();
};

module.exports = {
  protect,
  authorizeRoles,
};
