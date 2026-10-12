import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Customer from '../models/Customer.js';

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Customer tokens may only reach customer-facing profile routes.
    // Everything else mounted behind `auth` is admin/manager territory.
    if (decoded.role === 'customer') {
      const pathOnly = req.originalUrl.split('?')[0];
      const customerRoutes = ['/api/customers/profile'];
      if (!customerRoutes.some((p) => pathOnly.startsWith(p))) {
        return res.status(403).json({ error: 'Admin access required.' });
      }
      const customer = await Customer.findById(decoded.id).select('-password');
      if (!customer) {
        return res.status(401).json({ error: 'Invalid token. Customer not found.' });
      }
      req.user = { ...customer.toObject(), role: 'customer' };
      return next();
    }

    // Otherwise check admin/manager user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Server error.' });
  }
};

export default auth;
