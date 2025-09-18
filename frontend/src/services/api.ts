/**
 * API Service Layer
 * 백엔드 API와의 통신을 담당하는 서비스 레이어
 * 
 * Features:
 * - Axios 기반 HTTP 클라이언트
 * - 자동 인증 토큰 관리
 * - 에러 핸들링 및 응답 인터셉터
 * - TypeScript 타입 안정성
 */

import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { 
    User, 
    Attendee, 
    AttendeeFormData, 
    EmailTemplate, 
    EmailLog, 
    PaginationParams,
    PaginatedResponse,
    ApiResponse 
} from '../types';

class ApiService {
    private client: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.client = axios.create({
            baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - 인증 토큰 자동 추가
        this.client.interceptors.request.use(
            (config) => {
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - 에러 핸들링
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                return response;
            },
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // 인증 에러 시 토큰 제거 및 로그인 페이지로 리다이렉트
                    this.removeToken();
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Token Management
    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
    }

    removeToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
    }

    loadToken() {
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.token = token;
        }
    }

    // Auth API
    async verifyToken(token: string): Promise<ApiResponse<{ user: User }>> {
        try {
            const response = await this.client.post('/auth/verify', { token });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async mockLogin(email: string): Promise<ApiResponse<{ user: User; token: string }>> {
        try {
            const response = await this.client.post('/auth/mock-login', { email });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getUserProfile(): Promise<ApiResponse<User>> {
        try {
            const response = await this.client.get('/auth/user/profile');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Attendees API
    async getAttendees(params: Partial<PaginationParams> = {}): Promise<PaginatedResponse<Attendee>> {
        try {
            const response = await this.client.get('/attendees/', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAttendee(id: number): Promise<Attendee> {
        try {
            const response = await this.client.get(`/attendees/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createAttendee(data: AttendeeFormData): Promise<Attendee> {
        try {
            const response = await this.client.post('/attendees/', data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async updateAttendee(id: number, data: Partial<AttendeeFormData>): Promise<Attendee> {
        try {
            const response = await this.client.put(`/attendees/${id}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async deleteAttendee(id: number): Promise<void> {
        try {
            await this.client.delete(`/attendees/${id}`);
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async bulkCreateAttendees(attendees: AttendeeFormData[]): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post('/attendees/bulk', { attendees });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getAttendeeTypes(): Promise<ApiResponse<{ types: Array<{ value: string; label: string }> }>> {
        try {
            const response = await this.client.get('/attendees/types');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Email Templates API
    async getEmailTemplates(): Promise<EmailTemplate[]> {
        try {
            const response = await this.client.get('/templates/');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getEmailTemplate(id: number): Promise<EmailTemplate> {
        try {
            const response = await this.client.get(`/templates/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async createEmailTemplate(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        try {
            const response = await this.client.post('/templates/', data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Email Sending API
    async sendEmails(data: {
        template_id: number;
        recipient_ids: number[];
        scheduled_at?: string;
    }): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.post('/emails/send', data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async getEmailLogs(params: Partial<PaginationParams> = {}): Promise<PaginatedResponse<EmailLog>> {
        try {
            const response = await this.client.get('/emails/logs', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Health Check
    async healthCheck(): Promise<ApiResponse<any>> {
        try {
            const response = await this.client.get('/health');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Error Handler
    private handleError(error: any): Error {
        if (error.response?.data?.error) {
            return new Error(error.response.data.error);
        }
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('An unexpected error occurred');
    }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

