<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <h2 class="page-title">대시보드</h2>
        <p class="page-subtitle">실시간 데이터 현황을 한눈에 확인하세요</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedPeriod" class="period-select">
          <option value="today">오늘</option>
          <option value="week">이번 주</option>
          <option value="month">이번 달</option>
          <option value="quarter">분기</option>
        </select>
        <button class="refresh-btn" @click="refreshData">
          <span class="refresh-icon" :class="{ spinning: isRefreshing }">🔄</span>
          새로고침
        </button>
      </div>
    </div>

    <!-- Key Metrics -->
    <section class="metrics-section">
      <div class="metrics-grid">
        <div 
          v-for="metric in keyMetrics" 
          :key="metric.id"
          class="metric-card"
          :class="metric.trend"
        >
          <div class="metric-header">
            <div class="metric-icon">{{ metric.icon }}</div>
            <div class="metric-change" :class="metric.trend">
              {{ metric.change }}
            </div>
          </div>
          <div class="metric-content">
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-label">{{ metric.label }}</div>
          </div>
          <div class="metric-chart">
            <div class="mini-chart" :style="{ '--progress': metric.progress + '%' }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Charts Section -->
    <section class="charts-section">
      <div class="charts-grid">
        <!-- Revenue Chart -->
        <div class="chart-card large">
          <div class="chart-header">
            <h3 class="chart-title">매출 추이</h3>
            <div class="chart-controls">
              <button 
                v-for="period in chartPeriods" 
                :key="period.value"
                class="chart-btn"
                :class="{ active: selectedChartPeriod === period.value }"
                @click="selectedChartPeriod = period.value"
              >
                {{ period.label }}
              </button>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-placeholder">
              <div class="chart-bars">
                <div 
                  v-for="(bar, index) in chartData" 
                  :key="index"
                  class="chart-bar"
                  :style="{ height: bar.height + '%', '--delay': index * 0.1 + 's' }"
                ></div>
              </div>
              <div class="chart-labels">
                <span v-for="label in chartLabels" :key="label">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- User Activity -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">사용자 활동</h3>
          </div>
          <div class="activity-stats">
            <div class="activity-item">
              <div class="activity-dot active"></div>
              <div class="activity-info">
                <div class="activity-label">활성 사용자</div>
                <div class="activity-value">1,247</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-dot idle"></div>
              <div class="activity-info">
                <div class="activity-label">대기 중</div>
                <div class="activity-value">89</div>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-dot offline"></div>
              <div class="activity-info">
                <div class="activity-label">오프라인</div>
                <div class="activity-value">234</div>
              </div>
            </div>
          </div>
          <div class="donut-chart">
            <div class="donut-center">
              <div class="donut-value">1,570</div>
              <div class="donut-label">총 사용자</div>
            </div>
          </div>
        </div>

        <!-- Top Queries -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">인기 쿼리</h3>
            <button class="view-all-link">전체 보기</button>
          </div>
          <div class="query-list">
            <div 
              v-for="query in topQueries" 
              :key="query.id"
              class="query-item"
            >
              <div class="query-content">
                <div class="query-text">{{ query.text }}</div>
                <div class="query-meta">
                  <span class="query-user">{{ query.user }}</span>
                  <span class="query-time">{{ query.time }}</span>
                </div>
              </div>
              <div class="query-stats">
                <div class="query-count">{{ query.count }}</div>
                <div class="query-trend" :class="query.trend">
                  {{ query.trend === 'up' ? '↗️' : '↘️' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">시스템 상태</h3>
          </div>
          <div class="status-list">
            <div 
              v-for="service in systemStatus" 
              :key="service.name"
              class="status-item"
            >
              <div class="status-indicator" :class="service.status"></div>
              <div class="status-content">
                <div class="status-name">{{ service.name }}</div>
                <div class="status-info">
                  <span class="status-uptime">{{ service.uptime }}</span>
                  <span class="status-response">{{ service.responseTime }}ms</span>
                </div>
              </div>
              <div class="status-actions">
                <button class="status-btn">상세</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="activity-section">
      <div class="section-header">
        <h3 class="section-title">최근 활동</h3>
        <button class="view-all-btn">전체 보기</button>
      </div>
      
      <div class="activity-timeline">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="timeline-item"
        >
          <div class="timeline-marker" :class="activity.type"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <span class="timeline-title">{{ activity.title }}</span>
              <span class="timeline-time">{{ activity.time }}</span>
            </div>
            <div class="timeline-description">{{ activity.description }}</div>
            <div class="timeline-meta">
              <span class="timeline-user">{{ activity.user }}</span>
              <span class="timeline-category">{{ activity.category }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedPeriod = ref('today')
const selectedChartPeriod = ref('week')
const isRefreshing = ref(false)

const keyMetrics = [
  {
    id: 1,
    icon: '📊',
    label: '총 쿼리 수',
    value: '24,891',
    change: '+12.5%',
    trend: 'up',
    progress: 75
  },
  {
    id: 2,
    icon: '⚡',
    label: '평균 응답시간',
    value: '1.2초',
    change: '-8.3%',
    trend: 'up',
    progress: 85
  },
  {
    id: 3,
    icon: '👥',
    label: '활성 사용자',
    value: '1,247',
    change: '+5.7%',
    trend: 'up',
    progress: 60
  },
  {
    id: 4,
    icon: '💾',
    label: '데이터 처리량',
    value: '2.4TB',
    change: '-2.1%',
    trend: 'down',
    progress: 90
  }
]

const chartPeriods = [
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' }
]

const chartData = [
  { height: 60 },
  { height: 80 },
  { height: 45 },
  { height: 90 },
  { height: 70 },
  { height: 85 },
  { height: 95 }
]

const chartLabels = ['월', '화', '수', '목', '금', '토', '일']

const topQueries = [
  {
    id: 1,
    text: 'SELECT * FROM users WHERE status = "active"',
    user: '김데이터',
    time: '5분 전',
    count: '247회',
    trend: 'up'
  },
  {
    id: 2,
    text: 'SELECT COUNT(*) FROM orders WHERE date > "2024-01-01"',
    user: '이분석',
    time: '12분 전',
    count: '189회',
    trend: 'up'
  },
  {
    id: 3,
    text: 'SELECT * FROM products ORDER BY price DESC',
    user: '박쿼리',
    time: '18분 전',
    count: '156회',
    trend: 'down'
  }
]

const systemStatus = [
  {
    name: 'Database Server',
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '12'
  },
  {
    name: 'API Gateway',
    status: 'healthy',
    uptime: '99.8%',
    responseTime: '8'
  },
  {
    name: 'Cache Server',
    status: 'warning',
    uptime: '98.5%',
    responseTime: '25'
  },
  {
    name: 'File Storage',
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '15'
  }
]

const recentActivities = [
  {
    id: 1,
    type: 'query',
    title: '대용량 쿼리 실행 완료',
    description: '월별 매출 분석 쿼리가 성공적으로 실행되었습니다.',
    user: '김분석',
    category: '쿼리',
    time: '2분 전'
  },
  {
    id: 2,
    type: 'system',
    title: '시스템 업데이트',
    description: '데이터베이스 인덱스 최적화가 완료되었습니다.',
    user: '시스템',
    category: '시스템',
    time: '15분 전'
  },
  {
    id: 3,
    type: 'user',
    title: '새 사용자 등록',
    description: '박데이터님이 플랫폼에 가입했습니다.',
    user: '박데이터',
    category: '사용자',
    time: '1시간 전'
  }
]

const refreshData = async () => {
  isRefreshing.value = true
  setTimeout(() => {
    isRefreshing.value = false
  }, 1000)
}
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: var(--fs-h2);
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--ink);
}

.page-subtitle {
  color: var(--muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.period-select {
  padding: 10px 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--card);
  cursor: pointer;
  font-size: var(--fs-body);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.refresh-btn:hover {
  background: var(--primary-light);
}

.refresh-icon {
  transition: var(--transition);
}

.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.metric-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

.metric-card.up {
  border-left: 4px solid var(--good);
}

.metric-card.down {
  border-left: 4px solid var(--bad);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  font-size: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--primary) 10%, white);
  border-radius: 12px;
}

.metric-change {
  font-size: var(--fs-small);
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.metric-change.up {
  color: var(--good);
  background: color-mix(in oklab, var(--good) 15%, white);
}

.metric-change.down {
  color: var(--bad);
  background: color-mix(in oklab, var(--bad) 15%, white);
}

.metric-content {
  margin-bottom: 16px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 4px;
}

.metric-label {
  color: var(--muted);
  font-size: var(--fs-small);
}

.metric-chart {
  height: 4px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}

.mini-chart {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  width: var(--progress);
  border-radius: 2px;
  transition: width 1s ease;
}

/* Charts */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}

.chart-card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  grid-column: span 6;
}

