import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware to protect routes
 * Verifies JWT token and attaches user to request object
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          error: 'User not found',
          message: 'The user associated with this token no longer exists'
        });
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        error: 'Not authorized',
        message: 'Token verification failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      error: 'Not authorized',
      message: 'No token provided'
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role(s)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Not authorized',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};
