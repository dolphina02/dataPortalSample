<template>
  <div class="text-to-sql-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Text To SQL</h1>
        <p class="page-subtitle">자연어로 SQL 쿼리를 생성하세요</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedModel" class="model-select">
          <option value="gpt-4">GPT-4</option>
          <option value="claude-3">Claude-3</option>
          <option value="gemini-pro">Gemini Pro</option>
        </select>
      </div>
    </div>

    <div class="workspace">
      <!-- Input Section -->
      <div class="input-section">
        <div class="section-header">
          <h3 class="section-title">자연어 입력</h3>
          <div class="section-actions">
            <button class="action-btn" @click="clearInput">
              <IconSystem name="trash" :size="16" />
              초기화
            </button>
            <button class="action-btn" @click="loadExample">
              <IconSystem name="lightbulb" :size="16" />
              예시 불러오기
            </button>
          </div>
        </div>
        
        <div class="input-container">
          <textarea 
            v-model="naturalLanguageInput"
            class="natural-input"
            placeholder="예: 2024년 1월부터 현재까지 센터별 신규계약 건수를 알려줘"
            rows="4"
          ></textarea>
          
          <div class="input-footer">
            <div class="input-stats">
              <span class="char-count">{{ naturalLanguageInput.length }}/500</span>
            </div>
            <button 
              class="generate-btn"
              :disabled="!naturalLanguageInput.trim() || isGenerating"
              @click="generateSQL"
            >
              <span v-if="isGenerating" class="loading-spinner"></span>
              <IconSystem v-else name="zap" :size="16" />
              {{ isGenerating ? 'SQL 생성 중...' : 'SQL 생성' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Schema Context -->
      <div class="schema-section">
        <div class="section-header">
          <h3 class="section-title">스키마 컨텍스트</h3>
          <button class="toggle-btn" @click="showSchemaContext = !showSchemaContext">
            <IconSystem :name="showSchemaContext ? 'chevron-up' : 'chevron-down'" :size="16" />
          </button>
        </div>
        
        <Transition name="slide-down">
          <div v-show="showSchemaContext" class="schema-content">
            <div class="schema-tabs">
              <button 
                v-for="tab in schemaTabs" 
                :key="tab.id"
                class="schema-tab"
                :class="{ active: activeSchemaTab === tab.id }"
                @click="activeSchemaTab = tab.id"
              >
                {{ tab.label }}
              </button>
            </div>
            
            <div class="schema-tab-content">
              <div v-if="activeSchemaTab === 'tables'" class="tables-list">
                <div 
                  v-for="table in availableTables" 
                  :key="table.name"
                  class="table-item"
                  :class="{ selected: selectedTables.includes(table.name) }"
                  @click="toggleTable(table.name)"
                >
                  <div class="table-info">
                    <div class="table-name">{{ table.name }}</div>
                    <div class="table-description">{{ table.description }}</div>
                  </div>
                  <div class="table-columns">{{ table.columns.length }}개 컬럼</div>
                </div>
              </div>
              
              <div v-else class="relationships-view">
                <div class="relationship-diagram">
                  <div class="diagram-placeholder">
                    <IconSystem name="share-2" :size="48" />
                    <p>테이블 관계도</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Generated SQL -->
      <div class="sql-section">
        <div class="section-header">
          <h3 class="section-title">생성된 SQL</h3>
          <div class="section-actions" v-if="generatedSQL">
            <button class="action-btn" @click="copySQL">
              <IconSystem name="copy" :size="16" />
              복사
            </button>
            <button class="action-btn" @click="formatSQL">
              <IconSystem name="code" :size="16" />
              포맷
            </button>
            <button class="action-btn primary" @click="executeSQL">
              <IconSystem name="play" :size="16" />
              실행
            </button>
          </div>
        </div>
        
        <div class="sql-container">
          <div v-if="!generatedSQL && !isGenerating" class="empty-state">
            <IconSystem name="database" :size="48" />
            <h4>SQL이 생성되지 않았습니다</h4>
            <p>위에서 자연어를 입력하고 'SQL 생성' 버튼을 클릭하세요</p>
          </div>
          
          <div v-else-if="isGenerating" class="generating-state">
            <div class="generating-animation">
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
              <div class="pulse-dot"></div>
            </div>
            <p>AI가 SQL을 생성하고 있습니다...</p>
          </div>
          
          <div v-else class="sql-editor-container">
            <div class="sql-metadata">
              <div class="metadata-item">
                <span class="metadata-label">모델:</span>
                <span class="metadata-value">{{ selectedModel }}</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">생성 시간:</span>
                <span class="metadata-value">{{ generationTime }}ms</span>
              </div>
              <div class="metadata-item">
                <span class="metadata-label">신뢰도:</span>
                <span class="metadata-value confidence" :class="getConfidenceClass(confidence)">
                  {{ confidence }}%
                </span>
              </div>
            </div>
            
            <textarea 
              v-model="generatedSQL"
              class="sql-editor"
              rows="10"
              spellcheck="false"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Explanation -->
      <div v-if="sqlExplanation" class="explanation-section">
        <div class="section-header">
          <h3 class="section-title">쿼리 설명</h3>
          <button class="toggle-btn" @click="showExplanation = !showExplanation">
            <IconSystem :name="showExplanation ? 'chevron-up' : 'chevron-down'" :size="16" />
          </button>
        </div>
        
        <Transition name="slide-down">
          <div v-show="showExplanation" class="explanation-content">
            <div class="explanation-text">{{ sqlExplanation }}</div>
            <div class="explanation-steps">
              <h4>실행 단계:</h4>
              <ol>
                <li v-for="step in executionSteps" :key="step">{{ step }}</li>
              </ol>
            </div>
          </div>
        </Transition>
      </div>

      <!-- History -->
      <div class="history-section">
        <div class="section-header">
          <h3 class="section-title">생성 히스토리</h3>
          <button class="action-btn" @click="clearHistory">
            <IconSystem name="trash" :size="16" />
            전체 삭제
          </button>
        </div>
        
        <div class="history-list">
          <div 
            v-for="item in generationHistory" 
            :key="item.id"
            class="history-item"
            @click="loadFromHistory(item)"
          >
            <div class="history-content">
              <div class="history-input">{{ item.input }}</div>
              <div class="history-meta">
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
                <span class="history-model">{{ item.model }}</span>
                <span class="history-confidence" :class="getConfidenceClass(item.confidence)">
                  {{ item.confidence }}%
                </span>
              </div>
            </div>
            <button class="history-delete" @click.stop="deleteHistoryItem(item.id)">
              <IconSystem name="trash" :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import IconSystem from './IconSystem.vue'

// Reactive state
const naturalLanguageInput = ref('')
const selectedModel = ref('gpt-4')
const generatedSQL = ref('')
const sqlExplanation = ref('')
const isGenerating = ref(false)
const showSchemaContext = ref(true)
const showExplanation = ref(true)
const activeSchemaTab = ref('tables')
const selectedTables = ref([])
const generationTime = ref(0)
const confidence = ref(0)
const executionSteps = ref([])
const generationHistory = ref([])

// Sample data
const schemaTabs = [
  { id: 'tables', label: '테이블' },
  { id: 'relationships', label: '관계' }
]

const availableTables = [
  {
    name: 'users',
    description: '사용자 정보',
    columns: [
      { name: 'id', type: 'INT', description: '사용자 ID' },
      { name: 'name', type: 'VARCHAR(100)', description: '사용자 이름' },
      { name: 'email', type: 'VARCHAR(255)', description: '이메일' },
      { name: 'created_at', type: 'TIMESTAMP', description: '가입일' }
    ]
  },
  {
    name: 'orders',
    description: '주문 정보',
    columns: [
      { name: 'id', type: 'INT', description: '주문 ID' },
      { name: 'user_id', type: 'INT', description: '사용자 ID' },
      { name: 'amount', type: 'DECIMAL(10,2)', description: '주문 금액' },
      { name: 'order_date', type: 'TIMESTAMP', description: '주문일' }
    ]
  },
  {
    name: 'products',
    description: '상품 정보',
    columns: [
      { name: 'id', type: 'INT', description: '상품 ID' },
      { name: 'name', type: 'VARCHAR(255)', description: '상품명' },
      { name: 'price', type: 'DECIMAL(10,2)', description: '가격' },
      { name: 'category', type: 'VARCHAR(100)', description: '카테고리' }
    ]
  }
]

const exampleQueries = [
  "2024년 1월부터 현재까지 매출이 100만원 이상인 고객들의 이름과 총 구매금액을 조회해줘",
  "가장 많이 팔린 상품 TOP 10을 보여줘",
  "월별 매출 추이를 조회하고 싶어",
  "신규 가입자 중에서 첫 주문까지 걸린 평균 시간을 알고 싶어"
]

// Methods
const generateSQL = async () => {
  if (!naturalLanguageInput.value.trim()) return
  
  isGenerating.value = true
  const startTime = Date.now()
  
  // Simulate AI processing
  setTimeout(() => {
    const endTime = Date.now()
    generationTime.value = endTime - startTime
    
    // Mock generated SQL
    generatedSQL.value = `SELECT 
  u.name,
  SUM(o.amount) as total_amount
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.order_date >= '2024-01-01'
  AND o.amount >= 1000000
GROUP BY u.id, u.name
ORDER BY total_amount DESC;`
    
    sqlExplanation.value = "이 쿼리는 2024년 1월 1일 이후 100만원 이상 주문한 고객들의 이름과 총 구매금액을 조회합니다. users 테이블과 orders 테이블을 JOIN하여 고객별로 주문금액을 합계하고, 총 구매금액 기준으로 내림차순 정렬합니다."
    
    executionSteps.value = [
      "users 테이블과 orders 테이블을 user_id로 JOIN",
      "2024년 1월 1일 이후 주문 필터링",
      "100만원 이상 주문 필터링",
      "고객별로 주문금액 합계 계산",
      "총 구매금액 기준 내림차순 정렬"
    ]
    
    confidence.value = Math.floor(Math.random() * 20) + 80 // 80-99%
    
    // Add to history
    generationHistory.value.unshift({
      id: Date.now(),
      input: naturalLanguageInput.value,
      sql: generatedSQL.value,
      model: selectedModel.value,
      confidence: confidence.value,
      timestamp: new Date()
    })
    
    isGenerating.value = false
  }, 2000)
}

const clearInput = () => {
  naturalLanguageInput.value = ''
}

const loadExample = () => {
  const randomExample = exampleQueries[Math.floor(Math.random() * exampleQueries.length)]
  naturalLanguageInput.value = randomExample
}

const toggleTable = (tableName) => {
  const index = selectedTables.value.indexOf(tableName)
  if (index > -1) {
    selectedTables.value.splice(index, 1)
  } else {
    selectedTables.value.push(tableName)
  }
}

const copySQL = async () => {
  try {
    await navigator.clipboard.writeText(generatedSQL.value)
    // Show toast notification
  } catch (err) {
    console.error('Failed to copy SQL:', err)
  }
}

const formatSQL = () => {
  // Simple SQL formatting
  generatedSQL.value = generatedSQL.value
    .replace(/\s+/g, ' ')
    .replace(/SELECT/gi, 'SELECT')
    .replace(/FROM/gi, '\nFROM')
    .replace(/WHERE/gi, '\nWHERE')
    .replace(/JOIN/gi, '\nJOIN')
    .replace(/GROUP BY/gi, '\nGROUP BY')
    .replace(/ORDER BY/gi, '\nORDER BY')
    .trim()
}

const executeSQL = () => {
  // Navigate to Query Tool with the generated SQL
  console.log('Execute SQL:', generatedSQL.value)
}

const loadFromHistory = (item) => {
  naturalLanguageInput.value = item.input
  generatedSQL.value = item.sql
  selectedModel.value = item.model
  confidence.value = item.confidence
}

const deleteHistoryItem = (id) => {
  const index = generationHistory.value.findIndex(item => item.id === id)
  if (index > -1) {
    generationHistory.value.splice(index, 1)
  }
}

const clearHistory = () => {
  generationHistory.value = []
}

const getConfidenceClass = (conf) => {
  if (conf >= 90) return 'high'
  if (conf >= 70) return 'medium'
  return 'low'
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}
</script>

<style scoped>
.text-to-sql-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  max-width: 1200px;
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

.model-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.workspace {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Section Styles */
.input-section,
.schema-section,
.sql-section,
.explanation-section,
.history-section {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.section-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
}

.section-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
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

.toggle-btn {
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

.toggle-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* Input Section */
.input-container {
  padding: var(--space-5);
}

.natural-input {
  width: 100%;
  min-height: 120px;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
  resize: vertical;
  background: var(--surface);
  color: var(--text-primary);
}

.natural-input:focus {
  outline: none;
  border-color: var(--lina-orange);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lina-orange) 20%, transparent);
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-3);
}

.input-stats {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--lina-orange);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  cursor: pointer;
  transition: var(--transition-fast);
}

