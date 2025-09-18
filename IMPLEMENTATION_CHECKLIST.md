# 🚀 실제 구현을 위한 체크리스트

## 📋 **필수 설정 작업**

### **1. 🔑 Google Sheets API 설정**

#### ✅ **Google Cloud Console 설정**
- [ ] Google Cloud 프로젝트 생성
- [ ] Google Sheets API 활성화  
- [ ] 서비스 계정 생성
- [ ] JSON 키 파일 다운로드

#### ✅ **키 파일 설정**
```bash
# 1. 키 파일을 올바른 위치에 저장
mkdir -p backend/config
# 다운로드받은 JSON 파일을 backend/config/google-credentials.json 으로 저장

# 2. 환경변수 확인
# backend/config.env 파일에서 다음 줄의 주석 해제:
# GOOGLE_CREDENTIALS_PATH=config/google-credentials.json
```

#### ✅ **Google Sheets 권한 설정**
- [ ] 테스트할 Google Sheets 생성
- [ ] 서비스 계정 이메일에 편집 권한 부여
- [ ] 스프레드시트 ID 복사

---

### **2. 📧 이메일 SMTP 설정 (실제 발송용)**

#### ✅ **Gmail SMTP 설정**
```bash
# backend/config.env 파일 수정:
EMAIL_TEST_MODE=false  # 실제 발송 모드로 변경
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-password  # Gmail 앱 비밀번호
SENDER_NAME=Your Name
```

#### ✅ **Gmail 앱 비밀번호 생성 단계**
1. Gmail 계정에서 2단계 인증 활성화
2. Google 계정 관리 > 보안 > 앱 비밀번호
3. "메일" 앱 선택, "기타" 기기 선택
4. 생성된 16자리 비밀번호 복사

---

### **3. 🔄 백엔드 재시작 (새 설정 적용)**

```bash
# 현재 실행중인 백엔드 중지 (Ctrl+C)
# 그리고 재시작:
cd backend
source venv/bin/activate
python simple_app.py
```

---

## 🧪 **테스트 시나리오**

### **Phase 1: Google Sheets 연동 테스트**
- [ ] http://localhost:3002 접속
- [ ] "📊 Google Sheets" 탭 클릭
- [ ] 준비한 Google Sheets URL 입력
- [ ] 연결 및 데이터 가져오기 테스트

### **Phase 2: 이메일 발송 테스트**
- [ ] "🚀 이메일 캠페인" 탭 클릭  
- [ ] 가져온 참석자 데이터 확인
- [ ] 이메일 템플릿 선택 및 미리보기
- [ ] 실제 이메일 발송 테스트

---

## 🔧 **선택적 개선사항**

### **1. 🗃️ 데이터베이스 연동 (권장)**
현재는 메모리 기반 Mock 데이터를 사용중입니다.

```bash
# SQLite 데이터베이스 설정 (이미 구현됨)
cd backend
python -c "
from app import app, db
with app.app_context():
    db.create_all()
    print('데이터베이스 테이블 생성 완료')
"
```

### **2. 🔐 보안 강화**
```bash
# 실제 배포용 시크릿 키 생성
python -c "import secrets; print(f'SECRET_KEY={secrets.token_hex(32)}')"
```

### **3. 📊 로깅 및 모니터링**
```bash
# 로그 레벨 설정
LOG_LEVEL=INFO  # config.env에 추가
```

### **4. 🚀 배포 준비**
- [ ] Docker 컨테이너화
- [ ] 환경별 설정 분리 (dev/staging/prod)
- [ ] HTTPS 설정
- [ ] 도메인 연결

---

## ⚠️ **중요 보안 고려사항**

### **환경변수 보안**
```bash
# .gitignore에 추가 (이미 추가됨)
config.env
config/google-credentials.json
*.log
__pycache__/
```

### **API 키 보안**
- 서비스 계정 JSON 파일을 외부에 노출하지 말 것
- 프로덕션에서는 환경변수나 보안 저장소 사용
- 정기적으로 키 교체

---

## 📈 **확장 기능 (미래 개발)**

### **고급 기능들**
- [ ] 예약 발송 (특정 시간에 자동 발송)
- [ ] A/B 테스트 (다른 템플릿으로 분할 발송)
- [ ] 이메일 추적 (오픈율, 클릭율)
- [ ] 자동 재시도 (실패한 발송 자동 재시도)
- [ ] 웹훅 알림 (발송 완료시 Slack 등으로 알림)

### **UI/UX 개선**
- [ ] 드래그 앤 드롭 템플릿 에디터
- [ ] 실시간 발송 진행률 표시
- [ ] 모바일 반응형 최적화
- [ ] 다국어 지원

### **대용량 처리**
- [ ] Redis 큐를 이용한 비동기 처리
- [ ] 배치 처리 최적화
- [ ] 발송 속도 제한 (Rate Limiting)

---

## 🎯 **즉시 시작 가능한 최소 설정**

가장 빠르게 시작하려면 다음 2단계만 하면 됩니다:

### **1단계: Google API 설정**
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 > Sheets API 활성화 > 서비스 계정 생성
3. JSON 키 다운로드 후 `backend/config/google-credentials.json`에 저장

### **2단계: 백엔드 재시작**
```bash
cd backend && python simple_app.py
```

이제 실제 Google Sheets 연동이 가능합니다! 🎉

---

## ✅ **완료 여부 체크**

실제 구현 완료 시 다음을 확인하세요:

- [ ] Google Sheets에서 실제 데이터 가져오기 성공
- [ ] 이메일 템플릿 미리보기 정상 동작  
- [ ] 이메일 발송 (테스트 모드) 정상 동작
- [ ] 모든 에러 없이 전체 워크플로우 완주

**🎊 모든 체크가 완료되면 완전한 이메일 자동화 시스템이 완성됩니다!**
