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
  message?: string;
  context?: Record<string, any>;
}

export interface SendMessageResponse {
  message: Message;
  conversation_id: number;
  id?: number;
  role?: string;
  content?: string;
  created_at?: string;
  suggested_questions?: string[];
}

export interface PaginatedResponse<T> {
  count: number;
  total_pages?: number;
  next: string | null;
  previous: string | null;
  results: T[];
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
    apiClient.post<SendMessageResponse>("/api/v1/chat/messages/", {
      ...data,
      message: data.content || data.message,
    }),

  /**
   * Get message history for a conversation.
   * Unpacks paginated response automatically.
   * GET /api/v1/chat/messages/history/?conversation_id=<id>
   */
  getMessageHistory: async (conversationId: number): Promise<Message[]> => {
    const res = await apiClient.get<any>("/api/v1/chat/messages/history/", {
      conversation_id: String(conversationId),
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.results)) return res.results;
    if (Array.isArray(res?.messages)) return res.messages;
    return [];
  },
};
