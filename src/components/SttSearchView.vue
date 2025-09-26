<template>
  <div class="stt-search-view">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">STT 키워드 검색</h1>
        <p class="page-subtitle">음성 파일에서 키워드를 추출하여 데이터를 검색하세요</p>
      </div>
      <div class="header-actions">
        <select v-model="selectedLanguage" class="language-select">
          <option value="ko-KR">한국어</option>
          <option value="en-US">English</option>
          <option value="ja-JP">日本語</option>
        </select>
      </div>
    </div>

    <!-- Audio File Upload Section -->
    <div class="audio-upload-section">
      <div class="section-header">
        <h3 class="section-title">음성 파일 업로드</h3>
        <div class="section-actions">
          <button class="action-btn" @click="clearAudioFile">
            <IconSystem name="trash" :size="16" />
            초기화
          </button>
        </div>
      </div>

      <div class="audio-upload-container">
        <!-- File Upload Area -->
        <div 
          class="file-upload-area" 
          :class="{ 'drag-over': isDragOver, 'has-file': audioFile }"
          @drop="handleFileDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput"
            type="file" 
            accept="audio/*"
            @change="handleFileSelect"
            class="file-input"
          />
          
          <div v-if="!audioFile" class="upload-prompt">
            <IconSystem name="upload" :size="48" />
            <h4>음성 파일을 업로드하세요</h4>
            <p>파일을 드래그하거나 클릭하여 선택하세요</p>
            <div class="supported-formats">
              지원 형식: MP3, WAV, M4A, OGG
            </div>
          </div>
          
          <div v-else class="file-info">
            <div class="file-details">
              <IconSystem name="file-audio" :size="32" />
              <div class="file-meta">
                <div class="file-name">{{ audioFile.name }}</div>
                <div class="file-size">{{ formatFileSize(audioFile.size) }}</div>
                <div class="file-duration" v-if="audioDuration">{{ formatDuration(audioDuration) }}</div>
              </div>
            </div>
            
            <div class="file-actions">
              <button class="file-action-btn" @click.stop="playAudio" v-if="!isPlaying">
                <IconSystem name="play" :size="16" />
                재생
              </button>
              <button class="file-action-btn" @click.stop="pauseAudio" v-else>
                <IconSystem name="pause" :size="16" />
                일시정지
              </button>
              <button class="file-action-btn primary" @click.stop="processAudio" :disabled="isProcessing">
                <IconSystem name="zap" :size="16" />
                {{ isProcessing ? '처리 중...' : 'STT 처리' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Audio Player -->
        <div v-if="audioFile" class="audio-player">
          <audio 
            ref="audioElement"
            :src="audioUrl"
            @loadedmetadata="updateAudioDuration"
            @timeupdate="updateProgress"
            @ended="audioEnded"
          ></audio>
          
          <div class="player-controls">
            <button class="player-btn" @click="playAudio" v-if="!isPlaying">
              <IconSystem name="play" :size="20" />
            </button>
            <button class="player-btn" @click="pauseAudio" v-else>
              <IconSystem name="pause" :size="20" />
            </button>
            
            <div class="progress-container">
              <div class="progress-bar" @click="seekAudio">
                <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
              </div>
              <div class="time-display">
                <span>{{ formatTime(currentTime) }}</span>
                <span>{{ formatTime(audioDuration) }}</span>
              </div>
            </div>
            
            <div class="volume-control">
              <IconSystem name="volume-2" :size="16" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                v-model="volume"
                @input="updateVolume"
                class="volume-slider"
              />
            </div>
          </div>
        </div>

        <!-- Processing Status -->
        <div v-if="isProcessing" class="processing-status">
          <div class="processing-animation">
            <div class="processing-spinner"></div>
          </div>
          <div class="processing-text">
            <h4>음성을 텍스트로 변환 중...</h4>
            <p>{{ processingProgress }}% 완료</p>
          </div>
        </div>

        <!-- STT Results -->
        <div v-if="sttResults.length" class="stt-results">
          <div class="results-header">
            <h4>음성 인식 결과</h4>
            <div class="results-confidence">
              평균 신뢰도: {{ averageConfidence }}%
            </div>
          </div>
          
          <div class="results-segments">
            <div 
              v-for="(segment, index) in sttResults" 
              :key="index"
              class="result-segment"
              @click="seekToSegment(segment.startTime)"
            >
              <div class="segment-time">
                {{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}
              </div>
              <div class="segment-text">{{ segment.text }}</div>
              <div class="segment-confidence">{{ segment.confidence }}%</div>
            </div>
          </div>
          
          <div class="results-actions">
            <button class="results-btn" @click="copyAllTranscripts">
              <IconSystem name="copy" :size="16" />
              전체 복사
            </button>
            <button class="results-btn primary" @click="extractKeywordsFromSTT">
              <IconSystem name="search" :size="16" />
              키워드 추출
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Keyword Analysis -->
    <div v-if="extractedKeywords.length" class="keywords-section">
      <div class="section-header">
        <h3 class="section-title">추출된 키워드</h3>
        <button class="action-btn" @click="refreshKeywords">
          <IconSystem name="refresh-cw" :size="16" />
          재분석
        </button>
      </div>
      
      <div class="keywords-container">
        <div class="keywords-list">
          <div 
            v-for="keyword in extractedKeywords" 
            :key="keyword.text"
            class="keyword-item"
            :class="{ selected: selectedKeywords.includes(keyword.text) }"
            @click="toggleKeyword(keyword.text)"
          >
            <div class="keyword-content">
              <span class="keyword-text">{{ keyword.text }}</span>
              <span class="keyword-type">{{ keyword.type }}</span>
            </div>
            <div class="keyword-confidence">{{ keyword.confidence }}%</div>
          </div>
        </div>
        
        <div class="keywords-actions">
          <button class="keywords-btn" @click="selectAllKeywords">
            전체 선택
          </button>
          <button class="keywords-btn" @click="clearSelectedKeywords">
            선택 해제
          </button>
          <button class="keywords-btn primary" @click="searchWithKeywords">
            선택된 키워드로 검색
          </button>
        </div>
      </div>
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length" class="results-section">
      <div class="section-header">
        <h3 class="section-title">검색 결과</h3>
        <div class="results-meta">
          <span class="results-count">{{ searchResults.length }}개 결과</span>
          <span class="search-time">{{ searchTime }}ms</span>
        </div>
      </div>
      
      <div class="results-container">
        <div class="results-filters">
          <div class="filter-group">
            <label class="filter-label">데이터 타입</label>
            <select v-model="resultFilter.type" class="filter-select">
              <option value="">전체</option>
              <option value="table">테이블</option>
              <option value="view">뷰</option>
              <option value="report">리포트</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">정렬</label>
            <select v-model="resultFilter.sort" class="filter-select">
              <option value="relevance">관련도순</option>
              <option value="date">날짜순</option>
              <option value="name">이름순</option>
            </select>
          </div>
        </div>
        
        <div class="results-list">
          <div 
            v-for="result in filteredResults" 
            :key="result.id"
            class="result-item"
            @click="openResult(result)"
          >
            <div class="result-header">
              <div class="result-icon">
                <IconSystem :name="getResultIcon(result.type)" :size="24" />
              </div>
              <div class="result-meta">
                <span class="result-type">{{ result.type }}</span>
                <span class="result-relevance">{{ result.relevance }}% 일치</span>
              </div>
            </div>
            
            <div class="result-content">
              <h4 class="result-title">{{ result.title }}</h4>
              <p class="result-description">{{ result.description }}</p>
              
              <div class="result-highlights">
                <span 
                  v-for="highlight in result.highlights" 
                  :key="highlight"
                  class="highlight-tag"
                >
                  {{ highlight }}
                </span>
              </div>
            </div>
            
            <div class="result-actions">
              <button class="result-action-btn" @click.stop="previewResult(result)">
                <IconSystem name="eye" :size="16" />
                미리보기
              </button>
              <button class="result-action-btn primary" @click.stop="openResult(result)">
                <IconSystem name="external-link" :size="16" />
                열기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voice Commands Help -->
    <div class="help-section">
      <div class="section-header">
        <h3 class="section-title">음성 명령어 가이드</h3>
        <button class="toggle-btn" @click="showHelp = !showHelp">
          <IconSystem :name="showHelp ? 'chevron-up' : 'chevron-down'" :size="16" />
        </button>
      </div>
      
      <Transition name="slide-down">
        <div v-show="showHelp" class="help-content">
          <div class="help-categories">
            <div class="help-category">
              <h4>검색 명령어</h4>
              <ul>
                <li>"고객 데이터 찾아줘"</li>
                <li>"매출 관련 테이블 보여줘"</li>
                <li>"주문 정보 검색해줘"</li>
                <li>"최근 데이터 분석 결과"</li>
              </ul>
            </div>
            
            <div class="help-category">
              <h4>필터 명령어</h4>
              <ul>
                <li>"2024년 데이터만"</li>
                <li>"테이블 타입만 보여줘"</li>
                <li>"높은 정확도 순으로"</li>
                <li>"최신 순으로 정렬"</li>
              </ul>
            </div>
            
            <div class="help-category">
              <h4>분석 명령어</h4>
              <ul>
                <li>"트렌드 분석해줘"</li>
                <li>"상관관계 찾아줘"</li>
                <li>"이상치 탐지해줘"</li>
                <li>"요약 통계 보여줘"</li>
              </ul>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Search History -->
    <div class="history-section">
      <div class="section-header">
        <h3 class="section-title">검색 히스토리</h3>
        <button class="action-btn" @click="clearHistory">
          <IconSystem name="trash" :size="16" />
          전체 삭제
        </button>
      </div>
      
      <div class="history-list">
        <div 
          v-for="item in searchHistory" 
          :key="item.id"
          class="history-item"
          @click="loadFromHistory(item)"
        >
          <div class="history-content">
            <div class="history-query">
              <IconSystem name="mic" :size="16" />
              <span>{{ item.transcript }}</span>
            </div>
            <div class="history-keywords">
              <span 
                v-for="keyword in item.keywords.slice(0, 3)" 
                :key="keyword"
                class="history-keyword"
              >
                {{ keyword }}
              </span>
              <span v-if="item.keywords.length > 3" class="keyword-more">
                +{{ item.keywords.length - 3 }}
              </span>
            </div>
            <div class="history-meta">
              <span class="history-time">{{ formatHistoryTime(item.timestamp) }}</span>
              <span class="history-results">{{ item.resultCount }}개 결과</span>
            </div>
          </div>
          
          <button class="history-delete" @click.stop="deleteHistoryItem(item.id)">
            <IconSystem name="trash" :size="14" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconSystem from './IconSystem.vue'

// Reactive state
const audioFile = ref(null)
const audioUrl = ref('')
const isPlaying = ref(false)
const isProcessing = ref(false)
const processingProgress = ref(0)
const audioDuration = ref(0)
const currentTime = ref(0)
const volume = ref(1)
const isDragOver = ref(false)
const sttResults = ref([])
const selectedLanguage = ref('ko-KR')
const extractedKeywords = ref([])
const selectedKeywords = ref([])
const searchResults = ref([])
const searchTime = ref(0)
const showHelp = ref(false)
const searchHistory = ref([])

const resultFilter = ref({
  type: '',
  sort: 'relevance'
})

// Audio element reference
const audioElement = ref(null)
const fileInput = ref(null)

// Sample data
const sampleKeywords = [
  { text: '고객', type: '엔티티', confidence: 95 },
  { text: '매출', type: '지표', confidence: 92 },
  { text: '2024년', type: '시간', confidence: 88 },
  { text: '분석', type: '액션', confidence: 85 },
  { text: '데이터', type: '엔티티', confidence: 90 }
]

const sampleResults = [
  {
    id: 1,
    title: '고객 매출 분석 테이블',
    description: '2024년 고객별 매출 데이터 및 트렌드 분석 결과',
    type: 'table',
    relevance: 95,
    highlights: ['고객', '매출', '2024년']
  },
  {
    id: 2,
    title: '월별 매출 리포트',
    description: '월별 매출 현황 및 전년 대비 증감률 분석',
    type: 'report',
    relevance: 88,
    highlights: ['매출', '분석', '리포트']
  },
  {
    id: 3,
    title: '고객 세그먼트 뷰',
    description: '고객 행동 패턴 기반 세그먼트 분류 뷰',
    type: 'view',
    relevance: 82,
    highlights: ['고객', '분석', '세그먼트']
  }
]

// Computed
const filteredResults = computed(() => {
  let filtered = searchResults.value

  if (resultFilter.value.type) {
    filtered = filtered.filter(result => result.type === resultFilter.value.type)
  }

  // Sort results
  filtered.sort((a, b) => {
    switch (resultFilter.value.sort) {
      case 'relevance':
        return b.relevance - a.relevance
      case 'date':
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
      case 'name':
        return a.title.localeCompare(b.title)
      default:
        return 0
    }
  })

  return filtered
})

const progressPercentage = computed(() => {
  if (!audioDuration.value) return 0
  return (currentTime.value / audioDuration.value) * 100
})

const averageConfidence = computed(() => {
  if (!sttResults.value.length) return 0
  const total = sttResults.value.reduce((sum, result) => sum + result.confidence, 0)
  return Math.round(total / sttResults.value.length)
})

// Methods
const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    setAudioFile(file)
  }
}

const handleFileDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('audio/')) {
    setAudioFile(file)
  }
}

