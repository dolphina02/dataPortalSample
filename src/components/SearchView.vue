<template>
  <div class="search-view">
    <div class="search-header">
      <h2 class="page-title">데이터 검색 및 탐색</h2>
      <p class="page-subtitle">원하는 데이터를 빠르게 찾아보세요</p>
    </div>

    <!-- Advanced Search -->
    <div class="search-panel">
      <div class="search-box-container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="데이터셋, 테이블, 컬럼명으로 검색..."
            class="search-input"
            @input="handleSearch"
          />
          <button class="filter-btn" @click="showFilters = !showFilters">
            <span>필터</span>
            <span class="filter-icon" :class="{ active: showFilters }">⚙️</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <Transition name="fade">
        <div v-show="showFilters" class="filters-section">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">카테고리</label>
              <select v-model="filters.category" class="filter-select">
                <option value="">전체</option>
                <option value="finance">금융</option>
                <option value="customer">고객</option>
                <option value="sales">매출</option>
                <option value="marketing">마케팅</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">데이터 타입</label>
              <select v-model="filters.type" class="filter-select">
                <option value="">전체</option>
                <option value="table">테이블</option>
                <option value="view">뷰</option>
                <option value="api">API</option>
              </select>
            </div>
            
            <div class="filter-group">
              <label class="filter-label">업데이트</label>
              <select v-model="filters.updated" class="filter-select">
                <option value="">전체</option>
                <option value="today">오늘</option>
                <option value="week">이번 주</option>
                <option value="month">이번 달</option>
              </select>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Search Results -->
    <div class="results-section">
      <div class="results-header">
        <div class="results-info">
          <span class="results-count">{{ filteredResults.length }}개 결과</span>
          <span class="search-time">0.23초</span>
        </div>
        <div class="view-options">
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            📊
          </button>
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            📋
          </button>
        </div>
      </div>

      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="results-grid">
        <div 
          v-for="result in filteredResults" 
          :key="result.id"
          class="result-card"
          @click="openResult(result)"
        >
          <div class="result-header">
            <div class="result-icon">{{ result.icon }}</div>
            <div class="result-meta">
              <span class="result-type">{{ result.type }}</span>
              <span class="result-updated">{{ result.updated }}</span>
            </div>
          </div>
          
          <h3 class="result-title">{{ result.title }}</h3>
          <p class="result-description">{{ result.description }}</p>
          
          <div class="result-tags">
            <span v-for="tag in result.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
          
          <div class="result-footer">
            <div class="result-stats">
              <span class="stat">👁️ {{ result.views }}</span>
              <span class="stat">📊 {{ result.queries }}</span>
            </div>
            <div class="result-rating">
              <span class="rating-stars">⭐⭐⭐⭐⭐</span>
              <span class="rating-score">{{ result.rating }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="results-list">
        <div 
          v-for="result in filteredResults" 
          :key="result.id"
          class="result-row"
          @click="openResult(result)"
        >
          <div class="row-icon">{{ result.icon }}</div>
          <div class="row-content">
            <div class="row-main">
              <h3 class="row-title">{{ result.title }}</h3>
              <p class="row-description">{{ result.description }}</p>
            </div>
            <div class="row-meta">
              <span class="row-type">{{ result.type }}</span>
              <span class="row-updated">{{ result.updated }}</span>
              <span class="row-stats">👁️ {{ result.views }} | 📊 {{ result.queries }}</span>
            </div>
          </div>
          <div class="row-actions">
            <button class="action-btn">미리보기</button>
            <button class="action-btn primary">열기</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const showFilters = ref(false)
const viewMode = ref('grid')

const filters = ref({
  category: '',
  type: '',
  updated: ''
})

const searchResults = [
  {
    id: 1,
    icon: '💳',
    title: '신용카드 거래 데이터',
    description: '실시간 신용카드 거래 내역 및 패턴 분석을 위한 종합 데이터셋',
    type: '테이블',
    category: 'finance',
    updated: '2시간 전',
    views: '2.1k',
    queries: '456',
    rating: '4.8',
    tags: ['실시간', '거래', '분석', '금융']
  },
  {
    id: 2,
    icon: '👥',
    title: '고객 행동 분석',
    description: '웹사이트 및 모바일 앱 내 고객 행동 패턴과 선호도 분석 데이터',
    type: '뷰',
    category: 'customer',
    updated: '4시간 전',
    views: '1.8k',
    queries: '321',
    rating: '4.6',
    tags: ['행동', '패턴', 'UX', '고객']
  },
  {
    id: 3,
    icon: '📊',
    title: '월별 매출 현황',
    description: '제품별, 지역별 매출 현황 및 트렌드 분석을 위한 통합 데이터',
    type: 'API',
    category: 'sales',
    updated: '1일 전',
    views: '1.5k',
    queries: '289',
    rating: '4.7',
    tags: ['매출', '트렌드', '지역', '제품']
  },
  {
    id: 4,
    icon: '📈',
    title: '마케팅 캠페인 성과',
    description: '디지털 마케팅 캠페인의 성과 지표 및 ROI 분석 데이터',
    type: '테이블',
    category: 'marketing',
    updated: '3일 전',
    views: '1.2k',
    queries: '198',
    rating: '4.5',
    tags: ['마케팅', 'ROI', '캠페인', '성과']
  }
]

const filteredResults = computed(() => {
  let results = searchResults

  // Search query filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    results = results.filter(result => 
      result.title.toLowerCase().includes(query) ||
      result.description.toLowerCase().includes(query) ||
      result.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Category filter
  if (filters.value.category) {
    results = results.filter(result => result.category === filters.value.category)
  }

  // Type filter
  if (filters.value.type) {
    results = results.filter(result => result.type.toLowerCase().includes(filters.value.type))
  }

  return results
})

const handleSearch = () => {
  // 실제 검색 로직
  console.log('검색:', searchQuery.value)
}

const openResult = (result) => {
  console.log('결과 열기:', result.title)
  // 상세 페이지로 이동
}
</script>

<style scoped>
.search-view {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-header {
  text-align: center;
  margin-bottom: 8px;
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

/* Search Panel */
.search-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.search-box-container {
  margin-bottom: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid var(--line);
  border-radius: 14px;
  padding: 4px;
  transition: var(--transition-fast);
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, white);
}

.search-icon {
  padding: 0 16px;
  font-size: 18px;
  color: var(--muted);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 16px 8px;
  font-size: 16px;
  background: transparent;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card-hover);
  border: 1px solid var(--line);
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.filter-btn:hover {
  background: color-mix(in oklab, var(--primary) 8%, white);
  border-color: var(--primary);
}

.filter-icon {
  transition: var(--transition);
}

.filter-icon.active {
  transform: rotate(90deg);
}

/* Filters */
.filters-section {
  border-top: 1px solid var(--line);
  padding-top: 20px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--ink);
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: white;
  font-size: var(--fs-body);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Results */
.results-section {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
}

.results-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.results-count {
  font-weight: 600;
  color: var(--ink);
}

.search-time {
  color: var(--muted);
  font-size: var(--fs-small);
}

.view-options {
  display: flex;
  gap: 4px;
}

.view-btn {
  background: none;
  border: 1px solid var(--line);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: 16px;
}

.view-btn:hover {
  background: var(--card-hover);
}

.view-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Grid View */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.result-card {
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 20px;
  cursor: pointer;
  transition: var(--transition);
  background: white;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
  border-color: var(--primary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.result-icon {
  font-size: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--primary) 10%, white);
  border-radius: 10px;
}

.result-meta {
  text-align: right;
  font-size: var(--fs-small);
  color: var(--muted);
}

.result-type {
  display: block;
  font-weight: 600;
  color: var(--primary);
}

.result-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--ink);
}

