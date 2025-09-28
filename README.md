# 보험사 데이터 포털 (Lina Life Data Portal) 샘플 목업

라이나생명의 데이터 분석 및 관리를 위한 통합 웹 플랫폼입니다. 직관적인 인터페이스와 강력한 분석 도구를 통해 데이터 기반 의사결정을 지원합니다.

## 🌟 주요 기능

### 📊 대시보드
- 실시간 데이터 현황 모니터링
- 핵심 지표 및 성과 추적
- 시각화된 차트와 그래프
- 사용자 활동 및 시스템 상태 확인

### 🔍 데이터 탐색 및 검색
- 고급 검색 필터링
- 카테고리별 데이터 분류
- 실시간 검색 결과
- 그리드/리스트 뷰 지원

### 💻 SQL 쿼리 도구
- 인터랙티브 SQL 에디터
- 쿼리 실행 및 결과 확인
- 스키마 브라우저
- 쿼리 히스토리 관리
- 결과 내보내기 기능

### 🤖 Text-to-SQL 변환
- 자연어를 SQL로 자동 변환
- 다중 AI 모델 지원 (GPT-4, Claude-3, Gemini Pro)
- 스키마 컨텍스트 인식
- 쿼리 설명 및 실행 단계 제공
- 생성 히스토리 관리

### 🧠 AI 모델 관리
- 머신러닝 모델 생성 및 관리
- 모델 성능 모니터링
- 학습 진행 상황 추적
- 모델 설정 및 구성 관리
- 로그 및 메트릭 확인

### 🎤 STT 키워드 검색
- 음성 파일 업로드 및 처리
- 음성-텍스트 변환 (STT)
- 키워드 자동 추출
- 음성 명령어 기반 검색
- 다국어 지원 (한국어, 영어, 일본어)

### 🔌 API 탐색기
- REST API 테스트 및 문서화
- 인터랙티브 API 호출
- 요청/응답 확인
- API 카테고리별 분류
- 요청 저장 및 재사용

## 🛠 기술 스택

### Frontend
- **Vue 3** - 프로그레시브 JavaScript 프레임워크
- **Vite** - 빠른 빌드 도구
- **CSS3** - 모던 스타일링 (CSS Variables, Flexbox, Grid)
- **JavaScript ES6+** - 최신 JavaScript 기능

### 개발 도구
- **Vite Dev Server** - 개발 서버
- **Hot Module Replacement** - 실시간 코드 업데이트
- **ESLint** - 코드 품질 관리

## 🚀 시작하기

### 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd vue-data-portal
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:3000
   ```

### 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
vue-data-portal/
├── public/                 # 정적 파일
│   └── lina-logo.png      # 라이나생명 로고
├── src/
│   ├── components/        # Vue 컴포넌트
│   │   ├── HomeView.vue          # 홈 대시보드
│   │   ├── DashboardView.vue     # 데이터 대시보드
│   │   ├── SearchView.vue        # 데이터 검색
│   │   ├── QueryView.vue         # SQL 쿼리 도구
│   │   ├── TextToSqlView.vue     # Text-to-SQL 변환
│   │   ├── ModelManagementView.vue # AI 모델 관리
│   │   ├── SttSearchView.vue     # STT 키워드 검색
│   │   ├── ApiView.vue           # API 탐색기
│   │   └── IconSystem.vue        # 아이콘 시스템
│   ├── App.vue            # 메인 애플리케이션
│   ├── main.js           # 애플리케이션 진입점
│   └── style.css         # 글로벌 스타일
├── index.html            # HTML 템플릿
├── package.json          # 프로젝트 설정
├── vite.config.js        # Vite 설정
└── README.md            # 프로젝트 문서
```

## 🎨 디자인 시스템

### 컬러 팔레트
- **Primary**: 라이나생명 브랜드 컬러 기반
- **Lina Yellow**: #FFD700 (브랜드 메인 컬러)
- **Lina Orange**: #FF8C00 (브랜드 서브 컬러)
- **Semantic Colors**: Success, Warning, Error, Info

### 타이포그래피
- **Font Family**: Inter, system fonts
- **Font Sizes**: 12px ~ 48px (스케일 기반)
- **Font Weights**: 300 ~ 800

### 컴포넌트
- **모던 카드 디자인**: 그림자와 둥근 모서리
- **반응형 그리드**: 다양한 화면 크기 지원
- **인터랙티브 요소**: 호버 효과와 트랜지션
- **접근성**: ARIA 레이블과 키보드 네비게이션

## 🔧 주요 컴포넌트

### 1. 홈 대시보드 (HomeView)
- 플랫폼 현황 통계
- 최근 활동 타임라인
- 인기 데이터셋 목록
- 빠른 액션 버튼

### 2. SQL 쿼리 도구 (QueryView)
- 코드 에디터 (Monaco Editor 스타일)
- 실시간 쿼리 실행
- 결과 테이블 표시
- 스키마 브라우저

### 3. Text-to-SQL (TextToSqlView)
- 자연어 입력 인터페이스
- AI 모델 선택
- 스키마 컨텍스트 관리
- 생성된 SQL 편집 및 실행

### 4. STT 검색 (SttSearchView)
- 오디오 파일 업로드
- 실시간 음성 재생
- STT 처리 진행률
- 키워드 추출 및 검색

## 🌐 브라우저 지원

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 반응형 디자인

- **Desktop**: 1200px 이상
- **Tablet**: 768px - 1199px
- **Mobile**: 767px 이하

## 🔒 보안 고려사항

- XSS 방지를 위한 입력 검증
- CSRF 토큰 사용
- 안전한 API 통신
- 사용자 권한 관리

## 🚀 성능 최적화

- **코드 분할**: 라우트 기반 청크 분할
- **이미지 최적화**: WebP 포맷 지원
- **캐싱**: 브라우저 캐시 활용
- **번들 최적화**: Tree shaking과 압축

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 라이나생명의 내부 프로젝트입니다.

## 📞 지원 및 문의

- **코드작성자**: dolphina02@gmail.com

## 🔄 업데이트 로그

### v1.0.0 (2024-01-20)
- 초기 릴리즈 (mockup)
- 기본 대시보드 및 검색 기능
- SQL 쿼리 도구
- Text-to-SQL 변환 기능

### 향후 계획
- [ ] 실시간 알림 시스템
- [ ] 고급 데이터 시각화
- [ ] 모바일 앱 지원
- [ ] 다국어 지원 확장
- [ ] API 문서 자동 생성

---

**라이나생명 데이터 플랫폼팀** | 2024년 1월
