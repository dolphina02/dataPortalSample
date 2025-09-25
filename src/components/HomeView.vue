<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-header">
          <h1 class="hero-title">데이터를 탐색하고 인사이트를 발견하세요</h1>
          <p class="hero-subtitle">
            강력한 분석 도구와 직관적인 인터페이스로 데이터 기반 의사결정을 지원합니다
          </p>
        </div>
        
        <div class="search-container">
          <div class="search-box">
            <div class="search-icon">
              <IconSystem name="search" :size="20" />
            </div>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="데이터셋, 테이블, 또는 키워드를 검색하세요..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
            <button 
              class="search-btn" 
              @click="handleSearch"
              :disabled="!searchQuery.trim()"
            >
              <IconSystem name="arrow-right" :size="16" />
              검색
            </button>
          </div>
        </div>

        <div class="quick-actions">
          <button class="quick-action" @click="quickAction('sql')">
            <IconSystem name="code" :size="20" />
            <span>SQL 쿼리</span>
          </button>
          <button class="quick-action" @click="quickAction('dashboard')">
            <IconSystem name="dashboard" :size="20" />
            <span>대시보드</span>
          </button>
          <button class="quick-action" @click="quickAction('api')">
            <IconSystem name="api" :size="20" />
            <span>API 테스트</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
    <section class="stats-section">
      <div class="section-header">
        <h2 class="section-title">플랫폼 현황</h2>
        <p class="section-subtitle">실시간 데이터 플랫폼 사용 현황을 확인하세요</p>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-header">
            <div class="stat-icon">
              <IconSystem :name="stat.icon" :size="24" />
            </div>
            <div class="stat-trend" :class="stat.trend">
              <IconSystem :name="stat.trend === 'up' ? 'trending-up' : 'trending-down'" :size="16" />
              {{ stat.change }}
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
          <div class="stat-progress">
            <div class="progress-bar" :style="{ width: stat.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="activity-section">
      <div class="section-header-inline">
        <div>
          <h2 class="section-title">최근 활동</h2>
          <p class="section-subtitle">팀의 최신 데이터 작업을 확인하세요</p>
        </div>
        <button class="view-all-btn">
          <span>전체 보기</span>
          <IconSystem name="arrow-right" :size="16" />
        </button>
      </div>
      
      <div class="activity-list">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-item"
        >
          <div class="activity-icon" :class="activity.type">
            <IconSystem :name="activity.icon" :size="20" />
          </div>
          <div class="activity-content">
            <div class="activity-title">{{ activity.title }}</div>
            <div class="activity-description">{{ activity.description }}</div>
            <div class="activity-meta">
              <span class="activity-user">{{ activity.user }}</span>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
          <div class="activity-status" :class="activity.status">
            <IconSystem :name="getStatusIcon(activity.status)" :size="16" />
            <span>{{ activity.statusText }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Datasets -->
    <section class="datasets-section">
      <div class="section-header-inline">
        <div>
          <h2 class="section-title">인기 데이터셋</h2>
          <p class="section-subtitle">가장 많이 사용되는 데이터셋을 확인하세요</p>
        </div>
        <button class="view-all-btn">
          <span>더 보기</span>
          <IconSystem name="arrow-right" :size="16" />
        </button>
      </div>
      
      <div class="datasets-grid">
        <div 
          v-for="dataset in popularDatasets" 
          :key="dataset.id"
          class="dataset-card"
          @click="openDataset(dataset)"
        >
          <div class="dataset-header">
            <div class="dataset-icon" :class="dataset.category">
              <IconSystem :name="dataset.icon" :size="24" />
            </div>
            <div class="dataset-meta">
              <span class="dataset-category">{{ dataset.categoryName }}</span>
              <span class="dataset-updated">{{ dataset.updated }}</span>
            </div>
          </div>
          <h3 class="dataset-title">{{ dataset.title }}</h3>
          <p class="dataset-description">{{ dataset.description }}</p>
          <div class="dataset-footer">
            <div class="dataset-stats">
              <div class="stat">
                <IconSystem name="eye" :size="16" />
                <span>{{ dataset.views }}</span>
              </div>
              <div class="stat">
                <IconSystem name="activity" :size="16" />
                <span>{{ dataset.queries }}</span>
              </div>
            </div>
            <div class="dataset-tags">
              <span v-for="tag in dataset.tags" :key="tag" class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IconSystem from './IconSystem.vue'

const searchQuery = ref('')

const stats = [
  { icon: 'database', label: '활성 데이터셋', value: '1,247', change: '+12%', trend: 'up', progress: 75 },
  { icon: 'activity', label: '일일 쿼리', value: '8,932', change: '+5%', trend: 'up', progress: 85 },
  { icon: 'users', label: '활성 사용자', value: '342', change: '-2%', trend: 'down', progress: 60 },
  { icon: 'clock', label: '평균 응답시간', value: '1.2s', change: '-15%', trend: 'up', progress: 90 }
]

const recentActivities = [
  {
    id: 1,
    icon: 'dashboard',
    type: 'dashboard',
    title: '매출 분석 대시보드 업데이트',
    description: '2024년 Q1 매출 데이터 시각화 완료',
    user: '김데이터',
    time: '5분 전',
    status: 'success',
    statusText: '완료'
  },
  {
    id: 2,
    icon: 'code',
    type: 'query',
    title: '고객 세그먼트 쿼리 실행',
    description: '활성 사용자 분석을 위한 복합 쿼리',
    user: '이분석',
    time: '12분 전',
    status: 'running',
    statusText: '실행중'
  },
  {
    id: 3,
    icon: 'file',
    type: 'report',
    title: '월간 리포트 생성',
    description: '자동화된 월간 성과 리포트',
    user: '박리포트',
    time: '1시간 전',
    status: 'success',
    statusText: '완료'
  }
]

const getStatusIcon = (status) => {
  const icons = {
    success: 'check',
    running: 'clock',
    error: 'alert-circle'
  }
  return icons[status] || 'info'
}

const popularDatasets = [
  {
    id: 1,
    icon: 'database',
    category: 'finance',
    categoryName: '금융',
    title: '신용카드 거래 데이터',
    description: '실시간 신용카드 거래 내역 및 패턴 분석을 위한 종합 데이터셋',
    views: '2.1k',
    queries: '456',
    updated: '2시간 전',
    tags: ['실시간', '거래', '분석']
  },
  {
    id: 2,
    icon: 'users',
    category: 'customer',
    categoryName: '고객',
    title: '고객 행동 분석',
    description: '웹사이트 및 모바일 앱 내 고객 행동 패턴과 선호도 분석 데이터',
    views: '1.8k',
    queries: '321',
    updated: '4시간 전',
    tags: ['행동', '패턴', 'UX']
  },
  {
    id: 3,
    icon: 'trending-up',
    category: 'sales',
    categoryName: '매출',
    title: '월별 매출 현황',
    description: '제품별, 지역별 매출 현황 및 트렌드 분석을 위한 통합 데이터',
    views: '1.5k',
    queries: '289',
    updated: '1일 전',
    tags: ['매출', '트렌드', '지역']
  }
]

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    console.log('검색:', searchQuery.value)
    // 실제 검색 로직 구현
  }
}

