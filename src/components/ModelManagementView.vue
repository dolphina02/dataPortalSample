<template>
  <div class="model-management-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">모델 관리</h1>
        <p class="page-subtitle">AI 모델과 데이터 모델을 관리하세요</p>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="refreshModels">
          <IconSystem name="refresh-cw" :size="16" />
          새로고침
        </button>
        <button class="action-btn primary" @click="showCreateModal = true">
          <IconSystem name="plus" :size="16" />
          새 모델
        </button>
      </div>
    </div>

    <!-- Model Categories -->
    <div class="model-categories">
      <button 
        v-for="category in modelCategories" 
        :key="category.id"
        class="category-btn"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        <IconSystem :name="category.icon" :size="20" />
        <span>{{ category.label }}</span>
        <div class="category-count">{{ category.count }}</div>
      </button>
    </div>

    <!-- Models Grid -->
    <div class="models-section">
      <div class="section-header">
        <h2 class="section-title">{{ getCurrentCategoryLabel() }}</h2>
        <div class="section-controls">
          <div class="search-box">
            <IconSystem name="search" :size="16" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="모델 검색..."
              class="search-input"
            />
          </div>
          <select v-model="sortBy" class="sort-select">
            <option value="name">이름순</option>
            <option value="created">생성일순</option>
            <option value="updated">수정일순</option>
            <option value="status">상태순</option>
          </select>
        </div>
      </div>

      <div class="models-grid">
        <div 
          v-for="model in filteredModels" 
          :key="model.id"
          class="model-card"
          :class="{ 
            active: model.status === 'active',
            training: model.status === 'training',
            error: model.status === 'error'
          }"
          @click="selectModel(model)"
        >
          <div class="model-header">
            <div class="model-icon">
              <IconSystem :name="getModelIcon(model.type)" :size="24" />
            </div>
            <div class="model-status" :class="model.status">
              <div class="status-dot"></div>
              <span>{{ getStatusLabel(model.status) }}</span>
            </div>
          </div>

          <div class="model-content">
            <h3 class="model-name">{{ model.name }}</h3>
            <p class="model-description">{{ model.description }}</p>
            
            <div class="model-meta">
              <div class="meta-item">
                <span class="meta-label">타입:</span>
                <span class="meta-value">{{ model.type }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">버전:</span>
                <span class="meta-value">{{ model.version }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">정확도:</span>
                <span class="meta-value">{{ model.accuracy }}%</span>
              </div>
            </div>

            <div class="model-metrics" v-if="model.metrics">
              <div class="metric">
                <div class="metric-label">사용량</div>
                <div class="metric-bar">
                  <div 
                    class="metric-fill" 
                    :style="{ width: model.metrics.usage + '%' }"
                  ></div>
                </div>
                <div class="metric-value">{{ model.metrics.usage }}%</div>
              </div>
            </div>
          </div>

          <div class="model-actions">
            <button 
              class="model-action-btn"
              :class="{ active: model.status === 'active' }"
              @click.stop="toggleModelStatus(model)"
            >
              <IconSystem :name="model.status === 'active' ? 'pause' : 'play'" :size="16" />
            </button>
            <button class="model-action-btn" @click.stop="editModel(model)">
              <IconSystem name="edit" :size="16" />
            </button>
            <button class="model-action-btn" @click.stop="duplicateModel(model)">
              <IconSystem name="copy" :size="16" />
            </button>
            <button class="model-action-btn danger" @click.stop="deleteModel(model)">
              <IconSystem name="trash" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Model Details Panel -->
    <Transition name="slide-up">
      <div v-if="selectedModel" class="model-details-panel">
        <div class="panel-header">
          <h3 class="panel-title">{{ selectedModel.name }}</h3>
          <button class="close-btn" @click="selectedModel = null">
            <IconSystem name="x" :size="20" />
          </button>
        </div>

        <div class="panel-content">
          <div class="details-tabs">
            <button 
              v-for="tab in detailTabs" 
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeDetailTab === tab.id }"
              @click="activeDetailTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Overview Tab -->
            <div v-if="activeDetailTab === 'overview'" class="overview-tab">
              <div class="overview-grid">
                <div class="overview-section">
                  <h4>기본 정보</h4>
                  <div class="info-list">
                    <div class="info-item">
                      <span class="info-label">모델 ID:</span>
                      <span class="info-value">{{ selectedModel.id }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">생성일:</span>
                      <span class="info-value">{{ formatDate(selectedModel.createdAt) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">마지막 업데이트:</span>
                      <span class="info-value">{{ formatDate(selectedModel.updatedAt) }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">소유자:</span>
                      <span class="info-value">{{ selectedModel.owner }}</span>
                    </div>
                  </div>
                </div>

                <div class="overview-section">
                  <h4>성능 지표</h4>
                  <div class="performance-metrics">
                    <div class="performance-item">
                      <div class="performance-label">정확도</div>
                      <div class="performance-value">{{ selectedModel.accuracy }}%</div>
                      <div class="performance-bar">
                        <div 
                          class="performance-fill accuracy" 
                          :style="{ width: selectedModel.accuracy + '%' }"
                        ></div>
                      </div>
                    </div>
                    <div class="performance-item">
                      <div class="performance-label">응답 시간</div>
                      <div class="performance-value">{{ selectedModel.responseTime }}ms</div>
                      <div class="performance-bar">
                        <div 
                          class="performance-fill speed" 
                          :style="{ width: (1000 - selectedModel.responseTime) / 10 + '%' }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Configuration Tab -->
            <div v-if="activeDetailTab === 'config'" class="config-tab">
              <div class="config-form">
                <div class="form-group">
                  <label class="form-label">모델 이름</label>
                  <input 
                    v-model="selectedModel.name"
                    type="text" 
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">설명</label>
                  <textarea 
                    v-model="selectedModel.description"
                    class="form-textarea"
                    rows="3"
                  ></textarea>
                </div>
                <div class="form-group">
                  <label class="form-label">학습률</label>
                  <input 
                    v-model="selectedModel.config.learningRate"
                    type="number" 
                    step="0.001"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">배치 크기</label>
                  <input 
                    v-model="selectedModel.config.batchSize"
                    type="number" 
                    class="form-input"
                  />
                </div>
              </div>
            </div>

            <!-- Logs Tab -->
            <div v-if="activeDetailTab === 'logs'" class="logs-tab">
              <div class="logs-container">
                <div 
                  v-for="log in selectedModel.logs" 
                  :key="log.id"
                  class="log-entry"
                  :class="log.level"
                >
                  <div class="log-time">{{ formatTime(log.timestamp) }}</div>
                  <div class="log-level">{{ log.level.toUpperCase() }}</div>
                  <div class="log-message">{{ log.message }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-actions">
          <button class="panel-action-btn" @click="saveModel">
            <IconSystem name="save" :size="16" />
            저장
          </button>
          <button class="panel-action-btn" @click="trainModel">
            <IconSystem name="play" :size="16" />
            학습 시작
          </button>
          <button class="panel-action-btn" @click="exportModel">
            <IconSystem name="download" :size="16" />
            내보내기
          </button>
        </div>
      </div>
    </Transition>

    <!-- Create Model Modal -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">새 모델 생성</h3>
            <button class="modal-close" @click="showCreateModal = false">
              <IconSystem name="x" :size="20" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">모델 타입</label>
              <select v-model="newModel.type" class="form-select">
                <option value="llm">Large Language Model</option>
                <option value="classification">분류 모델</option>
                <option value="regression">회귀 모델</option>
                <option value="clustering">클러스터링 모델</option>
              </select>
            </div>
            
            <div class="form-group">
              <label class="form-label">모델 이름</label>
              <input 
                v-model="newModel.name"
                type="text" 
                class="form-input"
                placeholder="모델 이름을 입력하세요"
              />
            </div>
            
            <div class="form-group">
              <label class="form-label">설명</label>
              <textarea 
                v-model="newModel.description"
                class="form-textarea"
                rows="3"
                placeholder="모델에 대한 설명을 입력하세요"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="modal-action-btn" @click="showCreateModal = false">
              취소
            </button>
            <button class="modal-action-btn primary" @click="createModel">
              생성
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IconSystem from './IconSystem.vue'

// Reactive state
const activeCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('name')
const selectedModel = ref(null)
const activeDetailTab = ref('overview')
const showCreateModal = ref(false)

const newModel = ref({
  type: 'llm',
  name: '',
  description: ''
})

// Sample data
const modelCategories = [
  { id: 'all', label: '전체', icon: 'layers', count: 12 },
  { id: 'llm', label: 'LLM', icon: 'brain', count: 4 },
  { id: 'classification', label: '분류', icon: 'tag', count: 3 },
  { id: 'regression', label: '회귀', icon: 'trending-up', count: 2 },
  { id: 'clustering', label: '클러스터링', icon: 'circle', count: 3 }
]

const models = ref([
  {
    id: 'model-001',
    name: 'GPT-4 Custom',
    description: '고객 문의 분석을 위한 커스텀 GPT-4 모델',
    type: 'llm',
    version: '1.2.0',
    status: 'active',
    accuracy: 94,
    responseTime: 250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    owner: '김AI',
    metrics: { usage: 78 },
    config: {
      learningRate: 0.001,
      batchSize: 32
    },
    logs: [
      { id: 1, level: 'info', message: '모델 학습 완료', timestamp: new Date() },
      { id: 2, level: 'warning', message: '정확도 임계값 미달', timestamp: new Date() },
      { id: 3, level: 'error', message: '메모리 부족 오류', timestamp: new Date() }
    ]
  },
  {
    id: 'model-002',
    name: '고객 분류 모델',
    description: '고객 세그먼트 자동 분류 모델',
    type: 'classification',
    version: '2.1.0',
    status: 'training',
    accuracy: 87,
    responseTime: 120,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    owner: '이데이터',
    metrics: { usage: 45 },
    config: {
      learningRate: 0.01,
      batchSize: 64
    },
    logs: [
      { id: 1, level: 'info', message: '학습 진행 중 (75%)', timestamp: new Date() }
    ]
  },
  {
    id: 'model-003',
    name: '매출 예측 모델',
    description: '월별 매출 예측을 위한 회귀 모델',
    type: 'regression',
    version: '1.0.0',
    status: 'inactive',
    accuracy: 91,
    responseTime: 180,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
    owner: '박분석',
    metrics: { usage: 23 },
    config: {
      learningRate: 0.005,
      batchSize: 128
    },
    logs: []
  }
])

const detailTabs = [
  { id: 'overview', label: '개요' },
  { id: 'config', label: '설정' },
  { id: 'logs', label: '로그' }
]

// Computed
const filteredModels = computed(() => {
  let filtered = models.value

  // Filter by category
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(model => model.type === activeCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(model => 
      model.name.toLowerCase().includes(query) ||
      model.description.toLowerCase().includes(query)
    )
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'created':
        return b.createdAt - a.createdAt
      case 'updated':
        return b.updatedAt - a.updatedAt
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  return filtered
})

// Methods
const getCurrentCategoryLabel = () => {
  const category = modelCategories.find(cat => cat.id === activeCategory.value)
  return category ? category.label : '전체'
}

const getModelIcon = (type) => {
  const icons = {
    llm: 'brain',
    classification: 'tag',
    regression: 'trending-up',
    clustering: 'circle'
  }
  return icons[type] || 'box'
}

const getStatusLabel = (status) => {
  const labels = {
    active: '활성',
    inactive: '비활성',
    training: '학습중',
    error: '오류'
  }
  return labels[status] || status
}

const selectModel = (model) => {
  selectedModel.value = model
  activeDetailTab.value = 'overview'
}

const toggleModelStatus = (model) => {
  if (model.status === 'active') {
    model.status = 'inactive'
  } else if (model.status === 'inactive') {
    model.status = 'active'
  }
}

const editModel = (model) => {
  selectModel(model)
  activeDetailTab.value = 'config'
}

const duplicateModel = (model) => {
  const newModel = {
    ...model,
    id: 'model-' + Date.now(),
    name: model.name + ' (복사본)',
    status: 'inactive',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  models.value.push(newModel)
}

const deleteModel = (model) => {
  if (confirm(`"${model.name}" 모델을 삭제하시겠습니까?`)) {
    const index = models.value.findIndex(m => m.id === model.id)
    if (index > -1) {
      models.value.splice(index, 1)
    }
    if (selectedModel.value?.id === model.id) {
      selectedModel.value = null
    }
  }
}

const createModel = () => {
  const model = {
    id: 'model-' + Date.now(),
    name: newModel.value.name,
    description: newModel.value.description,
    type: newModel.value.type,
    version: '1.0.0',
    status: 'inactive',
    accuracy: 0,
    responseTime: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    owner: '현재사용자',
    metrics: { usage: 0 },
    config: {
      learningRate: 0.001,
      batchSize: 32
    },
    logs: []
  }
  
  models.value.push(model)
  showCreateModal.value = false
  
  // Reset form
  newModel.value = {
    type: 'llm',
    name: '',
    description: ''
  }
}

const refreshModels = () => {
  console.log('모델 목록 새로고침')
}

const saveModel = () => {
  console.log('모델 저장:', selectedModel.value)
}

const trainModel = () => {
  if (selectedModel.value) {
    selectedModel.value.status = 'training'
    console.log('모델 학습 시작:', selectedModel.value.name)
  }
}

const exportModel = () => {
  console.log('모델 내보내기:', selectedModel.value)
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

const formatTime = (date) => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}
</script>

<style scoped>
.model-management-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
}

.header-content {
  flex: 1;
}

.page-title {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.page-subtitle {
  font-size: var(--fs-lg);
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.action-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.action-btn.primary:hover {
  background: var(--lina-yellow);
}

/* Model Categories */
.model-categories {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  padding-bottom: var(--space-2);
}

.category-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  white-space: nowrap;
  color: var(--text-secondary);
}

.category-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.category-btn.active {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.category-count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  min-width: 20px;
  text-align: center;
}

.category-btn.active .category-count {
  background: rgba(255, 255, 255, 0.3);
}

/* Models Section */
.models-section {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.section-title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}

.section-controls {
  display: flex;
  gap: var(--space-3);
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-sm);
  color: var(--text-primary);
  width: 200px;
}

.sort-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

/* Models Grid */
.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-5);
  padding: var(--space-5);
}

.model-card {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  cursor: pointer;
  transition: var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--border-primary);
  transition: var(--transition-fast);
}

.model-card.active::before {
  background: var(--success);
}

.model-card.training::before {
  background: var(--lina-yellow);
}

.model-card.error::before {
  background: var(--error);
}

.model-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--lina-orange);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.model-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--surface-hover);
  border-radius: var(--radius-lg);
  color: var(--lina-orange);
}

.model-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-tertiary);
}

