/**
 * Profiles API Service
 *
 * Handles startup profile creation/updates, onboarding completion,
 * and profile status checks.
 */
import { apiClient } from "@/lib/api-client";

export interface StartupProfile {
  id: number;
  sector: string;
  sector_display: string;
  startup_name?: string;
  elevator_pitch?: string;
  background_story: string;
  problem: string;
  solution?: string;
  target_audience?: string;
  stage?: string;
  country: string;
  state: string;
  city: string;
  existing_experience: string;
  key_skills: string[];
  available_resources: Record<string, any>;
  team_status: string;
  team_status_display: string;
  time_commitment: string;
  time_commitment_display: string;
  onboarding_completed: boolean;
  generation_status: string;
  generation_status_display: string;
  generation_error: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileStatus {
  id: number;
  onboarding_completed: boolean;
  generation_status: string;
  generation_status_display: string;
  generation_error: string;
}

export interface ProfilePayload {
  sector?: string;
  startup_name?: string;
  elevator_pitch?: string;
  background_story?: string;
  problem?: string;
  solution?: string;
  target_audience?: string;
  stage?: string;
  country?: string;
  state?: string;
  city?: string;
  existing_experience?: string;
  key_skills?: string[];
  available_resources?: Record<string, any>;
  team_status?: string;
  time_commitment?: string;
}

export interface OnboardingSessionPayload {
  session_id?: string;
  sector: string;
  form_data?: Record<string, any>;
  chat_messages?: Array<{ role: string; content: string; timestamp?: string }>;
}

export interface OnboardingSessionResponse {
  status: string;
  session_id: string;
  sector: string;
  messages_count: number;
}

export const profilesApi = {
  /**
   * Save onboarding session data & chat history to database (works unauthenticated).
   * POST /api/v1/profile/onboarding-session/
   */
  saveOnboardingSession: (data: OnboardingSessionPayload) =>
    apiClient.post<OnboardingSessionResponse>("/api/v1/profile/onboarding-session/", data, false),

  /**
   * Get saved onboarding session data by session_id.
   * GET /api/v1/profile/onboarding-session/?session_id=<id>
   */
  getOnboardingSession: (sessionId: string) =>
    apiClient.get<any>(`/api/v1/profile/onboarding-session/?session_id=${encodeURIComponent(sessionId)}`, undefined, false),

  /**
   * Get the current user's startup profile.
   * GET /api/v1/profile/
   */
  getProfile: () => apiClient.get<StartupProfile>("/api/v1/profile/"),

  /**
   * Full update of the startup profile.
   * PUT /api/v1/profile/
   * All writable fields must be provided.
   */
  updateProfile: (data: ProfilePayload) =>
    apiClient.put<StartupProfile>("/api/v1/profile/", data),

  /**
   * Partial update of the startup profile.
   * PATCH /api/v1/profile/
   * Only the provided fields are updated.
   */
  patchProfile: (data: Partial<ProfilePayload>) =>
    apiClient.patch<StartupProfile>("/api/v1/profile/", data),

  /**
   * Complete onboarding.
   * POST /api/v1/profile/complete-onboarding/
   */
  completeOnboarding: () =>
    apiClient.post<ProfileStatus>("/api/v1/profile/complete-onboarding/"),

  /**
   * Get profile & onboarding status.
   * GET /api/v1/profile/status/
   */
  getStatus: () => apiClient.get<ProfileStatus>("/api/v1/profile/status/"),
};