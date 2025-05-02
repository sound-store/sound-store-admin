import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuth();

  // Check if token exists and is not expired
  const token = sessionStorage.getItem("auth-token");
  const expirationTime = sessionStorage.getItem("auth-expiration");
  const isExpired = expirationTime
    ? new Date() > new Date(expirationTime)
    : false;

  // Refresh user data when component mounts if token exists
  useEffect(() => {
    if (token && !isExpired && !isAuthenticated) {
      refreshUserData();
    }
  }, [token, isExpired, isAuthenticated, refreshUserData]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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

  // Check if user has Admin role
  if (user?.role !== "Admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated, not expired, and has admin role, render the child routes
  return <Outlet />;
};