.model-status.active .status-dot {
  background: var(--success);
}

.model-status.training .status-dot {
  background: var(--lina-yellow);
  animation: pulse 2s infinite;
}

.model-status.error .status-dot {
  background: var(--error);
}

.model-content {
  margin-bottom: var(--space-4);
}

.model-name {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.model-description {
  color: var(--text-secondary);
  margin: 0 0 var(--space-4) 0;
  line-height: var(--lh-relaxed);
}

.model-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.meta-label {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.meta-value {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.model-metrics {
  margin-bottom: var(--space-4);
}

.metric {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.metric-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  min-width: 60px;
}

.metric-bar {
  flex: 1;
  height: 6px;
  background: var(--surface-hover);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  background: var(--lina-orange);
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.metric-value {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}

.model-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.model-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.model-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.model-action-btn.active {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.model-action-btn.danger:hover {
  background: var(--error);
  color: white;
  border-color: var(--error);
}

/* Model Details Panel */
.model-details-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--surface);
  border-top: 1px solid var(--border-primary);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-xl);
  z-index: var(--z-modal);
  max-height: 60vh;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.panel-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.close-btn:hover {
  background: var(--surface-active);
  color: var(--text-primary);
}

.panel-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.details-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.tab-btn {
  padding: var(--space-3) var(--space-4);
  border: none;
  background: none;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--surface-active);
}

.tab-btn.active {
  color: var(--lina-orange);
  border-bottom-color: var(--lina-orange);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-5);
}

/* Overview Tab */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.overview-section h4 {
  margin: 0 0 var(--space-4) 0;
  color: var(--text-primary);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--text-secondary);
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--fw-medium);
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.performance-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.performance-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.performance-value {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.performance-bar {
  height: 8px;
  background: var(--surface-hover);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-normal);
}