.generate-btn:hover:not(:disabled) {
  background: var(--lina-yellow);
  transform: translateY(-1px);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Schema Section */
.schema-content {
  padding: var(--space-5);
}

.schema-tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
}

.schema-tab {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.schema-tab.active {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.tables-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-3);
}

.table-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
}

.table-item:hover {
  background: var(--surface-hover);
}

.table-item.selected {
  background: color-mix(in srgb, var(--lina-orange) 10%, transparent);
  border-color: var(--lina-orange);
}

.table-info {
  flex: 1;
}

.table-name {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.table-description {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.table-columns {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
}

/* SQL Section */
.sql-container {
  padding: var(--space-5);
}

.empty-state,
.generating-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  color: var(--text-secondary);
}

.empty-state h4 {
  margin: var(--space-4) 0 var(--space-2) 0;
  color: var(--text-primary);
}

.generating-animation {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: var(--lina-orange);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite both;
}

.pulse-dot:nth-child(1) { animation-delay: -0.32s; }
.pulse-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.sql-metadata {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--surface-hover);
  border-radius: var(--radius-md);
}

.metadata-item {
  display: flex;
  gap: var(--space-2);
  font-size: var(--fs-sm);
}

.metadata-label {
  color: var(--text-secondary);
}

.metadata-value {
  color: var(--text-primary);
  font-weight: var(--fw-medium);
}

