"""
Attendees Management Routes
참석자 데이터 관리를 위한 REST API 엔드포인트

Features:
- CRUD operations for attendees
- Google Sheets integration
- Bulk operations support
- Filtering and pagination
"""

from flask import Blueprint, request, jsonify
from models import Attendee, AttendeeType, db
from routes.auth import verify_firebase_token
from sqlalchemy import or_
import json

attendees_bp = Blueprint('attendees', __name__)

@attendees_bp.route('/', methods=['GET'])
@verify_firebase_token
def get_attendees():
    """참석자 목록 조회 (페이지네이션 및 필터링 지원)"""
    try:
        # 쿼리 파라미터 처리
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        attendee_type = request.args.get('type', '')
        
        # 기본 쿼리 생성
        query = Attendee.query
        
        # 검색 필터 적용
        if search:
            query = query.filter(
                or_(
                    Attendee.name.contains(search),
                    Attendee.email.contains(search),
                    Attendee.company.contains(search)
                )
            )
        
        # 참석자 유형 필터 적용
        if attendee_type:
            try:
                type_enum = AttendeeType(attendee_type)
                query = query.filter(Attendee.attendee_type == type_enum)
            except ValueError:
                return jsonify({'error': 'Invalid attendee type'}), 400
        
        # 페이지네이션 적용
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        attendees = [attendee.to_dict() for attendee in pagination.items]
        
        return jsonify({
            'attendees': attendees,
            'pagination': {
                'current_page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch attendees', 'details': str(e)}), 500

@attendees_bp.route('/<int:attendee_id>', methods=['GET'])
@verify_firebase_token
def get_attendee(attendee_id):
    """특정 참석자 정보 조회"""
    try:
        attendee = Attendee.query.get_or_404(attendee_id)
        return jsonify(attendee.to_dict())
    except Exception as e:
        return jsonify({'error': 'Failed to fetch attendee', 'details': str(e)}), 500

@attendees_bp.route('/', methods=['POST'])
@verify_firebase_token
def create_attendee():
    """새 참석자 생성"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['name', 'email']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # 이메일 중복 확인
        existing_attendee = Attendee.query.filter_by(email=data['email']).first()
        if existing_attendee:
            return jsonify({'error': 'Email already exists'}), 409
        
        # 참석자 유형 검증
        attendee_type = None
        if data.get('attendee_type'):
            try:
                attendee_type = AttendeeType(data['attendee_type'])
            except ValueError:
                return jsonify({'error': 'Invalid attendee type'}), 400
        
        # 새 참석자 생성
        attendee = Attendee(
            name=data['name'],
            email=data['email'],
            company=data.get('company'),
            position=data.get('position'),
            attendee_type=attendee_type,
            phone=data.get('phone'),
            custom_fields=data.get('custom_fields'),
            created_by=1  # TODO: Firebase UID로 대체
        )
        
        db.session.add(attendee)
        db.session.commit()
        
        return jsonify(attendee.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create attendee', 'details': str(e)}), 500

@attendees_bp.route('/<int:attendee_id>', methods=['PUT'])
@verify_firebase_token
def update_attendee(attendee_id):
    """참석자 정보 수정"""
    try:
        attendee = Attendee.query.get_or_404(attendee_id)
        data = request.get_json()
        
        # 이메일 중복 확인 (본인 제외)
        if data.get('email') and data['email'] != attendee.email:
            existing = Attendee.query.filter_by(email=data['email']).first()
            if existing:
                return jsonify({'error': 'Email already exists'}), 409
        
        # 필드 업데이트
        updateable_fields = ['name', 'email', 'company', 'position', 'phone', 'custom_fields']
        for field in updateable_fields:
            if field in data:
                setattr(attendee, field, data[field])
        
        # 참석자 유형 업데이트
        if 'attendee_type' in data:
            try:
                attendee.attendee_type = AttendeeType(data['attendee_type']) if data['attendee_type'] else None
            except ValueError:
                return jsonify({'error': 'Invalid attendee type'}), 400
        
        db.session.commit()
        return jsonify(attendee.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update attendee', 'details': str(e)}), 500

@attendees_bp.route('/<int:attendee_id>', methods=['DELETE'])
@verify_firebase_token
def delete_attendee(attendee_id):
    """참석자 삭제"""
    try:
        attendee = Attendee.query.get_or_404(attendee_id)
        db.session.delete(attendee)
        db.session.commit()
        
        return jsonify({'message': 'Attendee deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete attendee', 'details': str(e)}), 500

@attendees_bp.route('/bulk', methods=['POST'])
@verify_firebase_token
def bulk_create_attendees():
    """대량 참석자 생성 (Google Sheets 연동용)"""
    try:
        data = request.get_json()
        attendees_data = data.get('attendees', [])
        
        if not attendees_data:
            return jsonify({'error': 'No attendees data provided'}), 400
        
        created_attendees = []
        errors = []
        
        for i, attendee_data in enumerate(attendees_data):
            try:
                # 필수 필드 검증
                if not attendee_data.get('name') or not attendee_data.get('email'):
                    errors.append(f"Row {i+1}: Name and email are required")
                    continue
                
                # 이메일 중복 확인
                existing = Attendee.query.filter_by(email=attendee_data['email']).first()
                if existing:
                    errors.append(f"Row {i+1}: Email {attendee_data['email']} already exists")
                    continue
                
                # 참석자 유형 검증
                attendee_type = None
                if attendee_data.get('attendee_type'):
                    try:
                        attendee_type = AttendeeType(attendee_data['attendee_type'])
                    except ValueError:
                        errors.append(f"Row {i+1}: Invalid attendee type")
                        continue
                
                # 참석자 생성
                attendee = Attendee(
                    name=attendee_data['name'],
                    email=attendee_data['email'],
                    company=attendee_data.get('company'),
                    position=attendee_data.get('position'),
                    attendee_type=attendee_type,
                    phone=attendee_data.get('phone'),
                    google_sheet_row=attendee_data.get('row_number'),
                    custom_fields=attendee_data.get('custom_fields'),
                    created_by=1  # TODO: Firebase UID로 대체
                )
                
                db.session.add(attendee)
                created_attendees.append(attendee)
                
            except Exception as e:
                errors.append(f"Row {i+1}: {str(e)}")
        
        # 성공한 것들만 커밋
        if created_attendees:
            db.session.commit()
        
        return jsonify({
            'created': len(created_attendees),
            'errors': errors,
            'total_processed': len(attendees_data)
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Bulk creation failed', 'details': str(e)}), 500

@attendees_bp.route('/types', methods=['GET'])
def get_attendee_types():
    """사용 가능한 참석자 유형 목록 반환"""
    types = [{'value': t.value, 'label': t.value.title()} for t in AttendeeType]
    return jsonify({'types': types})

