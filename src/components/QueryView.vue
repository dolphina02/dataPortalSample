<template>
  <div class="query-view">
    <div class="query-header">
      <h2 class="page-title">Query Tool</h2>
      <p class="page-subtitle">SQL 쿼리를 작성하고 실행해보세요</p>
    </div>

    <div class="query-workspace">
      <!-- Query Editor -->
      <div class="editor-panel">
        <div class="editor-header">
          <div class="editor-tabs">
            <div class="tab active">
              <span>새 쿼리</span>
              <button class="tab-close">×</button>
            </div>
          </div>
          <div class="editor-actions">
            <button class="action-btn" @click="formatQuery">
              <span>🎨</span> 포맷
            </button>
            <button class="action-btn primary" @click="executeQuery" :disabled="!sqlQuery.trim()">
              <span>▶️</span> 실행
            </button>
          </div>
        </div>
        
        <div class="editor-container">
          <textarea 
            v-model="sqlQuery"
            class="sql-editor"
            placeholder="SELECT * FROM users WHERE created_at > '2024-01-01';"
            spellcheck="false"
          ></textarea>
        </div>
      </div>

      <!-- Results Panel -->
      <div class="results-panel">
        <div class="results-header">
          <div class="results-tabs">
            <button 
              class="results-tab" 
              :class="{ active: activeTab === 'results' }"
              @click="activeTab = 'results'"
            >
              결과 ({{ queryResults.length }})
            </button>
            <button 
              class="results-tab" 
              :class="{ active: activeTab === 'history' }"
              @click="activeTab = 'history'"
            >
              히스토리
            </button>
          </div>
          
          <div class="results-actions" v-if="activeTab === 'results' && queryResults.length">
            <button class="action-btn" @click="exportResults">
              <span>📥</span> 내보내기
            </button>
          </div>
        </div>

        <div class="results-content">
          <!-- Query Results -->
          <div v-if="activeTab === 'results'" class="results-table-container">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>쿼리 실행 중...</p>
            </div>
            
            <div v-else-if="queryResults.length" class="table-wrapper">
              <table class="results-table">
                <thead>
                  <tr>
                    <th v-for="column in tableColumns" :key="column">
                      {{ column }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in queryResults" :key="index">
                    <td v-for="column in tableColumns" :key="column">
                      {{ row[column] }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div v-else class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>쿼리를 실행해보세요</h3>
              <p>SQL 쿼리를 작성하고 실행 버튼을 클릭하세요</p>
            </div>
          </div>

          <!-- Query History -->
          <div v-else class="history-list">
            <div 
              v-for="query in queryHistory" 
              :key="query.id"
              class="history-item"
              @click="loadQuery(query)"
            >
              <div class="history-content">
                <div class="history-query">{{ query.sql }}</div>
                <div class="history-meta">
                  <span class="history-time">{{ query.executedAt }}</span>
                  <span class="history-duration">{{ query.duration }}ms</span>
                  <span class="history-rows">{{ query.rowCount }}행</span>
                </div>
              </div>
              <div class="history-status" :class="query.status">
                {{ query.status === 'success' ? '✅' : '❌' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schema Browser -->
    <div class="schema-panel">
      <div class="schema-header">
        <h3>스키마 브라우저</h3>
        <button class="refresh-btn" @click="refreshSchema">🔄</button>
      </div>
      
      <div class="schema-tree">
        <div 
          v-for="database in schemaDatabases" 
          :key="database.name"
          class="schema-database"
        >
          <div 
            class="schema-item database-item"
            @click="toggleDatabase(database.name)"
          >
            <span class="schema-icon">{{ database.expanded ? '📂' : '📁' }}</span>
            <span class="schema-name">{{ database.name }}</span>
          </div>
          
          <div v-if="database.expanded" class="schema-tables">
            <div 
              v-for="table in database.tables" 
              :key="table.name"
              class="schema-table"
            >
              <div 
                class="schema-item table-item"
                @click="toggleTable(database.name, table.name)"
              >
                <span class="schema-icon">{{ table.expanded ? '📋' : '📄' }}</span>
                <span class="schema-name">{{ table.name }}</span>
                <span class="table-count">({{ table.columns.length }})</span>
              </div>
              
              <div v-if="table.expanded" class="schema-columns">
                <div 
                  v-for="column in table.columns" 
                  :key="column.name"
                  class="schema-item column-item"
                  @click="insertColumn(database.name, table.name, column.name)"
                >
                  <span class="schema-icon">🔹</span>
                  <span class="schema-name">{{ column.name }}</span>
                  <span class="column-type">{{ column.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sqlQuery = ref('')
const activeTab = ref('results')
const isLoading = ref(false)
const queryResults = ref([])

// Sample data
const sampleResults = [
  { id: 1, name: '김철수', email: 'kim@example.com', created_at: '2024-01-15', status: 'active' },
  { id: 2, name: '이영희', email: 'lee@example.com', created_at: '2024-01-16', status: 'active' },
  { id: 3, name: '박민수', email: 'park@example.com', created_at: '2024-01-17', status: 'inactive' }
]

const queryHistory = ref([
  {
    id: 1,
    sql: 'SELECT * FROM users WHERE status = "active"',
    executedAt: '2024-01-20 14:30',
    duration: 245,
    rowCount: 1247,
    status: 'success'
  },
  {
    id: 2,
    sql: 'SELECT COUNT(*) FROM orders WHERE date > "2024-01-01"',
    executedAt: '2024-01-20 14:25',
    duration: 156,
    rowCount: 1,
    status: 'success'
  }
])

const schemaDatabases = ref([
  {
    name: 'production',
    expanded: true,
    tables: [
      {
        name: 'users',
        expanded: false,
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'name', type: 'VARCHAR(255)' },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'orders',
        expanded: false,
        columns: [
          { name: 'id', type: 'INT' },
          { name: 'user_id', type: 'INT' },
          { name: 'amount', type: 'DECIMAL(10,2)' },
          { name: 'created_at', type: 'TIMESTAMP' }
        ]
      }
    ]
  }
])

const tableColumns = computed(() => {
  if (queryResults.value.length === 0) return []
  return Object.keys(queryResults.value[0])
})

const executeQuery = async () => {
  if (!sqlQuery.value.trim()) return
  
  isLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    queryResults.value = sampleResults
    isLoading.value = false
    
    // Add to history
    queryHistory.value.unshift({
      id: Date.now(),
      sql: sqlQuery.value,
      executedAt: new Date().toLocaleString('ko-KR'),
      duration: Math.floor(Math.random() * 500) + 100,
      rowCount: sampleResults.length,
      status: 'success'
    })
  }, 1500)
}

const formatQuery = () => {
  // Simple SQL formatting
  sqlQuery.value = sqlQuery.value
    .replace(/\s+/g, ' ')
    .replace(/SELECT/gi, 'SELECT')
    .replace(/FROM/gi, '\nFROM')
    .replace(/WHERE/gi, '\nWHERE')
    .replace(/ORDER BY/gi, '\nORDER BY')
    .trim()
}

const exportResults = () => {
  console.log('결과 내보내기')
}

const loadQuery = (query) => {
  sqlQuery.value = query.sql
}

const toggleDatabase = (dbName) => {
  const db = schemaDatabases.value.find(d => d.name === dbName)
  if (db) db.expanded = !db.expanded
}

const toggleTable = (dbName, tableName) => {
  const db = schemaDatabases.value.find(d => d.name === dbName)
  if (db) {
    const table = db.tables.find(t => t.name === tableName)
    if (table) table.expanded = !table.expanded
  }
}

const insertColumn = (dbName, tableName, columnName) => {
  const fullName = `${dbName}.${tableName}.${columnName}`
  const cursorPos = sqlQuery.value.length
  sqlQuery.value += (sqlQuery.value ? ', ' : '') + fullName
}

const refreshSchema = () => {
  console.log('스키마 새로고침')
}
</script>

<style scoped>
.query-view {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  height: calc(100vh - 120px);
}

.query-header {
  grid-column: 1 / -1;
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

.query-workspace {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

/* Editor Panel */
.editor-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 300px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.editor-tabs {
  display: flex;
  gap: 4px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--card-hover);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  font-size: var(--fs-small);
}

.tab.active {
  background: white;
  border-color: var(--primary);
}

.tab-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--muted);
  font-size: 16px;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  background: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-small);
}

.action-btn:hover:not(:disabled) {
  background: var(--card-hover);
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-light);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.editor-container {
  flex: 1;
  padding: 16px;
}

.sql-editor {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  background: transparent;
}

/* Results Panel */
.results-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 400px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--line);
}

