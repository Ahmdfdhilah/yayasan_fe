// apps/vite-react-app/src/services/organizations/service.ts
import { BaseService } from "../base";
import {
  OrganizationCreate,
  OrganizationUpdate,
  OrganizationResponse,
  OrganizationListResponse,
  OrganizationFilterParams,
  MessageResponse,
} from "./types";

class OrganizationService extends BaseService {
  constructor() {
    super("/organizations");
  }

  // List organizations with filtering
  async getOrganizations(
    params?: OrganizationFilterParams
  ): Promise<OrganizationListResponse> {
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

  // Create new organization
  async createOrganization(
    organizationData: OrganizationCreate
  ): Promise<OrganizationResponse> {
    return this.post("/", organizationData);
  }

  // Get organization by ID
  async getOrganizationById(
    organizationId: number
  ): Promise<OrganizationResponse> {
    return this.get(`/${organizationId}`);
  }

  // Update organization
  async updateOrganization(
    organizationId: number,
    organizationData: OrganizationUpdate
  ): Promise<OrganizationResponse> {
    return this.put(`/${organizationId}`, organizationData);
  }

  // Delete organization
  async deleteOrganization(
    organizationId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${organizationId}`);
  }
}

export const organizationService = new OrganizationService();