.chart-card.large {
  grid-column: span 8;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--ink);
}

.chart-controls {
  display: flex;
  gap: 4px;
}

.chart-btn {
  padding: 6px 12px;
  border: 1px solid var(--line);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-small);
}

.chart-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.view-all-link {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: var(--fs-small);
}

/* Chart Placeholder */
.chart-container {
  height: 200px;
}

.chart-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 160px;
  margin-bottom: 12px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, var(--primary), var(--secondary));
  border-radius: 4px 4px 0 0;
  animation: growUp 0.8s ease var(--delay) both;
}

@keyframes growUp {
  from { height: 0; }
  to { height: var(--height); }
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-small);
  color: var(--muted);
}

/* Activity Stats */
.activity-stats {
  margin-bottom: 20px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.activity-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.activity-dot.active {
  background: var(--good);
}

.activity-dot.idle {
  background: var(--accent-yellow);
}

.activity-dot.offline {
  background: var(--muted);
}

.activity-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.activity-label {
  color: var(--muted);
  font-size: var(--fs-small);
}

.activity-value {
  font-weight: 600;
  color: var(--ink);
}

/* Donut Chart */
.donut-chart {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
  background: conic-gradient(
    var(--good) 0deg 200deg,
    var(--accent-yellow) 200deg 240deg,
    var(--muted) 240deg 360deg
  );
  border-radius: 50%;
}

.donut-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: var(--card);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.donut-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}

