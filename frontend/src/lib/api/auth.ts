/**
 * Auth API Service
 *
 * Handles user registration, login, logout, password reset,
 * email verification, and Google OAuth.
 */
import { apiClient, type TokenPair } from "@/lib/api-client";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar: string | null;
  is_email_verified: boolean;
  date_joined: string;
  role?: "user" | "admin" | "super_admin";
  is_staff?: boolean;
  is_superuser?: boolean;
  sector?: string;
  onboarding_completed?: boolean;
  onboardingCompleted?: boolean;
}

export interface LoginResponse {
  user: User;
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  phone?: string;
  session_id?: string;
  password: string;
  password_confirm: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  token: string;
  password: string;
  password_confirm: string;
}

export interface EmailVerifyPayload {
  token: string;
}

export interface GoogleOAuthPayload {
  code: string;
}

export const authApi = {
  /**
   * Register a new user account.
   * POST /api/v1/auth/register/
   */
  register: (data: RegisterPayload) =>
    apiClient.post<LoginResponse>("/api/v1/auth/register/", data, false),

  /**
   * Login with email and password.
   * POST /api/v1/auth/login/
   */
  login: (data: LoginPayload) =>
    apiClient.post<LoginResponse>("/api/v1/auth/login/", data, false),

  /**
   * Login or register via Google OAuth.
   * POST /api/v1/auth/google/
   */
  googleOAuth: (data: GoogleOAuthPayload) =>
    apiClient.post<LoginResponse>("/api/v1/auth/google/", data, false),

  /**
   * Logout and blacklist the refresh token.
   * POST /api/v1/auth/logout/
   */
  logout: (refreshToken: string) =>
    apiClient.post<void>("/api/v1/auth/logout/", { refresh: refreshToken }),

  /**
   * Get the currently authenticated user's profile.
   * GET /api/v1/auth/me/
   */
  getMe: () => apiClient.get<User>("/api/v1/auth/me/"),

  /**
   * Refresh the JWT access token.
   * POST /api/v1/auth/token/refresh/
   */
  refreshToken: (refresh: string) =>
    apiClient.post<TokenPair>("/api/v1/auth/token/refresh/", { refresh }, false),

  /**
   * Request a password reset email.
   * POST /api/v1/auth/password-reset/
   */
  requestPasswordReset: (data: PasswordResetRequestPayload) =>
    apiClient.post<{ detail: string }>("/api/v1/auth/password-reset/", data, false),

  /**
   * Confirm a password reset with token.
   * POST /api/v1/auth/password-reset/confirm/
   */
  confirmPasswordReset: (data: PasswordResetConfirmPayload) =>
    apiClient.post<{ detail: string }>("/api/v1/auth/password-reset/confirm/", data, false),

  /**
   * Verify email address with token.
   * POST /api/v1/auth/verify-email/
   */
  verifyEmail: (data: EmailVerifyPayload) =>
    apiClient.post<{ detail: string }>("/api/v1/auth/verify-email/", data, false),
};