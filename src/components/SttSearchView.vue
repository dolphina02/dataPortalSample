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
              <span class="history-time">{{ formatTime(item.timestamp) }}</span>
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
const isListening = ref(false)
const transcript = ref('')
const transcriptConfidence = ref(0)
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

// Speech Recognition
let recognition = null

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

// Methods
const initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = selectedLanguage.value
    
    recognition.onstart = () => {
      isListening.value = true
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let confidence = 0
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
          confidence = Math.round(result[0].confidence * 100)
        }
      }
      
      if (finalTranscript) {
        transcript.value = finalTranscript
        transcriptConfidence.value = confidence
        extractKeywords(finalTranscript)
      }
    }
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false
    }
    
    recognition.onend = () => {
      isListening.value = false
    }
  }
}

const toggleListening = () => {
  if (!recognition) {
    alert('음성 인식이 지원되지 않는 브라우저입니다.')
    return
  }
  
  if (isListening.value) {
    recognition.stop()
  } else {
    recognition.lang = selectedLanguage.value
    recognition.start()
  }
}

const clearTranscript = () => {
  transcript.value = ''
  transcriptConfidence.value = 0
  extractedKeywords.value = []
  selectedKeywords.value = []
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
  performSearch(transcript.value, extractedKeywords.value.map(k => k.text))
}

const searchWithKeywords = () => {
  performSearch(transcript.value, selectedKeywords.value)
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
  if (transcript.value) {
    extractKeywords(transcript.value)
  }
}

const copyTranscript = async () => {
  try {
    await navigator.clipboard.writeText(transcript.value)
    // Show toast notification
  } catch (err) {
    console.error('Failed to copy transcript:', err)
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
  transcript.value = item.transcript
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

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}

// Lifecycle
onMounted(() => {
  initSpeechRecognition()
})

onUnmounted(() => {
  if (recognition && isListening.value) {
    recognition.stop()
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
.voice-input-section,
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

/* Voice Input */
.voice-input-container {
  padding: var(--space-5);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.voice-visualizer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--surface-hover);
  transition: var(--transition-fast);
}

.voice-visualizer.active {
  border-color: var(--lina-orange);
  background: color-mix(in srgb, var(--lina-orange) 5%, transparent);
}

.visualizer-bars {
  display: flex;
  align-items: end;
  gap: 3px;
  height: 60px;
  margin-bottom: var(--space-4);
}

.visualizer-bar {
  width: 4px;
  background: var(--lina-orange);
  border-radius: 2px;
  transition: height 0.3s ease;
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0%, 100% {
    transform: scaleY(0.3);
  }
  50% {
    transform: scaleY(1);
  }
}

.voice-status {
  text-align: center;
  color: var(--text-secondary);
}

.status-idle,
.status-listening,
.status-complete {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.listening-animation {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid var(--lina-orange);
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
}

.pulse-ring:nth-child(2) {
  animation-delay: 0.7s;
}

.pulse-ring:nth-child(3) {
  animation-delay: 1.4s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Transcript */
.transcript-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.transcript-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transcript-header h4 {
  margin: 0;
  color: var(--text-primary);
}

.transcript-confidence {
  font-size: var(--fs-sm);
  color: var(--success);
  font-weight: var(--fw-semibold);
}

.transcript-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.transcript-text {
  width: 100%;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  font-size: var(--fs-base);
  line-height: var(--lh-relaxed);
  resize: vertical;
  background: var(--surface);
  color: var(--text-primary);
}

.transcript-text:focus {
  outline: none;
  border-color: var(--lina-orange);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lina-orange) 20%, transparent);
}

.transcript-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.transcript-btn {
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

.transcript-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.transcript-btn.primary {
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
@media (max-width: 1024px) {
  .voice-input-container {
    grid-template-columns: 1fr;
  }
  
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
}
</style>