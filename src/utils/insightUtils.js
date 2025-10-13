// Throttle utility
export const throttle = (fn, wait = 32) => {
  let t = 0
  return (...args) => {
    const now = Date.now()
    if (now - t >= wait) {
      t = now
      fn(...args)
    }
  }
}

// Intersection Observer hook for lazy loading
export const useIntersect = () => {
  const isSupported = typeof IntersectionObserver !== 'undefined'
  
  const make = (onEnter) => {
    return {
      mounted(el) {
        if (!isSupported) {
          onEnter()
          return
        }
        const io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting) {
            onEnter()
            io.disconnect()
          }
        }, { rootMargin: '64px' })
        io.observe(el)
      }
    }
  }
  
  return { make }
}

// Monthly data cache (SWR pattern)
const monthlyCache = new Map()

export const fetchMonthlyData = async (key) => {
  await new Promise(r => setTimeout(r, 150))
  return {
    kpis: [
      { title: '🎯 목표 달성률', value: 0.7, delta: +0.085 },
      { title: '💰 APE 실적', value: 350, unit: '백만원', delta: +41 },
      { title: '🏢 가동 지점률', value: 0.594, of: [95, 160] },
      { title: '⚠️ 주목 필요 지점', value: 5, warn: true }
    ],
    daySeries: Array.from({ length: 15 }, (_, i) => 20 + i * 5),
    yearSeries: [160, 140, 120, 95, 110],
    monthBars: [20, 25, 30, 35, 40, 45, 50, 52, 50, 40, 30, 20],
    productSeries: {
      A: [160, 150, 130, 120, 110, 105],
      B: [155, 148, 140, 138, 130, 128],
      C: [165, 160, 158, 150, 145, 140]
    },
    ranking: [420, 380, 350, 330, 300, 280, 250, 220, 200, 180],
    visits: [
      { branch: '리더스일산', visits: 24, rate: 0.86, owner: '김성훈' },
      { branch: '구미스튜디오', visits: 18, rate: 0.72, owner: '박지우' },
      { branch: '안산센터', visits: 9, rate: 0.41, owner: '최다연' }
    ],
    edu: [
      { branch: '리더스일산', status: '완료', rate: 0.92, last: '2025-09-12', left: 3 },
      { branch: '구미스튜디오', status: '진행중', rate: 0.68, last: '2025-09-17', left: 11 },
      { branch: '안산센터', status: '미진행', rate: null, last: '—', left: 24 }
    ]
  }
}

export const getMonthlyData = async (key) => {
  if (monthlyCache.has(key)) return monthlyCache.get(key)
  const data = await fetchMonthlyData(key)
  monthlyCache.set(key, data)
  return data
}
