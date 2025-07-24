// apps/vite-react-app/src/services/messages/types.ts

import { PaginatedResponse } from "../base/types";

// Message Status Enum
export enum MessageStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived"
}

// Message Types
export interface Message {
  id: number;
  email: string;
  name: string;
  title: string;
  message: string;
  status: MessageStatus;
  ip_address?: string;
  user_agent?: string;
  read_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
  is_unread: boolean;
  short_message: string;
  short_title: string;
}

// Request Types
export interface MessageCreate {
  email: string;
  name: string;
  title: string;
  message: string;
}

export interface MessageUpdate {
  status?: MessageStatus;
}

export interface MessageStatusUpdate {
  status: MessageStatus;
}

// Response Types
export interface MessageResponse extends Message {}

export interface MessageListResponse extends PaginatedResponse<Message> {}

export interface MessageSummary {
  id: number;
  email: string;
  name: string;
  short_title: string;
  status: MessageStatus;
  is_unread: boolean;
  created_at: string;
}

export interface PublicMessageResponse {
  id: number;
  title: string;
  status: string;
  created_at: string;
  message: string;
}

// Filter Types
export interface MessageFilterParams {
  page?: number;
  size?: number;
  search?: string;
  status?: MessageStatus;
  unread_only?: boolean;
  created_after?: string;
  created_before?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

// Statistics Types
export interface MessageStatistics {
  total_messages: number;
  unread_messages: number;
  read_messages: number;
  archived_messages: number;
  messages_today: number;
  messages_this_week: number;
  messages_this_month: number;
}

// Response wrapper for single operations
export interface MessageResponse {
  message: string;
  success?: boolean;
  data?: object;
}