import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { UserRole } from '@/types/safety'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    requiresAuth?: boolean
    roles?: UserRole[]
    layout?: 'auth' | 'main'
  }
}

const ALL_ROLES: UserRole[] = ['SuperAdmin', 'SafetyInspector', 'EnterpriseUser', 'Viewer']

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      title: '用户登录',
      description: '演示账号登录北京市应急管理局安全生产监管平台原型控制台。',
      requiresAuth: false,
      layout: 'auth',
    },
  },
  {
    path: '/tender',
    name: 'tender',
    component: () => import('@/views/tender/TenderView.vue'),
    meta: {
      title: '招标公告全文',
      description:
        '北京市应急管理局发布安全生产监管综合信息平台（二期）招标公告，预算690.5万元。',
      requiresAuth: false,
      layout: 'auth',
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: {
      title: '监测分析一张图',
      requiresAuth: true,
      layout: 'main',
      roles: ALL_ROLES,
    },
  },
  {
    path: '/hazards',
    name: 'hazards',
    component: () => import('@/views/hazards/HazardsView.vue'),
    meta: {
      title: '隐患治理闭环',
      requiresAuth: true,
      layout: 'main',
      roles: ['SuperAdmin', 'SafetyInspector', 'EnterpriseUser'],
    },
  },
  {
    path: '/enterprises',
    name: 'enterprises',
    component: () => import('@/views/enterprises/EnterprisesView.vue'),
    meta: {
      title: '企业一企一档',
      requiresAuth: true,
      layout: 'main',
      roles: ['SuperAdmin', 'SafetyInspector', 'EnterpriseUser'],
    },
  },
  {
    path: '/system',
    name: 'system',
    component: () => import('@/views/system/SystemView.vue'),
    meta: {
      title: '系统配置',
      requiresAuth: true,
      layout: 'main',
      roles: ['SuperAdmin'],
    },
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('@/views/error/ForbiddenView.vue'),
    meta: { title: '无权访问', requiresAuth: false, layout: 'auth' },
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

function applySeo(to: { path: string; meta: { title?: string; description?: string } }) {
  const baseTitle = '北京应急局安全生产监管平台二期招标-隐患治理子系统开发'
  const title = to.meta.title ? `${to.meta.title} · 安全生产监管平台` : baseTitle
  document.title = title

  const desc =
    to.meta.description ||
    '北京市应急管理局发布安全生产监管综合信息平台（二期）招标公告，预算690.5万元。涵盖隐患自查、监测分析一张图及京办端升级，2027年3月验收。'

  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null
    if (!el) {
      el = document.createElement('meta')
      if (selector.includes('property=')) {
        el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '')
      } else {
        el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '')
      }
      document.head.appendChild(el)
    }
    el.setAttribute(attr, value)
  }

  setMeta('meta[name="description"]', 'content', desc)
  setMeta('meta[property="og:title"]', 'content', title)
  setMeta('meta[property="og:description"]', 'content', desc)
}

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  try {
    await auth.bootstrap()
  } catch {
    // allow public pages even if engine fails
  }

  const requiresAuth = to.meta.requiresAuth !== false
  if (requiresAuth && !auth.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return { path: '/dashboard' }
  }
  if (to.meta.roles && !auth.hasRole(to.meta.roles)) {
    return { path: '/403' }
  }
  applySeo(to)
  return true
})

export default router
