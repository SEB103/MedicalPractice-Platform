import { ref, onMounted, onUnmounted } from 'vue'
export function useClock() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval>
  const refresh = () => {
    now.value = new Date()
  }
  onMounted(() => {
    timer = setInterval(refresh, 30000)
    document.addEventListener('visibilitychange', refresh)
  })
  onUnmounted(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', refresh)
  })
  return now
}
