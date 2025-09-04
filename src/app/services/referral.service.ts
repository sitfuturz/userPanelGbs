import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';

export interface ReferralData {
  _id: string;
  giver_id: {
    _id: string;
    name: string;
    mobile_number: string;
    email: string;
    profilePic: string;
  };
  receiver_id: string;
  referral_type: string;
  referral_status: {
    told_them_you_would_will: boolean;
    given_card: boolean;
  };
  referral: string;
  mobile_number: string;
  address: string;
  comments: string;
  business_name: string;
  rating: number;
  createdAt: string;
  __v: number;
}

export interface ReferralResponse {
  success: boolean;
  message: string;
  data: ReferralData[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile_number: string;
  profilePic: string;
  chapter_name: string;
  business_name: string;
  address: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  docs: User[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface CreateReferralRequest {
  giver_id?: string; // Will be added from token
  receiver_id: string;
  referral_type: 'inside' | 'outside';
  referral_status: {
    told_them_you_would_will: boolean;
    given_card: boolean;
  };
  referral?: string;
  mobile_number: string;
  address?: string;
  comments?: string;
  business_name?: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private headers: any = [];
  private baseUrl = 'http://localhost:3200';

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token != null) {
      this.headers.push({ 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
  };

  private getUserIdFromToken(): string {
    const token = this.storage.get(common.TOKEN);
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    try {
      // Decode JWT token to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }

  /**
   * Get given referrals for the current user
   */
  async getGivenReferrals(page: number = 1): Promise<ReferralResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/get-given-referral/${userId}?page=${page}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Given Referrals Error:', error);
      swalHelper.showToast('Failed to fetch given referrals', 'error');
      throw error;
    }
  }

  /**
   * Get received referrals for the current user
   */
  async getReceivedReferrals(page: number = 1): Promise<ReferralResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/get-received-referral/${userId}?page=${page}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Received Referrals Error:', error);
      swalHelper.showToast('Failed to fetch received referrals', 'error');
      throw error;
    }
  }

  /**
   * Get list of inside users (same chapter)
   */
  async getInsideUsers(page: number = 1, limit: number = 50): Promise<UserResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/get-inside-users?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Inside Users Error:', error);
      swalHelper.showToast('Failed to fetch inside users', 'error');
      throw error;
    }
  }

  /**
   * Get list of outside users (cross-chapter)
   */
  async getOutsideUsers(page: number = 1, limit: number = 50): Promise<UserResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/get-outside-users?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Outside Users Error:', error);
      swalHelper.showToast('Failed to fetch outside users', 'error');
      throw error;
    }
  }

  /**
   * Create a new referral
   */
  async createReferral(referralData: CreateReferralRequest): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      // Add giver_id from token
      const requestData = {
        ...referralData,
        giver_id: userId
      };

      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/create-referral`,
          method: 'POST',
        },
        requestData,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Create Referral Error:', error);
      swalHelper.showToast('Failed to create referral', 'error');
      throw error;
    }
  }

  /**
   * Get all users (both inside and outside) with search and pagination
   */
  async getAllUsers(searchTerm: string = '', page: number = 1, limit: number = 20): Promise<{inside: UserResponse, outside: UserResponse}> {
    try {
      const [insideUsers, outsideUsers] = await Promise.all([
        this.getInsideUsers(page, limit),
        this.getOutsideUsers(page, limit)
      ]);

      return {
        inside: insideUsers,
        outside: outsideUsers
      };
    } catch (error) {
      console.error('Get All Users Error:', error);
      throw error;
    }
  }

  /**
   * Update an existing referral
   */
  async updateReferral(referralId: string, referralData: Partial<CreateReferralRequest>): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/update-referral/${referralId}`,
          method: 'PUT',
        },
        referralData,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Update Referral Error:', error);
      swalHelper.showToast('Failed to update referral', 'error');
      throw error;
    }
  }

  /**
   * Delete a referral
   */
  async deleteReferral(referralId: string): Promise<any> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/delete-referral/${referralId}`,
          method: 'DELETE',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Delete Referral Error:', error);
      swalHelper.showToast('Failed to delete referral', 'error');
      throw error;
    }
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<any> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const response = await this.apiManager.request(
        {
          url: `${this.baseUrl}/mobile/referral-stats/${userId}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      return response.data || response;
    } catch (error) {
      console.error('Get Referral Stats Error:', error);
      swalHelper.showToast('Failed to fetch referral statistics', 'error');
      throw error;
    }
  }
}