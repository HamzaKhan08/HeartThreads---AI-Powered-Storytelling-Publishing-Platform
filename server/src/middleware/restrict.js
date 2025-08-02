const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.id).select('-passwordHash');
        
        if (user) {
          req.user = user;
          req.token = token;
          req.isGuest = false;
        } else {
          req.isGuest = true;
        }
      } catch (error) {
        // Invalid token, treat as guest
        req.isGuest = true;
      }
    } else {
      // No token provided, treat as guest
      req.isGuest = true;
    }
    
    next();
  } catch (error) {
    console.error('Restrict middleware error:', error);
    req.isGuest = true;
    next();
  }
};
