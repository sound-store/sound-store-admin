import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  // Check if user is authenticated by looking for the token in sessionStorage
  const token = sessionStorage.getItem("auth-token");
  const expirationTime = sessionStorage.getItem("auth-expiration");

  // Check if token exists and is not expired
  const isAuthenticated = !!token;
  const isExpired = expirationTime
    ? new Date() > new Date(expirationTime)
    : false;

  // If token is expired, clear it and redirect to login
  if (isExpired && token) {
    sessionStorage.removeItem("auth-token");
    sessionStorage.removeItem("auth-expiration");
    return <Navigate to="/login" replace />;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and not expired, render the child routes
  return <Outlet />;
};
