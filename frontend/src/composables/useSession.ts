import { useRouter } from 'vue-router'
import { apiMode } from '../config/api'
import { authApi } from '../services/api'
import { useDemoStore } from '../stores/demo'

export function useSession() {
  const demo = useDemoStore()
  const router = useRouter()
  async function logout() {
    if (apiMode) await authApi.logout().catch(() => undefined)
    demo.me = null
    demo.state.role = 'visitor'
    if (apiMode) demo.state.appointments = []
    await router.push('/')
  }
  return { logout }
}
