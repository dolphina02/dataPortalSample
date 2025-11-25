<template>
  <div class="customer-journey-view">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">고객 여정 타임라인</h1>
          <p class="page-subtitle">고객과의 모든 접점을 시간 흐름에 따라 확인하세요</p>
        </div>
        <div class="header-actions">
          <select v-model="selectedCustomer" class="customer-select">
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }} ({{ customer.policyNumber }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Customer Info Card -->
    <div class="customer-info-card">
      <div class="customer-avatar-container">
        <div class="customer-avatar-grid">
          <div class="avatar-quadrant top-left">
            <div class="quadrant-value">{{ currentCustomer?.gender }}</div>
          </div>
          <div class="avatar-quadrant top-right">
            <div class="quadrant-value">{{ currentCustomer?.age }}</div>
          </div>
          <div class="avatar-quadrant bottom-left">
            <div class="quadrant-value">{{ currentCustomer?.location }}</div>
          </div>
          <div class="avatar-quadrant bottom-right">
            <div class="quadrant-value membership-period">
              <span class="years">{{ currentCustomer?.membershipYears?.split('년')[0] }}년</span>
              <span class="months">{{ currentCustomer?.membershipYears?.split('년')[1] }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="customer-details">
        <h3>{{ currentCustomer?.name }}</h3>
        <div class="customer-meta">
          <span class="meta-item">
            <IconSystem name="file-text" :size="14" />
            {{ currentCustomer?.policyNumber }}
          </span>
          <span class="meta-item">
            <IconSystem name="calendar" :size="14" />
            가입일: {{ currentCustomer?.joinDate }}
          </span>
          <span class="meta-item">
            <IconSystem name="shield" :size="14" />
            {{ currentCustomer?.productType }}
          </span>
        </div>
      </div>
      <div class="customer-stats">
        <div class="stat-box">
          <div class="stat-value">{{ displayedEvents.length }}</div>
          <div class="stat-label">총 접점</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ formatCurrency(totalPremium) }}</div>
          <div class="stat-detail">(평균 {{ formatCurrency(averageMonthlyPremium) }}/월)</div>
          <div class="stat-label">총 납입 보험료</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">{{ formatCurrency(totalClaim) }}</div>
          <div class="stat-detail">(평균 {{ formatCurrency(averageClaim) }}, {{ claimCount }}회)</div>
          <div class="stat-label">총 청구 금액</div>
        </div>
        <div class="stat-box" :class="{ positive: claimRatio > 0 }">
          <div class="stat-value">{{ claimRatio }}%</div>
          <div class="stat-label">청구율</div>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="filter-controls">
      <div class="filter-group">
        <span class="filter-group-label">레인:</span>
        <button 
          class="filter-btn lane-filter" 
          :class="{ active: !hideLanes.income }"
          @click="hideLanes.income = !hideLanes.income"
        >
          Income
        </button>
        <button 
          class="filter-btn lane-filter" 
          :class="{ active: !hideLanes.communication }"
          @click="hideLanes.communication = !hideLanes.communication"
        >
          Contact
        </button>
        <button 
          class="filter-btn lane-filter" 
          :class="{ active: !hideLanes.outcome }"
          @click="hideLanes.outcome = !hideLanes.outcome"
        >
          Outcome
        </button>
      </div>

      <div class="filter-group">
        <span class="filter-group-label">기간:</span>
        <button 
          class="filter-btn" 
          :class="{ active: periodFilter === 'all' }"
          @click="periodFilter = 'all'"
        >
          전체 기간
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: periodFilter === '3y' }"
          @click="periodFilter = '3y'"
        >
          최근 3년
        </button>
      </div>
      
      <div class="zoom-control">
        <IconSystem name="zoom-out" :size="16" />
        <input 
          type="range" 
          v-model.number="zoomLevel" 
          min="100" 
          max="300" 
          step="10"
          class="zoom-slider"
        />
        <IconSystem name="zoom-in" :size="16" />
        <span class="zoom-label">{{ zoomLevel }}%</span>
      </div>
    </div>

    <!-- Timeline -->
    <div class="timeline-wrapper">
      <div class="timeline-container" ref="timelineContainer" :style="{ '--timeline-width': timelineWidth + 'px' }">
        <div class="timeline-track">
          <!-- Year Background Sections -->
          <div 
            v-for="(section, index) in yearSections" 
            :key="section.year"
            class="year-section"
            :class="{ alternate: index % 2 === 1 }"
            :style="{ left: section.start + 'px', width: section.width + 'px' }"
          >
          </div>
          
          <!-- Timeline Lines with Labels -->
          <div v-if="!hideLanes.income" class="timeline-line income-line">
            <div class="lane-label-inline">Income</div>
          </div>
          <div v-if="!hideLanes.communication" class="timeline-line communication-line">
            <div class="lane-label-inline">Contact</div>
          </div>
          <div v-if="!hideLanes.outcome" class="timeline-line outcome-line">
            <div class="lane-label-inline">Outcome</div>
          </div>
          
          <!-- Lane Backgrounds -->
          <div v-if="!hideLanes.income" class="lane-background income-background"></div>
          <div v-if="!hideLanes.communication" class="lane-background communication-background"></div>
          <div v-if="!hideLanes.outcome" class="lane-background outcome-background"></div>
          
          <!-- Year Markers -->
          <div 
            v-for="year in yearMarkers" 
            :key="year.year"
            class="year-marker"
            :style="{ left: year.position + 'px' }"
          >
            <div class="year-line"></div>
            <div class="year-label">{{ year.year }}년</div>
          </div>
          
          <!-- Inactive Period Indicators -->
          <div 
            v-for="(gap, index) in inactiveGaps" 
            :key="'gap-' + index"
            class="inactive-gap"
            :style="{ 
              left: gap.start + 'px',
              width: gap.width + 'px'
            }"
          >
            <div class="gap-label">{{ gap.duration }}일</div>
          </div>

          <!-- Contract Event (Fixed) -->
          <div 
            v-if="contractEvent"
            class="timeline-event contract-fixed"
            :class="{ active: selectedEvent?.id === contractEvent.id }"
            @click="selectEvent(contractEvent)"
            @mouseenter="handleEventHover($event, contractEvent)"
            @mouseleave="hoveredEvent = null"
          >
            <div class="event-point contract">
              <IconSystem :name="getEventIcon('contract')" :size="12" />
            </div>
            <div class="event-date-box">{{ formatShortDate(contractEvent.date) }}</div>
          </div>

          <!-- Events -->
          <div 
            v-for="(event, index) in displayedEvents" 
            :key="event.id"
            :ref="el => { if (event.id === displayedEvents[displayedEvents.length - 1]?.id) latestEventRef = el }"
            class="timeline-event"
            :class="[
              { active: selectedEvent?.id === event.id },
              getEventLane(event.type)
            ]"
            :style="{ 
              left: getEventPosition(event, index) + 'px',
              zIndex: 100 + index
            }"
            @click="selectEvent(event)"
            @mouseenter="handleEventHover($event, event)"
            @mouseleave="hoveredEvent = null"
          >
            <div class="event-point" :class="event.type">
              <IconSystem 
                :name="getEventIcon(event.type)" 
                :size="event.type === 'payment' ? 6 : 14" 
              />
            </div>
            <div class="event-date-box">{{ formatShortDate(event.date) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Global Tooltip -->
    <div 
      v-if="hoveredEvent" 
      class="event-tooltip visible"
      :style="tooltipStyle"
    >
      <div class="tooltip-header">
        <div class="tooltip-type-badge" :class="hoveredEvent.type">
          {{ getEventTypeLabel(hoveredEvent.type) }}
        </div>
        <div class="tooltip-date">{{ formatDate(hoveredEvent.date) }}</div>
      </div>
      <div class="tooltip-title">{{ hoveredEvent.title }}</div>
      <div class="tooltip-description">{{ hoveredEvent.description }}</div>
      <div class="tooltip-hint">클릭하여 상세 정보 보기</div>
    </div>

    <!-- Event Detail Panel -->
    <div v-if="selectedEvent" class="detail-panel">
      <div class="detail-panel-header">
        <div class="detail-title-section">
          <div class="event-type-badge large" :class="selectedEvent.type">
            <IconSystem :name="getEventIcon(selectedEvent.type)" :size="20" />
            {{ getEventTypeLabel(selectedEvent.type) }}
          </div>
          <h3 class="detail-panel-title">{{ selectedEvent.title }}</h3>
        </div>
        <button class="close-btn" @click="closeEventDetail">
          <IconSystem name="x" :size="20" />
        </button>
      </div>
      
      <div class="detail-panel-body">
        <div class="detail-section">
          <h4>기본 정보</h4>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-key">일시</span>
              <span class="detail-value">{{ formatDateTime(selectedEvent.date) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-key">채널</span>
              <span class="detail-value">{{ selectedEvent.channel || '웹사이트' }}</span>
            </div>
            <div v-if="selectedEvent.agent" class="detail-row">
              <span class="detail-key">담당자</span>
              <span class="detail-value">{{ selectedEvent.agent }}</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>상세 내용</h4>
          <p class="detail-description">{{ selectedEvent.description }}</p>
          
          <div v-if="selectedEvent.details" class="detail-grid">
            <div v-for="(value, key) in selectedEvent.details" :key="key" class="detail-row">
              <span class="detail-key">{{ key }}</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>
        </div>
        
        <div v-if="selectedEvent.notes" class="detail-section">
          <h4>메모</h4>
          <p class="detail-notes">{{ selectedEvent.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import IconSystem from './IconSystem.vue'

// Reactive state
const selectedCustomer = ref('cust_001')
const selectedEvent = ref(null)
const timelineContainer = ref(null)
const latestEventRef = ref(null)
const hideLanes = ref({
  income: false,
  communication: false,
  outcome: false
})
const hoveredEvent = ref(null)
const tooltipStyle = ref({})
const zoomLevel = ref(100)
const periodFilter = ref('all')

// Event types configuration
const eventTypes = [
  { id: 'web', label: '웹 방문', icon: 'globe' },
  { id: 'contact', label: '통화', icon: 'phone' },
  { id: 'email', label: '이메일', icon: 'mail' },
  { id: 'claim', label: '청구', icon: 'file-text' },
  { id: 'payment', label: '납입', icon: 'credit-card' },
  { id: 'contract', label: '계약', icon: 'file' },
  { id: 'upsell', label: '상향판매', icon: 'trending-up' }
]

// Sample customers
const customers = [
  { 
    id: 'cust_001', 
    name: '김철수', 
    policyNumber: 'POL-2015-001234',
    joinDate: '2015-03-15',
    productType: '종합보험',
    gender: '남성',
    age: '60대',
    location: '서울시',
    membershipYears: '10년3개월'
  },
  { 
    id: 'cust_002', 
    name: '이영희', 
    policyNumber: 'POL-2022-005678',
    joinDate: '2022-08-20',
    productType: '건강보험',
    gender: '여성',
    age: '40대',
    location: '부산시',
    membershipYears: '3년'
  }
]

// Sample events data
const customerEvents = {
  cust_001: [
    // 2015년 - 가입
    {
      id: 'evt_001',
      type: 'web',
      title: '웹사이트 방문',
      description: '보험 상품 페이지 조회',
      date: '2015-02-10T10:30:00',
      channel: '웹사이트',
      details: {
        '페이지': '종합보험 상품 안내',
        '체류시간': '5분 23초',
        'IP': '192.168.1.100'
      }
    },
    {
      id: 'evt_002',
      type: 'contact',
      title: '상담 전화',
      description: '보험 상품 문의 및 가입 상담',
      date: '2015-03-10T14:20:00',
      channel: '전화',
      agent: '박상담',
      status: 'completed',
      details: {
        '통화시간': '15분 32초',
        '상담내용': '종합보험 가입 문의',
        '결과': '가입 의향 확인'
      }
    },
    {
      id: 'evt_003',
      type: 'contract',
      title: '보험 계약 체결',
      description: '종합보험 신규 가입',
      date: '2015-03-15T11:00:00',
      channel: '지점 방문',
      agent: '김설계사',
      status: 'completed',
      details: {
        '상품명': '라이나 종합보험',
        '보험료': '월 150,000원',
        '보장기간': '20년'
      }
    },
    // 2015-2017년 납입 (매월)
    {
      id: 'evt_004',
      type: 'payment',
      title: '보험료 납입',
      description: '4월 보험료 자동이체',
      date: '2015-04-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체',
        '계좌': '국민은행 ***-***-****'
      }
    },
    {
      id: 'evt_005',
      type: 'payment',
      title: '보험료 납입',
      description: '5월 보험료 자동이체',
      date: '2023-05-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_006',
      type: 'payment',
      title: '보험료 납입',
      description: '6월 보험료 자동이체',
      date: '2023-06-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_007',
      type: 'web',
      title: '마이페이지 접속',
      description: '보험 계약 내역 조회',
      date: '2023-08-15T16:45:00',
      channel: '모바일 앱',
      details: {
        '조회내용': '계약 상세 정보',
        '체류시간': '3분 12초'
      }
    },
    {
      id: 'evt_008',
      type: 'payment',
      title: '보험료 납입',
      description: '9월 보험료 자동이체',
      date: '2023-09-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_009',
      type: 'email',
      title: '이메일 발송',
      description: '연말 보험료 납입 안내',
      date: '2023-11-25T10:00:00',
      channel: '이메일',
      status: 'sent',
      details: {
        '제목': '12월 보험료 납입 안내',
        '발송시간': '2023-11-25 10:00',
        '열람여부': '확인'
      }
    },
    {
      id: 'evt_010',
      type: 'payment',
      title: '보험료 납입',
      description: '12월 보험료 자동이체',
      date: '2023-12-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_011',
      type: 'payment',
      title: '보험료 납입',
      description: '1월 보험료 자동이체',
      date: '2024-01-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_012',
      type: 'payment',
      title: '보험료 납입',
      description: '2월 보험료 자동이체',
      date: '2024-02-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_013',
      type: 'claim',
      title: '보험금 청구',
      description: '입원 치료비 청구',
      date: '2024-03-10T13:30:00',
      channel: '모바일 앱',
      status: 'processing',
      details: {
        '청구금액': '2,500,000원',
        '청구사유': '입원 치료',
        '입원기간': '2024-03-05 ~ 2024-03-08'
      },
      notes: '서류 검토 중입니다. 영업일 기준 3일 내 처리 예정입니다.'
    },
    {
      id: 'evt_014',
      type: 'contact',
      title: '청구 진행 문의',
      description: '보험금 청구 진행 상황 문의',
      date: '2024-03-15T11:20:00',
      channel: '전화',
      agent: '최상담',
      status: 'completed',
      details: {
        '통화시간': '8분 15초',
        '문의내용': '청구 진행 상황',
        '답변': '서류 검토 완료, 지급 예정'
      }
    },
    {
      id: 'evt_015',
      type: 'claim',
      title: '보험금 지급 완료',
      description: '입원 치료비 지급',
      date: '2024-03-18T14:00:00',
      channel: '계좌이체',
      status: 'completed',
      details: {
        '지급금액': '2,300,000원',
        '지급일': '2024-03-18',
        '계좌': '국민은행 ***-***-****'
      }
    },
    {
      id: 'evt_016',
      type: 'upsell',
      title: '추가 보장 제안',
      description: '암보험 추가 가입 제안',
      date: '2024-03-25T15:30:00',
      channel: '전화',
      agent: '김설계사',
      status: 'pending',
      details: {
        '제안상품': '암보험 특약',
        '추가보험료': '월 50,000원',
        '고객반응': '검토 중'
      },
      notes: '고객이 가족과 상의 후 결정하겠다고 함. 1주일 후 재연락 예정.'
    },
    {
      id: 'evt_017',
      type: 'web',
      title: '암보험 상품 조회',
      description: '암보험 특약 상세 정보 확인',
      date: '2024-03-28T20:15:00',
      channel: '모바일 앱',
      details: {
        '조회상품': '암보험 특약',
        '체류시간': '12분 45초',
        '비교상품': '3개'
      }
    },
    {
      id: 'evt_018',
      type: 'payment',
      title: '보험료 납입',
      description: '6월 보험료 자동이체',
      date: '2024-06-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_019',
      type: 'contact',
      title: '정기 상담',
      description: '계약 1년 경과 정기 상담',
      date: '2024-09-10T14:00:00',
      channel: '전화',
      agent: '김설계사',
      status: 'completed',
      details: {
        '통화시간': '12분 30초',
        '상담내용': '계약 만족도 조사',
        '결과': '만족'
      }
    },
    {
      id: 'evt_020',
      type: 'payment',
      title: '보험료 납입',
      description: '12월 보험료 자동이체',
      date: '2024-12-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    {
      id: 'evt_021',
      type: 'payment',
      title: '보험료 납입',
      description: '1월 보험료 자동이체',
      date: '2025-01-01T09:00:00',
      channel: '자동이체',
      status: 'completed',
      details: {
        '납입금액': '150,000원',
        '납입방법': '자동이체'
      }
    },
    // 2017년 - 첫 청구
    {
      id: 'evt_030',
      type: 'claim',
      title: '보험금 청구',
      description: '외래 진료비 청구',
      date: '2017-06-15T14:00:00',
      channel: '지점 방문',
      status: 'completed',
      details: {
        '청구금액': '500,000원',
        '청구사유': '외래 진료',
        '지급금액': '450,000원'
      }
    },
    // 2018년 - 정기 상담
    {
      id: 'evt_031',
      type: 'contact',
      title: '정기 상담',
      description: '계약 3년 경과 정기 상담',
      date: '2018-03-20T15:00:00',
      channel: '전화',
      agent: '김설계사',
      status: 'completed',
      details: {
        '통화시간': '10분 20초',
        '상담내용': '계약 만족도 조사'
      }
    },
    // 2019년 - 추가 보장
    {
      id: 'evt_032',
      type: 'upsell',
      title: '추가 보장 가입',
      description: '암보험 특약 추가',
      date: '2019-05-10T11:00:00',
      channel: '지점 방문',
      agent: '김설계사',
      status: 'completed',
      details: {
        '추가상품': '암보험 특약',
        '추가보험료': '월 50,000원'
      }
    },
    // 2020년 - 대규모 청구
    {
      id: 'evt_033',
      type: 'claim',
      title: '보험금 청구',
      description: '수술비 청구',
      date: '2020-08-20T10:00:00',
      channel: '모바일 앱',
      status: 'completed',
      details: {
        '청구금액': '5,000,000원',
        '청구사유': '수술 및 입원',
        '지급금액': '4,800,000원'
      }
    },
    // 2021년 - 웹 방문
    {
      id: 'evt_034',
      type: 'web',
      title: '마이페이지 접속',
      description: '보험 계약 내역 조회',
      date: '2021-03-15T16:30:00',
      channel: '모바일 앱',
      details: {
        '조회내용': '계약 상세 정보',
        '체류시간': '5분 30초'
      }
    },
    // 2016년 - 청약철회 (다른 고객 사례)
    {
      id: 'evt_036',
      type: 'cancellation',
      title: '청약철회',
      description: '가입 후 7일 이내 청약철회',
      date: '2016-08-10T14:00:00',
      channel: '전화',
      status: 'completed',
      details: {
        '철회사유': '고객 변심',
        '환불금액': '150,000원'
      }
    },
    // 2018년 - 심사거절 (추가 보장 신청)
    {
      id: 'evt_037',
      type: 'rejection',
      title: '심사거절',
      description: '건강검진 결과로 인한 추가 보장 거절',
      date: '2018-09-15T11:00:00',
      channel: '우편',
      status: 'completed',
      details: {
        '신청상품': '중증질환 특약',
        '거절사유': '건강검진 결과 부적합'
      }
    },
    // 2022년 - 이메일
    {
      id: 'evt_035',
      type: 'email',
      title: '이메일 발송',
      description: '보험료 인상 안내',
      date: '2022-11-01T10:00:00',
      channel: '이메일',
      status: 'sent',
      details: {
        '제목': '2023년 보험료 조정 안내',
        '열람여부': '확인'
      }
    },
    {
      id: 'evt_022',
      type: 'web',
      title: '마이페이지 접속',
      description: '보험 계약 내역 조회',
      date: '2025-01-15T10:20:00',
      channel: '모바일 앱',
      details: {
        '조회내용': '계약 상세 정보',
        '체류시간': '4분 10초'
      }
    }
  ]
}

// Computed
const currentCustomer = computed(() => {
  return customers.find(c => c.id === selectedCustomer.value)
})

const allEvents = computed(() => {
  return customerEvents[selectedCustomer.value] || []
})

const contractEvent = computed(() => {
  const events = [...allEvents.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  return events.find(e => e.type === 'contract')
})

const sortedEvents = computed(() => {
  let events = [...allEvents.value].sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // 계약 이벤트는 항상 별도 표시
  events = events.filter(e => e.type !== 'contract')
  
  // 기간 필터 적용
  if (periodFilter.value === '3y' && events.length > 0) {
    const firstDate = new Date(events[0].date)
    const lastDate = new Date(events[events.length - 1].date)
    const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365)
    
    // Case 1: 전체 기간이 3년 초과 → 첫 년도 + 최근 3년
    if (totalYears > 3) {
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
      
      const firstYear = firstDate.getFullYear()
      const firstYearEnd = new Date(firstYear + 1, 0, 1)
      
      // 첫 년도 이벤트
      const firstYearEvents = events.filter(e => {
        const eventDate = new Date(e.date)
        return eventDate >= firstDate && eventDate < firstYearEnd
      })
      
      // 최근 3년 이벤트
      const recentEvents = events.filter(e => new Date(e.date) >= threeYearsAgo)
      
      // 중복 제거하고 합치기
      const eventIds = new Set()
      events = [...firstYearEvents, ...recentEvents].filter(e => {
        if (eventIds.has(e.id)) return false
        eventIds.add(e.id)
        return true
      })
      
      // 날짜순 정렬
      events.sort((a, b) => new Date(a.date) - new Date(b.date))
    }
    // Case 2: 전체 기간이 3년 이하 → 전체 표시 (필터링 안함)
  }
  
  return events
})

const displayedEvents = computed(() => {
  return sortedEvents.value.filter(event => {
    const lane = getEventLane(event.type)
    if (lane === 'income-lane' && hideLanes.value.income) return false
    if (lane === 'communication-lane' && hideLanes.value.communication) return false
    if (lane === 'outcome-lane' && hideLanes.value.outcome) return false
    return true
  })
})

const totalPremium = computed(() => {
  return allEvents.value
    .filter(e => e.type === 'payment')
    .reduce((sum, e) => {
      const amount = e.details?.['납입금액']?.replace(/[^0-9]/g, '') || '0'
      return sum + parseInt(amount)
    }, 0)
})

const totalClaim = computed(() => {
  return allEvents.value
    .filter(e => e.type === 'claim' && e.status === 'completed')
    .reduce((sum, e) => {
      const amount = e.details?.['지급금액']?.replace(/[^0-9]/g, '') || '0'
      return sum + parseInt(amount)
    }, 0)
})

const claimRatio = computed(() => {
  if (totalPremium.value === 0) return 0
  return Math.round((totalClaim.value / totalPremium.value) * 100)
})

const claimCount = computed(() => {
  return allEvents.value.filter(e => e.type === 'claim' && e.status === 'completed').length
})

const averageClaim = computed(() => {
  if (claimCount.value === 0) return 0
  return Math.round(totalClaim.value / claimCount.value)
})

const averageMonthlyPremium = computed(() => {
  const paymentCount = allEvents.value.filter(e => e.type === 'payment').length
  if (paymentCount === 0) return 0
  return Math.round(totalPremium.value / paymentCount)
})

const contractPosition = computed(() => {
  if (!contractEvent.value) return null
  
  // 계약은 항상 고정 위치 (25px)
  return 25
})

const inactiveGaps = computed(() => {
  const gaps = []
  const contactEvents = sortedEvents.value.filter(e => e.type !== 'payment')
  
  if (contactEvents.length < 2) return gaps
  
  const firstDate = new Date(sortedEvents.value[0].date)
  const lastDate = new Date(sortedEvents.value[sortedEvents.value.length - 1].date)
  const totalDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24)
  
  for (let i = 0; i < contactEvents.length - 1; i++) {
    const currentDate = new Date(contactEvents[i].date)
    const nextDate = new Date(contactEvents[i + 1].date)
    const gapDays = (nextDate - currentDate) / (1000 * 60 * 60 * 24)
    
    if (gapDays > 90) { // 3개월 이상
      const startDays = (currentDate - firstDate) / (1000 * 60 * 60 * 24)
      const endDays = (nextDate - firstDate) / (1000 * 60 * 60 * 24)
      
      const startPercentage = totalDays > 0 ? startDays / totalDays : 0
      const endPercentage = totalDays > 0 ? endDays / totalDays : 0
      
      const startPos = 120 + (startPercentage * timelineWidth.value)
      const endPos = 120 + (endPercentage * timelineWidth.value)
      
      gaps.push({
        start: startPos,
        width: endPos - startPos,
        duration: Math.round(gapDays)
      })
    }
  }
  
  return gaps
})

const baseTimelineWidth = ref(1200) // 기본 타임라인 너비 (px)

const timelineWidth = computed(() => {
  return baseTimelineWidth.value * (zoomLevel.value / 100)
})

// 컨테이너 크기에 맞춰 타임라인 너비 조정
const updateTimelineWidth = () => {
  if (timelineContainer.value) {
    const containerWidth = timelineContainer.value.clientWidth
    // 컨테이너 너비에서 여백을 뺀 값을 기본 너비로 설정
    baseTimelineWidth.value = Math.max(1200, containerWidth - 200)
  }
}

onMounted(() => {
  updateTimelineWidth()
  window.addEventListener('resize', updateTimelineWidth)
  scrollToLatest()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTimelineWidth)
})

const yearMarkers = computed(() => {
  if (displayedEvents.value.length === 0) return []
  
  const allSortedEvents = [...allEvents.value]
    .filter(e => e.type !== 'contract')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  if (allSortedEvents.length === 0) return []
  
  const firstDate = new Date(allSortedEvents[0].date)
  const lastDate = new Date(allSortedEvents[allSortedEvents.length - 1].date)
  const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365)
  
  // 연도 수집
  const years = new Set()
  displayedEvents.value.forEach(event => {
    const year = new Date(event.date).getFullYear()
    years.add(year)
  })
  
  const markers = []
  const sortedYears = Array.from(years).sort((a, b) => a - b)
  
  // Case 1: 최근 3년 필터 + 전체 기간이 3년 초과 → 4등분 배치
  if (periodFilter.value === '3y' && totalYears > 3) {
    const firstYear = firstDate.getFullYear()
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    const recentStartYear = threeYearsAgo.getFullYear()
    
    sortedYears.forEach(year => {
      if (year === firstYear) {
        // 첫 년도는 0% 위치
        markers.push({
          year,
          position: 120
        })
      } else if (year >= recentStartYear) {
        // 최근 3년은 25% ~ 100% 사이에 배치
        const recentYears = sortedYears.filter(y => y >= recentStartYear).sort((a, b) => a - b)
        const yearIndex = recentYears.indexOf(year)
        const totalRecentYears = recentYears.length
        const percentage = totalRecentYears > 1 ? yearIndex / (totalRecentYears - 1) : 0
        markers.push({
          year,
          position: 120 + (timelineWidth.value * 0.25) + (percentage * timelineWidth.value * 0.75)
        })
      }
    })
  } else {
    // Case 2: 일반 배치
    const sortedDisplayed = [...displayedEvents.value].sort((a, b) => new Date(a.date) - new Date(b.date))
    const firstDate2 = new Date(sortedDisplayed[0].date)
    const lastDate2 = new Date(sortedDisplayed[sortedDisplayed.length - 1].date)
    const totalDays = (lastDate2 - firstDate2) / (1000 * 60 * 60 * 24)
    
    sortedYears.forEach(year => {
      const yearDate = new Date(year, 0, 1)
      const daysDiff = Math.max(0, (yearDate - firstDate2) / (1000 * 60 * 60 * 24))
      const percentage = totalDays > 0 ? daysDiff / totalDays : 0
      
      markers.push({
        year,
        position: 120 + (percentage * timelineWidth.value)
      })
    })
  }
  
  return markers
})

const yearSections = computed(() => {
  if (displayedEvents.value.length === 0) return []
  
  const allSortedEvents = [...allEvents.value]
    .filter(e => e.type !== 'contract')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  if (allSortedEvents.length === 0) return []
  
  const firstDate = new Date(allSortedEvents[0].date)
  const lastDate = new Date(allSortedEvents[allSortedEvents.length - 1].date)
  const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365)
  
  // 연도 수집
  const years = new Set()
  displayedEvents.value.forEach(event => {
    const year = new Date(event.date).getFullYear()
    years.add(year)
  })
  
  const sortedYears = Array.from(years).sort((a, b) => a - b)
  const sections = []
  
  // Case 1: 최근 3년 필터 + 전체 기간이 3년 초과 → 4등분 배치
  if (periodFilter.value === '3y' && totalYears > 3) {
    const firstYear = firstDate.getFullYear()
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    const recentStartYear = threeYearsAgo.getFullYear()
    
    sortedYears.forEach((year, index) => {
      if (year === firstYear) {
        // 첫 년도: 0% ~ 25%
        sections.push({
          year,
          start: 120,
          width: timelineWidth.value * 0.25
        })
      } else if (year >= recentStartYear) {
        // 최근 3년: 25% ~ 100%를 균등 분할
        const recentYears = sortedYears.filter(y => y >= recentStartYear).sort((a, b) => a - b)
        const yearIndex = recentYears.indexOf(year)
        const totalRecentYears = recentYears.length
        const sectionWidth = (timelineWidth.value * 0.75) / totalRecentYears
        const startPos = 120 + (timelineWidth.value * 0.25) + (yearIndex * sectionWidth)
        
        sections.push({
          year,
          start: startPos,
          width: sectionWidth
        })
      }
    })
  } else {
    // Case 2: 일반 배치
    const sortedDisplayed = [...displayedEvents.value].sort((a, b) => new Date(a.date) - new Date(b.date))
    const firstDate2 = new Date(sortedDisplayed[0].date)
    const lastDate2 = new Date(sortedDisplayed[sortedDisplayed.length - 1].date)
    const totalDays = (lastDate2 - firstDate2) / (1000 * 60 * 60 * 24)
    
    sortedYears.forEach((year, index) => {
      const yearStart = new Date(year, 0, 1)
      const yearEnd = index < sortedYears.length - 1 
        ? new Date(sortedYears[index + 1], 0, 1)
        : new Date(lastDate2.getTime() + 24 * 60 * 60 * 1000)
      
      const startDays = Math.max(0, (yearStart - firstDate2) / (1000 * 60 * 60 * 24))
      const endDays = (yearEnd - firstDate2) / (1000 * 60 * 60 * 24)
      
      const startPercentage = totalDays > 0 ? startDays / totalDays : 0
      const endPercentage = totalDays > 0 ? endDays / totalDays : 1
      
      const startPos = 120 + (startPercentage * timelineWidth.value)
      const endPos = 120 + (endPercentage * timelineWidth.value)
      
      sections.push({
        year,
        start: startPos,
        width: endPos - startPos
      })
    })
  }
  
  return sections
})

// Methods
const getEventPosition = (event, index) => {
  if (displayedEvents.value.length === 0) return 25
  
  const allSortedEvents = [...allEvents.value]
    .filter(e => e.type !== 'contract')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
  
  if (allSortedEvents.length === 0) return 25
  
  const firstDate = new Date(allSortedEvents[0].date)
  const lastDate = new Date(allSortedEvents[allSortedEvents.length - 1].date)
  const eventDate = new Date(event.date)
  const totalYears = (lastDate - firstDate) / (1000 * 60 * 60 * 24 * 365)
  
  // Case 1: 최근 3년 필터 + 전체 기간이 3년 초과 → 4등분 배치
  if (periodFilter.value === '3y' && totalYears > 3) {
    const firstYear = firstDate.getFullYear()
    const firstYearEnd = new Date(firstYear + 1, 0, 1)
    const threeYearsAgo = new Date()
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
    
    // 첫 년도에 속하는지 확인
    if (eventDate >= firstDate && eventDate < firstYearEnd) {
      // 첫 년도: 전체의 1/4 (25%)
      const firstYearDays = (firstYearEnd - firstDate) / (1000 * 60 * 60 * 24)
      const eventDaysInFirstYear = (eventDate - firstDate) / (1000 * 60 * 60 * 24)
      const percentageInFirstYear = firstYearDays > 0 ? eventDaysInFirstYear / firstYearDays : 0
      return 120 + (percentageInFirstYear * timelineWidth.value * 0.25)
    } else if (eventDate >= threeYearsAgo) {
      // 최근 3년: 전체의 3/4 (75%)
      const recentThreeYearsDays = (lastDate - threeYearsAgo) / (1000 * 60 * 60 * 24)
      const eventDaysInRecent = (eventDate - threeYearsAgo) / (1000 * 60 * 60 * 24)
      const percentageInRecent = recentThreeYearsDays > 0 ? eventDaysInRecent / recentThreeYearsDays : 0
      return 120 + (timelineWidth.value * 0.25) + (percentageInRecent * timelineWidth.value * 0.75)
    }
    // 중간 기간은 표시 안됨
    return 25
  }
  
  // Case 2: 전체 기간 또는 3년 이하 → 일반 배치
  const firstDate2 = new Date(sortedEvents.value[0].date)
  const lastDate2 = new Date(sortedEvents.value[sortedEvents.value.length - 1].date)
  const totalDays = (lastDate2 - firstDate2) / (1000 * 60 * 60 * 24)
  const eventDays = (eventDate - firstDate2) / (1000 * 60 * 60 * 24)
  
  const percentage = totalDays > 0 ? eventDays / totalDays : 0
  return 120 + (percentage * timelineWidth.value)
}

const getEventTypeCount = (type) => {
  return allEvents.value.filter(e => e.type === type).length
}

const formatCurrency = (amount) => {
  if (amount === 0) return '0원'
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`
  }
  if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`
  }
  return `${amount.toLocaleString()}원`
}

