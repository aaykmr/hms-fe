import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../services/api";
import apiService from "../services/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (staffId: string, password: string) => Promise<void>;
  signup: (data: {
    staffId: string;
    name: string;
    email: string;
    password: string;
    clearanceLevel?: "L1" | "L2" | "L3" | "L4";
    department?: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasClearance: (level: "L1" | "L2" | "L3" | "L4") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { user } = await apiService.getProfile();
          setUser(user);
        } catch (error) {
          console.error("Failed to load user profile:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (staffId: string, password: string) => {
    const response = await apiService.login({ staffId, password });
    setUser(response.user);
  };

  const signup = async (data: {
    staffId: string;
    name: string;
    email: string;
    password: string;
    clearanceLevel?: "L1" | "L2" | "L3" | "L4";
    department?: string;
  }) => {
    const response = await apiService.signup(data);
    setUser(response.user);
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
  };

  const isAuthenticated = !!user;

  const hasClearance = (level: "L1" | "L2" | "L3" | "L4"): boolean => {
    if (!user) return false;

    const levels = ["L1", "L2", "L3", "L4"];
    const userLevelIndex = levels.indexOf(user.clearanceLevel);
    const requiredLevelIndex = levels.indexOf(level);

    return userLevelIndex >= requiredLevelIndex;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
    hasClearance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
