/**
 * Offline Authentication System
 * Simulates authentication without requiring a backend
 */

import { offlineStorage, User } from './offline-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

class OfflineAuth {
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private generateToken(): string {
    return 'offline_' + Math.random().toString(36).substr(2, 15);
  }

  private hashPassword(password: string): string {
    // Simple hash for demo purposes - in real app use proper hashing
    return btoa(password + 'salt');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUsers = await offlineStorage.getAll<User>('users');
      const userExists = existingUsers.some(user => user.email === data.email);

      if (userExists) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Create new user
      const user: User = {
        id: this.generateId(),
        email: data.email,
        name: data.name,
        createdAt: new Date().toISOString(),
        subscription: 'free',
        onboardingCompleted: false
      };

      // Save user and password hash
      await offlineStorage.save('users', user);
      offlineStorage.setItem(`password_${user.id}`, this.hashPassword(data.password));

      // Generate token and set current user
      const token = this.generateToken();
      offlineStorage.setAuthToken(token);
      offlineStorage.setCurrentUser(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Find user by email
      const users = await offlineStorage.getAll<User>('users');
      const user = users.find(u => u.email === credentials.email);

      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check password
      const storedPasswordHash = offlineStorage.getItem<string>(`password_${user.id}`);
      const providedPasswordHash = this.hashPassword(credentials.password);

      if (storedPasswordHash !== providedPasswordHash) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Generate token and set current user
      const token = this.generateToken();
      offlineStorage.setAuthToken(token);
      offlineStorage.setCurrentUser(user);

      return {
        success: true,
        user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Login failed'
      };
    }
  }

  async logout(): Promise<void> {
    offlineStorage.clearAuthToken();
    offlineStorage.clearCurrentUser();
  }

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Check if user exists
      const users = await offlineStorage.getAll<User>('users');
      const userExists = users.some(u => u.email === email);

      // Always return success for security (don't reveal if email exists)
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to send reset email'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you'd validate the reset token
      // For demo purposes, we'll just return success
      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to reset password'
      };
    }
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const currentUser = offlineStorage.getCurrentUser();
      if (currentUser) {
        // Mark email as verified
        const updatedUser = { ...currentUser };
        offlineStorage.setCurrentUser(updatedUser);
        await offlineStorage.save('users', updatedUser);
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: 'Email verification failed'
      };
    }
  }

  getCurrentUser(): User | null {
    return offlineStorage.getCurrentUser();
  }

  isAuthenticated(): boolean {
    const token = offlineStorage.getAuthToken();
    const user = offlineStorage.getCurrentUser();
    return !!(token && user);
  }

  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const currentUser = offlineStorage.getCurrentUser();
      if (!currentUser) {
        return {
          success: false,
          error: 'Not authenticated'
        };
      }

      const updatedUser = { ...currentUser, ...updates };
      offlineStorage.setCurrentUser(updatedUser);
      await offlineStorage.save('users', updatedUser);

      return {
        success: true,
        user: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update profile'
      };
    }
  }
}

export const offlineAuth = new OfflineAuth();