"""
Google Sheets API 연동 서비스
"""

import os
import json
from typing import List, Dict, Any, Optional
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


class GoogleSheetsService:
    def __init__(self):
        self.service = None
        self.credentials = None
        self._initialize_service()
    
    def _initialize_service(self):
        """Google Sheets API 서비스 초기화"""
        try:
            # 서비스 계정 키 파일 경로
            credentials_path = os.getenv('GOOGLE_CREDENTIALS_PATH', 'config/google-credentials.json')
            
            if os.path.exists(credentials_path):
                # 서비스 계정 사용
                self.credentials = service_account.Credentials.from_service_account_file(
                    credentials_path,
                    scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
                )
            else:
                # 환경변수에서 JSON 직접 읽기
                credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')
                if credentials_json:
                    credentials_info = json.loads(credentials_json)
                    self.credentials = service_account.Credentials.from_service_account_info(
                        credentials_info,
                        scopes=['https://www.googleapis.com/auth/spreadsheets.readonly']
                    )
            
            if self.credentials:
                self.service = build('sheets', 'v4', credentials=self.credentials)
                print("✅ Google Sheets API 연동 성공")
            else:
                print("⚠️ Google Sheets 인증 정보가 없습니다. Mock 데이터를 사용합니다.")
                
        except Exception as e:
            print(f"⚠️ Google Sheets API 초기화 실패: {str(e)}")
            self.service = None
    
    def get_sheet_data(self, spreadsheet_id: str, range_name: str = 'A:Z') -> List[List[str]]:
        """
        Google Sheets에서 데이터 가져오기
        
        Args:
            spreadsheet_id: 스프레드시트 ID
            range_name: 읽을 범위 (예: 'A1:E100', 'Sheet1!A:E')
        
        Returns:
            List[List[str]]: 시트 데이터
        """
        if not self.service:
            # Mock 데이터 반환
            return self._get_mock_data()
        
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            print(f"✅ Google Sheets에서 {len(values)}행의 데이터를 가져왔습니다.")
            return values
            
        except HttpError as error:
            print(f"❌ Google Sheets API 오류: {error}")
            return self._get_mock_data()
        except Exception as error:
            print(f"❌ 예상치 못한 오류: {error}")
            return self._get_mock_data()
    
    def _get_mock_data(self) -> List[List[str]]:
        """Mock 데이터 반환 (테스트용)"""
        return [
            ['이름', '이메일', '회사', '직책', '참석자 유형'],
            ['김철수', 'kim@example.com', 'ABC Corp', '개발자', 'attendee'],
            ['이영희', 'lee@example.com', 'XYZ Inc', 'CTO', 'speaker'],
            ['박민수', 'park@example.com', 'Tech Startup', '마케팅 매니저', 'sponsor'],
            ['최지혜', 'choi@example.com', 'Innovation Lab', 'PM', 'attendee'],
            ['정우진', 'jung@example.com', 'AI Company', 'AI Engineer', 'vip']
        ]
    
    def parse_attendees_from_sheet(self, sheet_data: List[List[str]]) -> List[Dict[str, Any]]:
        """
        시트 데이터를 참석자 객체로 변환
        
        Args:
            sheet_data: Google Sheets 원본 데이터
        
        Returns:
            List[Dict]: 참석자 정보 리스트
        """
        if not sheet_data or len(sheet_data) < 2:
            return []
        
        # 첫 번째 행을 헤더로 사용
        headers = [header.lower().strip() for header in sheet_data[0]]
        attendees = []
        
        # 헤더 매핑 (다양한 헤더명 지원)
        header_mapping = {
            '이름': ['이름', 'name', '성명', '참석자명'],
            '이메일': ['이메일', 'email', 'e-mail', '메일', '이메일주소'],
            '회사': ['회사', 'company', '회사명', '소속'],
            '직책': ['직책', 'position', '직위', '역할'],
            '참석자유형': ['참석자유형', '참석자 유형', 'attendee_type', 'type', '유형']
        }
        
        # 헤더 인덱스 찾기
        header_indices = {}
        for field, possible_headers in header_mapping.items():
            for i, header in enumerate(headers):
                if any(ph in header for ph in possible_headers):
                    header_indices[field] = i
                    break
        
        # 데이터 행 처리 (헤더 제외)
        for row_index, row in enumerate(sheet_data[1:], start=2):
            if not row or len(row) == 0:
                continue
                
            attendee = {}
            
            # 각 필드 매핑
            for field, col_index in header_indices.items():
                if col_index < len(row) and row[col_index].strip():
                    if field == '참석자유형':
                        # 참석자 유형 정규화
                        type_value = row[col_index].strip().lower()
                        type_mapping = {
                            '연사': 'speaker', 'speaker': 'speaker', '발표자': 'speaker',
                            '참석자': 'attendee', 'attendee': 'attendee', '일반': 'attendee',
                            '스폰서': 'sponsor', 'sponsor': 'sponsor', '후원사': 'sponsor',
                            '스태프': 'staff', 'staff': 'staff', '운영진': 'staff',
                            'vip': 'vip', 'VIP': 'vip', '귀빈': 'vip'
                        }
                        attendee['attendee_type'] = type_mapping.get(type_value, 'attendee')
                    else:
                        field_map = {
                            '이름': 'name',
                            '이메일': 'email', 
                            '회사': 'company',
                            '직책': 'position'
                        }
                        attendee[field_map[field]] = row[col_index].strip()
            
            # 필수 필드 검증
            if attendee.get('name') and attendee.get('email'):
                # 이메일 형식 간단 검증
                email = attendee['email']
                if '@' in email and '.' in email:
                    attendee['id'] = row_index
                    attendee['created_at'] = '2024-09-18T12:00:00Z'
                    attendees.append(attendee)
                else:
                    print(f"⚠️ 잘못된 이메일 형식: {email} (행 {row_index})")
            else:
                print(f"⚠️ 필수 정보 누락 (행 {row_index}): 이름={attendee.get('name')}, 이메일={attendee.get('email')}")
        
        print(f"✅ {len(attendees)}명의 참석자 데이터를 처리했습니다.")
        return attendees
    
    def validate_spreadsheet_access(self, spreadsheet_id: str) -> bool:
        """
        스프레드시트 접근 권한 확인
        
        Args:
            spreadsheet_id: 스프레드시트 ID
        
        Returns:
            bool: 접근 가능 여부
        """
        if not self.service:
            return False
        
        try:
            # 스프레드시트 메타데이터만 가져와서 접근 권한 확인
            metadata = self.service.spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()
            
            print(f"✅ 스프레드시트 접근 성공: {metadata.get('properties', {}).get('title', 'Unknown')}")
            return True
            
        except HttpError as error:
            print(f"❌ 스프레드시트 접근 실패: {error}")
            return False
        except Exception as error:
            print(f"❌ 예상치 못한 오류: {error}")
            return False


# 전역 인스턴스
google_sheets_service = GoogleSheetsService()
