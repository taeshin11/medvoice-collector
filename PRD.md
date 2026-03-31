# PRD: MedVoice Collector — AI 음성 의료 데이터 수집기

## 1. 프로젝트 개요

**제품명:** MedVoice Collector (메드보이스 콜렉터)
**브랜드:** SPINAI
**한줄 요약:** 회진·외래 진료 중 의사-환자 대화를 AI가 실시간으로 듣고, 의학 용어로 자동 변환하여 엑셀형 데이터베이스에 채워주는 웹 애플리케이션

---

## 2. 배경 및 문제 정의

### 현재 Pain Point
- 의사가 회진(rounding) 또는 외래(outpatient clinic) 진료 중 환자와 대화하면서 **동시에 수기로 기록**해야 함
- 환자의 구어체 표현(예: "오른쪽 윗배가 아파요")을 **의학 용어(RUQ pain)**로 머릿속에서 변환 후 직접 입력
- 기록 누락, 오타, 시간 소모 → 진료 효율 저하

### 목표
- 대화 중 AI가 **실시간 음성 인식** → **의학 용어 자동 변환** → **엑셀형 DB 자동 입력**
- 의사는 환자와 대화에만 집중, 기록은 AI가 처리
- 최초 MVP를 웹으로 빠르게 구현하여 실제 임상 현장 피드백 확보

---

## 3. 타겟 유저

| 구분 | 설명 |
|------|------|
| Primary | 외과·내과 전공의/전문의 (회진·외래 담당) |
| Secondary | 간호사, PA(Physician Assistant), 의대 실습생 |
| Stakeholder | 최유진 (초기 테스터 및 피드백 제공자) |

---

## 4. 핵심 기능 (Features)

### 4.1 실시간 음성 인식 (Speech-to-Text)
- 브라우저 마이크를 통한 **실시간 스트리밍 인식** (음성 파일 저장 없음 → 환자 프라이버시 보호)
- Android/PC: Web Speech API 사용 (무료, 실시간)
- iOS Safari: Web Speech API 미지원 → Whisper API 폴백 자동 전환
- 한국어 의료 대화 인식 최적화
- 의사 발화 / 환자 발화 구분 (가능 시 화자 분리)
- 시작/중지/일시정지 컨트롤 (큰 버튼 — 모바일 한 손 조작 고려)

### 4.2 AI 의학 용어 변환 (Medical Term Mapping)
- 환자 구어체 → 표준 의학 약어/용어 자동 변환
- 변환 예시:

| 환자 표현 (구어체) | AI 변환 (의학 용어) | 매핑 필드 |
|---|---|---|
| "오른쪽 윗배가 아파요" | RUQ pain | C.C (Chief Complaint) |
| "명치가 아파요" | Epigastric pain | C.C |
| "열이 나요" | Fever | C.C |
| "밥 먹으면 체해요" | Postprandial indigestion | Associated Sx |
| "담석으로 수술하러 왔어요" | Cholelithiasis, Op. scheduled | Diagnosis / Plan |
| "3일 전부터 아팠어요" | Onset: 3 days ago | History |

- Claude API (Sonnet) 활용하여 context-aware 변환
- 진료과별 용어 사전 확장 가능

### 4.3 엑셀형 데이터베이스 자동 생성
- 환자별 행(row) 자동 생성
- 기본 컬럼 구조:

| 컬럼 | 설명 |
|------|------|
| Patient ID | 환자 식별 (자동 채번 또는 수동 입력) |
| Name | 환자명 |
| Date | 진료일 |
| C.C (Chief Complaint) | 주소 — AI 자동 채움 |
| Present Illness | 현병력 — AI 자동 채움 |
| Associated Sx | 동반 증상 — AI 자동 채움 |
| Past Hx | 과거력 |
| Diagnosis | 진단명 |
| Plan | 치료 계획 |
| Notes | 기타 메모 |

- 컬럼 커스터마이징 가능 (사용자가 필드 추가/삭제/이름 변경)
- 셀 클릭 시 수동 편집 가능

### 4.4 내보내기 (Export)
- `.xlsx` (엑셀) 파일 다운로드
- `.csv` 파일 다운로드
- 클립보드 복사 (EMR 붙여넣기용)

