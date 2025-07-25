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

  // Create new organization with multipart form data
  async createOrganization(
    data: OrganizationCreate,
    image?: File
  ): Promise<OrganizationResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.post("/", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Get organization by ID
  async getOrganizationById(
    organizationId: number
  ): Promise<OrganizationResponse> {
    return this.get(`/${organizationId}`);
  }

  // Update organization with multipart form data
  async updateOrganization(
    organizationId: number,
    data: OrganizationUpdate,
    image?: File
  ): Promise<OrganizationResponse> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    if (image) {
      formData.append('image', image);
    }
    
    return this.put(`/${organizationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Delete organization
  async deleteOrganization(
    organizationId: number
  ): Promise<MessageResponse> {
    return this.delete(`/${organizationId}`);
  }
}

export const organizationService = new OrganizationService();