<template>
  <div class="text-to-sql-view">
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">TMR Assistant</h1>
          <p class="page-subtitle">{{ language === 'ko' ? '텔레마케팅을 위한 AI 어시스턴트' : 'AI Assistant for Telemarketing' }}</p>
        </div>
        <div class="header-actions">
          <div class="language-toggle">
            <button 
              class="lang-btn" 
              :class="{ active: language === 'ko' }"
              @click="language = 'ko'"
            >
              한국어
            </button>
            <button 
              class="lang-btn" 
              :class="{ active: language === 'en' }"
              @click="language = 'en'"
            >
              English
            </button>
          </div>
          <button class="action-btn" @click="clearChat">
            <IconSystem name="trash" :size="16" />
            {{ language === 'ko' ? '대화 초기화' : 'Clear Chat' }}
          </button>
        </div>
      </div>
    </div>

    <div class="chat-workspace">
      <!-- Chat Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="chatMessages.length === 0" class="welcome-message">
          <div class="welcome-content">
            <IconSystem name="headphones" :size="48" />
            <h3>TMR Assistant</h3>
            <p>{{ language === 'ko' ? '고객 정보를 조회하고 텔레마케팅에 필요한 인사이트를 제공합니다' : 'Search customer information and get insights for telemarketing' }}</p>
            <div class="example-questions">
              <h4>{{ language === 'ko' ? '예시 질문:' : 'Example Questions:' }}</h4>
              <div class="example-list">
                <button 
                  v-for="example in currentExampleQuestions" 
                  :key="example"
                  class="example-btn"
                  @click="sendMessage(example)"
                >
                  {{ example }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div 
          v-for="message in chatMessages" 
          :key="message.id"
          class="message"
          :class="{ 
            'user-message': message.type === 'user', 
            'assistant-message': message.type === 'assistant',
            'isStreaming': message.isStreaming
          }"
        >
          <div class="message-avatar">
            <IconSystem v-if="message.type === 'user'" name="user" :size="20" />
            <IconSystem v-else name="headphones" :size="20" />
          </div>
          
          <div class="message-content">
            <div class="message-header">
              <span class="message-sender">{{ message.type === 'user' ? (language === 'ko' ? '상담사' : 'Agent') : 'TMR Assistant' }}</span>
              <span class="message-time">{{ formatMessageTime(message.timestamp) }}</span>
            </div>
            
            <div class="message-body">
              <div v-if="message.type === 'user'" class="user-text">
                {{ message.content }}
              </div>
              
              <div v-else class="assistant-response">
                <div v-if="message.isGenerating" class="generating-indicator">
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>{{ language === 'ko' ? '고객 정보를 분석하고 있습니다...' : 'Analyzing customer information...' }}</span>
                </div>
                
                <div v-else>
                  <div v-if="message.explanation" class="response-explanation">
                    {{ message.explanation }}
                  </div>
                  
                  <!-- Customer Analysis Result -->
                  <div v-if="message.customerAnalysis" class="customer-analysis">
                    <div class="analysis-section" v-if="message.customerAnalysis.customerInfo">
                      <h4 class="section-title">{{ language === 'ko' ? '고객 정보' : 'Customer Information' }}</h4>
                      <div class="info-grid">
                        <div class="info-item" v-for="(value, key) in message.customerAnalysis.customerInfo" :key="key">
                          <span class="info-label">{{ key }}:</span>
                          <span class="info-value">{{ value }}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div class="analysis-section" v-if="message.customerAnalysis.currentPolicies">
                      <h4 class="section-title">{{ language === 'ko' ? '현재 보험 약관 및 신규 상품 정보' : 'Current Policy & New Product Information' }}</h4>
                      <div class="policy-info">
                        <div class="policy-block">
                          <div class="policy-details" v-html="message.customerAnalysis.currentPolicies"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div class="analysis-section" v-if="message.customerAnalysis.gaps">
                      <h4 class="section-title">{{ language === 'ko' ? '보장 공백 및 특이점 분석' : 'Coverage Gaps & Analysis' }}</h4>
                      <div class="gaps-list" v-html="message.customerAnalysis.gaps"></div>
                    </div>
                    
                    <div class="analysis-section highlight" v-if="message.customerAnalysis.script">
                      <h4 class="section-title">{{ language === 'ko' ? '업셀링 스크립트' : 'Upselling Script' }}</h4>
                      <div class="script-content" v-html="message.customerAnalysis.script"></div>
                    </div>
                    
                    <div class="analysis-section" v-if="message.customerAnalysis.keyPoints">
                      <h4 class="section-title">{{ language === 'ko' ? '핵심 공략 포인트' : 'Key Points' }}</h4>
                      <div class="key-points" v-html="message.customerAnalysis.keyPoints"></div>
                    </div>
                    
                    <!-- Streaming indicator -->
                    <div v-if="message.isStreaming" class="streaming-indicator">
                      <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span>{{ language === 'ko' ? '분석 중...' : 'Analyzing...' }}</span>
                    </div>
                  </div>
                  
                  <!-- Simple text response -->
                  <div v-if="message.simpleResponse" class="simple-response" v-html="message.simpleResponse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-section">
        <div class="input-container">
          <div class="input-wrapper">
            <textarea 
              v-model="currentMessage"
              class="message-input"
              :placeholder="language === 'ko' ? '고객 이름을 검색하거나 질문해보세요... (예: 김철수 고객의 특성을 분석해서 업셀링 포인트를 알려줘)' : 'Search customer name or ask a question... (e.g., Analyze customer characteristics and suggest upselling points)'"
              rows="1"
              @keydown="handleKeydown"
              @input="adjustTextareaHeight"
              ref="messageInput"
            ></textarea>
            
            <div class="input-actions">
              <button class="input-action-btn" @click="loadExample" title="예시 불러오기">
                <IconSystem name="lightbulb" :size="16" />
              </button>
              <button 
                class="send-btn"
                :disabled="!currentMessage.trim() || isGenerating"
                @click="sendMessage()"
              >
                <IconSystem v-if="isGenerating" name="loader" :size="16" class="spinning" />
                <IconSystem v-else name="send" :size="16" />
              </button>
            </div>
          </div>
          
          <div class="input-footer">
            <div class="input-stats">
              <span class="char-count">{{ currentMessage.length }}/1000</span>
            </div>
            <div class="input-tips">
              <span class="tip">{{ language === 'ko' ? 'Shift + Enter로 줄바꿈, Enter로 전송' : 'Shift + Enter for new line, Enter to send' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import IconSystem from './IconSystem.vue'

// Reactive state
const language = ref('ko')
const currentMessage = ref('')
const isGenerating = ref(false)
const chatMessages = ref([])
const messagesContainer = ref(null)
const messageInput = ref(null)

let messageIdCounter = 1

// Sample data
const exampleQuestionsKo = [
  "김철수 고객의 특성을 분석해서 업셀링 포인트를 알려줘",
  "이 고객과 컨택했던 정보를 보여줘",
  "고객이 지금 내고 있는 보험료는 얼마야?",
  "고객이 최근에 청구한게 언제야?",
  "고객의 보장 공백을 분석해줘"
]

const exampleQuestionsEn = [
  "Analyze customer characteristics and suggest upselling points",
  "Show me the contact history with this customer",
  "What is the customer's current premium payment?",
  "When was the customer's last claim?",
  "Analyze the customer's coverage gaps"
]

// Computed
const currentExampleQuestions = computed(() => {
  return language.value === 'ko' ? exampleQuestionsKo : exampleQuestionsEn
})

// Methods
const sendMessage = async (message = null) => {
  const messageText = message || currentMessage.value.trim()
  if (!messageText || isGenerating.value) return
  
  // Add user message
  const userMessage = {
    id: messageIdCounter++,
    type: 'user',
    content: messageText,
    timestamp: new Date()
  }
  chatMessages.value.push(userMessage)
  
  // Clear input
  currentMessage.value = ''
  
  // Add generating assistant message
  const assistantMessage = {
    id: messageIdCounter++,
    type: 'assistant',
    isGenerating: true,
    timestamp: new Date()
  }
  chatMessages.value.push(assistantMessage)
  
  // Scroll to bottom
  await nextTick()
  scrollToBottom()
  
  isGenerating.value = true
  
  // Simulate AI processing with MCP tool calls - show explanation first
  setTimeout(async () => {
    const response = generateTMRResponse(messageText, language.value)
    const messageIndex = chatMessages.value.findIndex(m => m.id === assistantMessage.id)
    
    if (messageIndex > -1) {
      // Step 1: Type explanation character by character
      chatMessages.value[messageIndex] = {
        ...assistantMessage,
        isGenerating: false,
        explanation: '',
        isStreaming: true
      }
      
      // Type explanation
      await typeExplanation(messageIndex, response.explanation)
      await nextTick()
      scrollToBottom()
      
      // Step 2: Stream the main content
      setTimeout(async () => {
        if (response.customerAnalysis) {
          // For customer analysis, show sections progressively
          await streamCustomerAnalysis(messageIndex, response, assistantMessage)
        } else if (response.simpleResponse) {
          // For simple responses, type it out
          await typeSimpleResponse(messageIndex, response.simpleResponse, assistantMessage, response.explanation)
        }
        
        isGenerating.value = false
        await nextTick()
        scrollToBottom()
      }, 500)
    }
  }, 1500)
}

// Type explanation text
const typeExplanation = async (messageIndex, text) => {
  const lines = text.split('\n')
  let currentText = ''
  
  for (const line of lines) {
    for (let i = 0; i < line.length; i++) {
      currentText += line[i]
      chatMessages.value[messageIndex].explanation = currentText
      await new Promise(resolve => setTimeout(resolve, 20)) // Slower typing for explanation
      await nextTick()
    }
    currentText += '\n'
    chatMessages.value[messageIndex].explanation = currentText
  }
}

// Type simple response
const typeSimpleResponse = async (messageIndex, html, assistantMessage, explanation) => {
  chatMessages.value[messageIndex] = {
    ...assistantMessage,
    isGenerating: false,
    explanation: explanation,
    simpleResponse: '',
    isStreaming: true
  }
  
  // Split by HTML tags to preserve structure while typing
  const parts = html.split(/(<[^>]+>)/g)
  let displayText = ''
  let charCount = 0
  
  for (const part of parts) {
    if (part.startsWith('<') && part.endsWith('>')) {
      // It's an HTML tag, add it immediately
      displayText += part
      chatMessages.value[messageIndex].simpleResponse = displayText
    } else {
      // It's text content, type it character by character
      for (let i = 0; i < part.length; i++) {
        displayText += part[i]
        charCount++
        
        // Update display every few characters for better performance
        if (charCount % 2 === 0 || i === part.length - 1) {
          chatMessages.value[messageIndex].simpleResponse = displayText
          
          // Variable delay based on character type - SLOWER
          if (part[i] === ' ' || part[i] === '\n') {
            await new Promise(resolve => setTimeout(resolve, 5))
          } else if (part[i] === '.' || part[i] === ',' || part[i] === ':') {
            await new Promise(resolve => setTimeout(resolve, 40))
          } else {
            await new Promise(resolve => setTimeout(resolve, 20))
          }
          
          await nextTick()
        }
      }
    }
    
    // Scroll periodically
    if (charCount % 50 === 0) {
      scrollToBottom()
    }
  }
  
  chatMessages.value[messageIndex].simpleResponse = html
  chatMessages.value[messageIndex].isStreaming = false
  await nextTick()
  scrollToBottom()
}

// Stream customer analysis sections progressively
const streamCustomerAnalysis = async (messageIndex, response, assistantMessage) => {
  const analysis = response.customerAnalysis
  
  // Step 1: Customer Info - show immediately (it's structured data)
  chatMessages.value[messageIndex] = {
    ...assistantMessage,
    isGenerating: false,
    explanation: response.explanation,
    customerAnalysis: {
      customerInfo: analysis.customerInfo
    },
    isStreaming: true
  }
  await nextTick()
  scrollToBottom()
  
  // Step 2: Add Current Policies with typing effect
  await new Promise(resolve => setTimeout(resolve, 600))
  await typeText(messageIndex, 'currentPolicies', analysis.currentPolicies)
  
  // Step 3: Add Gaps with typing effect
  await new Promise(resolve => setTimeout(resolve, 600))
  await typeText(messageIndex, 'gaps', analysis.gaps)
  
  // Step 4: Add Script with typing effect
  if (analysis.script) {
    await new Promise(resolve => setTimeout(resolve, 600))
    await typeText(messageIndex, 'script', analysis.script)
  }
  
  // Step 5: Add Key Points with typing effect
  if (analysis.keyPoints) {
    await new Promise(resolve => setTimeout(resolve, 600))
    await typeText(messageIndex, 'keyPoints', analysis.keyPoints)
    chatMessages.value[messageIndex].isStreaming = false
    await nextTick()
    scrollToBottom()
  }
}

// Type text character by character (for HTML content)
const typeText = async (messageIndex, field, fullText) => {
  if (!chatMessages.value[messageIndex].customerAnalysis) {
    chatMessages.value[messageIndex].customerAnalysis = {}
  }
  
  // Initialize with empty string
  chatMessages.value[messageIndex].customerAnalysis[field] = ''
  
  // Split by HTML tags to preserve structure while typing
  const parts = fullText.split(/(<[^>]+>)/g)
  let displayText = ''
  let charCount = 0
  
  for (const part of parts) {
    if (part.startsWith('<') && part.endsWith('>')) {
      // It's an HTML tag, add it immediately
      displayText += part
      chatMessages.value[messageIndex].customerAnalysis[field] = displayText
    } else {
      // It's text content, type it character by character
      for (let i = 0; i < part.length; i++) {
        displayText += part[i]
        charCount++
        
        // Update display every few characters for better performance
        if (charCount % 2 === 0 || i === part.length - 1) {
          chatMessages.value[messageIndex].customerAnalysis[field] = displayText
          
          // Variable delay based on character type - SLOWER
          if (part[i] === ' ' || part[i] === '\n') {
            await new Promise(resolve => setTimeout(resolve, 5))
          } else if (part[i] === '.' || part[i] === ',' || part[i] === ':') {
            await new Promise(resolve => setTimeout(resolve, 40))
          } else {
            await new Promise(resolve => setTimeout(resolve, 20))
          }
          
          await nextTick()
        }
      }
    }
    
    // Scroll periodically
    if (charCount % 50 === 0) {
      scrollToBottom()
    }
  }
  
  // Ensure full text is set
  chatMessages.value[messageIndex].customerAnalysis[field] = fullText
  await nextTick()
  scrollToBottom()
}

const generateTMRResponse = (message, lang = 'ko') => {
  const lowerMessage = message.toLowerCase()
  
  // 업셀링 포인트 분석
  if (lowerMessage.includes('업셀링') || lowerMessage.includes('특성') || lowerMessage.includes('분석') || 
      lowerMessage.includes('upselling') || lowerMessage.includes('characteristics') || lowerMessage.includes('analyze')) {
    
    if (lang === 'en') {
      return {
        explanation: '[Consultation Start] Customer ID: u_313821 Analyzing...\n→ Tool [get_customer_info] completed\n→ Tool [get_current_policies] completed\n→ Tool [get_customer_anomalies] completed',
        customerAnalysis: {
          customerInfo: {
            'Name': 'Kim**',
            'Age': '45 years',
            'Gender': 'Male',
            'Occupation': 'Office Worker (Manager)',
            'Family': 'Spouse, 2 children',
            'Monthly Premium': '₩250,000'
          },
          currentPolicies: `
            <div class="policy-item">
              <strong>Current Insurance:</strong> "Whole Life Insurance"<br>
              • Enrollment Date: 2015-03-20<br>
              • Status: Active<br>
              • Coverage:<br>
              &nbsp;&nbsp;- Death Benefit: ₩100M<br>
              &nbsp;&nbsp;- Cancer Coverage: ₩30M<br>
              &nbsp;&nbsp;- Stroke Coverage: ₩10M
            </div>
            <div class="policy-item">
              <strong>New Product:</strong> "2024 Comprehensive Health Insurance"<br>
              • Key Features:<br>
              &nbsp;&nbsp;- Metastatic cancer coverage<br>
              &nbsp;&nbsp;- 100% coverage for cerebrovascular/ischemic heart disease<br>
              &nbsp;&nbsp;- Caregiver support rider
            </div>
          `,
          gaps: `
            <ul class="gap-list">
              <li><strong>Death Benefit:</strong> Top 10% ✓</li>
              <li><strong>Vascular Disease Coverage:</strong> Bottom 15% (Very Weak) ⚠️</li>
              <li><strong>Premium to Income Ratio:</strong> Appropriate</li>
              <li><strong>Missing Benefits:</strong>
                <ul>
                  <li>No targeted cancer therapy coverage</li>
                  <li>Cerebral infarction diagnosis benefit gap</li>
                </ul>
              </li>
            </ul>
          `,
          script: `
            <blockquote class="sales-script">
              "Mr. Kim, while your current insurance provides excellent death benefit coverage, there are some gaps in vascular disease protection. 
              Specifically, your stroke coverage of ₩10M is below the average for your age group. 
              Additionally, you're missing coverage for targeted cancer therapy and cerebral infarction diagnosis benefits.<br><br>
              
              Our recently launched '2024 Comprehensive Health Insurance' offers metastatic cancer coverage and 100% coverage for cerebrovascular and ischemic heart diseases, 
              along with a caregiver support rider. By switching to this product, you can fill your current coverage gaps and receive better protection. 
              Moreover, the monthly premium is comparable to your current rate and appropriate for your income level. 
              Would you like to consider this opportunity for enhanced coverage?"
            </blockquote>
          `,
          keyPoints: `
            <ol class="key-points-list">
              <li><strong>Enhanced Vascular Disease Coverage:</strong> Higher stroke coverage than current policy</li>
              <li><strong>Added Targeted Cancer Therapy & Cerebral Infarction Benefits:</strong> Fills missing coverage</li>
              <li><strong>Caregiver Support Rider:</strong> Additional support provided</li>
              <li><strong>Premium Affordability:</strong> Similar to current premium</li>
              <li><strong>Overall Coverage Enhancement:</strong> Strengthened death and cancer benefits</li>
            </ol>
          `
        }
      }
    }
    
    // Korean version
    return {
      explanation: '[상담 시작] 고객 ID: u_313821 분석 중...\n→ Tool [get_customer_info] 호출 완료\n→ Tool [get_current_policies] 호출 완료\n→ Tool [get_customer_anomalies] 호출 완료',
      customerAnalysis: {
        customerInfo: {
          '이름': '김*수',
          '나이': '45세',
          '성별': '남성',
          '직업': '사무직(과장)',
          '가족 구성': '배우자, 자녀 2명',
          '월 보험료': '250,000원'
        },
        currentPolicies: `
          <div class="policy-item">
            <strong>현재 보험:</strong> "무배당 든든종신보험"<br>
            • 가입일: 2015-03-20<br>
            • 상태: 유지<br>
            • 보장 내용:<br>
            &nbsp;&nbsp;- 사망 보장: 1억 원<br>
            &nbsp;&nbsp;- 암 보장: 3천만 원<br>
            &nbsp;&nbsp;- 뇌졸중 보장: 1천만 원
          </div>
          <div class="policy-item">
            <strong>신규 상품:</strong> "2024 통합건강보험"<br>
            • 주요 기능:<br>
            &nbsp;&nbsp;- 전이암 보장<br>
            &nbsp;&nbsp;- 뇌혈관/허혈성 심장질환 100% 보장<br>
            &nbsp;&nbsp;- 간병인 지원 특약
          </div>
        `,
        gaps: `
          <ul class="gap-list">
            <li><strong>사망 보장:</strong> 상위 10% ✓</li>
            <li><strong>혈관 관련 보장:</strong> 하위 15% (매우 취약) ⚠️</li>
            <li><strong>보험료 대비 소득:</strong> 적정</li>
            <li><strong>누락된 혜택:</strong>
              <ul>
                <li>표적항암치료비 없음</li>
                <li>뇌경색 진단비 공백</li>
              </ul>
            </li>
          </ul>
        `,
        script: `
          <blockquote class="sales-script">
            "김 과장님, 현재 가입하신 보험은 사망 보장에 있어서는 매우 우수하지만, 혈관 관련 보장에 있어서는 약간의 공백이 있습니다. 
            특히, 뇌졸중과 같은 질환에 대한 보장이 현재 1천만 원으로, 동일 연령대 평균에 비해 낮습니다. 
            또한, 표적항암치료비와 뇌경색 진단비에 대한 보장이 누락되어 있습니다.<br><br>
            
            최근 출시된 '2024 통합건강보험'은 전이암 보장과 뇌혈관/허혈성 심장질환에 대한 100% 보장을 제공하며, 
            간병인 지원 특약도 포함되어 있습니다. 이 상품으로 전환하시면, 현재 보장 공백을 메우시고 더 나은 보호를 받을 수 있을 것입니다. 
            또한, 월 보험료는 현재와 크게 차이가 없으며, 소득 대비 적정 수준입니다. 
            이 기회를 통해 더 나은 보장을 고려해 보시지 않으시겠습니까?"
          </blockquote>
        `,
        keyPoints: `
          <ol class="key-points-list">
            <li><strong>혈관 관련 보장 강화:</strong> 현재 보장보다 높은 뇌졸중 보장 제공</li>
            <li><strong>표적항암치료비 및 뇌경색 진단비 보장 추가:</strong> 누락된 혜택 보완</li>
            <li><strong>간병인 지원 특약:</strong> 추가적인 지원 제공</li>
            <li><strong>보험료 대비 소득 적정성:</strong> 현재 보험료와 크게 차이가 없음</li>
            <li><strong>전체적인 보장 강화:</strong> 사망 보장과 암 보장 강화</li>
          </ol>
        `
      }
    }
  }
  
  // 컨택 정보 조회
  if (lowerMessage.includes('컨택') || lowerMessage.includes('상담') || lowerMessage.includes('이력') ||
      lowerMessage.includes('contact') || lowerMessage.includes('history')) {
    
    if (lang === 'en') {
      return {
        explanation: '→ Tool [get_contact_history] completed',
        simpleResponse: `
          <div class="contact-history">
            <h4>Customer Contact History</h4>
            <div class="contact-item">
              <div class="contact-date">2024-01-15 14:30</div>
              <div class="contact-content">
                <strong>Contact Type:</strong> Premium Payment Inquiry<br>
                <strong>Agent:</strong> Park Ji-young<br>
                <strong>Details:</strong> Requested auto-debit date change (5th → 15th of each month)
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-date">2023-11-20 10:15</div>
              <div class="contact-content">
                <strong>Contact Type:</strong> Coverage Verification<br>
                <strong>Agent:</strong> Kim Min-su<br>
                <strong>Details:</strong> Inquiry about cancer diagnosis benefit coverage
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-date">2023-08-10 16:45</div>
              <div class="contact-content">
                <strong>Contact Type:</strong> New Product Introduction<br>
                <strong>Agent:</strong> Lee Su-jin<br>
                <strong>Details:</strong> Proposed additional health insurance (Not enrolled)
              </div>
            </div>
          </div>
        `
      }
    }
    
    return {
      explanation: '→ Tool [get_contact_history] 호출 완료',
      simpleResponse: `
        <div class="contact-history">
          <h4>고객 컨택 이력</h4>
          <div class="contact-item">
            <div class="contact-date">2024-01-15 14:30</div>
            <div class="contact-content">
              <strong>상담 유형:</strong> 보험료 납입 문의<br>
              <strong>상담사:</strong> 박지영<br>
              <strong>내용:</strong> 자동이체 날짜 변경 요청 (매월 5일 → 15일)
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-date">2023-11-20 10:15</div>
            <div class="contact-content">
              <strong>상담 유형:</strong> 보장 내용 확인<br>
              <strong>상담사:</strong> 김민수<br>
              <strong>내용:</strong> 암 진단비 보장 범위 문의
            </div>
          </div>
          <div class="contact-item">
            <div class="contact-date">2023-08-10 16:45</div>
            <div class="contact-content">
              <strong>상담 유형:</strong> 신규 상품 안내<br>
              <strong>상담사:</strong> 이수진<br>
              <strong>내용:</strong> 건강보험 추가 가입 제안 (미가입)
            </div>
          </div>
        </div>
      `
    }
  }
  
  // 보험료 조회
  if (lowerMessage.includes('보험료') || lowerMessage.includes('납입') || lowerMessage.includes('얼마') ||
      lowerMessage.includes('premium') || lowerMessage.includes('payment')) {
    
    if (lang === 'en') {
      return {
        explanation: '→ Tool [get_premium_info] completed',
        simpleResponse: `
          <div class="premium-info">
            <h4>Current Premium Payments</h4>
            <div class="premium-summary">
              <div class="premium-total">
                <span class="label">Total Monthly Premium</span>
                <span class="amount">₩250,000</span>
              </div>
            </div>
            <div class="premium-breakdown">
              <h5>Breakdown by Policy</h5>
              <div class="premium-item">
                <div class="premium-name">Whole Life Insurance</div>
                <div class="premium-details">
                  <span>₩150,000/month</span>
                  <span class="status active">Active</span>
                </div>
              </div>
              <div class="premium-item">
                <div class="premium-name">Health Insurance Plus</div>
                <div class="premium-details">
                  <span>₩80,000/month</span>
                  <span class="status active">Active</span>
                </div>
              </div>
              <div class="premium-item">
                <div class="premium-name">Auto Insurance</div>
                <div class="premium-details">
                  <span>₩20,000/month</span>
                  <span class="status active">Active</span>
                </div>
              </div>
            </div>
            <div class="premium-note">
              <strong>Payment Method:</strong> Auto-debit (15th of each month)<br>
              <strong>Last Payment:</strong> 2024-01-15<br>
              <strong>Next Payment:</strong> 2024-02-15
            </div>
          </div>
        `
      }
    }
    
    return {
      explanation: '→ Tool [get_premium_info] 호출 완료',
      simpleResponse: `
        <div class="premium-info">
          <h4>현재 납입 중인 보험료</h4>
          <div class="premium-summary">
            <div class="premium-total">
              <span class="label">월 총 보험료</span>
              <span class="amount">250,000원</span>
            </div>
          </div>
          <div class="premium-breakdown">
            <h5>보험별 상세</h5>
            <div class="premium-item">
              <div class="premium-name">무배당 든든종신보험</div>
              <div class="premium-details">
                <span>월 150,000원</span>
                <span class="status active">납입 중</span>
              </div>
            </div>
            <div class="premium-item">
              <div class="premium-name">건강보험 플러스</div>
              <div class="premium-details">
                <span>월 80,000원</span>
                <span class="status active">납입 중</span>
              </div>
            </div>
            <div class="premium-item">
              <div class="premium-name">자동차보험</div>
              <div class="premium-details">
                <span>월 20,000원</span>
                <span class="status active">납입 중</span>
              </div>
            </div>
          </div>
          <div class="premium-note">
            <strong>납입 방법:</strong> 자동이체 (매월 15일)<br>
            <strong>최근 납입일:</strong> 2024-01-15<br>
            <strong>다음 납입일:</strong> 2024-02-15
          </div>
        </div>
      `
    }
  }
  
  // 청구 이력 조회
  if (lowerMessage.includes('청구') || lowerMessage.includes('보험금') || lowerMessage.includes('지급') ||
      lowerMessage.includes('claim') || lowerMessage.includes('last')) {
    
    if (lang === 'en') {
      return {
        explanation: '→ Tool [get_claim_history] completed',
        simpleResponse: `
          <div class="claim-history">
            <h4>Insurance Claim History</h4>
            <div class="claim-summary">
              <div class="claim-stat">
                <span class="stat-label">Total Claims</span>
                <span class="stat-value">3</span>
              </div>
              <div class="claim-stat">
                <span class="stat-label">Total Claimed</span>
                <span class="stat-value">₩4,500,000</span>
              </div>
              <div class="claim-stat">
                <span class="stat-label">Total Paid</span>
                <span class="stat-value">₩4,200,000</span>
              </div>
            </div>
            <div class="claim-list">
              <div class="claim-item">
                <div class="claim-header">
                  <span class="claim-date">2023-12-05</span>
                  <span class="claim-status completed">Paid</span>
                </div>
                <div class="claim-details">
                  <strong>Reason:</strong> Hospitalization<br>
                  <strong>Claimed Amount:</strong> ₩2,000,000<br>
                  <strong>Paid Amount:</strong> ₩1,800,000<br>
                  <strong>Processing Time:</strong> 7 days
                </div>
              </div>
              <div class="claim-item">
                <div class="claim-header">
                  <span class="claim-date">2023-06-20</span>
                  <span class="claim-status completed">Paid</span>
                </div>
                <div class="claim-details">
                  <strong>Reason:</strong> Outpatient Treatment<br>
                  <strong>Claimed Amount:</strong> ₩1,500,000<br>
                  <strong>Paid Amount:</strong> ₩1,400,000<br>
                  <strong>Processing Time:</strong> 5 days
                </div>
              </div>
              <div class="claim-item">
                <div class="claim-header">
                  <span class="claim-date">2022-11-10</span>
                  <span class="claim-status completed">Paid</span>
                </div>
                <div class="claim-details">
                  <strong>Reason:</strong> Surgery<br>
                  <strong>Claimed Amount:</strong> ₩1,000,000<br>
                  <strong>Paid Amount:</strong> ₩1,000,000<br>
                  <strong>Processing Time:</strong> 10 days
                </div>
              </div>
            </div>
            <div class="claim-note">
              <strong>Most Recent Claim:</strong> 2023-12-05 (Hospitalization)<br>
              <strong>Average Processing Time:</strong> 7.3 days
            </div>
          </div>
        `
      }
    }
    
    return {
      explanation: '→ Tool [get_claim_history] 호출 완료',
      simpleResponse: `
        <div class="claim-history">
          <h4>보험금 청구 이력</h4>
          <div class="claim-summary">
            <div class="claim-stat">
              <span class="stat-label">총 청구 건수</span>
              <span class="stat-value">3건</span>
            </div>
            <div class="claim-stat">
              <span class="stat-label">총 청구 금액</span>
              <span class="stat-value">4,500,000원</span>
            </div>
            <div class="claim-stat">
              <span class="stat-label">총 지급 금액</span>
              <span class="stat-value">4,200,000원</span>
            </div>
          </div>
          <div class="claim-list">
            <div class="claim-item">
              <div class="claim-header">
                <span class="claim-date">2023-12-05</span>
                <span class="claim-status completed">지급 완료</span>
              </div>
              <div class="claim-details">
                <strong>청구 사유:</strong> 입원 치료비<br>
                <strong>청구 금액:</strong> 2,000,000원<br>
                <strong>지급 금액:</strong> 1,800,000원<br>
                <strong>처리 기간:</strong> 7일
              </div>
            </div>
            <div class="claim-item">
              <div class="claim-header">
                <span class="claim-date">2023-06-20</span>
                <span class="claim-status completed">지급 완료</span>
              </div>
              <div class="claim-details">
                <strong>청구 사유:</strong> 외래 진료비<br>
                <strong>청구 금액:</strong> 1,500,000원<br>
                <strong>지급 금액:</strong> 1,400,000원<br>
                <strong>처리 기간:</strong> 5일
              </div>
            </div>
            <div class="claim-item">
              <div class="claim-header">
                <span class="claim-date">2022-11-10</span>
                <span class="claim-status completed">지급 완료</span>
              </div>
              <div class="claim-details">
                <strong>청구 사유:</strong> 수술비<br>
                <strong>청구 금액:</strong> 1,000,000원<br>
                <strong>지급 금액:</strong> 1,000,000원<br>
                <strong>처리 기간:</strong> 10일
              </div>
            </div>
          </div>
          <div class="claim-note">
            <strong>최근 청구:</strong> 2023-12-05 (입원 치료비)<br>
            <strong>평균 처리 기간:</strong> 7.3일
          </div>
        </div>
      `
    }
  }
  
  // 보장 공백 분석
  if (lowerMessage.includes('공백') || lowerMessage.includes('부족') || lowerMessage.includes('취약') ||
      lowerMessage.includes('gap') || lowerMessage.includes('coverage')) {
    
    if (lang === 'en') {
      return {
        explanation: '→ Tool [analyze_coverage_gaps] completed',
        simpleResponse: `
          <div class="gap-analysis">
            <h4>Coverage Gap Analysis</h4>
            <div class="gap-overview">
              <div class="gap-score">
                <span class="score-label">Overall Coverage Score</span>
                <span class="score-value">72/100</span>
                <span class="score-grade">Good</span>
              </div>
            </div>
            <div class="gap-categories">
              <div class="gap-category good">
                <div class="category-header">
                  <span class="category-name">Death Benefit</span>
                  <span class="category-score">95/100</span>
                </div>
                <div class="category-detail">
                  Excellent - Top 10% for the same age group.
                </div>
              </div>
              <div class="gap-category warning">
                <div class="category-header">
                  <span class="category-name">Vascular Disease Coverage</span>
                  <span class="category-score">45/100</span>
                </div>
                <div class="category-detail">
                  Stroke coverage of ₩10M is below the age group average (₩30M).<br>
                  Cerebral infarction diagnosis benefit is missing.
                </div>
              </div>
              <div class="gap-category warning">
                <div class="category-header">
                  <span class="category-name">Cancer Coverage</span>
                  <span class="category-score">65/100</span>
                </div>
                <div class="category-detail">
                  General cancer coverage is adequate, but targeted cancer therapy is missing.<br>
                  No additional coverage for metastatic cancer.
                </div>
              </div>
              <div class="gap-category good">
                <div class="category-header">
                  <span class="category-name">Injury Coverage</span>
                  <span class="category-score">80/100</span>
                </div>
                <div class="category-detail">
                  Adequate coverage for general injuries.
                </div>
              </div>
            </div>
            <div class="gap-recommendation">
              <h5>Improvement Recommendations</h5>
              <ol>
                <li>Enhance cerebrovascular disease coverage (Priority: High)</li>
                <li>Add targeted cancer therapy coverage (Priority: Medium)</li>
                <li>Add metastatic cancer coverage (Priority: Medium)</li>
              </ol>
            </div>
          </div>
        `
      }
    }
    
    return {
      explanation: '→ Tool [analyze_coverage_gaps] 호출 완료',
      simpleResponse: `
        <div class="gap-analysis">
          <h4>보장 공백 분석</h4>
          <div class="gap-overview">
            <div class="gap-score">
              <span class="score-label">종합 보장 점수</span>
              <span class="score-value">72/100</span>
              <span class="score-grade">양호</span>
            </div>
          </div>
          <div class="gap-categories">
            <div class="gap-category good">
              <div class="category-header">
                <span class="category-name">사망 보장</span>
                <span class="category-score">95/100</span>
              </div>
              <div class="category-detail">
                동일 연령대 상위 10% 수준으로 매우 우수합니다.
              </div>
            </div>
            <div class="gap-category warning">
              <div class="category-header">
                <span class="category-name">혈관 질환 보장</span>
                <span class="category-score">45/100</span>
              </div>
              <div class="category-detail">
                뇌졸중 보장이 1천만 원으로 동일 연령대 평균(3천만 원)에 비해 낮습니다.<br>
                뇌경색 진단비가 누락되어 있습니다.
              </div>
            </div>
            <div class="gap-category warning">
              <div class="category-header">
                <span class="category-name">암 보장</span>
                <span class="category-score">65/100</span>
              </div>
              <div class="category-detail">
                일반 암 보장은 적정하나, 표적항암치료비가 누락되어 있습니다.<br>
                전이암에 대한 추가 보장이 없습니다.
              </div>
            </div>
            <div class="gap-category good">
              <div class="category-header">
                <span class="category-name">상해 보장</span>
                <span class="category-score">80/100</span>
              </div>
              <div class="category-detail">
                일반적인 상해에 대한 보장이 적절합니다.
              </div>
            </div>
          </div>
          <div class="gap-recommendation">
            <h5>개선 권장사항</h5>
            <ol>
              <li>뇌혈관 질환 보장 강화 (우선순위: 높음)</li>
              <li>표적항암치료비 추가 (우선순위: 중간)</li>
              <li>전이암 보장 추가 (우선순위: 중간)</li>
            </ol>
          </div>
        </div>
      `
    }
  }
  
  // 기본 응답
  if (lang === 'en') {
    return {
      explanation: 'Searching customer information.',
      simpleResponse: `
        <div class="default-response">
          <p>Sorry, I couldn't find information for that question.</p>
          <p>Please try questions like:</p>
          <ul>
            <li>Analyze customer characteristics and suggest upselling points</li>
            <li>Show me the contact history with this customer</li>
            <li>What is the customer's current premium payment?</li>
            <li>When was the customer's last claim?</li>
          </ul>
        </div>
      `
    }
  }
  
  return {
    explanation: '고객 정보를 조회하고 있습니다.',
    simpleResponse: `
      <div class="default-response">
        <p>죄송합니다. 해당 질문에 대한 정보를 찾을 수 없습니다.</p>
        <p>다음과 같은 질문을 시도해보세요:</p>
        <ul>
          <li>고객의 특성을 분석해서 업셀링 포인트를 알려줘</li>
          <li>고객과 컨택했던 정보를 보여줘</li>
          <li>고객이 지금 내고 있는 보험료는 얼마야?</li>
          <li>고객이 최근에 청구한게 언제야?</li>
        </ul>
      </div>
    `
  }
}

const clearChat = () => {
  chatMessages.value = []
  currentMessage.value = ''
}

const loadExample = () => {
  const examples = language.value === 'ko' ? exampleQuestionsKo : exampleQuestionsEn
  const randomExample = examples[Math.floor(Math.random() * examples.length)]
  currentMessage.value = randomExample
}

const handleKeydown = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

const adjustTextareaHeight = () => {
  const textarea = messageInput.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
  }
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const formatMessageTime = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp)
}
</script>

