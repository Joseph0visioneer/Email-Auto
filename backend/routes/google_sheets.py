"""
Google Sheets API 라우트
"""

from flask import Blueprint, request, jsonify
from services.google_sheets import google_sheets_service
import re

google_sheets_bp = Blueprint('google_sheets', __name__)


@google_sheets_bp.route('/test-connection', methods=['POST'])
def test_google_sheets_connection():
    """Google Sheets 연결 테스트"""
    try:
        data = request.get_json()
        spreadsheet_id = data.get('spreadsheet_id', '')
        
        if not spreadsheet_id:
            return jsonify({
                'success': False,
                'error': '스프레드시트 ID가 필요합니다.'
            }), 400
        
        # 스프레드시트 ID 형식 검증
        if not _validate_spreadsheet_id(spreadsheet_id):
            return jsonify({
                'success': False,
                'error': '올바르지 않은 스프레드시트 ID 형식입니다.'
            }), 400
        
        # 접근 권한 확인
        is_accessible = google_sheets_service.validate_spreadsheet_access(spreadsheet_id)
        
        if is_accessible:
            return jsonify({
                'success': True,
                'message': '스프레드시트에 성공적으로 연결되었습니다.',
                'spreadsheet_id': spreadsheet_id
            })
        else:
            return jsonify({
                'success': False,
                'error': '스프레드시트에 접근할 수 없습니다. ID와 권한을 확인하세요.'
            }), 403
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'연결 테스트 중 오류가 발생했습니다: {str(e)}'
        }), 500


@google_sheets_bp.route('/import-attendees', methods=['POST'])
def import_attendees_from_sheets():
    """Google Sheets에서 참석자 데이터 가져오기"""
    try:
        data = request.get_json()
        spreadsheet_id = data.get('spreadsheet_id', '')
        sheet_range = data.get('range', 'A:Z')  # 기본값: 전체 시트
        
        if not spreadsheet_id:
            return jsonify({
                'success': False,
                'error': '스프레드시트 ID가 필요합니다.'
            }), 400
        
        if not _validate_spreadsheet_id(spreadsheet_id):
            return jsonify({
                'success': False,
                'error': '올바르지 않은 스프레드시트 ID 형식입니다.'
            }), 400
        
        # 시트 데이터 가져오기
        sheet_data = google_sheets_service.get_sheet_data(spreadsheet_id, sheet_range)
        
        if not sheet_data:
            return jsonify({
                'success': False,
                'error': '시트에서 데이터를 찾을 수 없습니다.'
            }), 404
        
        # 참석자 데이터로 변환
        attendees = google_sheets_service.parse_attendees_from_sheet(sheet_data)
        
        return jsonify({
            'success': True,
            'message': f'{len(attendees)}명의 참석자 데이터를 가져왔습니다.',
            'attendees': attendees,
            'total_rows': len(sheet_data),
            'valid_attendees': len(attendees),
            'spreadsheet_id': spreadsheet_id,
            'range': sheet_range
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'데이터 가져오기 중 오류가 발생했습니다: {str(e)}'
        }), 500


@google_sheets_bp.route('/preview-data', methods=['POST'])
def preview_sheet_data():
    """Google Sheets 데이터 미리보기 (처음 10행만)"""
    try:
        data = request.get_json()
        spreadsheet_id = data.get('spreadsheet_id', '')
        sheet_range = data.get('range', 'A1:Z10')  # 처음 10행만
        
        if not spreadsheet_id:
            return jsonify({
                'success': False,
                'error': '스프레드시트 ID가 필요합니다.'
            }), 400
        
        if not _validate_spreadsheet_id(spreadsheet_id):
            return jsonify({
                'success': False,
                'error': '올바르지 않은 스프레드시트 ID 형식입니다.'
            }), 400
        
        # 시트 데이터 가져오기
        sheet_data = google_sheets_service.get_sheet_data(spreadsheet_id, sheet_range)
        
        if not sheet_data:
            return jsonify({
                'success': False,
                'error': '시트에서 데이터를 찾을 수 없습니다.'
            }), 404
        
        # 헤더와 샘플 데이터 분리
        headers = sheet_data[0] if sheet_data else []
        sample_rows = sheet_data[1:6] if len(sheet_data) > 1 else []  # 최대 5행
        
        return jsonify({
            'success': True,
            'message': '데이터 미리보기를 가져왔습니다.',
            'headers': headers,
            'sample_rows': sample_rows,
            'total_preview_rows': len(sheet_data),
            'spreadsheet_id': spreadsheet_id,
            'range': sheet_range
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'미리보기 중 오류가 발생했습니다: {str(e)}'
        }), 500


@google_sheets_bp.route('/extract-spreadsheet-id', methods=['POST'])
def extract_spreadsheet_id():
    """Google Sheets URL에서 스프레드시트 ID 추출"""
    try:
        data = request.get_json()
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({
                'success': False,
                'error': 'Google Sheets URL이 필요합니다.'
            }), 400
        
        # URL에서 스프레드시트 ID 추출
        spreadsheet_id = _extract_spreadsheet_id_from_url(url)
        
        if spreadsheet_id:
            return jsonify({
                'success': True,
                'spreadsheet_id': spreadsheet_id,
                'message': '스프레드시트 ID가 성공적으로 추출되었습니다.'
            })
        else:
            return jsonify({
                'success': False,
                'error': '올바른 Google Sheets URL이 아닙니다.'
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'URL 처리 중 오류가 발생했습니다: {str(e)}'
        }), 500


def _validate_spreadsheet_id(spreadsheet_id: str) -> bool:
    """스프레드시트 ID 형식 검증"""
    # Google Sheets ID는 일반적으로 44자의 영숫자와 일부 특수문자로 구성
    pattern = r'^[a-zA-Z0-9-_]{40,50}$'
    return bool(re.match(pattern, spreadsheet_id))


def _extract_spreadsheet_id_from_url(url: str) -> str:
    """URL에서 스프레드시트 ID 추출"""
    # Google Sheets URL 패턴들
    patterns = [
        r'/spreadsheets/d/([a-zA-Z0-9-_]+)',
        r'key=([a-zA-Z0-9-_]+)',
        r'id=([a-zA-Z0-9-_]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    # URL 자체가 ID인 경우
    if _validate_spreadsheet_id(url):
        return url
    
    return ''
