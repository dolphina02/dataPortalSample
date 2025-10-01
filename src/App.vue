<template>
  <div class="app-container">
    <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <!-- Mobile Overlay -->
      <div 
        v-if="!sidebarCollapsed && isMobile"
        class="mobile-overlay"
        @click="sidebarCollapsed = true"
      ></div>
      
      <!-- Sidebar Navigation -->
      <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-content">
          <!-- Header -->
          <div class="sidebar-header">
            <Transition name="fade" mode="out-in">
              <div v-if="!sidebarCollapsed" key="expanded" class="brand">
                <div class="logo">
                  <img src="/lina-logo.png" alt="LINA" class="logo-image" />
                </div>
                <div class="brand-text">
                  <h1 class="brand-title">Data Portal</h1>
                  <p class="brand-subtitle">라이나생명 분석 플랫폼</p>
                </div>
              </div>
              <div v-else key="collapsed" class="brand-collapsed">
                <div class="logo collapsed" @click="expandSidebar">
                  <img src="/lina-logo.png" alt="L" class="logo-image collapsed" />
                </div>
              </div>
            </Transition>
            
            <button 
              class="toggle-btn" 
              @click="toggleSidebar"
              :aria-label="sidebarCollapsed ? '사이드바 열기' : '사이드바 닫기'"
            >
              <IconSystem 
                :name="sidebarCollapsed ? 'chevron-right' : 'chevron-down'" 
                :size="16" 
              />
            </button>
          </div>

          <!-- Navigation -->
          <nav class="nav-menu" role="navigation">
            <div class="nav-section">
              <Transition name="fade">
                <div v-show="!sidebarCollapsed" class="nav-section-title">메인</div>
              </Transition>
              <div class="nav-items">
                <button 
                  v-for="item in mainMenuItems" 
                  :key="item.id"
                  class="nav-item" 
                  :class="{ active: activeView === item.id }"
                  @click="setActiveView(item.id)"
                  :title="sidebarCollapsed ? item.label : ''"
                >
                  <div class="nav-item-icon">
                    <IconSystem :name="item.icon" :size="20" />
                  </div>
                  <Transition name="fade">
                    <span v-show="!sidebarCollapsed" class="nav-item-text">{{ item.label }}</span>
                  </Transition>
                  <div v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</div>
                </button>
              </div>
            </div>

            <div class="nav-section">
              <Transition name="fade">
                <div v-show="!sidebarCollapsed" class="nav-section-title">분석 도구</div>
              </Transition>
              <div class="nav-items">
                <button 
                  v-for="item in analysisMenuItems" 
                  :key="item.id"
                  class="nav-item" 
                  :class="{ active: activeView === item.id }"
                  @click="setActiveView(item.id)"
                  :title="sidebarCollapsed ? item.label : ''"
                >
                  <div class="nav-item-icon">
                    <IconSystem :name="item.icon" :size="20" />
                  </div>
                  <Transition name="fade">
                    <span v-show="!sidebarCollapsed" class="nav-item-text">{{ item.label }}</span>
                  </Transition>
                  <div v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</div>
                </button>
              </div>
            </div>

            <div class="nav-section">
              <Transition name="fade">
                <div v-show="!sidebarCollapsed" class="nav-section-title">관리</div>
              </Transition>
              <div class="nav-items">
                <button 
                  v-for="item in managementMenuItems" 
                  :key="item.id"
                  class="nav-item" 
                  :class="{ active: activeView === item.id }"
                  @click="setActiveView(item.id)"
                  :title="sidebarCollapsed ? item.label : ''"
                >
                  <div class="nav-item-icon">
                    <IconSystem :name="item.icon" :size="20" />
                  </div>
                  <Transition name="fade">
                    <span v-show="!sidebarCollapsed" class="nav-item-text">{{ item.label }}</span>
                  </Transition>
                  <div v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{ item.badge }}</div>
                </button>
              </div>
            </div>
          </nav>

          <!-- Footer -->
          <div class="sidebar-footer">
            <Transition name="fade">
              <div v-show="!sidebarCollapsed" class="user-info">
                <div class="user-avatar">
                  <IconSystem name="users" :size="16" />
                </div>
                <div class="user-details">
                  <div class="user-name">김데이터</div>
                  <div class="user-role">Data Analyst</div>
                </div>
              </div>
            </Transition>
            
            <button class="settings-btn" :class="{ collapsed: sidebarCollapsed }">
              <IconSystem name="settings" :size="20" />
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
       <main class="main-content">
         <!-- Mobile Menu Button -->
         <button 
           class="mobile-menu-btn"
           @click="toggleSidebar"
           :class="{ active: !sidebarCollapsed }"
         >
           <IconSystem name="menu" :size="24" />
         </button>
         
         <div class="content-wrapper">
          <Transition name="page" mode="out-in">
            <component 
              :is="currentView" 
              :key="activeView" 
              @navigate-to-dashboard="navigateToDashboard"
            />
          </Transition>
        </div>
      </main>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast" tag="div">
          <div 
            v-for="toast in toasts" 
            :key="toast.id"
            class="toast" 
            :class="toast.type"
          >
            <div class="toast-icon">
              <IconSystem 
                :name="getToastIcon(toast.type)" 
                :size="20" 
              />
            </div>
            <div class="toast-content">
              <div class="toast-title">{{ toast.title }}</div>
              <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
            </div>
            <button class="toast-close" @click="removeToast(toast.id)">
              <IconSystem name="close" :size="16" />
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import IconSystem from './components/IconSystem.vue'
import HomeView from './components/HomeView.vue'
import SearchView from './components/SearchView.vue'
import QueryView from './components/QueryView.vue'
import TextToSqlView from './components/TextToSqlView.vue'
import ModelManagementView from './components/ModelManagementView.vue'
import SttSearchView from './components/SttSearchView.vue'
import DashboardView from './components/DashboardView.vue'
import DashboardStoreView from './components/DashboardStoreView.vue'
import ApiView from './components/ApiView.vue'
import ChubbDataView from './components/ChubbDataView.vue'

