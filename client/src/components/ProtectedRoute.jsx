import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, user, allowedRoles = ['admin', 'user', 'alten'] }) {
  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    // Not authorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

export function NonAltenRoute({ children, user }) {
  return <ProtectedRoute user={user} allowedRoles={['admin', 'user']}>{children}</ProtectedRoute>;
}