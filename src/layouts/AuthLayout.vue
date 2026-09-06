<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="auth-shell relative min-h-[calc(100vh-40px)] overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.35),transparent_42%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.28),transparent_36%),linear-gradient(160deg,#0f172a_0%,#1e3a8a_48%,#0c4a6e_100%)]"
    />
    <div class="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] max-w-6xl flex-col px-4 py-8">
      <div class="mb-8 flex flex-wrap items-center justify-between gap-3 text-slate-50">
        <div>
          <p class="text-xs tracking-[0.22em] text-sky-200/80">北京市应急管理局</p>
          <h1 class="mt-1 text-2xl font-bold">安全生产检查和隐患治理信息子系统</h1>
          <p class="mt-1 text-sm text-sky-100/70">二期原型 · 京办多端 · 监测分析一张图</p>
        </div>
        <div class="flex gap-3 text-sm">
          <RouterLink to="/tender" class="rounded-lg border border-white/20 px-3 py-1.5 hover:bg-white/10"
            >招标公告</RouterLink
          >
          <RouterLink
            to="/login"
            class="rounded-lg bg-sky-400 px-3 py-1.5 font-medium text-slate-950 hover:bg-sky-300"
            >登录控制台</RouterLink
          >
        </div>
      </div>
      <RouterView />
      <p class="mt-auto pt-8 text-center text-xs text-sky-100/50">
        演示系统 · 浏览器 sql.js + R2 SQLite · 不具备实际执法效力
      </p>
    </div>
  </div>
</template>
