"""
이메일 발송 서비스
"""

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header
from typing import List, Dict, Any, Optional
from datetime import datetime
import re


class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.email_address = os.getenv('EMAIL_ADDRESS', '')
        self.email_password = os.getenv('EMAIL_PASSWORD', '')
        self.sender_name = os.getenv('SENDER_NAME', 'Email Automation System')
        
        # 테스트 모드 (실제 이메일 발송하지 않음)
        self.test_mode = os.getenv('EMAIL_TEST_MODE', 'true').lower() == 'true'
        
        if self.test_mode:
            print("📧 이메일 서비스가 테스트 모드로 실행됩니다.")
        else:
            print("📧 이메일 서비스가 실제 발송 모드로 실행됩니다.")
    
    def validate_email_config(self) -> bool:
        """이메일 설정 검증"""
        if self.test_mode:
            return True
            
        required_configs = {
            'SMTP_SERVER': self.smtp_server,
            'EMAIL_ADDRESS': self.email_address,
            'EMAIL_PASSWORD': self.email_password
        }
        
        missing_configs = [key for key, value in required_configs.items() if not value]
        
        if missing_configs:
            print(f"❌ 필수 이메일 설정이 없습니다: {', '.join(missing_configs)}")
            return False
        
        print("✅ 이메일 설정이 완료되었습니다.")
        return True
    
    def validate_email_address(self, email: str) -> bool:
        """이메일 주소 형식 검증"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    def process_template(self, template: str, data: Dict[str, Any]) -> str:
        """
        템플릿 변수 치환
        
        Args:
            template: 템플릿 문자열 ({{variable}} 형식)
            data: 치환할 데이터
        
        Returns:
            str: 처리된 문자열
        """
        processed = template
        
        # 기본 변수들
        default_data = {
            'current_date': datetime.now().strftime('%Y년 %m월 %d일'),
            'current_time': datetime.now().strftime('%H:%M'),
            'sender_name': self.sender_name
        }
        
        # 데이터 병합 (사용자 데이터가 우선)
        all_data = {**default_data, **data}
        
        # 변수 치환
        for key, value in all_data.items():
            placeholder = f'{{{{{key}}}}}'
            processed = processed.replace(placeholder, str(value))
        
        return processed
    
    def send_email(self, 
                   recipient_email: str, 
                   subject: str, 
                   body: str, 
                   recipient_name: str = '', 
                   template_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        단일 이메일 발송
        
        Args:
            recipient_email: 수신자 이메일
            subject: 이메일 제목
            body: 이메일 본문
            recipient_name: 수신자 이름
            template_data: 템플릿 변수 데이터
        
        Returns:
            Dict: 발송 결과
        """
        # 이메일 주소 검증
        if not self.validate_email_address(recipient_email):
            return {
                'success': False,
                'error': f'잘못된 이메일 주소: {recipient_email}',
                'recipient': recipient_email
            }
        
        # 템플릿 처리
        if template_data:
            template_data['name'] = recipient_name or recipient_email.split('@')[0]
            template_data['email'] = recipient_email
            
            subject = self.process_template(subject, template_data)
            body = self.process_template(body, template_data)
        
        # 테스트 모드
        if self.test_mode:
            print(f"📧 [테스트] 이메일 발송 시뮬레이션")
            print(f"   수신자: {recipient_name} <{recipient_email}>")
            print(f"   제목: {subject}")
            print(f"   본문 미리보기: {body[:100]}...")
            
            return {
                'success': True,
                'message': '테스트 모드에서 성공적으로 시뮬레이션 되었습니다.',
                'recipient': recipient_email,
                'subject': subject,
                'test_mode': True
            }
        
        # 실제 이메일 발송
        try:
            # 이메일 설정 검증
            if not self.validate_email_config():
                return {
                    'success': False,
                    'error': '이메일 설정이 올바르지 않습니다.',
                    'recipient': recipient_email
                }
            
            # MIME 메시지 생성
            message = MIMEMultipart('alternative')
            message['From'] = f"{self.sender_name} <{self.email_address}>"
            message['To'] = f"{recipient_name} <{recipient_email}>" if recipient_name else recipient_email
            message['Subject'] = Header(subject, 'utf-8')
            
            # 본문 추가 (HTML과 텍스트 모두 지원)
            if '<html>' in body.lower() or '<p>' in body.lower():
                # HTML 이메일
                html_part = MIMEText(body, 'html', 'utf-8')
                message.attach(html_part)
            else:
                # 텍스트 이메일
                text_part = MIMEText(body, 'plain', 'utf-8')
                message.attach(text_part)
            
            # SMTP 연결 및 발송
            context = ssl.create_default_context()
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.email_address, self.email_password)
                server.send_message(message)
            
            print(f"✅ 이메일 발송 성공: {recipient_email}")
            
            return {
                'success': True,
                'message': '이메일이 성공적으로 발송되었습니다.',
                'recipient': recipient_email,
                'subject': subject,
                'sent_at': datetime.now().isoformat()
            }
            
        except smtplib.SMTPAuthenticationError:
            error_msg = 'SMTP 인증 실패. 이메일 주소와 비밀번호를 확인하세요.'
            print(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'recipient': recipient_email
            }
            
        except smtplib.SMTPRecipientsRefused:
            error_msg = f'수신자 이메일 주소가 거부되었습니다: {recipient_email}'
            print(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'recipient': recipient_email
            }
            
        except Exception as e:
            error_msg = f'이메일 발송 중 오류가 발생했습니다: {str(e)}'
            print(f"❌ {error_msg}")
            return {
                'success': False,
                'error': error_msg,
                'recipient': recipient_email
            }
    
    def send_bulk_emails(self, 
                        attendees: List[Dict[str, Any]], 
                        email_template: Dict[str, str],
                        template_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        대량 이메일 발송
        
        Args:
            attendees: 참석자 정보 리스트
            email_template: 이메일 템플릿 (subject, body 포함)
            template_data: 공통 템플릿 데이터
        
        Returns:
            Dict: 대량 발송 결과
        """
        results = {
            'total': len(attendees),
            'success_count': 0,
            'failure_count': 0,
            'results': [],
            'started_at': datetime.now().isoformat()
        }
        
        for i, attendee in enumerate(attendees, 1):
            print(f"📧 이메일 발송 중... ({i}/{len(attendees)}) - {attendee.get('email', 'Unknown')}")
            
            # 개별 템플릿 데이터 생성
            individual_data = template_data.copy() if template_data else {}
            individual_data.update({
                'name': attendee.get('name', '참석자'),
                'email': attendee.get('email', ''),
                'company': attendee.get('company', ''),
                'position': attendee.get('position', ''),
                'attendee_type': attendee.get('attendee_type', 'attendee')
            })
            
            # 개별 이메일 발송
            result = self.send_email(
                recipient_email=attendee.get('email', ''),
                subject=email_template.get('subject', ''),
                body=email_template.get('body', ''),
                recipient_name=attendee.get('name', ''),
                template_data=individual_data
            )
            
            result['attendee_id'] = attendee.get('id')
            result['attendee_name'] = attendee.get('name')
            results['results'].append(result)
            
            if result['success']:
                results['success_count'] += 1
            else:
                results['failure_count'] += 1
        
        results['completed_at'] = datetime.now().isoformat()
        results['duration'] = f"{results['success_count'] + results['failure_count']} emails processed"
        
        print(f"📊 대량 이메일 발송 완료:")
        print(f"   총 {results['total']}명 대상")
        print(f"   성공: {results['success_count']}명")
        print(f"   실패: {results['failure_count']}명")
        
        return results


# 전역 인스턴스
email_service = EmailService()