const quickAction = (action) => {
  console.log('빠른 액션:', action)
  // 해당 페이지로 이동
}

const openDataset = (dataset) => {
  console.log('데이터셋 열기:', dataset.title)
  // 데이터셋 상세 페이지로 이동
}
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, 
    var(--surface) 0%, 
    color-mix(in srgb, var(--primary) 2%, var(--surface)) 100%);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-2xl);
  padding: var(--space-16) var(--space-8);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    var(--primary) 50%, 
    transparent 100%);
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.hero-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.hero-title {
  font-size: var(--fs-4xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0;
  line-height: var(--lh-tight);
  letter-spacing: -0.025em;
}

.hero-subtitle {
  font-size: var(--fs-lg);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--lh-relaxed);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-container {
  display: flex;
  justify-content: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-fast);
  width: 100%;
  max-width: 600px;
  position: relative;
}

.search-box::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-xl);
  padding: 1px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  opacity: 0;
  transition: var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
}

.search-box:focus-within::before {
  opacity: 1;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--space-4);
  color: var(--text-tertiary);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: var(--space-4) var(--space-2);
  font-size: var(--fs-base);
  background: transparent;
  color: var(--text-primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: linear-gradient(135deg, var(--lina-yellow) 0%, var(--lina-orange) 100%);
  color: var(--text-primary);
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-weight: var(--fw-bold);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-sm);
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.search-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--lina-yellow-light) 0%, var(--lina-orange-light) 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.quick-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.quick-action {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

.quick-action:hover {
  background: var(--surface-hover);
  border-color: var(--lina-yellow);
  color: var(--lina-orange);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Section Headers */
.section-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
  letter-spacing: -0.025em;
}

.section-subtitle {
  font-size: var(--fs-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--lh-relaxed);
}

/* Stats Section */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.stat-card {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  transition: var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  transform: scaleX(0);
  transition: var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--lina-yellow), var(--lina-orange));
  transform: scaleX(0);
  transition: var(--transition-fast);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--lina-yellow) 20%, transparent), 
    color-mix(in srgb, var(--lina-orange) 15%, transparent));
  border-radius: var(--radius-lg);
  color: var(--lina-orange);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
}

