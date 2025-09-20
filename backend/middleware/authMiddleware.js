import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AUTH] Token received:', token ? 'Present' : 'Missing');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('[AUTH] Token decoded successfully for user:', decoded.id);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.log('[AUTH] User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      
      req.user.role = decoded.role; // Attach role to user object
      console.log('[AUTH] User authenticated:', req.user.email, 'Role:', req.user.role);

      return next();
    } catch (error) {
      console.error('[AUTH] JWT Verification Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    console.log('[AUTH] No token provided');
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: ${req.user?.role} is not authorized to access this route` });
    }
    next();
  };
};

export { protect, authorizeRoles };
