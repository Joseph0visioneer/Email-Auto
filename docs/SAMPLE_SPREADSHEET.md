# 📋 샘플 Google Sheets 템플릿

## 🎯 사용법
1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. 아래 데이터를 복사해서 붙여넣기
3. 서비스 계정 이메일에 편집자 권한 부여

## 📊 샘플 데이터

### 헤더 (첫 번째 행)
```
이름	이메일	회사	직책	참석자유형
```

### 샘플 참석자 데이터
```
이름	이메일	회사	직책	참석자유형
홍길동	hong.gildong@techcorp.com	TechCorp	개발자	attendee
김영희	kim.younghee@innovate.co.kr	Innovate Inc	CTO	speaker
이철수	lee.chulsoo@sponsor.com	Sponsor Co	마케팅이사	sponsor
박민수	park.minsu@startup.kr	Startup	CEO	vip
정수아	jung.sua@agency.com	Agency	디자이너	attendee
최대한	choi.daehan@consulting.kr	Consulting	컨설턴트	attendee
오성민	oh.sungmin@venture.com	Venture Capital	투자자	vip
한지수	han.jisu@media.co.kr	Media Co	기자	staff
윤태경	yoon.taekyung@university.ac.kr	University	교수	speaker
장미라	jang.mira@global.com	Global Solutions	프로젝트매니저	attendee
```

## 🔧 헤더 설정 가이드

### 필수 컬럼
- **이름** (또는 name, 성명)
- **이메일** (또는 email, e-mail)

### 선택 컬럼
- **회사** (또는 company, 소속)
- **직책** (또는 position, 역할)
- **참석자유형** (또는 attendee_type, type)

### 참석자유형 옵션
- `attendee` - 일반 참석자
- `speaker` - 연사
- `sponsor` - 스폰서
- `vip` - VIP
- `staff` - 스태프

## 📧 이메일 템플릿에서 사용할 수 있는 변수
- `{{name}}` - 참석자 이름
- `{{email}}` - 이메일 주소
- `{{company}}` - 회사명
- `{{position}}` - 직책
- `{{event_name}}` - 이벤트명
- `{{event_date}}` - 이벤트 날짜
- `{{venue}}` - 장소
- `{{sender_name}}` - 발송자명

## 🎯 실제 사용 예시

### 일반 참석자용 이메일
```
안녕하세요 {{name}}님,

{{company}}에서 {{position}}로 활동하시는 {{name}}님을 {{event_name}}에 초대합니다.

일시: {{event_date}}
장소: {{venue}}

많은 참여 부탁드립니다.

감사합니다.
{{sender_name}}
```

### 연사용 이메일
```
안녕하세요 {{name}}님,

{{event_name}}의 연사로 초대하게 되어 영광입니다.

귀하의 {{company}}에서의 경험을 공유해주시기를 기대하고 있습니다.

발표 일정 및 자세한 사항은 별도로 안내드리겠습니다.

감사합니다.
{{sender_name}}
```

이 템플릿을 사용하여 테스트 스프레드시트를 만들어보세요!