<style scoped>
.text-to-sql-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: var(--space-4);
  gap: var(--space-4);
}

.model-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-size: var(--fs-sm);
  cursor: pointer;
}

.language-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--surface);
}

.lang-btn {
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  font-size: var(--fs-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  border-right: 1px solid var(--border-primary);
}

.lang-btn:last-child {
  border-right: none;
}

.lang-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.lang-btn.active {
  background: var(--lina-yellow);
  color: var(--gray-800);
  font-weight: var(--fw-semibold);
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

/* Chat Workspace */
.chat-workspace {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background: var(--surface-hover);
}

/* Welcome Message */
.welcome-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 400px;
}

.welcome-content {
  text-align: center;
  max-width: 600px;
  padding: var(--space-8);
}

.welcome-content h3 {
  font-size: var(--fs-lg);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: var(--space-4) 0 var(--space-2) 0;
}

.welcome-content p {
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  font-size: var(--fs-sm);
}

.example-questions h4 {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.example-btn {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-md);
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.example-btn:hover {
  background: var(--lina-yellow);
  color: var(--gray-800);
  border-color: var(--lina-yellow);
}

/* Messages */
.message {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  max-width: 100%;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: var(--lina-yellow);
  color: var(--gray-800);
}

.assistant-message .message-avatar {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
}

.message-content {
  flex: 1;
  min-width: 0;
  max-width: 70%;
}

.user-message .message-content {
  align-self: flex-end;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.user-message .message-header {
  flex-direction: row-reverse;
}

.message-sender {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
}

.message-time {
  font-size: 10px;
  color: var(--text-tertiary);
}

.message-body {
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}

.user-message .message-body {
  background: var(--lina-yellow);
  color: var(--gray-800);
  border-color: var(--lina-yellow);
}

.user-text {
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

/* Assistant Response */
.generating-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
}

.streaming-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  color: var(--text-secondary);
  padding: var(--space-3);
  background: var(--surface-hover);
  border-radius: var(--radius-md);
  margin-top: var(--space-2);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: var(--text-tertiary);
  border-radius: 50%;
  animation: typing 1.4s ease-in-out infinite both;
}

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }
.typing-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.response-explanation {
  margin-bottom: var(--space-4);
  line-height: var(--lh-relaxed);
  color: var(--text-secondary);
  white-space: pre-line;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--fs-xs);
  background: var(--surface-hover);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--lina-yellow);
  position: relative;
}