.stat-trend.up {
  color: var(--success);
  background: color-mix(in srgb, var(--success) 10%, transparent);
}

.stat-trend.down {
  color: var(--error);
  background: color-mix(in srgb, var(--error) 10%, transparent);
}

.stat-content {
  margin-bottom: var(--space-4);
}

.stat-value {
  font-size: var(--fs-3xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  line-height: var(--lh-tight);
}

.stat-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin: 0;
  font-weight: var(--fw-medium);
}

.stat-progress {
  height: 4px;
  background: var(--surface-active);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--lina-yellow), var(--lina-orange));
  border-radius: var(--radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(255, 215, 0, 0.3);
}

/* Section Headers */
.section-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-6);
  gap: var(--space-4);
}

.view-all-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  white-space: nowrap;
}

.view-all-btn:hover {
  border-color: var(--lina-yellow);
  color: var(--lina-orange);
  background: var(--surface-hover);
}

/* Activity Section */
.activity-list {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  transition: var(--transition-fast);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item:hover {
  background: var(--surface-hover);
}

.activity-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.activity-icon.dashboard {
  background: color-mix(in srgb, var(--primary) 10%, transparent);
  color: var(--primary);
}

.activity-icon.query {
  background: color-mix(in srgb, var(--success) 10%, transparent);
  color: var(--success);
}

.activity-icon.report {
  background: color-mix(in srgb, var(--warning) 10%, transparent);
  color: var(--warning);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-1) 0;
  font-size: var(--fs-base);
}

.activity-description {
  color: var(--text-secondary);
  margin: 0 0 var(--space-2) 0;
  font-size: var(--fs-sm);
  line-height: var(--lh-snug);
}

.activity-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

.activity-user {
  font-weight: var(--fw-medium);
}

.activity-status {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  white-space: nowrap;
  flex-shrink: 0;
}

.activity-status.success {
  background: color-mix(in srgb, var(--success) 10%, transparent);
  color: var(--success);
}

.activity-status.running {
  background: color-mix(in srgb, var(--warning) 10%, transparent);
  color: var(--warning);
}

.activity-status.error {
  background: color-mix(in srgb, var(--error) 10%, transparent);
  color: var(--error);
}

/* Datasets Section */
.datasets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--space-6);
}

.dataset-card {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  cursor: pointer;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.dataset-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--primary), var(--primary-light));
  transform: scaleX(0);
  transition: var(--transition-fast);
}

.dataset-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary);
}

.dataset-card:hover::before {
  transform: scaleX(1);
}

.dataset-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--lina-yellow), var(--lina-orange));
  transform: scaleX(0);
  transition: var(--transition-fast);
}

.dataset-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-4);
}

.dataset-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
}

.dataset-icon.finance {
  background: color-mix(in srgb, var(--lina-yellow) 20%, transparent);
  color: var(--lina-orange);
}

.dataset-icon.customer {
  background: color-mix(in srgb, var(--success) 10%, transparent);
  color: var(--success);
}

.dataset-icon.sales {
  background: color-mix(in srgb, var(--warning) 10%, transparent);
  color: var(--warning);
}

.dataset-meta {
  text-align: right;
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

.dataset-category {
  display: block;
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.dataset-updated {
  color: var(--text-tertiary);
}

.dataset-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  margin: 0 0 var(--space-2) 0;
  color: var(--text-primary);
  line-height: var(--lh-snug);
}

.dataset-description {
  color: var(--text-secondary);
  margin: 0 0 var(--space-5) 0;
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.dataset-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
}

.dataset-stats {
  display: flex;
  gap: var(--space-4);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  font-weight: var(--fw-medium);
}

.dataset-tags {
  display: flex;
  gap: var(--space-1);
  flex-wrap: wrap;
}

.tag {
  background: var(--surface-active);
  color: var(--text-secondary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--fs-xs);
  font-weight: var(--fw-medium);
  border: 1px solid var(--border-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
  
  .datasets-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    padding: var(--space-12) var(--space-6);
  }
  
  .hero-title {
    font-size: var(--fs-3xl);
  }
  
  .hero-subtitle {
    font-size: var(--fs-base);
  }
  
  .quick-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-action {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .datasets-grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }
  
  .section-header-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .view-all-btn {
    align-self: flex-end;
  }
  
  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
  
  .activity-status {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: var(--space-10) var(--space-4);
  }
  
  .hero-title {
    font-size: var(--fs-2xl);
  }
  
  .search-box {
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .dataset-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }
}
</style>