### 4.5 대화 로그 뷰어
- 원본 음성 텍스트(transcript) 전문 열람
- AI가 어떤 발화를 어떤 필드에 매핑했는지 하이라이트 표시
- 오류 시 수동 수정 → AI 학습 피드백 루프

---

## 5. 사용자 시나리오 (User Flow)

```
1. 의사가 핸드폰/태블릿으로 웹앱 접속 (또는 홈화면 PWA)
2. 🎙️ "음성 인식 시작" 버튼 탭
3. 의사: "담석으로 수술하러 오셨죠? 아프진 않으셨어요? 증상은 없나요?"
4. 환자: "오른쪽 윗배가 아파요, 명치가 아파요"
5. AI 실시간 처리:
   - STT → "오른쪽 윗배가 아파요, 명치가 아파요"
   - 변환 → C.C: "RUQ pain, Epigastric pain"
   - 엑셀 테이블 C.C 컬럼에 자동 입력
6. 의사가 다음 질문 계속 → AI 계속 채움
7. 진료 종료 → "중지" 탭
8. 의사가 테이블 검토 → 수정할 부분 직접 수정
9. 엑셀 다운로드 또는 EMR 복사
```

---

## 6. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React (Vite) / Next.js — 반응형 SPA |
| STT (Android/PC) | Web Speech API (실시간 스트리밍, 녹음 파일 미저장) |
| STT (iOS 폴백) | Whisper API (iOS Safari Web Speech API 미지원 대응) |
| AI 변환 | Anthropic Claude API (Sonnet 4) |
| 데이터 저장 | 브라우저 LocalStorage / IndexedDB (MVP) |
| Export | SheetJS (xlsx), FileSaver.js |
| 배포 | Vercel Free Tier |
| 도메인 | `medvoice.spinai.dev` 또는 Vercel 기본 도메인 |
| 모바일 대응 | PWA manifest, 홈화면 추가 지원, viewport meta |

---

## 7. MVP 범위 (Phase 1 — 2일 목표)

### ✅ 포함
- [x] 실시간 음성 인식 (Web Speech API, 한국어) — 음성 파일 저장 없음
- [x] iOS Safari 폴백 (Whisper API 자동 전환)
- [x] Claude API 연동 — 구어체 → 의학 용어 변환
- [x] 엑셀형 테이블 UI (편집 가능)
- [x] 환자 세션 추가/전환
- [x] xlsx/csv 내보내기
- [x] 반응형 (핸드폰 세로 + 태블릿 가로 + PC)
- [x] PWA manifest (홈화면 추가 → 앱처럼 사용)
- [x] 대화 transcript 표시

### ❌ 미포함 (Phase 2+)
- [ ] 화자 분리 (Speaker Diarization)
- [ ] EMR 시스템 직접 연동
- [ ] 진료과별 커스텀 용어 사전 관리
- [ ] 다중 사용자 / 로그인
- [ ] 서버 사이드 DB (PostgreSQL 등)
- [ ] 모바일 네이티브 앱 (PWA로 대부분 커버, 필요 시 고려)
- [ ] HIPAA/의료정보보호 규정 대응

---

## 8. UI/UX 가이드라인

### 레이아웃
```
┌──────────────────────────────────────────────┐
│  ◆ SPINAI · MedVoice Collector  [새 환자] [내보내기] │
├──────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌────────────────────┐ │
│  │ 🎙️ 실시간 대화    │  │ 📊 환자 데이터 테이블  │ │
│  │                 │  │                    │ │
│  │ [대화 transcript] │  │ [엑셀형 editable   │ │
│  │                 │  │  table]            │ │
│  │                 │  │                    │ │
│  │ ● REC 00:03:24  │  │                    │ │
│  │ [시작][중지][일시정지]│  │                    │ │
│  └─────────────────┘  └────────────────────┘ │
├──────────────────────────────────────────────┤
│  환자 목록: [Patient 1] [Patient 2] [+]        │
├──────────────────────────────────────────────┤
│  Built by SPINAI · spinaiceo@gmail.com · 👁 visitor count │
└──────────────────────────────────────────────┘
```

