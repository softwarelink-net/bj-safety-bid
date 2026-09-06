<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalStickyBanner from '@/components/common/GlobalStickyBanner.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth = useAuthStore()
const layout = computed(() => (route.meta.layout === 'auth' ? AuthLayout : MainLayout))
</script>

<template>
  <GlobalStickyBanner />
  <div
    v-if="auth.booting && !auth.engineReady"
    class="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
  >
    <div class="panel px-8 py-6 text-center">
      <p class="text-sm font-semibold text-slate-800">正在加载安全监管数据引擎</p>
      <p class="mt-2 text-xs text-slate-500">浏览器 sql.js / WebAssembly 初始化中，请稍候</p>
    </div>
  </div>
  <component :is="layout" />
</template>
