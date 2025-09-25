<template>
  <svg 
    :width="size" 
    :height="size" 
    :viewBox="viewBox" 
    :class="['icon', `icon-${name}`, { 'icon-filled': filled }]"
    :style="{ color }"
  >
    <!-- Home -->
    <g v-if="name === 'home'">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="9,22 9,12 15,12 15,22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Search -->
    <g v-else-if="name === 'search'">
      <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="m21 21-4.35-4.35" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Code/Query -->
    <g v-else-if="name === 'code'">
      <polyline points="16,18 22,12 16,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="8,6 2,12 8,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Dashboard -->
    <g v-else-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="3" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="14" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
      <rect x="3" y="14" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="2"/>
    </g>

    <!-- API -->
    <g v-else-if="name === 'api'">
      <path d="M6 3h12l4 6-10 13L2 9l4-6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="m6 3 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Menu -->
    <g v-else-if="name === 'menu'">
      <line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Close -->
    <g v-else-if="name === 'close'">
      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Arrow Right -->
    <g v-else-if="name === 'arrow-right'">
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <polyline points="12,5 19,12 12,19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Chevron Down -->
    <g v-else-if="name === 'chevron-down'">
      <polyline points="6,9 12,15 18,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Chevron Right -->
    <g v-else-if="name === 'chevron-right'">
      <polyline points="9,18 15,12 9,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Filter -->
    <g v-else-if="name === 'filter'">
      <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Settings -->
    <g v-else-if="name === 'settings'">
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 16a4 4 0 0 1-8 0 4 4 0 0 1 8 0z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Refresh -->
    <g v-else-if="name === 'refresh'">
      <polyline points="23,4 23,10 17,10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="1,20 1,14 7,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Play -->
    <g v-else-if="name === 'play'">
      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
    </g>

    <!-- Database -->
    <g v-else-if="name === 'database'">
      <ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" stroke-width="2"/>
    </g>

    <!-- Users -->
    <g v-else-if="name === 'users'">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Activity -->
    <g v-else-if="name === 'activity'">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Trending Up -->
    <g v-else-if="name === 'trending-up'">
      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="17,6 23,6 23,12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Trending Down -->
    <g v-else-if="name === 'trending-down'">
      <polyline points="23,18 13.5,8.5 8.5,13.5 1,6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="17,18 23,18 23,12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Clock -->
    <g v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <polyline points="12,6 12,12 16,14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Eye -->
    <g v-else-if="name === 'eye'">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
    </g>

    <!-- Grid -->
    <g v-else-if="name === 'grid'">
      <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="14" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="14" y="14" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="3" y="14" width="7" height="7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- List -->
    <g v-else-if="name === 'list'">
      <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Send -->
    <g v-else-if="name === 'send'">
      <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <polygon points="22,2 15,22 11,13 2,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Save -->
    <g v-else-if="name === 'save'">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="17,21 17,13 7,13 7,21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="7,3 7,8 15,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Download -->
    <g v-else-if="name === 'download'">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="7,10 12,15 17,10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Plus -->
    <g v-else-if="name === 'plus'">
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Minus -->
    <g v-else-if="name === 'minus'">
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Check -->
    <g v-else-if="name === 'check'">
      <polyline points="20,6 9,17 4,12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Alert Circle -->
    <g v-else-if="name === 'alert-circle'">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Info -->
    <g v-else-if="name === 'info'">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Server -->
    <g v-else-if="name === 'server'">
      <rect x="2" y="3" width="20" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="2" y="10" width="20" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="2" y="17" width="20" height="4" rx="1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="6" y1="5" x2="6.01" y2="5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="6" y1="12" x2="6.01" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <line x1="6" y1="19" x2="6.01" y2="19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Folder -->
    <g v-else-if="name === 'folder'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- Folder Open -->
    <g v-else-if="name === 'folder-open'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 19l1.5-6h17l-1.5 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- File -->
    <g v-else-if="name === 'file'">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>

    <!-- External Link -->
    <g v-else-if="name === 'external-link'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="15,3 21,3 21,9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </g>

    <!-- Lina Logo -->
    <g v-else-if="name === 'lina-logo'">
      <!-- L -->
      <rect x="1" y="2" width="4" height="18" fill="white"/>
      <rect x="1" y="16" width="10" height="4" fill="white"/>
      
      <!-- I -->
      <rect x="15" y="2" width="4" height="18" fill="white"/>
      
      <!-- N -->
      <rect x="23" y="2" width="4" height="18" fill="white"/>
      <rect x="31" y="2" width="4" height="18" fill="white"/>
      <polygon points="27,2 31,2 31,18 27,14" fill="white"/>
      
      <!-- A -->
      <polygon points="39,20 42,2 46,2 49,20 45,20 44.5,15 41.5,15 41,20" fill="white"/>
      <rect x="42" y="10" width="2.5" height="2" fill="black"/>
      
      <!-- Exclamation mark (yellow) -->
      <rect x="54" y="2" width="6" height="13" fill="#FFB81C"/>
      <rect x="54" y="17" width="6" height="3" fill="#FFB81C"/>
    </g>

    <!-- Lina Logo Collapsed (just L and !) -->
    <g v-else-if="name === 'lina-logo-collapsed'">
      <!-- L -->
      <rect x="2" y="3" width="5" height="15" fill="white"/>
      <rect x="2" y="15" width="10" height="3" fill="white"/>
      
      <!-- Exclamation mark (yellow) -->
      <rect x="15" y="3" width="4" height="12" fill="#FFB81C"/>
      <rect x="15" y="17" width="4" height="2" fill="#FFB81C"/>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [String, Number],
    default: 20
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  filled: {
    type: Boolean,
    default: false
  },
  viewBox: {
    type: String,
    default: '0 0 24 24'
  }
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.icon:hover {
  transform: scale(1.05);
}
</style>