const getEventLane = (type) => {
  // Income: 가입, 업셀, 보험료 납입
  const incomeTypes = ['contract', 'upsell', 'payment']
  // Outcome: 청구, 반환, 해약
  const outcomeTypes = ['claim', 'cancellation', 'rejection', 'termination']
  // Communication: 전화, 웹, 이메일, 마케팅
  const communicationTypes = ['contact', 'web', 'email']
  
  if (incomeTypes.includes(type)) return 'income-lane'
  if (outcomeTypes.includes(type)) return 'outcome-lane'
  if (communicationTypes.includes(type)) return 'communication-lane'
  return 'communication-lane' // 기본값
}

const getEventIcon = (type) => {
  const icons = {
    web: 'globe',
    contact: 'phone',
    email: 'mail',
    claim: 'file-text',
    payment: 'credit-card',
    contract: 'file',
    upsell: 'trending-up',
    cancellation: 'x-circle',
    rejection: 'alert-circle',
    termination: 'slash'
  }
  return icons[type] || 'circle'
}

const getEventTypeLabel = (type) => {
  const labels = {
    web: '웹 방문',
    contact: '통화',
    email: '이메일',
    claim: '청구',
    payment: '납입',
    contract: '계약',
    upsell: '상향판매',
    cancellation: '청약철회',
    rejection: '심사거절',
    termination: '해지'
  }
  return labels[type] || type
}