.message.isStreaming .response-explanation::after {
  content: '▋';
  animation: blink 1s step-end infinite;
  color: var(--lina-yellow);
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

.message.isStreaming .policy-details::after,
.message.isStreaming .gaps-list::after,
.message.isStreaming .script-content::after,
.message.isStreaming .key-points::after,
.message.isStreaming .simple-response::after {
  content: '▋';
  animation: blink 1s step-end infinite;
  color: var(--lina-yellow);
  margin-left: 2px;
}

/* Customer Analysis Styles */
.customer-analysis {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  font-size: var(--fs-sm);
}

.customer-analysis * {
  font-size: inherit;
}

.customer-analysis h4 {
  font-size: var(--fs-sm);
}

.customer-analysis h5 {
  font-size: var(--fs-sm);
}

.analysis-section {
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  animation: fadeInUp 0.4s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.analysis-section.highlight {
  background: color-mix(in srgb, var(--lina-yellow) 10%, var(--surface));
  border-color: var(--lina-yellow);
}

.section-title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--border-primary);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3);
}

.info-item {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--surface);
  border-radius: var(--radius-sm);
}

.info-label {
  color: var(--text-secondary);
  font-weight: var(--fw-medium);
  font-size: var(--fs-sm);
}

.info-value {
  color: var(--text-primary);
  font-weight: var(--fw-semibold);
  font-size: var(--fs-sm);
}

