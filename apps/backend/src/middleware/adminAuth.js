import jwt from 'jsonwebtoken';
import Admin from '../models/auth/adminModel.js';
import AppError from '../utils/AppError.js';

export const adminAuth = async (req, res, next) => {
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

    // Reject tokens explicitly minted for a non-admin role
    if (decoded.role && decoded.role !== 'admin') {
      return next(new AppError('Not authorized for this resource', 403));
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return next(new AppError('Admin no longer exists', 401));
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(new AppError('Invalid token', 401));
  }
};

// Attaches req.admin if a valid admin token is present, but never blocks.
// Used to gate admin self-registration: the controller allows the request
// only when it is bootstrapping the first admin OR an existing admin made it.
export const optionalAdminAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role && decoded.role !== 'admin') return next();

    const admin = await Admin.findById(decoded.id);
    if (admin) req.admin = admin;
    next();
  } catch (err) {
    // Invalid/expired token is ignored here; the controller enforces the gate
    next();
  }
};
