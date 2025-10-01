# 🚀 LINA Data Portal - Vue 3

데이터 분석 플랫폼을 위한 현대적이고 직관적인 웹 애플리케이션입니다.

![Vue 3](https://img.shields.io/badge/Vue-3.4.0-4FC08D?style=flat-square&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.0.0-646CFF?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🎯 프로젝트 개요

Data Portal은 데이터 분석 업무를 효율화하기 위한 통합 플랫폼입니다. 
보험업계 특화 데이터 분석 도구와 직관적인 사용자 인터페이스를 제공하여 데이터 기반 의사결정을 지원합니다.

## ✨ 주요 기능

### 🏠 **홈 대시보드**
- **통합 검색**: 데이터셋, 테이블, 키워드 통합 검색 기능
- **카테고리별 검색 결과**: 대시보드, 리포트, 테이블, 모델, API별 분류 표시
- **접기/펼치기 기능**: 카테고리 헤더 클릭으로 섹션 관리
- **컴팩트 오버뷰**: 업데이트, 최근 활동, 인기 데이터셋을 한눈에
- **빠른 액션**: 새 대시보드, 데이터 가져오기, SQL 쿼리, API 테스트

### � ***My Dashboard**
- **슬라이더 형태**: 여러 대시보드를 슬라이드로 탐색
- **동적 제목 표시**: 현재 보고 있는 대시보드 이름 자동 표시
- **보험 KPI 대시보드**: 보험계약, 보험료 수입, 심사기간, 고객만족도
- **청구 요약 대시보드**: 청구 현황, 처리 상태, 승인률 등
- **헤더리스 디자인**: 콘텐츠에 집중할 수 있는 깔끔한 레이아웃

### 🏪 **Dashboard Store**
- **템플릿 갤러리**: 다양한 대시보드 템플릿 제공
- **카테고리별 분류**: 업무 영역별 대시보드 템플릿
- **원클릭 설치**: 간편한 대시보드 설치 및 커스터마이징
- **미리보기 기능**: 설치 전 대시보드 미리보기

### 📋 **Data Report**
- **PDF 뷰어**: 월간 리포트 및 분석 문서 온라인 뷰어
- **카테고리 필터**: 고객 분석, KPI 리포트, 모니터링, 월간 리포트
- **전체화면 모드**: 문서 집중 읽기 모드
- **검색 기능**: 리포트 내용 검색

### 🏢 **Chubb Data**
- **보험사 특화 데이터**: 영어 기반 보험업계 데이터 카탈로그
- **다중 데이터 타입**: Dataset, Dashboard, Report 통합 관리
- **고급 필터링**: 타입별, 태그별 필터링 및 검색
- **즐겨찾기 기능**: 자주 사용하는 데이터 북마크

## 🛠️ 분석 도구

### 💻 **SQL Editor**
- **사이드바 레이아웃**: 스키마 패널과 에디터 분리
- **구문 강조**: SQL 쿼리 하이라이팅 및 자동완성
- **스키마 브라우저**: 테이블 구조 실시간 탐색
- **쿼리 실행**: 저장 및 실행 버튼으로 간편한 쿼리 관리
- **결과 테이블**: 쿼리 결과를 표 형태로 표시

### ⚡ **Text To SQL**
- **생명보험사 특화**: 보험업계 용어 및 데이터 구조 최적화
- **AI 모델 선택**: GPT-4, Claude-3, Gemini Pro 지원
- **예시 질문 제공**: 
  - "지난 달 신규 가입자 수는?"
  - "보험금 청구가 가장 많은 상품은?"
  - "고객 만족도가 높은 지역은?"
- **대화형 인터페이스**: 채팅 형태의 자연스러운 상호작용
- **쿼리 설명**: 생성된 SQL의 실행 로직 설명
- **대화 초기화**: 새로운 세션 시작 기능

### 🎤 **STT 키워드 검색**
- **상담 녹취 분석**: 보험 상담 내용 음성 인식
- **고급 필터링**: 날짜, 상담사, 고객 유형별 필터
- **키워드 하이라이팅**: 검색된 키워드 강조 표시
- **세그먼트 재생**: 특정 구간 바로 재생
- **통계 대시보드**: 키워드 빈도 및 트렌드 분석
- **내보내기 기능**: 분석 결과 Excel/PDF 저장

## ⚙️ 관리 도구

### 📦 **모델 관리**
- **사이드바 레이아웃**: 모델 목록과 상세 정보 분리
- **보험 특화 모델**: 
  - 보험금 청구 사기 탐지
  - 고객 이탈 예측
  - 리스크 점수 산출
- **실시간 모니터링**: 모델 상태 및 성능 지표 추적
- **Feature Importance**: 모델 특성 중요도 시각화
- **성능 메트릭**: 정확도, F1 스코어, 응답시간 표시
- **모델 업로드**: 새 모델 등록 및 배포 기능

### 🔌 **API Explorer**
- **사이드바 네비게이션**: API 카테고리별 분류
- **보험 API 카테고리**:
  - 고객 관리 API
  - 보험 상품 API  
  - 청구 처리 API
  - 언더라이팅 API
- **실시간 테스트**: API 엔드포인트 즉시 테스트
- **요청/응답 뷰어**: JSON 포맷팅 및 구문 강조
- **문서 연동**: API 문서 바로가기 기능

## 🎨 디자인 시스템

### **브랜드 디자인 UI**
- **컬러 시스템**: 옐로우(#FFD700)와 오렌지(#FF8C00) 기반
- **통일된 헤더**: 모든 페이지 동일한 제목/설명 위치 및 폰트 크기
- **표준 레이아웃**: `var(--space-4)` 패딩으로 통일된 여백
- **반응형 디자인**: 데스크톱/태블릿/모바일 최적화
- **접근성 준수**: WCAG 2.1  및 스크린 리더 지원
가이드라인준수

### **컴포넌트 시스템**
- **IconSystem**: SVG 기반 확장 가능한 아이콘 라이브러리
- **표준 버튼**: Primary/Secondary 버튼 스타일 통일
- **카드 레이아웃**: 일관된 그림자와 호버 효과
- **토스트 알림**: 성공/에러/경고/정보 타입별 알림
- **모달 시스템**: 중앙 정렬 및 백드롭 처리

### **사용자 경험**
- **고정 사이드바**: 메인 콘텐츠 스크롤과 독립적 동작
- **부드러운 전환**: 페이지 간 자연스러운 애니메이션
- **직관적 네비게이션**: 명확한 메뉴 구조와 활성 상태 표시
- **빠른 피드백**: 사용자 액
## 🚀 시작하기

### 필수 요구사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd vue-data-portal

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 개발 서버
개발 서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
src/
├── components/                    # Vue 컴포넌트
│   ├── HomeView.vue              # 홈 대시보드 (통합 검색)
│   ├── DashboardView.vue         # My Dashboard (슬라이더)
│   ├── DashboardStoreView.vue    # Dashboard Store (템플릿)
│   ├── SearchView.vue            # Data Report (PDF 뷰어)
│   ├── ChubbDataView.vue         # Chubb Data (보험사 데이터)
│   ├── QueryView.vue             # SQL Editor
│   ├── TextToSqlView.vue         # Text-to-SQL 도구
│   ├── SttSearchView.vue         # STT 키워드 검색
│   ├── ModelManagementView.vue   # 모델 관리
│   ├── ApiView.vue               # API Explorer
│   └── IconSystem.vue            # 아이콘 시스템
├── style.css                     # 글로벌 스타일 (표준 헤더 포함)
├── App.vue                       # 메인 애플리케이션 (사이드바)
└── main.js                       # 애플리케이션 진입점

public/
├── lina-logo.png                 # 샘플 로고
├── sampleDashboard.png           # 대시보드 미리보기
├── sampleDashboard2.png          # 대시보드 미리보기 2
├── 보험통계월보_25년7월호.pdf      # 샘플 PDF 리포트
└── 월간생명보험_25년9월호.pdf      # 샘플 PDF 리포트
```

## 🎯 주요 기술 스택

### **Frontend**
- **Vue 3**: Composition API 기반 현대적 프레임워크
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **CSS Variables**: 동적 테마 시스템
- **SVG Icons**: 확장 가능한 벡터 아이콘

### **개발 도구**
- **Hot Module Replacement**: 실시간 코드 업데이트
- **TypeScript 지원**: 타입 안전성 (선택사항)
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅

## 🌟 특별한 기능들

### **보험업계 특화**
- 생명보험사 데이터 구조에 최적화된 Text-to-SQL
- 보험 용어 및 KPI에 특화된 샘플 데이터
- 청구, 언더라이팅, 고객관리 등 보험 업무 프로세스 반영

### **통합 검색 시스템**
- 홈화면에서 모든 리소스 통합 검색
- 카테고리별 결과 분류 (대시보드/리포트/테이블/모델/API)
- 실시간 검색 결과 및 태그 하이라이팅

### **사용자 중심 설
- 헤더리스 My Dashboard로 콘텐츠 집중
- 카테고리별 접기/펼치기로 정보 관리
- 고정 사이드바로 일관된 네비게이션

### **PDF 문서 관리**
라우저 내장 PDF 뷰어
- 전체화면 모드 지원
- 실제 보험 월보 문서 연동
## 📊 성능 최적화

- **컴포넌트 기반 아키텍처**: Vue 3 Composition API 활용
- **CSS 변수 시스템**: 런타임 테마 변경 지원
- **SVG 아이콘**: 확장 가능한 벡터 아이콘으로 선명한 표시
- **반응형 레이아웃**: CSS Grid와 Flexbox 조합으로 효율적 레이아웃
- **표준화된 스타일**: 중복 CSS 제거로 번들 크기 최적화

## 🏗️ 아키텍처 특징

### **모듈화된 컴포넌트**
- 각 기능별 독립적인 Vue 컴포넌트
- 재사용 가능한 IconSystem 컴포넌트
- 표준화된 헤더와 레이아웃 구조

### **상태 관리**
- Vue 3 Composition API의 reactive 시스템 활용
- 컴포넌트 간 props/emit 패턴으로 데이터 흐름 관리
- 로컬 스토리지를 통한 사용자 설정 유지

### **라우팅 시스템**
- 단일 페이지 애플리케이션(SPA) 구조
- 동적 컴포넌트 로딩으로 메모리 효율성
- 사이드바 기반 네비게이션

## 🔧 커스터마이징

### **브랜드 테마**
CSS 변수를 통해 브랜드 컬러를 적용했습니다:

```css
:root {
  /* 브랜드 컬러 */
  --lina-yellow: #FFD700;
  --lina-yellow-light: #FFED4E;
  --lina-yellow-dark: #F4C430;
  --lina-orange: #FF8C00;
  --lina-orange-light: #FFA500;
  
  /* 표준 레이아웃 */
  --space-4: 1rem;
  
  /* 표준 헤더 스타일 */
  .page-title: 2rem, font-weight: 700;
  .page-subtitle: 1rem, font-weight: 400;
}
```

### **표준 페이지 레이아웃**
모든 페이지가 동일한 구조를 따릅니다:

```vue
<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">페이지 제목</h1>
          <p class="page-subtitle">페이지 설명</p>
        </div>
        <div class="header-actions">
          <!-- 액션 버튼들 -->
        </div>
      </div>
    </div>
    <!-- 페이지 콘텐츠 -->
  </div>
</template>
```

### **새 페이지 추가하기**
1. `src/components/`에 새 Vue 컴포넌트 생성
2. `App.vue`의 `mainMenuItems`에 메뉴 항목 추가
3. `viewComponents`에 컴포넌트 매핑 추가
4. 표준 헤더 구조 사용으로 일관성 유지

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ for LINA Life Insurance**