.performance-fill.accuracy {
  background: var(--success);
}

.performance-fill.speed {
  background: var(--info);
}

/* Config Tab */
.config-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  max-width: 500px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
}

.form-input,
.form-textarea,
.form-select {
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  color: var(--text-primary);
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--lina-orange);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lina-orange) 20%, transparent);
}

.form-textarea {
  resize: vertical;
}

/* Logs Tab */
.logs-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
}

.log-entry {
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--surface-hover);
}

.log-entry.error {
  background: color-mix(in srgb, var(--error) 10%, transparent);
}

.log-entry.warning {
  background: color-mix(in srgb, var(--lina-yellow) 10%, transparent);
}

.log-entry.info {
  background: color-mix(in srgb, var(--info) 10%, transparent);
}

.log-time {
  color: var(--text-tertiary);
  white-space: nowrap;
}

.log-level {
  font-weight: var(--fw-bold);
  white-space: nowrap;
}

.log-entry.error .log-level {
  color: var(--error);
}

.log-entry.warning .log-level {
  color: var(--lina-orange);
}

.log-entry.info .log-level {
  color: var(--info);
}

.log-message {
  color: var(--text-primary);
}

/* Panel Actions */
.panel-actions {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.panel-action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.panel-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--space-4);
}

.modal-content {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}

.modal-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.modal-close:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.modal-body {
  flex: 1;
  padding: var(--space-5);
  overflow-y: auto;
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-4) var(--space-5);
  border-top: 1px solid var(--border-primary);
}

.modal-action-btn {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.modal-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.modal-action-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.modal-action-btn.primary:hover {
  background: var(--lina-yellow);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all var(--transition-normal);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .model-categories {
    flex-wrap: wrap;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
  
  .section-controls {
    width: 100%;
    justify-content: space-between;
  }
  
  .models-grid {
    grid-template-columns: 1fr;
  }
  
  .overview-grid {
    grid-template-columns: 1fr;
  }
  
  .model-details-panel {
    max-height: 80vh;
  }
}
</style>