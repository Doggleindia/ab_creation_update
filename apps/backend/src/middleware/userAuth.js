import jwt from 'jsonwebtoken';
import User from '../models/auth/userModel.js';
import AppError from '../utils/AppError.js';

export const userAuth  = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No token provided', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject tokens explicitly minted for a non-user role (e.g. admin tokens)
    if (decoded.role && decoded.role !== 'user') {
      return next(new AppError('Not authorized for this resource', 403));
    }

    // ✅ Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    // ✅ Attach user to request
    req.user = user;

    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

export const optionalUserAuth = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only attach a user for genuine user tokens; otherwise proceed as guest
    if (decoded.role && decoded.role !== 'user') {
      return next();
    }

    const user = await User.findById(decoded.id);

    if (user) {
      req.user = user;
    }
    next();
  } catch (err) {
    // Stale or invalid token is ignored so checkout can proceed as guest
    next();
  }
};
