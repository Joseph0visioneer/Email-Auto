# 📊 Google Sheets 연동 설정 가이드

이 가이드에 따라 Google Sheets API를 설정하면 실제 Google Sheets에서 참석자 데이터를 가져올 수 있습니다.

## 🔧 1단계: Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. 프로젝트 이름: `email-automation-system` (또는 원하는 이름)

### 1.2 Google Sheets API 활성화
1. **API 및 서비스 > 라이브러리** 메뉴 이동
2. "Google Sheets API" 검색
3. **Google Sheets API** 선택 후 **사용 설정** 클릭

### 1.3 서비스 계정 생성
1. **API 및 서비스 > 사용자 인증 정보** 메뉴 이동
2. **사용자 인증 정보 만들기 > 서비스 계정** 선택
3. 서비스 계정 정보 입력:
   - **서비스 계정 이름**: `email-automation-sheets`
   - **서비스 계정 ID**: `email-automation-sheets` (자동 생성)
   - **설명**: `Google Sheets API access for Email Automation`
4. **만들고 계속하기** 클릭
5. 역할 설정은 건너뛰기 (기본 권한 사용)
6. **완료** 클릭

### 1.4 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. **키** 탭 선택
3. **키 추가 > 새 키 만들기** 선택
4. **키 유형**: JSON 선택
5. **만들기** 클릭
6. JSON 파일이 다운로드됨 ⭐ **이 파일을 안전하게 보관하세요!**

## 📋 2단계: Google Sheets 준비

### 2.1 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 다음과 같은 형식으로 데이터 입력:

| A (이름) | B (이메일) | C (회사) | D (직책) | E (참석자유형) |
|----------|------------|----------|----------|---------------|
| 홍길동 | hong@example.com | ABC Corp | 개발자 | attendee |
| 김영희 | kim@example.com | XYZ Inc | CTO | speaker |
| 이철수 | lee@example.com | Tech Co | 마케팅 | sponsor |

### 2.2 서비스 계정에 권한 부여
1. 스프레드시트에서 **공유** 버튼 클릭
2. 다운로드받은 JSON 파일에서 `client_email` 값 복사
   ```json
   {
     "client_email": "email-automation-sheets@your-project.iam.gserviceaccount.com"
   }
   ```
3. 이 이메일 주소를 스프레드시트에 **편집자** 권한으로 추가
4. **완료** 클릭

### 2.3 스프레드시트 ID 확인
스프레드시트 URL에서 ID 부분을 복사하세요:
```
https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
```

## ⚙️ 3단계: 백엔드 설정

### 3.1 서비스 계정 키 파일 배치
다운로드받은 JSON 파일을 다음 위치에 저장:
```
backend/config/google-credentials.json
```

### 3.2 환경 변수 설정
`backend/config.env` 파일을 수정:
```bash
# Google Sheets Configuration
GOOGLE_CREDENTIALS_PATH=config/google-credentials.json

# 또는 JSON 내용을 직접 환경변수로 설정
# GOOGLE_CREDENTIALS_JSON={"type":"service_account",...}
```

### 3.3 백엔드 재시작
```bash
cd backend
source venv/bin/activate
python simple_app.py
```

## 🧪 4단계: 테스트

### 4.1 연결 테스트
웹 브라우저에서 http://localhost:3002 접속 후:
1. **📊 Google Sheets** 탭 클릭
2. 스프레드시트 URL 입력
3. **🔗 연결 및 미리보기** 버튼 클릭
4. 데이터 미리보기 확인
5. **📥 데이터 가져오기** 버튼 클릭

### 4.2 이메일 발송 테스트
1. **🚀 이메일 캠페인** 탭 클릭
2. 가져온 참석자 데이터 확인
3. 이메일 템플릿 선택
4. **👁️ 미리보기** 확인
5. **📤 이메일 발송하기** (테스트 모드)

## 📧 5단계: 실제 이메일 발송 설정 (선택사항)

실제 이메일을 발송하려면 SMTP 설정이 필요합니다:

### 5.1 Gmail SMTP 설정
1. Gmail에서 **2단계 인증** 활성화
2. **앱 비밀번호** 생성:
   - Google 계정 > 보안 > 앱 비밀번호
   - 앱 선택: 메일
   - 기기 선택: 기타 (사용자 지정 이름 입력)
   - 생성된 16자리 비밀번호 복사

### 5.2 환경변수 설정
`backend/config.env` 파일 수정:
```bash
# 실제 이메일 발송을 위한 설정
EMAIL_TEST_MODE=false
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
SENDER_NAME=Your Name or Organization
```

## 🔒 보안 주의사항

1. **JSON 키 파일 보안**:
   - Git에 커밋하지 마세요
   - `.gitignore`에 `config/google-credentials.json` 추가
   
2. **환경변수 보안**:
   - 실제 배포시 환경변수로 설정
   - 하드코딩하지 마세요

3. **스프레드시트 권한**:
   - 필요한 최소 권한만 부여
   - 정기적으로 권한 검토

## 🎯 지원되는 데이터 형식

### 필수 컬럼
- **이름**: 참석자 이름
- **이메일**: 유효한 이메일 주소

### 선택 컬럼
- **회사**: 소속 회사명
- **직책**: 직책/역할
- **참석자유형**: `attendee`, `speaker`, `sponsor`, `vip`, `staff`

### 헤더 예시
다음 헤더명들이 자동으로 인식됩니다:
- **이름**: 이름, name, 성명, 참석자명
- **이메일**: 이메일, email, e-mail, 메일, 이메일주소
- **회사**: 회사, company, 회사명, 소속
- **직책**: 직책, position, 직위, 역할
- **참석자유형**: 참석자유형, attendee_type, type, 유형

## 🆘 문제 해결

### 권한 오류
```
Error: 스프레드시트에 접근할 수 없습니다
```
- 서비스 계정 이메일이 스프레드시트에 공유되었는지 확인
- 편집자 권한으로 공유되었는지 확인

### 인증 오류
```
Error: Google Sheets API 초기화 실패
```
- JSON 키 파일 경로가 올바른지 확인
- JSON 파일 내용이 손상되지 않았는지 확인

### 데이터 형식 오류
```
Warning: 필수 정보 누락
```
- 첫 번째 행이 헤더인지 확인
- 이름과 이메일 컬럼이 있는지 확인
- 이메일 형식이 올바른지 확인

이제 완전한 Google Sheets 연동과 이메일 발송 시스템이 준비되었습니다! 🎉
