"""
Authentication Routes
Firebase Authentication 기반 사용자 인증 및 관리

Security Features:
- Firebase JWT 토큰 검증
- 사용자 세션 관리
- 권한 기반 접근 제어
"""

from flask import Blueprint, request, jsonify
from functools import wraps
import firebase_admin
from firebase_admin import auth, credentials
import os

auth_bp = Blueprint('auth', __name__)

# Firebase Admin SDK 초기화 (환경변수 기반)
def init_firebase():
    """Firebase Admin SDK 초기화"""
    try:
        if not firebase_admin._apps:
            # 개발 환경에서는 환경변수 사용, 프로덕션에서는 서비스 계정 키 파일 사용
            cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred)
            else:
                # 환경변수가 없으면 기본 자격증명 사용 (Google Cloud 환경)
                firebase_admin.initialize_app()
        return True
    except Exception as e:
        print(f"Firebase 초기화 실패: {e}")
        return False

# Firebase 초기화
init_firebase()

def verify_firebase_token(f):
    """Firebase JWT 토큰 검증 데코레이터"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Authorization header is missing'}), 401
        
        try:
            # Bearer 토큰 형식 확인
            if not token.startswith('Bearer '):
                return jsonify({'error': 'Invalid token format'}), 401
            
            token = token.split('Bearer ')[1]
            
            # Firebase 토큰 검증
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function

@auth_bp.route('/verify', methods=['POST'])
def verify_token():
    """토큰 검증 및 사용자 정보 반환"""
    token = request.json.get('token')
    
    if not token:
        return jsonify({'error': 'Token is required'}), 400
    
    try:
        # Firebase 토큰 검증
        decoded_token = auth.verify_id_token(token)
        
        # 사용자 정보 반환
        user_info = {
            'uid': decoded_token.get('uid'),
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name'),
            'picture': decoded_token.get('picture'),
            'email_verified': decoded_token.get('email_verified', False)
        }
        
        return jsonify({
            'valid': True,
            'user': user_info
        })
        
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 401

@auth_bp.route('/user/profile', methods=['GET'])
@verify_firebase_token
def get_user_profile():
    """인증된 사용자의 프로필 정보 조회"""
    try:
        user_uid = request.user.get('uid')
        
        # Firebase에서 사용자 정보 조회
        user_record = auth.get_user(user_uid)
        
        profile = {
            'uid': user_record.uid,
            'email': user_record.email,
            'display_name': user_record.display_name,
            'photo_url': user_record.photo_url,
            'email_verified': user_record.email_verified,
            'created_at': user_record.user_metadata.creation_timestamp,
            'last_signin': user_record.user_metadata.last_sign_in_timestamp
        }
        
        return jsonify(profile)
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user profile', 'details': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@verify_firebase_token
def logout():
    """사용자 로그아웃 (클라이언트에서 토큰 삭제 안내)"""
    return jsonify({
        'message': 'Logout successful',
        'instructions': 'Please remove the token from client storage'
    })

# 개발용 Mock 인증 (프로덕션에서는 제거)
@auth_bp.route('/mock-login', methods=['POST'])
def mock_login():
    """개발용 Mock 로그인 (Firebase 설정 전 테스트용)"""
    if os.getenv('DEBUG', 'False').lower() != 'true':
        return jsonify({'error': 'Mock login only available in development mode'}), 403
    
    email = request.json.get('email', 'test@example.com')
    
    mock_user = {
        'uid': 'mock-uid-12345',
        'email': email,
        'name': 'Test User',
        'email_verified': True
    }
    
    return jsonify({
        'valid': True,
        'user': mock_user,
        'token': 'mock-token-for-development'
    })

