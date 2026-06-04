"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { offlineAuth } from '@/lib/offline-auth';
import { offlineStorage, User } from '@/lib/offline-storage';

interface OfflineContextType {
  isOnline: boolean;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(false); // Always offline for this demo
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize offline storage
    offlineStorage.init().catch(console.error);

    // Check if user is already logged in
    const currentUser = offlineAuth.getCurrentUser();
    if (currentUser && offlineAuth.isAuthenticated()) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }

    // Set up demo data if first time
    setupDemoData();
  }, []);

  const setupDemoData = async () => {
    try {
      // Check if demo user already exists
      const users = await offlineStorage.getAll('users');
      if (users.length === 0) {
        // Create demo user
        await offlineAuth.register({
          email: 'demo@startpilot.com',
          password: 'demo123',
          name: 'Demo User'
        });
      }
    } catch (error) {
      console.error('Failed to setup demo data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await offlineAuth.login({ email, password });
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const result = await offlineAuth.register({ email, password, name });
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await offlineAuth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    try {
      const result = await offlineAuth.updateProfile(updates);
      if (result.success && result.user) {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  };

  const value: OfflineContextType = {
    isOnline,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}