/**
 * Admin Panel API Service
 * Handles platform analytics, startup venture management, founder administration,
 * content management, and system settings.
 * Purely focused on startup guidance & AI synthesis (no payment logic).
 */
import { apiClient } from "@/lib/api-client";

export interface AdminAnalyticsMetrics {
  total_founders: number;
  active_founders: number;
  verified_founders: number;
  new_founders_30d: number;
  total_startups: number;
  total_roadmaps: number;
  total_validations: number;
  avg_viability_score: number;
  total_ai_requests: number;
  ai_success_rate: string;
  total_tokens: number;
}

export interface SectorDistribution {
  key: string;
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface TrendDay {
  day: string;
  users: number;
  ai_requests: number;
}

export interface RecentEvent {
  id: string;
  type: string;
  title: string;
  time: string;
  badge: string;
}

export interface AdminAnalyticsResponse {
  metrics: AdminAnalyticsMetrics;
  sectors: SectorDistribution[];
  trend: TrendDay[];
  recent_events: RecentEvent[];
}

export interface AdminVenture {
  id: string;
  founder_name: string;
  founder_email: string;
  sector: string;
  sector_display: string;
  problem: string;
  background_story?: string;
  generation_status: "idle" | "pending" | "processing" | "completed" | "failed";
  viability_score?: number | null;
  roadmap_weeks?: number | null;
  roadmap_tasks: number;
  created_at: string;
}

export interface AdminVenturesResponse {
  ventures: AdminVenture[];
  total: number;
  completed_count: number;
  processing_count: number;
}

export type UserRole = "user" | "admin" | "super_admin";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Suspended";
  is_staff: boolean;
  is_superuser: boolean;
  is_email_verified: boolean;
  joined: string;
  sector: string;
  onboarding_completed: boolean;
  viability_score?: number | null;
  tokens_used?: number;
  token_limit?: number;
  ai_access_blocked?: boolean;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  current_user_role?: UserRole;
}

export interface AdminMentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  sector: string;
  bio: string;
  background_story?: string;
  expertise: string[];
  experience_years: string;
  rating: number;
  availability: "available" | "busy" | "offline";
  contact_email: string;
  linkedin_url?: string;
  calendly_url?: string;
  phone?: string;
  notes?: string;
  is_active: boolean;
  created_at?: string;
}

export interface AdminMentorsResponse {
  mentors: AdminMentor[];
  total: number;
  available_count: number;
}

export interface AdminSector {
  name: string;
  code: string;
  status: string;
  founders: number;
  resources: number;
}

export interface AdminResource {
  id: string;
  name: string;
  category: string;
  type: string;
  url?: string;
  sector: string;
}

export interface AdminContentResponse {
  sectors: AdminSector[];
  resources: AdminResource[];
}

export interface AdminSettingsResponse {
  settings: {
    platform_name: string;
    support_email: string;
    maintenance_mode: boolean;
    enforce_mfa: boolean;
    rate_limiting: boolean;
    session_timeout_hours: number;
    [key: string]: any;
  };
  system: {
    database: string;
    ai_engine: string;
    celery: string;
    api_version: string;
  };
}