### SPINAI 브랜딩 요구사항
- **헤더:** "SPINAI" 로고/텍스트가 좌측 상단에 항상 표시 (예: `◆ SPINAI · MedVoice Collector`)
- **푸터:** `Built by SPINAI` 문구 + 연락처 이메일 + 방문자 카운터
- **컬러 액센트:** SPINAI 브랜드 컬러를 주요 버튼/링크에 적용
- **Export 파일:** 내보낸 xlsx/csv 파일 첫 행 또는 시트명에 `SPINAI MedVoice` 워터마크 포함
- **파비콘 & 타이틀:** 브라우저 탭에 SPINAI 아이콘 + "MedVoice Collector | SPINAI" 타이틀
- **로딩/스플래시:** 앱 초기 로딩 시 SPINAI 로고 잠깐 표시 (0.5~1초)

### 디자인 원칙
- **Mobile-First 반응형** — 핸드폰 → 태블릿 → PC 순서로 설계
- **소프트 배경색** — 장시간 사용 시 눈 피로 최소화 (연한 블루/그린 계열)
- **큰 터치 타겟** — 최소 48x48px, 태블릿에서 장갑 끼고도 누를 수 있도록
- **최소 클릭** — 시작 버튼 한 번이면 AI가 알아서 처리, 의사 개입 최소화
- **실시간 피드백** — 음성 인식 중임을 시각적으로 표시 (파형/펄스 애니메이션)
- **PWA 지원** — 홈화면에 추가하면 네이티브 앱처럼 사용 가능 (주소바 없이 풀스크린)
- **세로/가로 모드 대응** — 핸드폰 세로(대화 중심), 태블릿 가로(테이블 중심) 레이아웃 자동 전환

### 반응형 레이아웃 전략

| 디바이스 | 화면 | 레이아웃 |
|----------|------|----------|
| 핸드폰 (< 640px) | 세로 | 대화 transcript 위 + 테이블 아래 (스크롤) |
| 태블릿 (640~1024px) | 가로 | 좌측 대화 + 우측 테이블 (2컬럼) |
| PC (> 1024px) | - | 좌측 대화 + 우측 테이블 (넓은 2컬럼) |

---

## 9. Standing Constraints (필수 준수사항)

> ⚠️ 아래 항목은 **모든 개발 단계에서 반드시 준수**해야 하는 절대 제약조건이다.
> Builder/Reviewer 에이전트는 매 마일스톤마다 이 섹션을 체크리스트로 검증할 것.

---

### 9.1 Zero-Cost 인프라 (비용 최소화)

**원칙:** 운영 비용 $0 유지. 유료 서비스 절대 사용 금지 (MVP 단계).

| 항목 | 선택 | 비고 |
|------|------|------|
| 호스팅 | Vercel Free Tier | 실제 배포까지 완료할 것. 가이드만 작성 금지 |
| 도메인 | Vercel 기본 도메인 (`*.vercel.app`) | GitHub 링크 노출 금지 — Vercel URL로만 공유 |
| STT (Android/PC) | Web Speech API | 브라우저 내장, 무료 |
| STT (iOS 폴백) | Whisper API | 사용량 최소화, 캐싱 적용 |
| AI 변환 | Claude API (Sonnet) | 프롬프트 최적화로 토큰 절약 |
| 데이터 수집 | Google Sheets + Apps Script | 무료 |
| 분석 | 방문자 카운터 (자체 구현) | Footer 배치 |

**배포 지시:**
```bash
# Vercel 실제 배포 — 가이드 작성이 아닌 직접 실행
vercel --prod
```
- GitHub 아이디가 노출되는 `github.io` 링크 사용 금지
- Vercel 배포 URL만 외부 공유용으로 사용

---

### 9.2 SEO 최적화 (검색 잘 되도록)

검색 엔진에서 "의료 음성 기록", "AI 진료 기록", "medical voice recorder" 등으로 상위 노출 목표.

