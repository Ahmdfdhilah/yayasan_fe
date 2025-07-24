// apps/vite-react-app/src/services/board-members/service.ts
import { BaseService } from "../base";
import {
  BoardMemberCreate,
  BoardMemberUpdate,
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

  // Get active board members
  async getActiveBoardMembers(limit?: number): Promise<BoardMemberResponse[]> {
    const queryParams = new URLSearchParams();
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    
    const endpoint = queryParams.toString() ? `/active?${queryParams.toString()}` : "/active";
    return this.get(endpoint);
  }

  // Get board members by position
  async getBoardMembersByPosition(position: string): Promise<BoardMemberResponse[]> {
    return this.get(`/position/${encodeURIComponent(position)}`);
  }

  // Search board members
  async searchBoardMembers(
    query: string, 
    limit?: number, 
    activeOnly: boolean = true
  ): Promise<BoardMemberResponse[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);
    if (limit) {
      queryParams.append("limit", limit.toString());
    }
    queryParams.append("active_only", activeOnly.toString());
    
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

  // Create new board member (admin only)
  async createBoardMember(
    boardMemberData: BoardMemberCreate
  ): Promise<BoardMemberResponse> {
    return this.post("/", boardMemberData);
  }

  // Get board member by ID
  async getBoardMemberById(
    boardMemberId: number
  ): Promise<BoardMemberResponse> {
    return this.get(`/${boardMemberId}`);
  }

  // Update board member (admin only)
  async updateBoardMember(
    boardMemberId: number,
    boardMemberData: BoardMemberUpdate
  ): Promise<BoardMemberResponse> {
    return this.put(`/${boardMemberId}`, boardMemberData);
  }

  // Delete board member (admin only)
  async deleteBoardMember(
    boardMemberId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${boardMemberId}`);
  }

  // Update display order (admin only)
  async updateDisplayOrder(
    boardMemberId: number,
    newOrder: number
  ): Promise<BoardMemberResponse> {
    return this.patch(`/${boardMemberId}/display-order`, { new_order: newOrder });
  }

  // Toggle active status (admin only)
  async toggleActiveStatus(
    boardMemberId: number
  ): Promise<BoardMemberResponse> {
    return this.patch(`/${boardMemberId}/toggle-active`);
  }
}

export const boardMemberService = new BoardMemberService();