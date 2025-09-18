# 🚀 Email Automation System

완전한 이메일 자동화 솔루션으로 Google Sheets 연동과 대량 이메일 발송을 지원합니다.

## ✨ 주요 기능

### 📊 Google Sheets 연동
- **실시간 데이터 가져오기**: Google Sheets에서 직접 참석자 데이터 import
- **스마트 헤더 인식**: 다양한 헤더명 자동 인식 (이름, 이메일, 회사 등)
- **데이터 미리보기**: 가져오기 전 데이터 확인 가능
- **4단계 진행표시**: 직관적인 진행 상황 표시

### 📧 이메일 발송 시스템
- **SMTP 연동**: Gmail, Outlook 등 실제 이메일 서버 연동
- **테스트 모드**: 안전한 테스트 발송
- **템플릿 엔진**: 변수 치환 ({{name}}, {{company}} 등)
- **대량 발송**: 수백명에게 한번에 발송
- **발송 결과 추적**: 성공/실패 상세 리포트

### 🎯 스마트 이메일 캠페인
- **수신자 필터링**: 참석자 유형별 선택 발송
- **실시간 미리보기**: 실제 발송될 이메일 미리보기
- **캠페인 설정**: 이벤트 정보 일괄 관리
- **발송 통계**: 실시간 성공률 및 오류 분석

### 👥 참석자 관리
- **유형별 분류**: Speaker, Attendee, Sponsor, VIP, Staff
- **실시간 데이터**: 백엔드 API와 완전 연동
- **검색 및 필터**: 효율적인 데이터 관리

## 🏗️ 시스템 아키텍처

```
📦 Email Automation System
├── 🖥️ Frontend (React + TypeScript)
│   ├── 📊 Dashboard
│   ├── 👥 Attendee Management
│   ├── 📧 Email Templates
│   ├── 📊 Google Sheets Integration
│   └── 🚀 Email Campaign
├── ⚙️ Backend (Python Flask)
│   ├── 🔗 Google Sheets API
│   ├── 📧 Email Service (SMTP)
│   ├── 🗃️ Database (SQLite/MySQL)
│   └── 🔐 Authentication
└── 📊 External Services
    ├── Google Sheets API
    ├── Gmail SMTP
    └── Firebase Auth
```

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/Joseph0visioneer/Email-Auto.git
cd Email-Auto
```

### 2. 백엔드 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp config.env.example config.env
python simple_app.py
```

### 3. 프론트엔드 설정
```bash
cd frontend
npm install
PORT=3002 REACT_APP_API_URL=http://localhost:5001/api npm start
```

### 4. 접속
- **프론트엔드**: http://localhost:3002
- **백엔드 API**: http://localhost:5001

## 📋 실제 구현 가이드

### 🔑 Google Sheets API 설정
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 및 Sheets API 활성화
3. 서비스 계정 생성 및 JSON 키 다운로드
4. `backend/config/google-credentials.json`에 저장

상세한 설정 방법은 [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)를 참고하세요.

### 📧 이메일 SMTP 설정
```bash
# backend/config.env 파일 수정
EMAIL_TEST_MODE=false  # 실제 발송 모드
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail 앱 비밀번호
```

## 📊 지원되는 데이터 형식

### Google Sheets 헤더 (자동 인식)
| 필수 | 헤더명 예시 |
|------|-------------|
| ✅ | **이름**: 이름, name, 성명 |
| ✅ | **이메일**: 이메일, email, e-mail |
| ⚪ | **회사**: 회사, company, 소속 |
| ⚪ | **직책**: 직책, position, 역할 |
| ⚪ | **유형**: 참석자유형, type (attendee, speaker, sponsor, vip, staff) |

### 이메일 템플릿 변수
- `{{name}}` - 참석자 이름
- `{{email}}` - 이메일 주소
- `{{company}}` - 회사명
- `{{position}}` - 직책
- `{{event_name}}` - 이벤트명
- `{{event_date}}` - 이벤트 날짜
- `{{venue}}` - 장소
- `{{sender_name}}` - 발송자명

## 🔧 개발 환경

### 요구사항
- **Python 3.9+**
- **Node.js 18+**
- **npm 또는 yarn**

### 기술 스택
- **Frontend**: React, TypeScript, Axios
- **Backend**: Python, Flask, SQLAlchemy
- **Database**: SQLite (개발) / MySQL (프로덕션)
- **External APIs**: Google Sheets API, Gmail SMTP

## 📁 프로젝트 구조

```
email-automation-system/
├── 📂 backend/                 # Python Flask 백엔드
│   ├── 📂 routes/             # API 라우트
│   ├── 📂 services/           # 비즈니스 로직
│   ├── 📂 config/             # 설정 파일
│   ├── 📄 app.py              # 메인 애플리케이션
│   ├── 📄 simple_app.py       # 간단한 개발 서버
│   ├── 📄 models.py           # 데이터베이스 모델
│   └── 📄 requirements.txt    # Python 의존성
├── 📂 frontend/               # React 프론트엔드
│   ├── 📂 src/components/     # React 컴포넌트
│   ├── 📂 src/pages/          # 페이지 컴포넌트
│   ├── 📂 src/services/       # API 클라이언트
│   ├── 📄 package.json        # Node.js 의존성
│   └── 📄 tsconfig.json       # TypeScript 설정
├── 📂 docs/                   # 문서
├── 📄 README.md               # 프로젝트 개요
├── 📄 GOOGLE_SHEETS_SETUP.md  # Google Sheets 설정 가이드
└── 📄 IMPLEMENTATION_CHECKLIST.md # 구현 체크리스트
```

## 🧪 테스트

### 단위 테스트 실행
```bash
# 백엔드 테스트
cd backend
python -m pytest

# 프론트엔드 테스트
cd frontend
npm test
```

### 통합 테스트
```bash
# 전체 시스템 테스트
./scripts/run-tests.sh
```

## 🚀 배포

### Docker를 사용한 배포
```bash
# Docker 컨테이너 빌드 및 실행
docker-compose up --build
```

### 수동 배포
1. 환경 변수 설정
2. 데이터베이스 마이그레이션
3. 프론트엔드 빌드
4. 프로덕션 서버 실행

상세한 배포 방법은 [DEPLOYMENT.md](./docs/DEPLOYMENT.md)를 참고하세요.

## 🔒 보안

- **API 키 보안**: 환경변수 사용
- **CORS 설정**: 허용된 도메인만 접근
- **입력 검증**: 모든 사용자 입력 검증
- **HTTPS**: 프로덕션에서 HTTPS 필수

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

## 🤝 기여

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 지원

- **Issues**: [GitHub Issues](https://github.com/Joseph0visioneer/Email-Auto/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Joseph0visioneer/Email-Auto/discussions)

## 📈 로드맵

### 현재 버전 (v1.0)
- ✅ Google Sheets 연동
- ✅ 이메일 발송 시스템
- ✅ 웹 인터페이스
- ✅ 템플릿 관리

### 다음 버전 (v1.1)
- [ ] 예약 발송
- [ ] A/B 테스트
- [ ] 이메일 추적
- [ ] 모바일 앱

### 미래 계획 (v2.0)
- [ ] AI 기반 템플릿 최적화
- [ ] 고급 분석 도구
- [ ] 다국어 지원
- [ ] 엔터프라이즈 기능

---

⭐ **이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**