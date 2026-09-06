<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import type { UserRole } from '@/types/safety'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const db = useDbStore()

const navItems: { path: string; label: string; icon: string; roles?: UserRole[] }[] = [
  { path: '/dashboard', label: '监测分析一张图', icon: '◉' },
  {
    path: '/hazards',
    label: '隐患治理闭环',
    icon: '⚠',
    roles: ['SuperAdmin', 'SafetyInspector', 'EnterpriseUser'],
  },
  {
    path: '/enterprises',
    label: '企业一企一档',
    icon: '▣',
    roles: ['SuperAdmin', 'SafetyInspector', 'EnterpriseUser'],
  },
  { path: '/system', label: '系统配置审计', icon: '⚙', roles: ['SuperAdmin'] },
]

const visibleNav = computed(() => navItems.filter((item) => !item.roles || auth.hasRole(item.roles)))

const crumbs = computed(() => {
  const title = (route.meta.title as string) || '工作台'
  return ['安全生产监管平台', title]
})

onMounted(() => {
  if (auth.engineReady) db.refresh()
})

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div
    class="main-shell min-h-screen bg-[radial-gradient(ellipse_at_top,_#dbeafe_0%,_#f1f5f9_42%,_#f8fafc_100%)]"
  >
    <aside
      class="fixed left-0 top-10 z-40 flex h-[calc(100vh-40px)] w-60 flex-col border-r border-blue-900/10 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-sky-50 shadow-xl max-md:hidden"
    >
      <div class="border-b border-white/10 px-4 py-5">
        <p class="text-[11px] uppercase tracking-[0.18em] text-sky-300/80">11000026210200183840</p>
        <h1 class="mt-1 text-base font-bold leading-snug text-white">
          安全生产监管<br />综合信息平台（二期）
        </h1>
      </div>
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in visibleNav"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sky-100/85 transition hover:bg-white/10"
          active-class="!bg-blue-500/25 !text-white ring-1 ring-sky-300/30"
        >
          <span class="w-5 text-center opacity-80">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="border-t border-white/10 p-4 text-xs text-sky-100/70">
        <p>Worker 仅静态 · sql.js</p>
        <p class="mt-1">R2: bj-safety-bid-assets</p>
      </div>
    </aside>

    <div class="md:ml-60 flex min-h-[calc(100vh-40px)] flex-col">
      <header class="sticky top-10 z-30 border-b border-blue-900/10 bg-white/80 px-4 py-3 backdrop-blur-md md:px-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <nav class="text-xs text-slate-500">
              <span v-for="(c, i) in crumbs" :key="c">
                <span v-if="i > 0" class="mx-1">/</span>{{ c }}
              </span>
            </nav>
            <h2 class="mt-0.5 text-lg font-semibold text-slate-800">{{ route.meta.title }}</h2>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div v-if="db.stats" class="hidden items-center gap-2 lg:flex">
              <span class="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                重大隐患 {{ db.stats.criticalHazards }}
              </span>
              <span class="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                未销号 {{ db.stats.openHazards }}
              </span>
              <span class="rounded-md bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-200">
                安全指数 {{ db.stats.avgSafetyIndex }}
              </span>
            </div>
            <nav class="flex gap-1 text-xs md:hidden">
              <RouterLink
                v-for="item in visibleNav"
                :key="item.path"
                :to="item.path"
                class="rounded-md px-2 py-1 text-slate-600 ring-1 ring-slate-200"
                active-class="!bg-blue-600 !text-white !ring-blue-600"
              >
                {{ item.label.slice(0, 4) }}
              </RouterLink>
            </nav>
            <div class="text-right text-sm">
              <p class="font-medium text-slate-800">{{ auth.user?.full_name }}</p>
              <p class="text-xs text-slate-500">{{ auth.roleLabel }}</p>
            </div>
            <button type="button" class="btn-ghost" @click="onLogout">退出</button>
          </div>
        </div>
      </header>
      <main class="flex-1 p-4 md:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
