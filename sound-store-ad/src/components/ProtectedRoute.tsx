import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  // Check if user is authenticated by looking for the token in sessionStorage
  const isAuthenticated = !!sessionStorage.getItem("auth-token");

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};