// Reactive state
const sidebarCollapsed = ref(false)
const activeView = ref('home')
const toasts = ref([])
const isMobile = ref(false)
let toastId = 0

// Menu configuration
const mainMenuItems = [
  { id: 'home', icon: 'home', label: '홈' },
  { id: 'dashboard-store', icon: 'grid', label: 'Dashboard Store' },
  { id: 'dashboard', icon: 'activity', label: 'My Dashboard', badge: '2' },
  { id: 'search', icon: 'file-text', label: 'Data Report' },
  { id: 'chubb-data', icon: 'database', label: 'Chubb Data' }
]

const analysisMenuItems = [
  { id: 'query', icon: 'code', label: 'SQL Editor' },
  { id: 'text-to-sql', icon: 'zap', label: 'Text To SQL' },
  { id: 'stt-search', icon: 'message-circle', label: 'STT 키워드 검색' }
]

const managementMenuItems = [
  { id: 'model-management', icon: 'box', label: '모델 관리' },
  { id: 'api', icon: 'api', label: 'API Explorer' }
]

// View components mapping
const viewComponents = {
  home: HomeView,
  search: SearchView,
  query: QueryView,
  'text-to-sql': TextToSqlView,
  'model-management': ModelManagementView,
  'stt-search': SttSearchView,
  dashboard: DashboardView,
  'dashboard-store': DashboardStoreView,
  api: ApiView,
  'chubb-data': ChubbDataView
}

// Computed
const currentView = computed(() => viewComponents[activeView.value])

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar-collapsed', sidebarCollapsed.value)
}

const expandSidebar = () => {
  if (sidebarCollapsed.value) {
    sidebarCollapsed.value = false
    localStorage.setItem('sidebar-collapsed', false)
  }
}

const setActiveView = (viewId) => {
  activeView.value = viewId
  
  // Auto-collapse sidebar only on mobile
  if (window.innerWidth <= 768) {
    sidebarCollapsed.value = true
    localStorage.setItem('sidebar-collapsed', true)
  }
}

const addToast = (title, message = '', type = 'info') => {
  const toast = {
    id: ++toastId,
    title,
    message,
    type
  }
  
  toasts.value.push(toast)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 5000)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const getToastIcon = (type) => {
  const icons = {
    success: 'check',
    error: 'alert-circle',
    warning: 'alert-circle',
    info: 'info'
  }
  return icons[type] || 'info'
}

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

const navigateToDashboard = () => {
  setActiveView('dashboard')
  addToast('성공!', 'My Dashboard로 이동했습니다', 'success')
}