.result-description {
  color: var(--muted);
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.result-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.tag {
  background: color-mix(in oklab, var(--secondary) 15%, white);
  color: var(--secondary);
  padding: 4px 8px;
  border-radius: 8px;
  font-size: var(--fs-xs);
  font-weight: 500;
}

.result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-stats {
  display: flex;
  gap: 12px;
}

.stat {
  font-size: var(--fs-small);
  color: var(--muted);
}

.result-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-stars {
  font-size: var(--fs-small);
}

.rating-score {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--ink);
}

/* List View */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

.result-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  cursor: pointer;
  transition: var(--transition-fast);
}

.result-row:hover {
  background: var(--card-hover);
}

.row-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in oklab, var(--primary) 10%, white);
  border-radius: 8px;
}

.row-content {
  flex: 1;
}

.row-main {
  margin-bottom: 4px;
}

.row-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--ink);
}

.row-description {
  color: var(--muted);
  margin: 0;
  font-size: var(--fs-small);
}

.row-meta {
  display: flex;
  gap: 12px;
  font-size: var(--fs-small);
  color: var(--muted);
}

.row-type {
  font-weight: 600;
  color: var(--primary);
}

.row-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid var(--line);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-small);
}

.action-btn:hover {
  background: var(--card-hover);
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-btn.primary:hover {
  background: var(--primary-light);
}

@media (max-width: 768px) {
  .results-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .result-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .row-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>