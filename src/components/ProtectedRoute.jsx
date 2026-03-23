import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute - loading:", loading);
  console.log("ProtectedRoute - user:", user);
  console.log("ProtectedRoute - allowedRoles:", allowedRoles);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // After loading is complete, check if user exists
  if (!user) {
    console.log("No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Check role permissions
  if (!allowedRoles.includes(user.user_type)) {
    console.log(`User role ${user.user_type} not in allowed roles:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;