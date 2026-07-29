"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { offlineAuth } from '@/lib/offline-auth';
import { offlineStorage, User } from '@/lib/offline-storage';
import { getStoredSector, setStoredSector } from '@/lib/sector-utils';

interface OfflineContextType {
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

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const DEFAULT_DEMO_USER: User = {
  id: 'demo-user-1',
  email: 'demo@startpilot.com',
  name: 'Demo Founder',
  createdAt: '2026-01-01T00:00:00.000Z',
  subscription: 'pro',
  onboardingCompleted: true
};

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true); // Connected / Live online status
  const [user, setUser] = useState<User | null>(DEFAULT_DEMO_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [sector, setSectorState] = useState<string>("technology");

  useEffect(() => {
    // Initialize offline storage in background
    offlineStorage.init().catch(console.error);

    const initialSector = getStoredSector();
    setSectorState(initialSector);

    const currentUser = offlineAuth.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      setUser(DEFAULT_DEMO_USER);
    }
    setIsAuthenticated(true);

    const handleSectorChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setSectorState(customEvent.detail);
      }
    };

    window.addEventListener("startpilot_sector_changed", handleSectorChange);
    return () => {
      window.removeEventListener("startpilot_sector_changed", handleSectorChange);
    };
  }, []);

  const changeSector = (newSector: string) => {
    setStoredSector(newSector);
    setSectorState(newSector);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const activeUser = { ...DEFAULT_DEMO_USER, email: email || DEFAULT_DEMO_USER.email };
    setUser(activeUser);
    setIsAuthenticated(true);
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const newUser = {
      ...DEFAULT_DEMO_USER,
      email: email || DEFAULT_DEMO_USER.email,
      name: name || DEFAULT_DEMO_USER.name
    };
    setUser(newUser);
    setIsAuthenticated(true);
    return true;
  };

  const logout = async (): Promise<void> => {
    // Auth is frozen - logout stays authenticated as demo user
    setUser(DEFAULT_DEMO_USER);
    setIsAuthenticated(true);
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    setUser(prev => (prev ? { ...prev, ...updates } : { ...DEFAULT_DEMO_USER, ...updates }));
  };

  const value: OfflineContextType = {
    isOnline,
    user: user || DEFAULT_DEMO_USER,
    isAuthenticated: true,
    sector,
    changeSector,
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