**필수 구현 항목:**
- `<title>`, `<meta description>`, `<meta keywords>` 태그 최적화
- Open Graph (`og:title`, `og:description`, `og:image`) 및 Twitter Card 메타 태그
- 구조화 데이터 (JSON-LD: `SoftwareApplication` 스키마)
- `sitemap.xml` 자동 생성
- `robots.txt` 설정
- Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`)
- 이미지 alt 태그, heading 계층 구조 (`h1` → `h2` → `h3`)
- Lighthouse SEO 점수 **90점 이상** 목표
- 페이지 로드 속도 최적화 (코드 스플리팅, lazy loading)

---

### 9.3 반응형 웹사이트 (Mobile-First)

- **Mobile-First** 설계: 핸드폰(< 640px) → 태블릿(640~1024px) → PC(> 1024px)
- CSS: Tailwind 기반 반응형 유틸리티 클래스 사용
- 터치 타겟 최소 48x48px
- PWA manifest 포함 (홈화면 추가 → 앱처럼 사용)
- viewport meta 태그 필수: `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

### 9.4 소프트 배경색 & UI 톤

- 배경: 연한 블루/그린 계열 (예: `#F0F7FF`, `#F5FAFA`, `#FAFBFE`)
- 의료 환경에서 장시간 사용 시 눈 피로 최소화
- 순백(`#FFFFFF`)이나 강한 대비색 지양
- 주요 액션 버튼만 SPINAI 브랜드 컬러로 포인트
- 다크모드는 Phase 2 고려

---

### 9.5 사용자 피드백 장치 (UX 해치지 않는 방식)

**수신 이메일:** `taeshinkim11@gmail.com`

**구현 방식:**
- 화면 우측 하단에 **작은 플로팅 버튼** (💬 또는 "피드백" 아이콘)
- 클릭 시 **간단한 모달** 팝업: 한줄 텍스트 입력 + 전송 버튼
- 전송 시 `mailto:taeshinkim11@gmail.com` 또는 Google Apps Script 경유 이메일 발송
- **절대 메인 UI를 가리거나 진료 흐름을 방해하지 않을 것**
- 전송 후 "감사합니다! 피드백이 전달되었습니다" 토스트 메시지 (2초 후 자동 닫힘)
- 피드백 버튼은 음성 인식 중에는 자동 숨김 (진료 집중 보장)

---

### 9.6 Milestone Git Push (gh CLI)

**원칙:** 중요 마일스톤 달성 시 반드시 git push. 수동 가이드 금지, 직접 실행.

**초기 설정 (Initializer 에이전트 필수 실행):**
```bash
# GitHub 리포 생성 — gh CLI로 직접 실행할 것
gh repo create medvoice-collector --public --source=. --remote=origin --push
```

**마일스톤 정의 및 커밋 규칙:**
| 마일스톤 | 커밋 메시지 | 시점 |
|----------|-----------|------|
| M1: 프로젝트 초기화 | `feat: project scaffolding & PWA setup` | 폴더 구조 + 빈 앱 실행 확인 |
| M2: STT 연동 | `feat: real-time speech-to-text` | 마이크 → 텍스트 변환 동작 |
| M3: AI 변환 | `feat: medical term conversion via Claude API` | 구어체 → 의학용어 변환 |
| M4: 테이블 UI | `feat: editable patient data table` | 엑셀형 테이블 렌더링 + 편집 |
| M5: Export | `feat: xlsx/csv export` | 파일 다운로드 동작 |
| M6: Google Sheets 연동 | `feat: silent data collection webhook` | 데이터 무음 수집 |
| M7: SEO + 브랜딩 | `feat: SEO meta tags & SPINAI branding` | Lighthouse 90+ |
| M8: Vercel 배포 | `feat: production deployment` | 라이브 URL 확인 |

```bash
# 마일스톤 달성 시 실행 (예시)
git add -A
git commit -m "feat: real-time speech-to-text"
git push origin main
```

---

### 9.7 CLI-First 자동화

**원칙:** CLI로 해결 가능한 작업은 **무조건 CLI로 자동화**. 가이드/매뉴얼 작성 금지.

적용 범위:
- `gh` CLI → GitHub 리포 생성, 이슈 관리
- `vercel` CLI → 실제 배포 (가이드가 아닌 직접 `vercel --prod` 실행)
- `npm` / `npx` → 패키지 설치, 프로젝트 scaffolding
- `curl` → API 테스트, webhook 테스트
- 환경 변수 → `.env` 파일 자동 생성

**금지 사항:**
- ❌ "다음 명령어를 실행하세요" 형태의 가이드
- ❌ "Vercel 대시보드에서 설정하세요" 형태의 GUI 안내
- ✅ 직접 명령어를 실행하여 결과를 확인

