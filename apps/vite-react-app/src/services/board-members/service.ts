// apps/vite-react-app/src/services/board-members/service.ts
import { BaseService } from "../base";
import {
  BoardMemberResponse,
  BoardMemberListResponse,
  BoardMemberSummary,
  BoardMemberFilterParams,
  BoardMemberStatistics,
  MessageResponse,
} from "./types";

class BoardMemberService extends BaseService {
  constructor() {
    super("/board-members");
  }

  // List board members with filtering
  async getBoardMembers(
    params?: BoardMemberFilterParams
  ): Promise<BoardMemberListResponse> {
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

  // Get all board members
  async getAllBoardMembers(limit?: number): Promise<BoardMemberResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/all?${queryParams.toString()}` : "/all";
    return this.get(endpoint);
  }

  // Get board members by position
  async getBoardMembersByPosition(position: string): Promise<BoardMemberResponse[]> {
    return this.get(`/position/${encodeURIComponent(position)}`);
  }

  // Search board members
  async searchBoardMembers(
    query: string, 
    limit?: number
  ): Promise<BoardMemberResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    return this.get(`/search?${queryParams.toString()}`);
  }

  // Get board member statistics (admin only)
  async getBoardMemberStatistics(): Promise<BoardMemberStatistics> {
    return this.get("/statistics");
  }

  // Get board member summaries
  async getBoardMemberSummaries(
    params?: BoardMemberFilterParams
  ): Promise<BoardMemberSummary[]> {
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

  // Create new board member with multipart form data (admin only)
  async createBoardMember(
    data: BoardMemberCreate,
    image: File
  ): Promise<BoardMemberResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', image);
    
    return this.post("/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get board member by ID
  async getBoardMemberById(
    boardMemberId: number
  ): Promise<BoardMemberResponse> {
    return this.get(`/${boardMemberId}`);
  }

  // Update board member with optional image upload (admin only)
  async updateBoardMember(
    boardMemberId: number,
    data: BoardMemberUpdate,
    image?: File
  ): Promise<BoardMemberResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${boardMemberId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete board member (admin only)
  async deleteBoardMember(
    boardMemberId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${boardMemberId}`);
  }

  // Update display order (admin only) - Updated endpoint path
  async updateDisplayOrder(
    boardMemberId: number,
    newOrder: number
  ): Promise<BoardMemberResponse> {
    return this.patch(`/${boardMemberId}/order`, { new_order: newOrder });
  }

}

export const boardMemberService = new BoardMemberService();