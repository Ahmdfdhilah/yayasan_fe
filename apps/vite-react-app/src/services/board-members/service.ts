// apps/vite-react-app/src/services/board-members/service.ts
import { BaseService } from "../base";
import {
  BoardGroupCreate,
  BoardGroupUpdate,
  BoardGroupResponse,
  BoardGroupListResponse,
  BoardGroupFilterParams,
  BoardMemberCreate,
  BoardMemberUpdate,
  BoardMemberResponse,
  BoardMemberListResponse,
  BoardMemberFilterParams,
  MessageResponse,
} from "./types";

class BoardMemberService extends BaseService {
  constructor() {
    super("/board-members");
  }

  // ===== BOARD GROUP METHODS =====

  // List board groups with filtering  
  async getBoardGroups(
    params?: BoardGroupFilterParams
  ): Promise<BoardGroupListResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = queryParams.toString() ? `/groups?${queryParams.toString()}` : "/groups";
    return this.get(endpoint);
  }

  // Create new board group (admin only)
  async createBoardGroup(data: BoardGroupCreate): Promise<BoardGroupResponse> {
    return this.post("/groups", data);
  }

  // Get board group by ID
  async getBoardGroupById(boardGroupId: number): Promise<BoardGroupResponse> {
    return this.get(`/groups/${boardGroupId}`);
  }

  // Update board group (admin only)
  async updateBoardGroup(
    boardGroupId: number,
    data: BoardGroupUpdate
  ): Promise<BoardGroupResponse> {
    return this.put(`/groups/${boardGroupId}`, data);
  }

  // Delete board group (admin only)
  async deleteBoardGroup(boardGroupId: number): Promise<MessageResponse> {
    return this.delete(`/groups/${boardGroupId}`);
  }

  // ===== BOARD MEMBER METHODS =====

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
    
    const endpoint = queryParams.toString() ? `/members?${queryParams.toString()}` : "/members";
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
    
    return this.post("/members", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get board member by ID
  async getBoardMemberById(
    boardMemberId: number
  ): Promise<BoardMemberResponse> {
    return this.get(`/members/${boardMemberId}`);
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
    
    return this.put(`/members/${boardMemberId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete board member (admin only)
  async deleteBoardMember(
    boardMemberId: number
  ): Promise<MessageResponse> {
    return this.delete(`/members/${boardMemberId}`);
  }

}

export const boardMemberService = new BoardMemberService();