---

### 9.8 Google Sheets 무음 데이터 수집

**원칙:** 사용자 데이터를 Google Sheets로 자동 수집. **사용자는 이 수집을 인지하지 못하도록** 할 것.

**구현 상세:**

1. **Google Apps Script 웹앱 생성** (직접 코드 제공, 가이드 금지):
```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    new Date(),
    data.sessionId,
    data.patientCount,
    data.duration,
    data.termsConverted,
    data.device,
    data.browser
  ]);
  return ContentService.createTextOutput("OK");
}
```

2. **프론트엔드 POST 트리거:**
- 음성 인식 "중지" 버튼 클릭 시 → 세션 요약 데이터 자동 POST
- Export(내보내기) 버튼 클릭 시 → 사용 로그 자동 POST
- POST는 `navigator.sendBeacon()` 또는 `fetch` (비동기, UI 블로킹 없음)

3. **수집 데이터 (개인정보 제외):**
| 필드 | 설명 |
|------|------|
| timestamp | 세션 시각 |
| sessionId | 랜덤 UUID (환자 정보 아님) |
| patientCount | 해당 세션 환자 수 |
| duration | 세션 길이 (초) |
| termsConverted | AI 변환된 용어 수 |
| device | mobile / tablet / desktop |
| browser | Chrome / Safari / etc |

4. **사용자 비노출:**
- 네트워크 탭 외에는 수집 사실이 UI에 드러나지 않을 것
- 로딩 인디케이터, 토스트, 콘솔 로그 일절 표시 금지
- POST 실패 시 무시 (retry 없음, 에러 표시 없음)

---

### 9.9 SPINAI 브랜딩

- 헤더: `◆ SPINAI · MedVoice Collector` 항상 노출
- 푸터: `Built by SPINAI` + 방문자 카운터
- 파비콘 & 탭 타이틀: `MedVoice Collector | SPINAI`
- Export 파일: 시트명 또는 첫 행에 `SPINAI MedVoice` 워터마크
- 로딩 시 SPINAI 로고 스플래시 (0.5~1초)

---

## 10. 성공 지표 (KPI)

| 지표 | 목표 (MVP) |
|------|-----------|
| 음성 인식 정확도 (한국어 일상 의료 대화) | ≥ 85% |
| 의학 용어 변환 정확도 | ≥ 80% |
| 테스터 피드백 만족도 | 최유진 누나가 "쓸만하다" |
| MVP 완성 기한 | 2일 이내 |
| 페이지 로드 속도 | < 2초 |

---

## 11. 리스크 및 고려사항

| 리스크 | 대응 |
|--------|------|
| Web Speech API 한국어 의료 용어 인식률 낮음 | Whisper API 폴백, 후처리 보정 |
| iOS Safari Web Speech API 미지원 | Whisper API 자동 전환 (디바이스 감지) |
| Claude API 비용 | MVP 단계에선 소량 사용, 캐싱 활용 |
| 환자 개인정보 보호 | 음성 파일 미저장, 로컬 저장만, 서버 전송 없음. 추후 규정 대응 |
| 진료과마다 용어 체계 다름 | Phase 2에서 커스텀 사전 기능 추가 |
| 병원 네트워크 환경 (인터넷 제한) | PWA 오프라인 캐시 기본 적용, 오프라인 모드 고도화는 Phase 2 |
| 모바일 배터리 소모 | 음성 인식 중 화면 꺼짐 방지(Wake Lock API), 절전 안내 |

---

## 12. Anthropic Harness Design — 에이전트 역할

| 역할 | 담당 |
|------|------|
| **Planner** | PRD 분석 → 태스크 분해 → `handoff.md` 작성 |
| **Initializer** | 프로젝트 scaffolding, 패키지 설치, 폴더 구조 생성 |
| **Builder** | 컴포넌트별 구현 (STT, AI 변환, 테이블 UI, Export) |
| **Reviewer** | 코드 리뷰, 테스트, 버그 수정, 최종 배포 |

---

## 13. 연락처

- **개발:** 김태신 (SPINAI)
- **이메일:** spinaiceo@gmail.com
- **초기 테스터:** 최유진
