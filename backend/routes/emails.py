"""
이메일 관련 API 라우트
"""

from flask import Blueprint, request, jsonify
from services.email_service import email_service
from datetime import datetime

emails_bp = Blueprint('emails', __name__)

@emails_bp.route('/', methods=['GET'])
def get_emails():
    """이메일 목록 조회"""
    try:
        # Mock 데이터 (실제로는 데이터베이스에서 가져와야 함)
        emails = [
            {
                "id": 1,
                "recipient": "john.doe@example.com",
                "subject": "Welcome to our event!",
                "status": "sent",
                "sent_at": "2024-09-18T10:00:00Z"
            },
            {
                "id": 2,
                "recipient": "jane.smith@example.com", 
                "subject": "Speaker Information",
                "status": "pending",
                "sent_at": None
            }
        ]
        
        return jsonify({
            "emails": emails,
            "total": len(emails)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@emails_bp.route('/send', methods=['POST'])
def send_single_email():
    """단일 이메일 발송"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['recipient', 'subject', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # 이메일 발송
        result = email_service.send_email(
            recipient_email=data['recipient'],
            subject=data['subject'],
            body=data['body'],
            recipient_name=data.get('recipient_name', ''),
            template_data=data.get('template_data', {})
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": result['message'],
                "recipient": result['recipient'],
                "subject": result.get('subject', data['subject']),
                "sent_at": result.get('sent_at', datetime.now().isoformat()),
                "test_mode": result.get('test_mode', False)
            })
        else:
            return jsonify({
                "success": False,
                "error": result['error'],
                "recipient": result['recipient']
            }), 400
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@emails_bp.route('/send-bulk', methods=['POST'])
def send_bulk_emails():
    """대량 이메일 발송"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['attendees', 'template']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        attendees = data['attendees']
        email_template = data['template']
        template_data = data.get('template_data', {})
        
        # 템플릿 필수 필드 검증
        if 'subject' not in email_template or 'body' not in email_template:
            return jsonify({"error": "Template must include 'subject' and 'body'"}), 400
        
        # 대량 이메일 발송
        results = email_service.send_bulk_emails(
            attendees=attendees,
            email_template=email_template,
            template_data=template_data
        )
        
        return jsonify({
            "success": True,
            "message": f"대량 이메일 발송 완료: 성공 {results['success_count']}건, 실패 {results['failure_count']}건",
            "total": results['total'],
            "success_count": results['success_count'],
            "failure_count": results['failure_count'],
            "started_at": results['started_at'],
            "completed_at": results['completed_at'],
            "results": results['results']
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@emails_bp.route('/test-template', methods=['POST'])
def test_email_template():
    """이메일 템플릿 테스트"""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['template', 'sample_data']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        template = data['template']
        sample_data = data['sample_data']
        
        # 템플릿 처리
        processed_subject = email_service.process_template(
            template.get('subject', ''), 
            sample_data
        )
        processed_body = email_service.process_template(
            template.get('body', ''), 
            sample_data
        )
        
        return jsonify({
            "success": True,
            "processed_template": {
                "subject": processed_subject,
                "body": processed_body
            },
            "original_template": template,
            "sample_data": sample_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@emails_bp.route('/config', methods=['GET'])
def get_email_config():
    """이메일 설정 정보 조회"""
    try:
        is_configured = email_service.validate_email_config()
        
        return jsonify({
            "configured": is_configured,
            "test_mode": email_service.test_mode,
            "smtp_server": email_service.smtp_server,
            "smtp_port": email_service.smtp_port,
            "sender_name": email_service.sender_name,
            "email_address": email_service.email_address[:3] + "***" + email_service.email_address[-10:] if email_service.email_address else ""
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@emails_bp.route('/templates', methods=['GET'])
def get_email_templates():
    """이메일 템플릿 목록 조회"""
    try:
        # 기본 템플릿들
        templates = [
            {
                "id": 1,
                "name": "환영 이메일 - 일반 참석자",
                "subject": "{{event_name}} 참석을 환영합니다!",
                "body": """안녕하세요 {{name}}님,

{{event_name}}에 참석해주셔서 감사합니다.

📅 일정: {{event_date}}
📍 장소: {{venue}}
🕐 시간: {{event_time}}

궁금한 사항이 있으시면 언제든 연락주세요.

감사합니다.
{{sender_name}}""",
                "attendee_type": "attendee",
                "created_at": "2024-09-18T10:00:00Z"
            },
            {
                "id": 2,
                "name": "연사 환영 이메일",
                "subject": "연사로 모셔서 감사합니다 - {{event_name}}",
                "body": """{{name}} 님께,

{{event_name}}의 연사로 모셔서 진심으로 감사드립니다.

🎤 연사 전용 혜택:
- 연사 라운지 이용
- 기술 지원 제공
- 발표 장비 준비

📋 참고사항:
- 발표 30분 전 도착 부탁드립니다
- 발표 자료는 {{event_date}} 전까지 전달 부탁드립니다

성공적인 발표를 기원합니다.

{{sender_name}} 드림""",
                "attendee_type": "speaker",
                "created_at": "2024-09-18T10:30:00Z"
            },
            {
                "id": 3,
                "name": "VIP 초대 이메일",
                "subject": "VIP 초대 - {{event_name}}",
                "body": """{{name}} 님께,

VIP 게스트로 {{event_name}}에 초대합니다!

⭐ VIP 전용 혜택:
- VIP 라운지 이용
- 우선 좌석 배정
- 네트워킹 리셉션 참석
- 연사와의 개별 만남 기회

{{event_date}}에 뵙겠습니다.
특별한 시간이 되기를 바랍니다.

VIP 관계팀
{{sender_name}}""",
                "attendee_type": "vip",
                "created_at": "2024-09-18T11:00:00Z"
            }
        ]
        
        return jsonify({
            "templates": templates,
            "total": len(templates)
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500