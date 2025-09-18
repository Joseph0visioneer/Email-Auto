# 🚀 Google Sheets 실제 연동 빠른 시작 가이드

## 📋 **현재 상황**
- ✅ 코드는 이미 Google Sheets API 연동 준비 완료
- ✅ Mock 데이터와 실제 API 자동 전환 지원
- ⚠️ Google Cloud Console 설정만 필요

## 🔧 **Step 1: Google Cloud Console 설정 (5분)**

### 1.1 프로젝트 생성
```
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: "email-automation-system"
```

### 1.2 Google Sheets API 활성화
```
1. API 및 서비스 > 라이브러리
2. "Google Sheets API" 검색
3. [사용 설정] 클릭
```

### 1.3 서비스 계정 생성
```
1. API 및 서비스 > 사용자 인증 정보
2. [사용자 인증 정보 만들기] > [서비스 계정]
3. 이름: email-automation-sheets
4. [만들고 계속하기] 클릭
5. 역할 설정은 건너뛰기
6. [완료] 클릭
```

### 1.4 JSON 키 생성 및 다운로드
```
1. 생성된 서비스 계정 클릭
2. [키] 탭 선택
3. [키 추가] > [새 키 만들기]
4. 유형: JSON 선택
5. [만들기] 클릭
6. 다운로드된 JSON 파일을 안전한 곳에 보관
```

## 📊 **Step 2: Google Sheets 준비 (3분)**

### 2.1 테스트 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com) 접속
2. 새 스프레드시트 생성
3. 다음 데이터 복사 후 붙여넣기:

```
이름	이메일	회사	직책	참석자유형
홍길동	hong@example.com	TechCorp	개발자	attendee
김영희	kim@example.com	Innovation Inc	CTO	speaker
이철수	lee@example.com	Sponsor Co	마케팅이사	sponsor
박민수	park@example.com	Startup	CEO	vip
정수아	jung@example.com	Agency	디자이너	attendee
```

### 2.2 서비스 계정에 권한 부여
```
1. 스프레드시트에서 [공유] 버튼 클릭
2. 다운로드받은 JSON 파일을 열어서 "client_email" 값 복사
   예: "email-automation-sheets@your-project.iam.gserviceaccount.com"
3. 이 이메일을 스프레드시트에 "편집자" 권한으로 추가
4. [완료] 클릭
```

### 2.3 스프레드시트 ID 복사
```
URL에서 ID 부분 복사:
https://docs.google.com/spreadsheets/d/[이 부분이 ID]/edit
```

## ⚙️ **Step 3: 백엔드 설정 (2분)**

### 3.1 JSON 키 파일 배치
```bash
# 다운로드받은 JSON 파일을 다음 위치에 저장
cp ~/Downloads/your-credentials.json backend/config/google-credentials.json
```

### 3.2 환경변수 설정
```bash
# config.env 파일 생성
cd backend
cp config.env.example config.env

# config.env 파일 수정 (필요시)
# GOOGLE_CREDENTIALS_PATH=config/google-credentials.json (이미 설정됨)
```

### 3.3 백엔드 재시작
```bash
cd backend
source venv/bin/activate
python simple_app.py
```

## 🧪 **Step 4: 테스트 실행 (1분)**

### 4.1 프론트엔드 접속
```
http://localhost:3002
```

### 4.2 Google Sheets 연동 테스트
```
1. [📊 Google Sheets] 탭 클릭
2. 복사한 스프레드시트 URL 입력
3. [🔗 연결 및 미리보기] 클릭
4. 데이터 미리보기 확인
5. [📥 데이터 가져오기] 클릭
```

### 4.3 이메일 캠페인 테스트
```
1. [🚀 이메일 캠페인] 탭 클릭
2. 가져온 참석자 데이터 확인
3. 이메일 템플릿 작성
4. [📤 이메일 발송하기] (테스트 모드)
```

## 🎯 **예상 결과**

### ✅ 성공 시
```
✅ Google Sheets API 연동 성공
✅ Google Sheets에서 5행의 데이터를 가져왔습니다.
✅ 5명의 참석자 데이터를 처리했습니다.
```

### ⚠️ 실패 시 (Mock 모드)
```
⚠️ Google Sheets 인증 정보가 없습니다. Mock 데이터를 사용합니다.
```

## 🔍 **문제 해결**

### 권한 오류
```
❌ 스프레드시트 접근 실패: 403 Forbidden
```
**해결책**: 서비스 계정 이메일이 스프레드시트에 편집자 권한으로 공유되었는지 확인

### 인증 파일 오류
```
⚠️ Google Sheets API 초기화 실패
```
**해결책**: 
1. JSON 파일이 `backend/config/google-credentials.json`에 있는지 확인
2. JSON 파일 내용이 손상되지 않았는지 확인

### API 미활성화 오류
```
❌ Google Sheets API가 활성화되지 않음
```
**해결책**: Google Cloud Console에서 Sheets API 활성화 확인

## 📧 **실제 이메일 발송 설정 (선택사항)**

현재는 테스트 모드입니다. 실제 이메일을 발송하려면:

### Gmail SMTP 설정
```bash
# 1. Gmail에서 2단계 인증 활성화
# 2. 앱 비밀번호 생성 (16자리)
# 3. config.env 파일 수정:

EMAIL_TEST_MODE=false
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
SENDER_NAME=Your Name
```

## 🎉 **완료!**

이제 실제 Google Sheets 데이터로 이메일 자동화 시스템을 사용할 수 있습니다!

**총 소요시간: 약 11분**
- Google Cloud 설정: 5분
- Google Sheets 준비: 3분  
- 백엔드 설정: 2분
- 테스트: 1분
