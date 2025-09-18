/**
 * TypeScript Type Definitions
 * 전역 타입 정의 및 인터페이스
 */

// User Types
export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
}

export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

// Attendee Types
export enum AttendeeType {
    SPEAKER = 'speaker',
    ATTENDEE = 'attendee',
    SPONSOR = 'sponsor',
    STAFF = 'staff',
    VIP = 'vip'
}

export interface Attendee {
    id: number;
    name: string;
    email: string;
    company?: string;
    position?: string;
    attendee_type?: AttendeeType;
    phone?: string;
    registration_date?: string;
    custom_fields?: Record<string, any>;
    created_at?: string;
}

export interface AttendeeFormData {
    name: string;
    email: string;
    company?: string;
    position?: string;
    attendee_type?: AttendeeType;
    phone?: string;
    custom_fields?: Record<string, any>;
}

// Email Types
export enum EmailStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
    SCHEDULED = 'scheduled'
}

export interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    body: string;
    attendee_type?: AttendeeType;
    variables?: Record<string, string>;
    is_active: boolean;
    created_at?: string;
}

export interface EmailLog {
    id: number;
    recipient_id: number;
    template_id?: number;
    subject: string;
    status: EmailStatus;
    sent_at?: string;
    scheduled_at?: string;
    error_message?: string;
    created_at?: string;
}

// API Response Types
export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginationParams {
    page: number;
    per_page: number;
    search?: string;
    type?: AttendeeType;
}

export interface PaginatedResponse<T> {
    items: T[];
    pagination: {
        current_page: number;
        per_page: number;
        total: number;
        pages: number;
        has_next: boolean;
        has_prev: boolean;
    };
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface EmailFormData {
    template_id: number;
    recipient_ids: number[];
    scheduled_at?: string;
    custom_subject?: string;
    custom_body?: string;
}

// Component Props Types
export interface TableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: any, item: T) => React.ReactNode;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

// Hook Types
export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Google Sheets Integration Types
export interface GoogleSheetsConfig {
    spreadsheetId: string;
    range: string;
    credentials: any;
}

export interface ImportedData {
    headers: string[];
    rows: string[][];
    mapping: Record<string, string>;
}

