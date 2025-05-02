import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold">Access Denied</h1>
      <p className="mt-4 text-lg">
        Sorry, {user?.firstName} {user?.lastName}. You don't have permission to
        access this area.
      </p>
      <p className="mt-2 text-gray-500">
        This section requires admin privileges. Your current role is:{" "}
        {user?.role}
      </p>
      <div className="mt-8 flex gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  );
};
