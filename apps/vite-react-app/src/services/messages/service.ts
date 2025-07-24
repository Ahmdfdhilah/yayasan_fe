// apps/vite-react-app/src/services/messages/service.ts
import { BaseService } from "../base";
import {
  MessageCreate,
  MessageUpdate,
  MessageStatusUpdate,
  MessageResponse as MessageResponseType,
  MessageListResponse,
  MessageSummary,
  MessageFilterParams,
  MessageStatistics,
  PublicMessageResponse,
  MessageStatus,
  MessageResponse,
} from "./types";

class MessageService extends BaseService {
  constructor() {
    super("/messages");
  }

  // ===== PUBLIC ENDPOINTS =====

  // Submit message (public - no auth required)
  async submitMessage(
    messageData: MessageCreate
  ): Promise<PublicMessageResponse> {
    return this.post("/submit", messageData);
  }

  // ===== ADMIN ENDPOINTS =====

  // List messages with filtering (admin only)
  async getMessages(
    params?: MessageFilterParams
  ): Promise<MessageListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/?${queryParams.toString()}` : "/";
    return this.get(endpoint);
  }

  // Get unread messages (admin only)
  async getUnreadMessages(limit?: number): Promise<MessageResponseType[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/unread?${queryParams.toString()}` : "/unread";
    return this.get(endpoint);
  }

  // Get messages by email (admin only)
  async getMessagesByEmail(email: string): Promise<MessageResponseType[]> {
    return this.get(`/by-email/${encodeURIComponent(email)}`);
  }

  // Search messages (admin only)
  async searchMessages(
    query: string, 
    limit?: number
  ): Promise<MessageResponseType[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    return this.get(`/search?${queryParams.toString()}`);
  }

  // Get message statistics (admin only)
  async getMessageStatistics(): Promise<MessageStatistics> {
    return this.get("/statistics");
  }

  // Get message summaries (admin only)
  async getMessageSummaries(
    params?: MessageFilterParams
  ): Promise<MessageSummary[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/summaries?${queryParams.toString()}` : "/summaries";
    return this.get(endpoint);
  }

  // Get message by ID (admin only)
  async getMessageById(
    messageId: number,
    markAsRead: boolean = false
  ): Promise<MessageResponseType> {
    const queryParams = new URLSearchParams();
    if (markAsRead) {
      queryParams.append("mark_as_read", "true");
    }
    
    const endpoint = queryParams.toString() ? `/${messageId}?${queryParams.toString()}` : `/${messageId}`;
    return this.get(endpoint);
  }

  // Update message (admin only)
  async updateMessage(
    messageId: number,
    messageData: MessageUpdate
  ): Promise<MessageResponseType> {
    return this.put(`/${messageId}`, messageData);
  }

  // Delete message (admin only)
  async deleteMessage(
    messageId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${messageId}`);
  }

  // ===== STATUS MANAGEMENT METHODS =====

  // Update message status (admin only)
  async updateMessageStatus(
    messageId: number,
    statusData: MessageStatusUpdate
  ): Promise<MessageResponseType> {
    return this.patch(`/${messageId}/status`, statusData);
  }

  // Mark message as read (admin only)
  async markMessageAsRead(
    messageId: number
  ): Promise<MessageResponseType> {
    return this.post(`/${messageId}/mark-read`);
  }

  // Archive message (admin only)
  async archiveMessage(
    messageId: number
  ): Promise<MessageResponseType> {
    return this.post(`/${messageId}/archive`);
  }

  // ===== BULK OPERATIONS =====

  // Bulk update message status (admin only)
  async bulkUpdateStatus(
    messageIds: number[],
    status: MessageStatus
  ): Promise<MessageResponse> {
    return this.post("/bulk/status", {
      message_ids: messageIds,
      status: status
    });
  }

  // Bulk delete messages (admin only)
  async bulkDeleteMessages(
    messageIds: number[]
  ): Promise<MessageResponse> {
    return this.post("/bulk/delete", {
      message_ids: messageIds
    });
  }

  // Bulk mark messages as read (admin only)
  async bulkMarkAsRead(
    messageIds: number[]
  ): Promise<MessageResponse> {
    return this.post("/bulk/mark-read", {
      message_ids: messageIds
    });
  }

  // Bulk archive messages (admin only)
  async bulkArchiveMessages(
    messageIds: number[]
  ): Promise<MessageResponse> {
    return this.post("/bulk/archive", {
      message_ids: messageIds
    });
  }
}

export const messageService = new MessageService();