.policy-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.policy-block {
  background: var(--surface);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}

.policy-header {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.policy-details {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.policy-item {
  margin-bottom: var(--space-3);
}

.policy-item:last-child {
  margin-bottom: 0;
}

.gaps-list ul,
.gap-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--fs-sm);
}

.gaps-list li,
.gap-list li {
  padding: var(--space-2) 0;
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.gaps-list ul ul,
.gap-list ul {
  margin-left: var(--space-4);
  margin-top: var(--space-1);
  font-size: var(--fs-sm);
}

.sales-script {
  background: var(--surface);
  border-left: 4px solid var(--lina-yellow);
  padding: var(--space-4);
  margin: 0;
  font-style: italic;
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  border-radius: var(--radius-sm);
  font-size: var(--fs-sm);
}

.key-points-list {
  list-style: none;
  counter-reset: point-counter;
  padding: 0;
  margin: 0;
  font-size: var(--fs-sm);
}

.key-points-list li {
  counter-increment: point-counter;
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background: var(--surface);
  border-radius: var(--radius-sm);
  position: relative;
  padding-left: var(--space-8);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.key-points-list li::before {
  content: counter(point-counter);
  position: absolute;
  left: var(--space-3);
  top: var(--space-3);
  width: 24px;
  height: 24px;
  background: var(--lina-yellow);
  color: var(--gray-800);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fw-semibold);
  font-size: var(--fs-sm);
}

/* Simple Response Styles */
.simple-response {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.simple-response strong {
  font-size: var(--fs-sm);
}

.contact-history,
.premium-info,
.claim-history,
.gap-analysis {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  font-size: var(--fs-sm);
}

.gap-analysis * {
  font-size: var(--fs-sm);
}

.gap-analysis h4 {
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.gap-analysis h5 {
  font-size: var(--fs-sm);
}

.contact-history h4,
.premium-info h4,
.claim-history h4,
.gap-analysis h4 {
  font-size: var(--fs-base);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.contact-item,
.premium-item,
.claim-item {
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
}

.contact-date,
.claim-date {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.contact-content,
.claim-details {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.premium-summary {
  background: var(--surface-hover);
  border: 2px solid var(--lina-yellow);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

.premium-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.premium-total .label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.premium-total .amount {
  font-size: var(--fs-xl);
  font-weight: var(--fw-bold);
  color: var(--lina-yellow);
}

.premium-breakdown h5 {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.premium-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3);
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.premium-name {
  font-weight: var(--fw-medium);
  color: var(--text-primary);
  font-size: var(--fs-sm);
}

.premium-details {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  font-size: var(--fs-sm);
}

.status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
}

.status.active {
  background: color-mix(in srgb, var(--success) 20%, transparent);
  color: var(--success);
}

.status.completed {
  background: color-mix(in srgb, var(--lina-yellow) 20%, transparent);
  color: var(--lina-yellow-dark);
}

.premium-note,
.claim-note {
  background: var(--surface-hover);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  margin-top: var(--space-3);
  font-size: var(--fs-sm);
}

.claim-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.claim-stat {
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: var(--fs-xs);
  color: var(--text-secondary);
  margin-bottom: var(--space-1);
}

.stat-value {
  display: block;
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
}

.claim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.gap-overview {
  background: var(--surface-hover);
  border: 2px solid var(--lina-yellow);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  text-align: center;
}

.gap-score {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.score-label {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
}

.score-value {
  font-size: var(--fs-2xl);
  font-weight: var(--fw-bold);
  color: var(--lina-yellow);
}

.score-grade {
  font-size: var(--fs-base);
  color: var(--text-primary);
}

.gap-categories {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.gap-category {
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.gap-category.good {
  border-left: 4px solid var(--success);
}

.gap-category.warning {
  border-left: 4px solid var(--error);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.category-name {
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  font-size: var(--fs-sm);
}

.category-score {
  font-weight: var(--fw-bold);
  color: var(--lina-yellow);
  font-size: var(--fs-sm);
}

.category-detail {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.gap-recommendation {
  background: var(--surface-hover);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  margin-top: var(--space-3);
}

.gap-recommendation h5 {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-3) 0;
}

.gap-recommendation ol {
  margin: 0;
  padding-left: var(--space-5);
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.default-response {
  color: var(--text-secondary);
  line-height: var(--lh-relaxed);
  font-size: var(--fs-sm);
}

.default-response ul {
  margin-top: var(--space-3);
  padding-left: var(--space-5);
  font-size: var(--fs-sm);
}

/* Chat Input */
.chat-input-section {
  border-top: 1px solid var(--border-primary);
  background: var(--surface);
  padding: var(--space-4);
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  flex-shrink: 0;
}

.input-container {
  max-width: 100%;
}

.input-wrapper {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 44px;
  max-height: 120px;
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  font-size: var(--fs-sm);
  line-height: var(--lh-relaxed);
  resize: none;
  background: var(--surface);
  color: var(--text-primary);
  font-family: inherit;
}

.message-input:focus {
  outline: none;
  border-color: var(--lina-yellow);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--lina-yellow) 20%, transparent);
}

.input-actions {
  display: flex;
  gap: var(--space-2);
  align-items: flex-end;
}

.input-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--border-primary);
  background: var(--surface);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
}

.input-action-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--lina-yellow);
  color: white;
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-fast);
}

.send-btn:hover:not(:disabled) {
  background: var(--lina-yellow);
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-2);
}

.input-stats {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
}

.input-tips {
  font-size: var(--fs-sm);
  color: var(--text-tertiary);
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .response-metadata {
    flex-direction: column;
    gap: var(--space-2);
  }
  
  .input-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
}
</style>