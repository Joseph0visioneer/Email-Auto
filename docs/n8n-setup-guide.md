# n8n 환경 설정 및 초기 구성 가이드

## 1. n8n 설치 및 설정

### Option A: n8n Cloud (권장 - 빠른 시작)
1. https://n8n.cloud 접속
2. 무료 계정 생성
3. 새 워크플로우 생성

### Option B: 로컬 설치 (고급 사용자)
```bash
# npm을 통한 설치
npm install -g n8n

# Docker를 통한 설치
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## 2. Google Sheets API 설정

### 2.1 Google Cloud Console 설정
1. https://console.cloud.google.com 접속
2. 새 프로젝트 생성: "학회-이메일-자동화"
3. Google Sheets API 활성화
4. 서비스 계정 생성 및 JSON 키 다운로드

### 2.2 테스트용 스프레드시트 생성
```
Google Sheets 템플릿:
| 이름 | 이메일 | 국가 | 초록등급 | 소속 | 발표시간 | Travel_Grant |
|------|--------|------|----------|------|----------|--------------|
| 김철수 | kim@test.com | 한국 | A | 서울대병원 | 2025-10-15 09:00 | $1000 |
| 田中太郎 | tanaka@test.com | 일본 | B | 도쿄대병원 | 2025-10-15 10:30 | $800 |
| Dr. Smith | smith@test.com | 태국 | A | Bangkok Hospital | 2025-10-15 14:00 | $1200 |
```

## 3. Microsoft Graph API 설정 (Outlook 연동)

### 3.1 Azure App Registration
1. https://portal.azure.com 접속
2. "App registrations" → "New registration"
3. 앱 이름: "학회-이메일-자동화"
4. API 권한 설정:
   - Mail.Send
   - Mail.ReadWrite

### 3.2 인증 정보 획득
- Application (client) ID
- Directory (tenant) ID  
- Client secret 생성

## 4. n8n 워크플로우 기본 구조 설계

### 4.1 Main Workflow: 메일 발송 자동화
```
[Manual Trigger] 
    ↓
[Google Sheets - Read Data] 
    ↓
[Data Validation & Filtering]
    ↓
[Template Selection Logic]
    ↓
[Personalization & Variable Replacement]
    ↓
[Microsoft Outlook - Send Email]
    ↓
[Log Results]
```

### 4.2 Sub Workflow: 발송 이력 관리
```
[Webhook Trigger]
    ↓
[Parse Sending Results]
    ↓
[Save to Database/JSON]
    ↓
[Update Dashboard Data]
```

## 5. 첫 번째 워크플로우 구현

이제 n8n에서 실제 워크플로우를 구축해보겠습니다.

### Step 1: 기본 노드 배치
1. **Manual Trigger** 노드 추가
2. **Google Sheets** 노드 추가  
3. **Code** 노드 추가 (데이터 처리용)
4. **Microsoft Outlook** 노드 추가
5. **Set** 노드 추가 (로깅용)

### Step 2: Google Sheets 노드 설정
```javascript
// Google Sheets 노드 설정값
Operation: Read
Document: [스프레드시트 URL]
Sheet: Sheet1
Range: A:G  // 모든 데이터 컬럼
```

### Step 3: 데이터 처리 Code 노드
```javascript
// 입력 데이터 검증 및 필터링
const inputData = items[0].json;
const validEmails = [];

for (const row of inputData) {
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(row.이메일) && 
      row.이름 && 
      row.국가 && 
      row.초록등급) {
    
    // 템플릿 선택 로직
    let templateType = '';
    if (row.초록등급 === 'A') {
      templateType = 'premium_invite';
    } else if (row.초록등급 === 'B') {
      templateType = 'standard_invite';
    } else {
      templateType = 'basic_invite';
    }
    
    validEmails.push({
      name: row.이름,
      email: row.이메일,
      country: row.국가,
      grade: row.초록등급,
      affiliation: row.소속,
      presentationTime: row.발표시간,
      travelGrant: row.Travel_Grant,
      templateType: templateType,
      personalizedSubject: `${row.이름}님, 학회 참석 안내드립니다`,
      personalizedBody: `안녕하세요 ${row.이름}님,\n\n${row.소속}에서 오시는 것을 환영합니다.\n귀하의 초록등급: ${row.초록등급}\nTravel Grant: ${row.Travel_Grant}\n\n감사합니다.`
    });
  }
}

return validEmails.map(email => ({ json: email }));
```

### Step 4: Outlook 메일 발송 노드
```javascript
// Microsoft Outlook 노드 설정
Operation: Send Email
To: {{$json["email"]}}
Subject: {{$json["personalizedSubject"]}}
Body: {{$json["personalizedBody"]}}
Body Type: Text
```

### Step 5: 결과 로깅 노드
```javascript
// Set 노드 - 발송 결과 기록
{
  "timestamp": "{{$now}}",
  "recipient": "{{$json["email"]}}",
  "name": "{{$json["name"]}}",
  "template": "{{$json["templateType"]}}",
  "status": "sent",
  "country": "{{$json["country"]}}",
  "grade": "{{$json["grade"]}}"
}
```

## 6. 테스트 실행 절차

### 6.1 사전 준비
- [ ] Google Sheets API 연결 테스트
- [ ] Microsoft Graph API 연결 테스트  
- [ ] 테스트 이메일 계정 준비

### 6.2 단계별 테스트
1. **데이터 읽기 테스트**: Google Sheets에서 데이터 정상 읽기 확인
2. **필터링 테스트**: 유효한 데이터만 필터링되는지 확인
3. **템플릿 선택 테스트**: 초록등급별 올바른 템플릿 선택 확인
4. **메일 발송 테스트**: 실제 메일 발송 및 수신 확인

### 6.3 예상 결과
- 테스트 스프레드시트의 3명에게 각각 다른 템플릿으로 메일 발송
- 발송 로그에 모든 발송 내역 기록
- 오류 없이 전체 워크플로우 완료

## 7. 다음 단계 Preview

Phase 1 완료 후:
- 더 복잡한 조건부 로직 구현
- 시기별 템플릿 변경 기능
- 배치 발송 최적화
- 오류 처리 강화

---

**지금 바로 시작할 준비가 되었습니다!** 
어떤 환경(n8n Cloud vs 로컬)으로 시작하시겠어요?