.results-tabs {
  display: flex;
  gap: 4px;
}

.results-tab {
  padding: 8px 16px;
  border: 1px solid var(--line);
  background: var(--card-hover);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-small);
}

.results-tab.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.results-content {
  flex: 1;
  overflow: auto;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--line);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Results Table */
.table-wrapper {
  overflow: auto;
  max-height: 400px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.results-table th {
  background: var(--card-hover);
  font-weight: 600;
  color: var(--ink);
  position: sticky;
  top: 0;
}

.results-table td {
  color: var(--muted);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  text-align: center;
  color: var(--muted);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Query History */
.history-list {
  padding: 16px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
  cursor: pointer;
  transition: var(--transition-fast);
}

.history-item:hover {
  background: var(--card-hover);
}

.history-content {
  flex: 1;
}

.history-query {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--fs-small);
  color: var(--ink);
  margin-bottom: 4px;
}

.history-meta {
  display: flex;
  gap: 12px;
  font-size: var(--fs-xs);
  color: var(--muted);
}

.history-status {
  font-size: 20px;
}

/* Schema Panel */
.schema-panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  height: fit-content;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.schema-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.schema-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--ink);
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition-fast);
}

.refresh-btn:hover {
  background: var(--card-hover);
}

.schema-tree {
  font-size: var(--fs-small);
}

.schema-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: var(--transition-fast);
}

.schema-item:hover {
  background: var(--card-hover);
}

.schema-icon {
  font-size: 14px;
}

.schema-name {
  flex: 1;
  color: var(--ink);
}

.table-count,
.column-type {
  color: var(--muted);
  font-size: var(--fs-xs);
}

.schema-tables,
.schema-columns {
  margin-left: 16px;
}

.column-item {
  padding-left: 24px;
}

@media (max-width: 1024px) {
  .query-view {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .schema-panel {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .editor-header,
  .results-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .history-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>