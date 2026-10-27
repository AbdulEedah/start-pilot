/**
 * Chat API Service
 *
 * Handles conversations, sending messages, and retrieving message history.
 */
import { apiClient } from "@/lib/api-client";

export interface Message {
  id: number;
  conversation: number;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface Conversation {
  id: number;
  user: number;
  title: string;
  last_message: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface SendMessagePayload {
  conversation_id?: number;
  content: string;
  context?: Record<string, any>;
}

export interface SendMessageResponse {
  message: Message;
  conversation_id: number;
}

export const chatApi = {
  /**
   * List all conversations for the current user.
   * GET /api/v1/chat/conversations/
   */
  getConversations: () =>
    apiClient.get<Conversation[]>("/api/v1/chat/conversations/"),

  /**
   * Send a message and get an AI response.
   * POST /api/v1/chat/messages/
   */
  sendMessage: (data: SendMessagePayload) =>
    apiClient.post<SendMessageResponse>("/api/v1/chat/messages/", data),

  /**
   * Get message history for a conversation.
   * GET /api/v1/chat/messages/history/?conversation_id=<id>
   */
  getMessageHistory: (conversationId: number) =>
    apiClient.get<Message[]>("/api/v1/chat/messages/history/", {
      conversation_id: String(conversationId),
    }),
};