const setAudioFile = (file) => {
  audioFile.value = file
  audioUrl.value = URL.createObjectURL(file)
  sttResults.value = []
  extractedKeywords.value = []
  selectedKeywords.value = []
}

const clearAudioFile = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioFile.value = null
  audioUrl.value = ''
  sttResults.value = []
  extractedKeywords.value = []
  selectedKeywords.value = []
  isPlaying.value = false
  currentTime.value = 0
  audioDuration.value = 0
}

const playAudio = () => {
  if (audioElement.value) {
    audioElement.value.play()
    isPlaying.value = true
  }
}

const pauseAudio = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    isPlaying.value = false
  }
}

const updateAudioDuration = () => {
  if (audioElement.value) {
    audioDuration.value = audioElement.value.duration
  }
}

const updateProgress = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const audioEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
}

const seekAudio = (event) => {
  if (audioElement.value && audioDuration.value) {
    const rect = event.target.getBoundingClientRect()
    const percent = (event.clientX - rect.left) / rect.width
    const newTime = percent * audioDuration.value
    audioElement.value.currentTime = newTime
    currentTime.value = newTime
  }
}

const seekToSegment = (time) => {
  if (audioElement.value) {
    audioElement.value.currentTime = time
    currentTime.value = time
    if (!isPlaying.value) {
      playAudio()
    }
  }
}