.donut-label {
  font-size: var(--fs-xs);
  color: var(--muted);
}

/* Query List */
.query-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.query-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card-hover);
  border-radius: var(--radius-sm);
}

.query-content {
  flex: 1;
}

.query-text {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--fs-small);
  color: var(--ink);
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.query-meta {
  display: flex;
  gap: 8px;
  font-size: var(--fs-xs);
  color: var(--muted);
}

.query-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.query-count {
  font-weight: 600;
  color: var(--ink);
  font-size: var(--fs-small);
}

.query-trend {
  font-size: 16px;
}

/* System Status */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--card-hover);
  border-radius: var(--radius-sm);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-indicator.healthy {
  background: var(--good);
}

.status-indicator.warning {
  background: var(--accent-yellow);
}

.status-indicator.error {
  background: var(--bad);
}

.status-content {
  flex: 1;
}

.status-name {
  font-weight: 600;
  color: var(--ink);
  margin-bottom: 2px;
}

.status-info {
  display: flex;
  gap: 12px;
  font-size: var(--fs-small);
  color: var(--muted);
}

.status-btn {
  padding: 4px 8px;
  border: 1px solid var(--line);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: var(--fs-xs);
}

/* Activity Timeline */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: var(--fs-h3);
  font-weight: 700;
  margin: 0;
  color: var(--ink);
}

.view-all-btn {
  background: none;
  border: 1px solid var(--line);
  color: var(--muted);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
}

.view-all-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.activity-timeline {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.timeline-marker.query {
  background: var(--primary);
}

.timeline-marker.system {
  background: var(--accent-yellow);
}

.timeline-marker.user {
  background: var(--good);
}

.timeline-content {
  flex: 1;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.timeline-title {
  font-weight: 600;
  color: var(--ink);
}

.timeline-time {
  font-size: var(--fs-small);
  color: var(--muted);
}

.timeline-description {
  color: var(--muted);
  margin-bottom: 8px;
  line-height: 1.4;
}

.timeline-meta {
  display: flex;
  gap: 12px;
  font-size: var(--fs-small);
  color: var(--muted);
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card,
  .chart-card.large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>