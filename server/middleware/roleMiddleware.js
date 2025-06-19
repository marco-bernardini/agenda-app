import jwt from 'jsonwebtoken';

export function checkRole(allowedRoles) {
  return (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) return res.status(401).json({ error: "Authentication required" });
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user to request
      req.user = decoded;
      
      // Check if user role is allowed
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: "You don't have permission to access this resource" });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

// Helper middlewares for common scenarios
export const adminOnly = checkRole(['admin']);
export const nonAltenOnly = checkRole(['admin', 'user']); // All except 'alten'
export const allUsers = checkRole(['admin', 'user', 'alten']); // All roles

export function requireRole(allowedRoles) {
  return (req, res, next) => {
    // Role check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// Example usage in routes:
// import { requireRole } from '../middleware/roleMiddleware.js';
// Only admin and regular users can delete
// router.delete("/:id", requireRole(['admin', 'user']), async (req, res) => {
//   // Delete logic
// });