const updateVolume = () => {
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
}

const processAudio = async () => {
  if (!audioFile.value) return
  
  isProcessing.value = true
  processingProgress.value = 0
  
  // Simulate STT processing
  const interval = setInterval(() => {
    processingProgress.value += 10
    if (processingProgress.value >= 100) {
      clearInterval(interval)
      
      // Mock STT results
      sttResults.value = [
        {
          startTime: 0,
          endTime: 3.5,
          text: '안녕하세요 고객 데이터 분석 결과를 확인하고 싶습니다',
          confidence: 95
        },
        {
          startTime: 3.5,
          endTime: 7.2,
          text: '2024년 매출 현황과 트렌드를 보여주세요',
          confidence: 92
        },
        {
          startTime: 7.2,
          endTime: 10.8,
          text: '특히 보험 상품별 판매 실적이 궁금합니다',
          confidence: 88
        }
      ]
      
      isProcessing.value = false
      extractKeywordsFromSTT()
    }
  }, 200)
}

const extractKeywordsFromSTT = () => {
  const allText = sttResults.value.map(r => r.text).join(' ')
  extractKeywords(allText)
}

const copyAllTranscripts = async () => {
  const allText = sttResults.value.map(r => r.text).join('\n')
  try {
    await navigator.clipboard.writeText(allText)
    // Show toast notification
  } catch (err) {
    console.error('Failed to copy transcripts:', err)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const formatTime = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const extractKeywords = (text) => {
  // Simulate keyword extraction
  setTimeout(() => {
    extractedKeywords.value = sampleKeywords.filter(() => Math.random() > 0.3)
  }, 500)
}

const toggleKeyword = (keyword) => {
  const index = selectedKeywords.value.indexOf(keyword)
  if (index > -1) {
    selectedKeywords.value.splice(index, 1)
  } else {
    selectedKeywords.value.push(keyword)
  }
}

const selectAllKeywords = () => {
  selectedKeywords.value = extractedKeywords.value.map(k => k.text)
}

const clearSelectedKeywords = () => {
  selectedKeywords.value = []
}

const searchWithTranscript = () => {
  const allText = sttResults.value.map(r => r.text).join(' ')
  performSearch(allText, extractedKeywords.value.map(k => k.text))
}

const searchWithKeywords = () => {
  const allText = sttResults.value.map(r => r.text).join(' ')
  performSearch(allText, selectedKeywords.value)
}

const performSearch = (query, keywords) => {
  const startTime = Date.now()
  
  // Simulate search
  setTimeout(() => {
    searchResults.value = sampleResults
    searchTime.value = Date.now() - startTime
    
    // Add to history
    searchHistory.value.unshift({
      id: Date.now(),
      transcript: query,
      keywords: keywords,
      resultCount: sampleResults.length,
      timestamp: new Date()
    })
    
    // Keep only last 10 items
    if (searchHistory.value.length > 10) {
      searchHistory.value = searchHistory.value.slice(0, 10)
    }
  }, 800)
}

const refreshKeywords = () => {
  if (sttResults.value.length) {
    const allText = sttResults.value.map(r => r.text).join(' ')
    extractKeywords(allText)
  }
}

const getResultIcon = (type) => {
  const icons = {
    table: 'table',
    view: 'eye',
    report: 'file-text'
  }
  return icons[type] || 'database'
}

const previewResult = (result) => {
  console.log('Preview result:', result.title)
}

const openResult = (result) => {
  console.log('Open result:', result.title)
}

const loadFromHistory = (item) => {
  // Create mock STT results from history
  sttResults.value = [
    {
      startTime: 0,
      endTime: 5,
      text: item.transcript,
      confidence: 90
    }
  ]
  selectedKeywords.value = [...item.keywords]
  extractedKeywords.value = sampleKeywords.filter(k => item.keywords.includes(k.text))
}

const deleteHistoryItem = (id) => {
  const index = searchHistory.value.findIndex(item => item.id === id)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }
}

const clearHistory = () => {
  searchHistory.value = []
}

const formatHistoryTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

// Lifecycle
onMounted(() => {
  // Initialize audio context if needed
})

onUnmounted(() => {
  // Clean up audio URL
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style scoped>
.stt-search-view {
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

.language-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

/* Section Styles */
.audio-upload-section,
.keywords-section,
.results-section,
.help-section,
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

.action-btn.active {
  background: var(--error);
  color: white;
  border-color: var(--error);
}

.action-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
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

/* Audio Upload */
.audio-upload-container {
  padding: var(--space-5);
}

.file-upload-area {
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--surface-hover);
  position: relative;
}

.file-upload-area:hover,
.file-upload-area.drag-over {
  border-color: var(--lina-orange);
  background: color-mix(in srgb, var(--lina-orange) 5%, transparent);
}

.file-upload-area.has-file {
  border-style: solid;
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 5%, transparent);
}

.file-input {
  display: none;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  color: var(--text-secondary);
}

.upload-prompt h4 {
  margin: 0;
  color: var(--text-primary);
}

.supported-formats {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  background: var(--surface);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.file-details {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
}

.file-meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.file-name {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.file-size,
.file-duration {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.file-actions {
  display: flex;
  gap: var(--space-2);
}

.file-action-btn {
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

.file-action-btn:hover:not(:disabled) {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.file-action-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.file-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Audio Player */
.audio-player {
  margin-top: var(--space-5);
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.player-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.player-btn:hover {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.progress-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.progress-bar {
  height: 6px;
  background: var(--surface-hover);
  border-radius: var(--radius-full);
  cursor: pointer;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: var(--lina-orange);
  border-radius: var(--radius-full);
  transition: width 0.1s ease;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.volume-slider {
  width: 80px;
}

/* Processing Status */
.processing-status {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-top: var(--space-5);
}

.processing-animation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.processing-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--surface-hover);
  border-top: 3px solid var(--lina-orange);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.processing-text h4 {
  margin: 0 0 var(--space-1) 0;
  color: var(--text-primary);
}

.processing-text p {
  margin: 0;
  color: var(--text-secondary);
}

/* STT Results */
.stt-results {
  margin-top: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.results-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.results-confidence {
  font-size: var(--fs-sm);
  color: var(--success);
  font-weight: var(--fw-semibold);
}

.results-segments {
  max-height: 300px;
  overflow-y: auto;
}

.result-segment {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.result-segment:hover {
  background: var(--surface-hover);
}

.result-segment:last-child {
  border-bottom: none;
}

.segment-time {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  min-width: 100px;
}

.segment-text {
  flex: 1;
  color: var(--text-primary);
}

.segment-confidence {
  font-size: var(--fs-sm);
  color: var(--success);
  font-weight: var(--fw-semibold);
  min-width: 50px;
  text-align: right;
}

.results-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
  padding: var(--space-4);
  border-top: 1px solid var(--border-primary);
  background: var(--surface-hover);
}

.results-btn {
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

.results-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.results-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

/* Keywords */
.keywords-container {
  padding: var(--space-5);
}

.keywords-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.keyword-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--surface);
}

.keyword-item:hover {
  background: var(--surface-hover);
}

.keyword-item.selected {
  background: color-mix(in srgb, var(--lina-orange) 10%, transparent);
  border-color: var(--lina-orange);
}

.keyword-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.keyword-text {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.keyword-type {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.keyword-confidence {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--success);
}

.keywords-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.keywords-btn {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.keywords-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.keywords-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

/* Results */
.results-container {
  padding: var(--space-5);
}

.results-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.results-filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-5);
  padding: var(--space-4);
  background: var(--surface-hover);
  border-radius: var(--radius-md);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  color: var(--text-primary);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.result-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--surface);
}

.result-item:hover {
  background: var(--surface-hover);
  border-color: var(--lina-orange);
  transform: translateY(-1px);
}

.result-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-width: 80px;
}

.result-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: var(--surface-hover);
  border-radius: var(--radius-lg);
  color: var(--lina-orange);
}

.result-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-xs);
  text-align: center;
}

.result-type {
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.result-relevance {
  color: var(--success);
  font-weight: var(--fw-semibold);
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.result-description {
  color: var(--text-secondary);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--lh-relaxed);
}

.result-highlights {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.highlight-tag {
  background: color-mix(in srgb, var(--lina-yellow) 20%, transparent);
  color: var(--lina-orange);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

.result-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.result-action-btn {
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
  white-space: nowrap;
}

.result-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.result-action-btn.primary {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

/* Help Section */
.help-content {
  padding: var(--space-5);
}

.help-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.help-category h4 {
  margin: 0 0 var(--space-3) 0;
  color: var(--text-primary);
}

.help-category ul {
  margin: 0;
  padding-left: var(--space-5);
  list-style: none;
}

.help-category li {
  position: relative;
  margin-bottom: var(--space-2);
  color: var(--text-secondary);
  font-style: italic;
}

.help-category li::before {
  content: '"';
  position: absolute;
  left: -20px;
  color: var(--lina-orange);
  font-size: var(--fs-lg);
}

.help-category li::after {
  content: '"';
  color: var(--lina-orange);
  font-size: var(--fs-lg);
}

/* History */
.history-list {
  max-height: 400px;
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

.history-query {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
  color: var(--text-primary);
}

.history-keywords {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-2);
}

.history-keyword {
  background: var(--surface-hover);
  color: var(--text-secondary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
}

.keyword-more {
  background: var(--lina-orange);
  color: white;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

.history-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
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
  max-height: 600px;
  opacity: 1;
}

/* Responsive */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .help-categories {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: flex-start;
  }
  
  .keywords-list {
    grid-template-columns: 1fr;
  }
  
  .results-filters {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .result-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .result-actions {
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }
  
  .file-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .player-controls {
    flex-direction: column;
    gap: var(--space-3);
  }
  
  .processing-status {
    flex-direction: column;
    text-align: center;
  }
}
</style>