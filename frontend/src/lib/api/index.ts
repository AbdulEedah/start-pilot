/**
 * API Services Index
 *
 * Central export point for all API service modules.
 */
export { authApi } from "./auth";
export type {
  User,
  LoginResponse,
  LoginPayload,
  RegisterPayload,
  PasswordResetRequestPayload,
  PasswordResetConfirmPayload,
  EmailVerifyPayload,
  GoogleOAuthPayload,
} from "./auth";

export { profilesApi } from "./profiles";
export type { StartupProfile, ProfileStatus, ProfilePayload } from "./profiles";

export { validationApi } from "./validation";
export type { ValidationReport, ValidationPayload } from "./validation";

export { roadmapsApi } from "./roadmaps";
export type { Roadmap, RoadmapTask, RoadmapPayload, TaskUpdatePayload } from "./roadmaps";

export { chatApi } from "./chat";
export type { Message, Conversation, SendMessagePayload, SendMessageResponse } from "./chat";

export { notificationsApi } from "./notifications";
export type { Notification } from "./notifications";

export { recommendationsApi } from "./recommendations";
export type {
  FounderQuote,
  VentureRelevance,
  CaseStudy,
  DailyDirective,
  DynamicMotivationResponse,
} from "./recommendations";

export { adminApi, publicMentorsApi } from "./admin";
export type {
  UserRole,
  AdminAnalyticsResponse,
  AdminAnalyticsMetrics,
  SectorDistribution,
  TrendDay,
  RecentEvent,
  AdminVenture,
  AdminVenturesResponse,
  AdminUser,
  AdminUsersResponse,
  AdminMentor,
  AdminMentorsResponse,
  PublicMentor,
  PublicMentorsResponse,
  AdminContentResponse,
  AdminSector,
  AdminResource,
  AdminSettingsResponse,
} from "./admin";

export { apiClient, ApiError, getDjangoAdminUrl } from "@/lib/api-client";
export type { TokenPair } from "@/lib/api-client";