export const adminApi = {
  getAnalytics: (): Promise<AdminAnalyticsResponse> => {
    return apiClient.get<AdminAnalyticsResponse>("/api/v1/admin/analytics/");
  },

  getVentures: (params?: {
    search?: string;
    sector?: string;
    status?: string;
  }): Promise<AdminVenturesResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sector) query.set("sector", params.sector);
    if (params?.status) query.set("status", params.status);
    const queryString = query.toString();
    return apiClient.get<AdminVenturesResponse>(
      `/api/v1/admin/ventures/${queryString ? `?${queryString}` : ""}`
    );
  },

  getVenture: (id: string): Promise<any> => {
    return apiClient.get<any>(`/api/v1/admin/ventures/${id}/`);
  },

  getUsers: (params?: { search?: string; status?: string }): Promise<AdminUsersResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.status) query.set("status", params.status);
    const queryString = query.toString();
    return apiClient.get<AdminUsersResponse>(
      `/api/v1/admin/users/${queryString ? `?${queryString}` : ""}`
    );
  },

  createUser: (data: {
    email: string;
    full_name?: string;
    password: string;
    role?: UserRole;
    is_staff?: boolean;
  }): Promise<AdminUser> => {
    return apiClient.post<AdminUser>("/api/v1/admin/users/", data);
  },

  updateUser: (
    id: string | number,
    data: { is_active?: boolean; is_staff?: boolean; role?: UserRole; full_name?: string }
  ): Promise<AdminUser> => {
    return apiClient.patch<AdminUser>(`/api/v1/admin/users/${id}/`, data);
  },

  deleteUser: (id: string | number): Promise<{ detail: string }> => {
    return apiClient.delete<{ detail: string }>(`/api/v1/admin/users/${id}/`);
  },

  getUser: (id: string | number): Promise<any> => {
    return apiClient.get<any>(`/api/v1/admin/users/${id}/`);
  },

  updateUserTokens: (
    id: string | number,
    data: {
      token_limit?: number;
      reset_used?: boolean;
      add_tokens?: number;
      ai_access_blocked?: boolean;
    }
  ): Promise<{
    id: string;
    email: string;
    tokens_used: number;
    token_limit: number;
    ai_access_blocked: boolean;
    remaining_tokens: number | string;
    usage_percentage: number;
  }> => {
    return apiClient.post(`/api/v1/admin/users/${id}/tokens/`, data);
  },

  getMentors: (params?: {
    search?: string;
    sector?: string;
    availability?: string;
  }): Promise<AdminMentorsResponse> => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.sector) query.set("sector", params.sector);
    if (params?.availability) query.set("availability", params.availability);
    const queryString = query.toString();
    return apiClient.get<AdminMentorsResponse>(
      `/api/v1/admin/mentors/${queryString ? `?${queryString}` : ""}`
    );
  },

  getMentor: (id: string): Promise<AdminMentor> => {
    return apiClient.get<AdminMentor>(`/api/v1/admin/mentors/${id}/`);
  },

  createMentor: (data: Partial<AdminMentor>): Promise<AdminMentor> => {
    return apiClient.post<AdminMentor>("/api/v1/admin/mentors/", data);
  },

  updateMentor: (id: string, data: Partial<AdminMentor>): Promise<AdminMentor> => {
    return apiClient.patch<AdminMentor>(`/api/v1/admin/mentors/${id}/`, data);
  },

  deleteMentor: (id: string): Promise<{ detail: string }> => {
    return apiClient.delete<{ detail: string }>(`/api/v1/admin/mentors/${id}/`);
  },

  getContent: (): Promise<AdminContentResponse> => {
    return apiClient.get<AdminContentResponse>("/api/v1/admin/content/");
  },

  addResource: (data: {
    name: string;
    category: string;
    type: string;
    url?: string;
    sector?: string;
  }): Promise<AdminResource> => {
    return apiClient.post<AdminResource>("/api/v1/admin/content/", data);
  },

  deleteResource: (id: string): Promise<{ detail: string }> => {
    return apiClient.delete<{ detail: string }>(`/api/v1/admin/content/resources/${id}/`);
  },

  getSettings: (): Promise<AdminSettingsResponse> => {
    return apiClient.get<AdminSettingsResponse>("/api/v1/admin/settings/");
  },

  saveSettings: (data: Record<string, any>): Promise<{ detail: string; settings: any }> => {
    return apiClient.post<{ detail: string; settings: any }>("/api/v1/admin/settings/", data);
  },
};

export interface PublicMentor {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar?: string;
  sector: string;
  bio: string;
  background_story?: string;
  expertise: string[];
  experience: string;
  rating: number;
  availability: "available" | "busy" | "offline";
  contact_email: string;
  linkedin_url?: string;
  calendly_url?: string;
  phone?: string;
}

export interface PublicMentorsResponse {
  mentors: PublicMentor[];
  total: number;
  user_sector?: string;
  filter_type?: string;
}

export const publicMentorsApi = {
  getMentors: (params?: { sector?: string; filter_type?: string; search?: string }): Promise<PublicMentorsResponse> => {
    const query = new URLSearchParams();
    if (params?.sector) query.set("sector", params.sector);
    if (params?.filter_type) query.set("filter_type", params.filter_type);
    if (params?.search) query.set("search", params.search);
    const queryString = query.toString();
    return apiClient.get<PublicMentorsResponse>(
      `/api/v1/mentors/${queryString ? `?${queryString}` : ""}`
    );
  },
};
