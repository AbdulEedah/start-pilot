/**
 * Notifications API Service
 *
 * Handles listing notifications and marking them as read.
 */
import { apiClient } from "@/lib/api-client";

export interface Notification {
  id: number;
  user: number;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

export const notificationsApi = {
  /**
   * List all notifications for the current user.
   * GET /api/v1/notifications/
   */
  getNotifications: () =>
    apiClient.get<Notification[]>("/api/v1/notifications/"),

  /**
   * Mark a notification as read.
   * POST /api/v1/notifications/<id>/read/
   */
  markAsRead: (notificationId: number) =>
    apiClient.post<{ detail: string }>(
      `/api/v1/notifications/${notificationId}/read/`
    ),
};