import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { ENDPOINTS } from "@/apis/endpoints";
import { buildApiUrl } from "@/apis";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch user data using the token
  const fetchUserData = useCallback(async (token: string) => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.get(buildApiUrl(ENDPOINTS.AUTH.ME), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.isSuccess) {
        setUser(response.data.value);
      } else {
        // If the request was successful but the response indicates failure
        console.error("Failed to fetch user data:", response.data.message);
        sessionStorage.removeItem("auth-token");
        sessionStorage.removeItem("auth-expiration");
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      sessionStorage.removeItem("auth-token");
      sessionStorage.removeItem("auth-expiration");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to refresh user data using the current token
  const refreshUserData = useCallback(async () => {
    const token = sessionStorage.getItem("auth-token");
    setIsLoading(true);
    await fetchUserData(token ?? "");
  }, [fetchUserData]);

  // Function to log in with a token
  const login = useCallback(
    async (token: string) => {
      sessionStorage.setItem("auth-token", token);

      // Set session expiration time
      const expirationTime = new Date();
      expirationTime.setTime(expirationTime.getTime() + 60 * 60 * 1000); // Add 60 minutes (in milliseconds)
      sessionStorage.setItem("auth-expiration", expirationTime.toISOString());

      setIsLoading(true);
      await fetchUserData(token);
    },
    [fetchUserData]
  );

  // Function to log out
  const logout = useCallback(() => {
    sessionStorage.removeItem("auth-token");
    sessionStorage.removeItem("auth-expiration");
    setUser(null);
  }, []);

  // Initialization effect
  useEffect(() => {
    const token = sessionStorage.getItem("auth-token");
    fetchUserData(token ?? "");
  }, [fetchUserData]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
