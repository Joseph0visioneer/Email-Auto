-- Email Automation System Database Schema
-- MySQL 데이터베이스 스키마 정의
-- 
-- Design Principles:
-- - Normalized structure for data integrity
-- - Proper indexing for performance
-- - Foreign key constraints for referential integrity
-- - Audit fields for tracking changes

-- 데이터베이스 생성 (선택적)
-- CREATE DATABASE IF NOT EXISTS email_automation 
-- CHARACTER SET utf8mb4 
-- COLLATE utf8mb4_unicode_ci;

-- USE email_automation;

-- Users Table (Firebase UID 기반)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_firebase_uid (firebase_uid),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- Attendees Table (참석자 정보)
CREATE TABLE attendees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(200),
    position VARCHAR(100),
    attendee_type ENUM('speaker', 'attendee', 'sponsor', 'staff', 'vip') DEFAULT 'attendee',
    phone VARCHAR(20),
    registration_date TIMESTAMP NULL,
    
    -- Google Sheets 연동 정보
    google_sheet_row INT,
    custom_fields JSON,
    
    -- 메타데이터
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_type (attendee_type),
    INDEX idx_company (company),
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Email Templates Table (이메일 템플릿)
CREATE TABLE email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    attendee_type ENUM('speaker', 'attendee', 'sponsor', 'staff', 'vip') NULL,
    
    -- 템플릿 변수 정의
    variables JSON,
    
    -- 메타데이터
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_name (name),
    INDEX idx_type (attendee_type),
    INDEX idx_active (is_active),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Email Logs Table (이메일 전송 로그)
CREATE TABLE email_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    template_id INT,
    sender_id INT NOT NULL,
    
    -- 이메일 내용
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    
    -- 전송 정보
    status ENUM('pending', 'sent', 'failed', 'scheduled') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    scheduled_at TIMESTAMP NULL,
    error_message TEXT,
    
    -- 메타데이터
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recipient (recipient_id),
    INDEX idx_template (template_id),
    INDEX idx_sender (sender_id),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (recipient_id) REFERENCES attendees(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- Google Sheets Integration Table (Google Sheets 연동 설정)
CREATE TABLE google_sheets_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    spreadsheet_id VARCHAR(100) NOT NULL,
    sheet_range VARCHAR(50) DEFAULT 'A:Z',
    
    -- 필드 매핑 설정
    field_mapping JSON,
    
    -- 동기화 정보
    last_sync_at TIMESTAMP NULL,
    sync_status ENUM('success', 'failed', 'in_progress') DEFAULT 'success',
    sync_error_message TEXT,
    
    -- 메타데이터
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_spreadsheet_id (spreadsheet_id),
    INDEX idx_active (is_active),
    INDEX idx_created_by (created_by),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Email Templates에 기본 템플릿 삽입
INSERT INTO email_templates (name, subject, body, attendee_type, variables, created_by, is_active) VALUES
(
    'Welcome Email - General',
    'Welcome to {{event_name}}!',
    'Dear {{name}},\n\nWelcome to {{event_name}}!\n\nWe are excited to have you join us. Please find the event details below:\n\nDate: {{event_date}}\nVenue: {{venue}}\n\nBest regards,\nEvent Team',
    NULL,
    '{"name": "Attendee name", "event_name": "Event name", "event_date": "Event date", "venue": "Event venue"}',
    1,
    TRUE
),
(
    'Speaker Welcome',
    'Welcome Speaker - {{event_name}}',
    'Dear {{name}},\n\nThank you for agreeing to speak at {{event_name}}!\n\nAs a speaker, you have access to:\n- Speaker lounge\n- Technical support\n- Presentation equipment\n\nPlease arrive 30 minutes before your session.\n\nBest regards,\nEvent Organizers',
    'speaker',
    '{"name": "Speaker name", "event_name": "Event name", "session_time": "Session time"}',
    1,
    TRUE
),
(
    'VIP Welcome',
    'VIP Access - {{event_name}}',
    'Dear {{name}},\n\nAs our VIP guest for {{event_name}}, you have exclusive access to:\n\n- VIP lounge\n- Priority seating\n- Networking reception\n- Meet & greet with speakers\n\nWe look forward to hosting you!\n\nBest regards,\nVIP Relations Team',
    'vip',
    '{"name": "VIP name", "event_name": "Event name", "vip_benefits": "Special benefits"}',
    1,
    TRUE
);

-- 기본 사용자 생성 (개발용)
INSERT INTO users (firebase_uid, email, display_name, is_active) VALUES
('dev-user-001', 'admin@example.com', 'System Administrator', TRUE);

-- 샘플 참석자 데이터 (개발 및 테스트용)
INSERT INTO attendees (name, email, company, position, attendee_type, created_by) VALUES
('John Doe', 'john.doe@example.com', 'Tech Corp', 'Developer', 'attendee', 1),
('Jane Smith', 'jane.smith@example.com', 'Innovation Inc', 'CTO', 'speaker', 1),
('Mike Johnson', 'mike.johnson@example.com', 'Sponsor Co', 'Marketing Director', 'sponsor', 1),
('Sarah Wilson', 'sarah.wilson@example.com', 'Event Org', 'Event Manager', 'staff', 1),
('David Brown', 'david.brown@example.com', 'VIP Company', 'CEO', 'vip', 1);

