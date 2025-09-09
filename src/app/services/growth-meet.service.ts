import { Injectable } from '@angular/core';
import { ApiManager } from '../core/utilities/api-manager';
import { AppStorage } from '../core/utilities/app-storage';
import { swalHelper } from '../core/constants/swal-helper';
import { common } from '../core/constants/common';
import { apiEndpoints } from '../core/constants/api-endpoints';

export interface OneToOne {
  _id: string;
  memberId1: {
    _id: string;
    name: string;
    profilePic: string;
  };
  memberId2: {
    _id: string;
    name: string;
    profilePic: string;
  };
  meet_place: string;
  photo: string;
  initiatedBy: {
    _id: string;
    name: string;
    profilePic: string;
  } | null;
  date: string;
  topics: string;
  createdAt: string;
}

export interface OneToOneResponse {
  success: boolean;
  message: string;
  data: OneToOne[];
  totalDocs?: number;
  totalPages?: number;
  page?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  prevPage?: number | null;
  nextPage?: number | null;
}

export interface CreateOneToOneRequest {
  memberId1: string;
  memberId2: string;
  meet_place?: string;
  photo?: string;
  initiatedBy?: string;
  date?: string;
  topics?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OneToOneService {
  private headers: any = [];

  constructor(
    private apiManager: ApiManager,
    private storage: AppStorage
  ) {}

  private getHeaders = () => {
    this.headers = [];
    let token = this.storage.get(common.TOKEN);
    if (token) {
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
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }

  /**
   * Create a new one-to-one meeting
   */
  async createOneToOne(oneToOneData: CreateOneToOneRequest): Promise<OneToOneResponse> {
    try {
      this.getHeaders();
      const userId = this.getUserIdFromToken();
      
      const requestData = {
        ...oneToOneData,
        initiatedBy: userId
      };

      const response = await this.apiManager.request(
        {
          url: apiEndpoints.oneToOne.createOneToOne,
          method: 'POST',
        },
        requestData,
        this.headers
      );
      
      await swalHelper.showToast(response.message || 'One-to-one meeting created successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Create OneToOne Error:', error);
      await swalHelper.showToast(error.message || 'Failed to create one-to-one meeting', 'error');
      throw error;
    }
  }

  /**
   * Get one-to-one meeting by ID
   */
  async getOneToOneById(oneToOneId: string): Promise<OneToOneResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.oneToOne.getOneToOneById}`,
          method: 'POST',
        },
        { oneToOneId },
        this.headers
      );
      
      await swalHelper.showToast(response.message || 'One-to-one meeting fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get OneToOne By Id Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch one-to-one meeting', 'error');
      throw error;
    }
  }

  /**
   * Get initiated one-to-one meetings by user ID
   */
  async getInitiatedOneToOne(userId: string, page: number = 1, limit: number = 10): Promise<OneToOneResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.oneToOne.getInitiatedOneToOne}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      await swalHelper.showToast(response.message || 'Initiated one-to-one meetings fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get Initiated OneToOne Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch initiated one-to-one meetings', 'error');
      throw error;
    }
  }

  /**
   * Get not initiated one-to-one meetings by user ID
   */
  async getNotInitiatedOneToOne(userId: string, page: number = 1, limit: number = 10): Promise<OneToOneResponse> {
    try {
      this.getHeaders();
      
      const response = await this.apiManager.request(
        {
          url: `${apiEndpoints.oneToOne.getNotInitiatedOneToOne}/${userId}?page=${page}&limit=${limit}`,
          method: 'GET',
        },
        null,
        this.headers
      );
      
      await swalHelper.showToast(response.message || 'Not initiated one-to-one meetings fetched successfully', 'success');
      return response.data || response;
    } catch (error: any) {
      console.error('Get Not Initiated OneToOne Error:', error);
      await swalHelper.showToast(error.message || 'Failed to fetch not initiated one-to-one meetings', 'error');
      throw error;
    }
  }
}