const getStatusLabel = (status) => {
  const labels = {
    completed: '완료',
    processing: '처리중',
    pending: '대기',
    sent: '발송됨'
  }
  return labels[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const formatShortDate = (dateString) => {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectEvent = (event) => {
  selectedEvent.value = event
}

const closeEventDetail = () => {
  selectedEvent.value = null
}

const handleEventHover = (mouseEvent, event) => {
  hoveredEvent.value = event
  
  const rect = mouseEvent.currentTarget.getBoundingClientRect()
  const tooltipWidth = 280
  
  tooltipStyle.value = {
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.bottom + 10}px`,
    transform: 'translateX(-50%)'
  }
}

const getEventSize = (type) => {
  // 모든 이벤트 동일 크기
  return 'uniform'
}

const scrollToLatest = () => {
  nextTick(() => {
    if (timelineContainer.value && displayedEvents.value.length > 0) {
      const container = timelineContainer.value
      const lastEvent = displayedEvents.value[displayedEvents.value.length - 1]
      const position = getEventPosition(lastEvent, displayedEvents.value.length - 1)
      
      // 최신 이벤트가 화면 중앙에 오도록 스크롤
      const containerWidth = container.clientWidth
      container.scrollLeft = position - (containerWidth / 2)
    }
  })
}

</script>


<style scoped>
.customer-journey-view {
  padding: var(--space-6);
  max-width: 1800px;
  margin: 0 auto;
}

/* Header */
.page-header {
  margin-bottom: var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
}

.header-info h1 {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.header-info p {
  color: var(--text-secondary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.customer-select,
.time-range-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  color: var(--text-primary);
  font-size: var(--fs-sm);
  cursor: pointer;
}

/* Customer Info Card */
.customer-info-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-6);
}

.customer-avatar-container {
  flex-shrink: 0;
}

.customer-avatar-grid {
  width: 120px;
  height: 120px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  background: var(--border-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.avatar-quadrant {
  background: var(--surface-hover);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
}

.avatar-quadrant.top-left {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.avatar-quadrant.top-right {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.avatar-quadrant.bottom-left {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.avatar-quadrant.bottom-right {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.quadrant-value {
  font-size: 14px;
  font-weight: var(--fw-bold);
  color: white;
  text-align: center;
  line-height: 1.2;
}

.quadrant-value.membership-period {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quadrant-value .years {
  font-size: 14px;
  font-weight: var(--fw-bold);
}

.quadrant-value .months {
  font-size: 11px;
  font-weight: var(--fw-semibold);
}

.customer-details {
  flex: 1;
}

.customer-details h3 {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.customer-meta {
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.customer-stats {
  display: flex;
  gap: var(--space-4);
}

.stat-box {
  text-align: center;
  padding: var(--space-3);
  background: var(--surface-hover);
  border-radius: var(--radius-md);
  min-width: 80px;
}

.stat-value {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--lina-orange);
  margin-bottom: 2px;
}

.stat-detail {
  font-size: 9px;
  color: var(--text-tertiary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
}

.stat-box.positive .stat-value {
  color: var(--success);
}

/* Filter Controls */
.filter-controls {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.filter-group-label {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
}

.filter-btn:hover {
  background: var(--surface-hover);
  border-color: var(--lina-orange);
}

.filter-btn.active {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.filter-btn.lane-filter.active {
  background: var(--lina-orange);
  color: white;
  border-color: var(--lina-orange);
}

.filter-btn.lane-filter:not(.active) {
  opacity: 0.5;
}

/* Zoom Control */
.zoom-control {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.zoom-slider {
  width: 150px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--surface-hover);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.zoom-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--lina-orange);
  cursor: pointer;
  transition: var(--transition-fast);
}

.zoom-slider::-webkit-slider-thumb:hover {
  background: var(--lina-yellow);
  transform: scale(1.2);
}

.zoom-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--lina-orange);
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
}

.zoom-slider::-moz-range-thumb:hover {
  background: var(--lina-yellow);
  transform: scale(1.2);
}

.zoom-label {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

/* Timeline */
.timeline-wrapper {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-2);
  margin-bottom: var(--space-6);
  overflow: visible;
}

.timeline-container {
  position: relative;
  padding: var(--space-6) var(--space-2);
  overflow-x: auto;
  overflow-y: visible;
  scroll-behavior: smooth;
}

.timeline-track {
  position: relative;
  min-height: 280px;
  padding: 100px 0 var(--space-4) 0;
  min-width: calc(150px + var(--timeline-width, 1200px));
  transition: min-width 0.1s ease;
}

/* Year Background Sections */
.year-section {
  position: absolute;
  top: 0;
  bottom: 0;
  background: transparent;
  z-index: 0;
}

.year-section.alternate {
  background: rgba(0, 0, 0, 0.02);
}

.timeline-line {
  position: absolute;
  left: 0;
  width: calc(var(--timeline-width, 1200px) + 120px);
  height: 3px;
  border-radius: 2px;
  z-index: 2;
  transition: width 0.1s ease;
}

.timeline-line.income-line {
  top: 55px;
  background: linear-gradient(to right, #10b981 0%, #10b981 120px, #34d399 100%);
}

.timeline-line.communication-line {
  top: 115px;
  background: linear-gradient(to right, #3b82f6 0%, #3b82f6 120px, #60a5fa 100%);
}

.timeline-line.outcome-line {
  top: 175px;
  background: linear-gradient(to right, #f59e0b 0%, #f59e0b 120px, #fbbf24 100%);
}

.lane-label-inline {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  font-weight: var(--fw-bold);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  z-index: 3;
}

.income-line .lane-label-inline {
  color: #10b981;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.communication-line .lane-label-inline {
  color: #3b82f6;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.outcome-line .lane-label-inline {
  color: #f59e0b;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

/* Lane Backgrounds */
.lane-background {
  position: absolute;
  left: 0;
  right: 0;
  height: 50px;
  z-index: 0;
  pointer-events: none;
}

.lane-background.income-background {
  top: 30px;
  background: rgba(16, 185, 129, 0.05);
}

.lane-background.communication-background {
  top: 90px;
  background: rgba(59, 130, 246, 0.05);
}

.lane-background.outcome-background {
  top: 150px;
  background: rgba(245, 158, 11, 0.05);
}



/* Inactive Gap Indicator */
.inactive-gap {
  position: absolute;
  top: 78px;
  height: 4px;
  background: repeating-linear-gradient(
    90deg,
    var(--border-primary) 0px,
    var(--border-primary) 5px,
    transparent 5px,
    transparent 10px
  );
  z-index: 0;
  cursor: pointer;
  transition: var(--transition-fast);
}

.inactive-gap:hover {
  height: 6px;
  top: 77px;
  background: var(--border-primary);
}

.gap-label {
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  background: var(--surface);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
  border: 1px solid var(--border-primary);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-fast);
  pointer-events: none;
}

.inactive-gap:hover .gap-label {
  opacity: 1;
  visibility: visible;
}



/* Year Markers */
.year-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.year-line {
  width: 2px;
  height: 100%;
  background: var(--border-primary);
  opacity: 0.5;
}

.year-label {
  position: absolute;
  top: 3px;
  font-size: var(--fs-sm);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  background: var(--surface);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  white-space: nowrap;
  border: 1px solid var(--border-primary);
  z-index: 10;
}

.timeline-event {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  animation: fadeIn 0.5s ease-out;
  transition: var(--transition-fast);
  transform: translateX(-50%);
}

.timeline-event.income-lane {
  top: 50px;
}

.timeline-event.communication-lane {
  top: 110px;
}

.timeline-event.outcome-lane {
  top: 170px;
}



.timeline-event.contract-fixed {
  left: 120px !important;
  top: 50px;
  z-index: 200;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.timeline-event.active .event-label {
  color: var(--lina-orange);
}

.event-point {
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 0 0 4px var(--surface), 0 0 0 6px var(--border-primary);
  z-index: 10;
  transition: var(--transition-fast);
  margin-bottom: 0;
  position: relative;
  width: 20px;
  height: 20px;
}

.event-point svg {
  color: white;
  fill: currentColor;
  stroke: currentColor;
}

.timeline-event:hover .event-point {
  transform: scale(1.15);
  box-shadow: 0 0 0 6px var(--surface), 0 0 0 10px var(--lina-orange);
}

.timeline-event.active .event-point {
  box-shadow: 0 0 0 6px var(--surface), 0 0 0 10px var(--lina-orange);
  transform: scale(1.1);
}

.event-point.web { background: #3b82f6; }
.event-point.contact { background: #10b981; }
.event-point.email { background: #8b5cf6; }
.event-point.claim { background: #f59e0b; }
.event-point.payment { background: #06d6a0; }
.event-point.contract { background: #ef4444; }
.event-point.upsell { background: #ec4899; }
.event-point.cancellation { background: #64748b; }
.event-point.rejection { background: #dc2626; }
.event-point.termination { background: #1e293b; }

.event-date-box {
  font-size: 10px;
  color: var(--text-primary);
  text-align: center;
  margin-top: 8px;
  white-space: nowrap;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  padding: 2px 4px;
  line-height: 1;
}

/* Tooltip */
.event-tooltip {
  position: fixed;
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  min-width: 250px;
  max-width: 300px;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: 1000;
  pointer-events: none;
  transform: translateX(-50%);
}

.event-tooltip.visible {
  opacity: 1;
  visibility: visible;
}

.event-tooltip::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 8px solid transparent;
  border-bottom-color: var(--surface);
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  gap: var(--space-2);
}

.tooltip-type-badge {
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: white;
  white-space: nowrap;
}

.tooltip-type-badge.web { background: #3b82f6; }
.tooltip-type-badge.contact { background: #10b981; }
.tooltip-type-badge.email { background: #8b5cf6; }
.tooltip-type-badge.claim { background: #f59e0b; }
.tooltip-type-badge.payment { background: #06d6a0; }
.tooltip-type-badge.contract { background: #ef4444; }
.tooltip-type-badge.upsell { background: #ec4899; }
.tooltip-type-badge.cancellation { background: #64748b; }
.tooltip-type-badge.rejection { background: #dc2626; }
.tooltip-type-badge.termination { background: #1e293b; }

.tooltip-date {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.tooltip-title {
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.tooltip-description {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.tooltip-hint {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  font-style: italic;
  text-align: center;
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-primary);
}

.event-type-badge {
  padding: 4px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: white;
}

.event-type-badge.web { background: #3b82f6; }
.event-type-badge.contact { background: #10b981; }
.event-type-badge.email { background: #8b5cf6; }
.event-type-badge.claim { background: #f59e0b; }
.event-type-badge.payment { background: #06d6a0; }
.event-type-badge.contract { background: #ef4444; }
.event-type-badge.upsell { background: #ec4899; }
.event-type-badge.cancellation { background: #64748b; }
.event-type-badge.rejection { background: #dc2626; }
.event-type-badge.termination { background: #1e293b; }

.event-type-badge.large {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--fs-sm);
}



/* Detail Panel */
.detail-panel {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-5);
  border-bottom: 1px solid var(--border-primary);
}

.detail-title-section {
  flex: 1;
}

.detail-panel-title {
  font-size: var(--fs-xl);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: var(--space-2) 0 0 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--surface-hover);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--surface-active);
  color: var(--text-primary);
}

.detail-panel-body {
  padding: var(--space-5);
}

.detail-section {
  margin-bottom: var(--space-6);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3,
.detail-section h4 {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-2);
  background: var(--surface-hover);
  border-radius: var(--radius-sm);
}

.detail-key {
  font-weight: var(--fw-semibold);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
}

.detail-value {
  color: var(--text-primary);
  font-size: var(--fs-sm);
}

.detail-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.detail-notes {
  padding: var(--space-3);
  background: var(--warning-light);
  border-left: 3px solid var(--warning);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .customer-journey-view {
    padding: var(--space-4);
  }

  .header-content {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .customer-select,
  .time-range-select {
    width: 100%;
  }

  .customer-info-card {
    flex-direction: column;
    text-align: center;
  }

  .customer-meta {
    justify-content: center;
  }

  .customer-stats {
    width: 100%;
    justify-content: space-around;
  }

  .year-label {
    font-size: var(--fs-xs);
  }

  .event-point {
    width: 18px;
    height: 18px;
  }

  .event-tooltip {
    min-width: 200px;
  }
}
</style>
