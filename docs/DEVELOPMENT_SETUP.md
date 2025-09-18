# 개발 환경 설정 가이드

## 📋 시스템 요구사항

### 필수 소프트웨어
- **Node.js**: 18.0.0 이상
- **Python**: 3.9 이상
- **MySQL**: 8.0 이상
- **Git**: 최신 버전

### 권장 개발 도구
- **IDE**: VS Code, PyCharm, WebStorm
- **Database Tool**: MySQL Workbench, DBeaver
- **API Testing**: Postman, Insomnia

## 🚀 빠른 시작

### 1단계: 프로젝트 클론 및 설정
```bash
# 프로젝트 디렉토리로 이동
cd email-automation-system

# 환경변수 파일 생성
cp env.example .env
```

### 2단계: 백엔드 설정
```bash
# 백엔드 디렉토리로 이동
cd backend

# 가상환경 생성 및 활성화
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\\Scripts\\activate  # Windows

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정 (.env 파일 수정)
# DATABASE_URL=mysql://user:password@localhost:3306/email_automation
# DEBUG=True
```

### 3단계: 데이터베이스 설정
```bash
# MySQL 접속 후 데이터베이스 생성
mysql -u root -p
CREATE DATABASE email_automation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 스키마 적용
mysql -u root -p email_automation < ../database/schema.sql

# Flask 마이그레이션 초기화 (선택적)
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

### 4단계: 프론트엔드 설정
```bash
# 프론트엔드 디렉토리로 이동
cd ../frontend

# 의존성 설치
npm install

# 환경변수 설정
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
```

### 5단계: 개발 서버 실행

**백엔드 서버 (터미널 1)**
```bash
cd backend
source venv/bin/activate
python app.py
# 서버 실행: http://localhost:5000
```

**프론트엔드 서버 (터미널 2)**
```bash
cd frontend
npm start
# 서버 실행: http://localhost:3000
```

## 🔧 환경변수 설정

### 백엔드 (.env)
```bash
# 데이터베이스
DATABASE_URL=mysql://username:password@localhost:3306/email_automation

# Flask 설정
SECRET_KEY=your-super-secret-key-here
DEBUG=True
FLASK_ENV=development

# CORS 설정
CORS_ORIGINS=http://localhost:3000

# Firebase (개발 단계에서는 Mock 사용)
FIREBASE_CREDENTIALS_PATH=path/to/firebase-credentials.json

# Google Sheets API (나중에 설정)
GOOGLE_SHEETS_CREDENTIALS_PATH=path/to/google-credentials.json

# SMTP 설정 (나중에 설정)
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your-email@outlook.com
SMTP_PASSWORD=your-password
```

### 프론트엔드 (.env.local)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

## 🧪 기본 테스트

### 1. 백엔드 헬스 체크
```bash
curl http://localhost:5000/api/health
```

예상 응답:
```json
{
    "status": "healthy",
    "message": "Email Automation System is running",
    "version": "1.0.0"
}
```

### 2. Mock 로그인 테스트
```bash
curl -X POST http://localhost:5000/api/auth/mock-login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'
```

### 3. 참석자 목록 조회
```bash
# Mock 로그인에서 받은 토큰 사용
curl -X GET http://localhost:5000/api/attendees/ \\
  -H "Authorization: Bearer mock-token-for-development"
```

### 4. 프론트엔드 접속
브라우저에서 http://localhost:3000 접속하여 UI 확인

## 📁 프로젝트 구조 이해

```
email-automation-system/
├── backend/              # Flask 백엔드
│   ├── app.py           # 메인 애플리케이션
│   ├── models.py        # 데이터베이스 모델
│   ├── routes/          # API 라우트
│   ├── services/        # 비즈니스 로직
│   └── requirements.txt # Python 의존성
├── frontend/            # React 프론트엔드
│   ├── src/
│   │   ├── components/  # 재사용 컴포넌트
│   │   ├── pages/       # 페이지 컴포넌트
│   │   ├── services/    # API 서비스
│   │   ├── hooks/       # 커스텀 훅
│   │   └── types/       # TypeScript 타입
│   └── package.json     # Node.js 의존성
├── database/            # 데이터베이스 스키마
└── docs/               # 프로젝트 문서
```

## 🐛 트러블슈팅

### 일반적인 문제들

**1. 백엔드 서버가 시작되지 않음**
```bash
# 가상환경 활성화 확인
source venv/bin/activate

# 의존성 재설치
pip install -r requirements.txt

# MySQL 연결 확인
mysql -u root -p -e "SHOW DATABASES;"
```

**2. 프론트엔드 빌드 오류**
```bash
# 캐시 클리어 후 재설치
rm -rf node_modules package-lock.json
npm install
```

**3. 데이터베이스 연결 오류**
- MySQL 서버 실행 상태 확인
- DATABASE_URL 환경변수 확인
- 데이터베이스 권한 확인

**4. CORS 오류**
- CORS_ORIGINS 환경변수 확인
- 프론트엔드 서버 주소가 올바른지 확인

## 🔄 다음 단계

1. **Firebase 인증 설정**: Mock 로그인에서 실제 Firebase 인증으로 전환
2. **Google Sheets API 연동**: 참석자 데이터 가져오기 기능 구현
3. **이메일 전송 기능**: SMTP 서버 연동 및 이메일 발송
4. **UI 개선**: 사용자 친화적인 인터페이스 구현

## 📞 지원

문제가 발생하면 다음을 확인해주세요:
1. 모든 서비스가 실행 중인지 확인
2. 환경변수가 올바르게 설정되었는지 확인
3. 로그 파일에서 에러 메시지 확인
4. 이 가이드의 단계를 정확히 따랐는지 확인

