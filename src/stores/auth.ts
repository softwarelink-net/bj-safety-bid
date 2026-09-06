import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { BsbUser, UserRole } from '@/types/safety'
import { ROLE_LABELS } from '@/types/safety'
import { initSqlEngine, login as sqlLogin } from '@/utils/sqljs-engine'

const SESSION_KEY = 'bsb_session_user'

function readSession(): BsbUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as BsbUser) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<BsbUser | null>(readSession())
  const engineReady = ref(false)
  const bootError = ref<string | null>(null)
  const booting = ref(false)
  let bootPromise: Promise<void> | null = null

  const isAuthenticated = computed(() => !!user.value)
  const roleLabel = computed(() => (user.value ? ROLE_LABELS[user.value.role] : ''))

  function restoreSession() {
    user.value = readSession()
  }

  async function bootstrap() {
    if (engineReady.value) return
    if (bootPromise) return bootPromise

    booting.value = true
    bootError.value = null
    bootPromise = (async () => {
      try {
        await initSqlEngine()
        engineReady.value = true
        restoreSession()
      } catch (e) {
        bootError.value = e instanceof Error ? e.message : '数据库引擎初始化失败'
        throw e
      } finally {
        booting.value = false
      }
    })()

    return bootPromise
  }

  async function login(username: string, password: string) {
    await bootstrap()
    const result = await sqlLogin(username.trim(), password)
    if (!result) return { ok: false as const, message: '账号或密码错误' }
    user.value = result
    localStorage.setItem(SESSION_KEY, JSON.stringify(result))
    return { ok: true as const }
  }

  function logout() {
    user.value = null
    localStorage.removeItem(SESSION_KEY)
  }

  function hasRole(roles?: UserRole[]) {
    if (!roles || roles.length === 0) return true
    if (!user.value) return false
    return roles.includes(user.value.role)
  }

  return {
    user,
    engineReady,
    bootError,
    booting,
    isAuthenticated,
    roleLabel,
    bootstrap,
    login,
    logout,
    hasRole,
    restoreSession,
  }
})