// Lifecycle
onMounted(() => {
  // Restore sidebar state
  const savedState = localStorage.getItem('sidebar-collapsed')
  if (savedState !== null) {
    sidebarCollapsed.value = JSON.parse(savedState)
  }
  
  // Handle mobile
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // Welcome message
  setTimeout(() => {
    addToast('환영합니다!', 'Data Portal에 오신 것을 환영합니다', 'success')
  }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-layout {
  min-height: 100vh;
  position: relative;
}

/* Sidebar */
.sidebar {
  background: var(--surface);
  border-right: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  transition: var(--transition-normal);
  z-index: var(--z-sticky);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .sidebar-content {
  padding: var(--space-6) var(--space-4);
  align-items: center;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: var(--space-6);
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  min-height: 48px;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-collapsed {
  display: flex;
  justify-content: center;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
}

.logo.collapsed {
  width: 40px;
  height: 40px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.logo.collapsed:hover {
  background: var(--surface-hover);
  transform: scale(1.05);
}

.logo-image {
  height: 32px;
  width: auto;
  object-fit: contain;
  transition: var(--transition-fast);
}

.logo-image.collapsed {
  height: 28px;
  width: 28px;
  object-fit: cover;
  object-position: left center;
}

.brand-text {
  line-height: var(--lh-tight);
}

.brand-title {
  font-size: var(--fs-lg);
  font-weight: var(--fw-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.025em;
}

.brand-subtitle {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  margin: 0;
  font-weight: var(--fw-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-btn {
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
}

.toggle-btn:hover {
  background: var(--surface-active);
  color: var(--text-primary);
  transform: scale(1.05);
}

/* Navigation */
.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-section-title {
  font-size: var(--fs-xs);
  font-weight: var(--fw-semibold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 var(--space-3);
  margin-bottom: var(--space-1);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border: none;
  background: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  color: var(--text-secondary);
  font-size: var(--fs-sm);
  font-weight: var(--fw-medium);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  min-height: 44px;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: var(--space-3) var(--space-2);
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
  transition: var(--transition-fast);
}

.nav-item:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
  transform: translateX(2px);
}

.nav-item.active {
  background: linear-gradient(135deg, 
    color-mix(in srgb, var(--lina-yellow) 15%, transparent) 0%, 
    color-mix(in srgb, var(--lina-yellow) 10%, transparent) 100%);
  color: var(--lina-yellow-dark);
  font-weight: var(--fw-semibold);
}

.nav-item.active::before {
  height: 20px;
  background: var(--lina-yellow);
}

.nav-item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-item-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background: var(--lina-yellow);
  color: var(--text-primary);
  font-size: var(--fs-xs);
  font-weight: var(--fw-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}



/* Sidebar Footer */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--border-primary);
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--surface-active);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: var(--fs-xs);
  color: var(--text-tertiary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-btn {
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

.settings-btn:hover {
  background: var(--surface-active);
  color: var(--text-primary);
  transform: rotate(90deg);
}

.settings-btn.collapsed {
  width: 40px;
  height: 40px;
}

/* Main Content */
.main-content {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 280px;
  overflow: hidden;
  transition: var(--transition-normal);
}

.sidebar-collapsed .main-content {
  margin-left: 80px;
}

.content-wrapper {
  flex: 1;
  padding: var(--space-6);
  overflow-y: auto;
}

/* Toast System */
.toast-container {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  z-index: var(--z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(8px);
}

.toast.success {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 5%, var(--surface));
}

.toast.error {
  border-color: var(--error);
  background: color-mix(in srgb, var(--error) 5%, var(--surface));
}

.toast.warning {
  border-color: var(--lina-yellow);
  background: color-mix(in srgb, var(--lina-yellow) 5%, var(--surface));
}

.toast.info {
  border-color: var(--info);
  background: color-mix(in srgb, var(--info) 5%, var(--surface));
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast.success .toast-icon {
  color: var(--success);
}

.toast.error .toast-icon {
  color: var(--error);
}

.toast.warning .toast-icon {
  color: var(--lina-yellow-dark);
}

.toast.info .toast-icon {
  color: var(--info);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: var(--fs-sm);
  font-weight: var(--fw-semibold);
  color: var(--text-primary);
  margin: 0 0 2px 0;
}

.toast-message {
  font-size: var(--fs-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--lh-snug);
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-tertiary);
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
  flex-shrink: 0;
}

.toast-close:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: all var(--transition-normal);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: all var(--transition-normal);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform var(--transition-normal);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: calc(var(--z-modal) + 1);
  width: 48px;
  height: 48px;
  background: var(--lina-yellow);
  border: none;
  border-radius: var(--radius-lg);
  color: var(--gray-800);
  cursor: pointer;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-lg);
}

.mobile-menu-btn:hover {
  background: var(--lina-yellow-light);
  transform: scale(1.05);
}

.mobile-menu-btn.active {
  background: var(--lina-orange);
  color: white;
}

/* Mobile Overlay */
.mobile-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: calc(var(--z-modal) - 1);
}

/* Responsive */
@media (max-width: 768px) {
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .sidebar-collapsed .main-content {
    margin-left: 0;
  }
  
  .sidebar {
    transform: translateX(-100%);
    z-index: var(--z-modal);
  }
  
  .sidebar:not(.collapsed) {
    transform: translateX(0);
  }
  
  .content-wrapper {
    padding: var(--space-4);
    padding-top: calc(var(--space-4) + 64px); /* 햄버거 버튼 공간 확보 */
  }
  
  .toast-container {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
    max-width: none;
  }
}

@media (max-width: 480px) {
  .content-wrapper {
    padding: var(--space-3);
  }
  
  .toast-container {
    top: var(--space-3);
    right: var(--space-3);
    left: var(--space-3);
  }
}
</style>