.confidence.high {
  color: var(--success);
}

.confidence.medium {
  color: var(--lina-yellow);
}

.confidence.low {
  color: var(--error);
}

.sql-editor {
  width: 100%;
  min-height: 200px;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
  background: var(--surface);
  color: var(--text-primary);
  resize: vertical;
}

/* Explanation Section */
.explanation-content {
  padding: var(--space-5);
}

.explanation-text {
  margin-bottom: var(--space-4);
  line-height: var(--lh-relaxed);
  color: var(--text-secondary);
}

.explanation-steps h4 {
  margin: 0 0 var(--space-3) 0;
  color: var(--text-primary);
}

.explanation-steps ol {
  margin: 0;
  padding-left: var(--space-5);
}

.explanation-steps li {
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
}

/* History Section */
.history-list {
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.history-item:hover {
  background: var(--surface-hover);
}

.history-item:last-child {
  border-bottom: none;
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-input {
  font-size: var(--fs-sm);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
}

.history-confidence.high {
  color: var(--success);
}

.history-confidence.medium {
  color: var(--lina-yellow);
}

.history-confidence.low {
  color: var(--error);
}

.history-delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-tertiary);
}

.history-delete:hover {
  background: var(--error);
  color: white;
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all var(--transition-normal);
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .tables-list {
    grid-template-columns: 1fr;
  }
  
  .sql-metadata {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .history-meta {
    flex-direction: column;
    gap: var(--space-1);
  }
}
</style>