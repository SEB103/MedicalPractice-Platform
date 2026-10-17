import type { Role } from '../types/domain'
export function protectedRedirect(path: string, role: Role): string | undefined {
  if (!path.startsWith('/patient/')) return undefined
  return role === 'visitor' ? '/anmelden' : role === 'pending' ? '/freigabe' : undefined
}
