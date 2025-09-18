"""
Email Templates Routes
이메일 템플릿 관리를 위한 REST API 엔드포인트
"""

from flask import Blueprint, request, jsonify
from routes.auth import verify_firebase_token

templates_bp = Blueprint('templates', __name__)

@templates_bp.route('/', methods=['GET'])
@verify_firebase_token
def get_templates():
    """템플릿 목록 조회"""
    # TODO: 실제 템플릿 조회 로직 구현
    return jsonify({'templates': [], 'message': 'Templates feature coming soon'})

@templates_bp.route('/', methods=['POST'])
@verify_firebase_token
def create_template():
    """새 템플릿 생성"""
    # TODO: 실제 템플릿 생성 로직 구현
    return jsonify({'message': 'Template creation feature coming soon'})
