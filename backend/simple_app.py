"""
Simple Email Automation Backend
최소한의 기능으로 빠르게 시작하는 백엔드 서버
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from routes.google_sheets import google_sheets_bp
from routes.emails import emails_bp
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'dev-secret-key-email-automation-2024'
CORS(app, origins=['http://localhost:3000'])

# Health check endpoint
@app.route('/api/health')
def health_check():
    """시스템 상태 확인 엔드포인트"""
    return jsonify({
        'status': 'healthy',
        'message': 'Email Automation System is running',
        'version': '1.0.0'
    })

# Mock 로그인 엔드포인트
@app.route('/api/auth/mock-login', methods=['POST'])
def mock_login():
    """개발용 Mock 로그인"""
    data = request.get_json() or {}
    email = data.get('email', 'test@example.com')
    
    mock_user = {
        'uid': 'mock-uid-12345',
        'email': email,
        'displayName': 'Test User',
        'emailVerified': True
    }
    
    return jsonify({
        'valid': True,
        'data': {
            'user': mock_user,
            'token': 'mock-token-for-development'
        }
    })

# 토큰 검증 엔드포인트
@app.route('/api/auth/verify', methods=['POST'])
def verify_token():
    """토큰 검증 (Mock)"""
    data = request.get_json() or {}
    token = data.get('token')
    
    if token == 'mock-token-for-development':
        user_info = {
            'uid': 'mock-uid-12345',
            'email': 'test@example.com',
            'displayName': 'Test User',
            'emailVerified': True
        }
        
        return jsonify({
            'valid': True,
            'data': {
                'user': user_info
            }
        })
    else:
        return jsonify({
            'valid': False,
            'error': 'Invalid token'
        }), 401

# 참석자 목록 엔드포인트 (Mock 데이터)
@app.route('/api/attendees/', methods=['GET'])
def get_attendees():
    """참석자 목록 조회 (Mock 데이터)"""
    # 간단한 Mock 데이터
    mock_attendees = [
        {
            'id': 1,
            'name': 'John Doe',
            'email': 'john.doe@example.com',
            'company': 'Tech Corp',
            'position': 'Developer',
            'attendee_type': 'attendee',
            'created_at': '2024-09-18T10:00:00Z'
        },
        {
            'id': 2,
            'name': 'Jane Smith',
            'email': 'jane.smith@example.com',
            'company': 'Innovation Inc',
            'position': 'CTO',
            'attendee_type': 'speaker',
            'created_at': '2024-09-18T10:30:00Z'
        },
        {
            'id': 3,
            'name': 'Mike Johnson',
            'email': 'mike.johnson@example.com',
            'company': 'Sponsor Co',
            'position': 'Marketing Director',
            'attendee_type': 'sponsor',
            'created_at': '2024-09-18T11:00:00Z'
        }
    ]
    
    return jsonify({
        'attendees': mock_attendees,
        'pagination': {
            'current_page': 1,
            'per_page': 20,
            'total': 3,
            'pages': 1,
            'has_next': False,
            'has_prev': False
        }
    })

# 참석자 유형 목록
@app.route('/api/attendees/types', methods=['GET'])
def get_attendee_types():
    """참석자 유형 목록"""
    types = [
        {'value': 'speaker', 'label': 'Speaker'},
        {'value': 'attendee', 'label': 'Attendee'},
        {'value': 'sponsor', 'label': 'Sponsor'},
        {'value': 'staff', 'label': 'Staff'},
        {'value': 'vip', 'label': 'VIP'}
    ]
    return jsonify({'types': types})

# 에러 핸들러
@app.errorhandler(404)
def not_found(error):
    """404 에러 핸들러"""
    return jsonify({'error': 'Resource not found'}), 404

# Blueprint 등록
app.register_blueprint(google_sheets_bp, url_prefix='/api/google-sheets')
app.register_blueprint(emails_bp, url_prefix='/api/emails')

@app.errorhandler(500)
def internal_error(error):
    """500 에러 핸들러"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Starting Email Automation System (Simple Mode)")
    print("📍 Backend: http://localhost:5001")
    print("📍 Health Check: http://localhost:5001/api/health")
    print("📍 Mock Login: http://localhost:5001/api/auth/mock-login")
    print("📍 Attendees: http://localhost:5001/api/attendees/")
    print("")
    print("Press Ctrl+C to stop the server")
    
    app.run(host='127.0.0.1', port=5001, debug=True)
