"""
Database Models for Email Automation System
SQLAlchemy ORM 모델 정의

Design Principles:
- Single Responsibility: 각 모델은 하나의 도메인만 담당
- Data Integrity: 적절한 제약조건과 관계 설정
- Extensibility: 미래 확장을 고려한 필드 설계
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

class EmailStatus(Enum):
    """이메일 전송 상태"""
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    SCHEDULED = "scheduled"

class AttendeeType(Enum):
    """참석자 유형"""
    SPEAKER = "speaker"
    ATTENDEE = "attendee"
    SPONSOR = "sponsor"
    STAFF = "staff"
    VIP = "vip"

class User(db.Model):
    """사용자 모델 - Firebase UID 기반 인증"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    firebase_uid = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    # 관계 설정
    attendees = db.relationship('Attendee', backref='created_by_user', lazy=True)
    email_logs = db.relationship('EmailLog', backref='sender', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'display_name': self.display_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_active': self.is_active
        }

class Attendee(db.Model):
    """참석자 모델 - Google Sheets에서 가져온 데이터 저장"""
    __tablename__ = 'attendees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False, index=True)
    company = db.Column(db.String(200))
    position = db.Column(db.String(100))
    attendee_type = db.Column(db.Enum(AttendeeType), default=AttendeeType.ATTENDEE)
    phone = db.Column(db.String(20))
    registration_date = db.Column(db.DateTime)
    
    # 메타데이터
    google_sheet_row = db.Column(db.Integer)  # Google Sheets의 행 번호
    custom_fields = db.Column(db.JSON)  # 추가 사용자 정의 필드
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    email_logs = db.relationship('EmailLog', backref='recipient', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'company': self.company,
            'position': self.position,
            'attendee_type': self.attendee_type.value if self.attendee_type else None,
            'phone': self.phone,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'custom_fields': self.custom_fields,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EmailTemplate(db.Model):
    """이메일 템플릿 모델"""
    __tablename__ = 'email_templates'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    attendee_type = db.Column(db.Enum(AttendeeType))  # 특정 참석자 유형용
    
    # 템플릿 변수 설정
    variables = db.Column(db.JSON)  # {name: "description"} 형태
    
    # 메타데이터
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # 관계 설정
    email_logs = db.relationship('EmailLog', backref='template', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subject': self.subject,
            'body': self.body,
            'attendee_type': self.attendee_type.value if self.attendee_type else None,
            'variables': self.variables,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class EmailLog(db.Model):
    """이메일 전송 로그 모델"""
    __tablename__ = 'email_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('attendees.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('email_templates.id'))
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # 이메일 내용
    subject = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text, nullable=False)
    
    # 전송 정보
    status = db.Column(db.Enum(EmailStatus), default=EmailStatus.PENDING)
    sent_at = db.Column(db.DateTime)
    scheduled_at = db.Column(db.DateTime)
    error_message = db.Column(db.Text)
    
    # 메타데이터
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'template_id': self.template_id,
            'subject': self.subject,
            'status': self.status.value,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'scheduled_at': self.scheduled_at.isoformat() if self.scheduled_at else None,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

