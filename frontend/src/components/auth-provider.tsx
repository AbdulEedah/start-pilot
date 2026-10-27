"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiClient } from "@/lib/api-client";
import { authApi, type User } from "@/lib/api/auth";
import { getStoredSector, setStoredSector } from "@/lib/sector-utils";

interface AuthContextType {
  isOnline: boolean;
  user: User | null;
  isAuthenticated: boolean;
  sector: string;
  changeSector: (newSector: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sector, setSectorState] = useState<string>("technology");

  // Fetch current user on mount if tokens exist
  useEffect(() => {
    const initialSector = getStoredSector();
    setSectorState(initialSector);

    if (apiClient.isAuthenticated()) {
      authApi
        .getMe()
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token invalid/expired – clear it
          apiClient.clearTokens();
          setUser(null);
          setIsAuthenticated(false);
        });
    }

    const handleSectorChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSectorState(customEvent.detail);
      }
    };

    window.addEventListener("startpilot_sector_changed", handleSectorChange);
    return () => {
      window.removeEventListener(
        "startpilot_sector_changed",
        handleSectorChange,
      );
    };
  }, []);

  const changeSector = (newSector: string) => {
    setStoredSector(newSector);
    setSectorState(newSector);
  };

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await authApi.login({ email, password });
        apiClient.setTokens({
          access: response.access,
          refresh: response.refresh,
        });
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } catch (error: any) {
        const detail =
          error?.data?.detail ||
          error?.data?.non_field_errors?.[0] ||
          "Invalid email or password.";
        throw new Error(detail);
      }
    },
    [],
  );

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        const response = await authApi.register({
          email,
          full_name: name,
          password,
          password_confirm: password,
        });
        // Backend now returns tokens on registration (auto-login)
        apiClient.setTokens({
          access: response.access,
          refresh: response.refresh,
        });
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      } catch (error: any) {
        const firstError = Object.values(error?.data || {})
          .flat()
          .join(", ");
        throw new Error(firstError || "Registration failed.");
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Even if the API call fails, clear local state
    } finally {
      apiClient.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const updateUser = useCallback(
    async (updates: Partial<User>): Promise<void> => {
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [],
  );

  const value: AuthContextType = {
    isOnline,
    user,
    isAuthenticated,
    sector,
    changeSector,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
