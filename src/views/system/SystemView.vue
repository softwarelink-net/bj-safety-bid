<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useDbStore } from '@/stores/db'
import { getAuditLogs } from '@/utils/sqljs-engine'
import type { AuditLog } from '@/types/safety'

const db = useDbStore()
const logs = ref<AuditLog[]>([])

onMounted(() => {
  db.refresh()
  logs.value = getAuditLogs(30)
})

function toggle(key: string, current: string) {
  db.setConfig(key, current === 'true' ? 'false' : 'true')
  logs.value = getAuditLogs(30)
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-lg font-semibold text-slate-800">系统配置与审计</h3>
      <p class="text-sm text-slate-500">功能开关 · 字典键值 · 操作日志（SuperAdmin）</p>
    </div>

    <div class="panel overflow-hidden">
      <div class="border-b border-slate-100 px-4 py-3 font-medium text-slate-700">Feature Flags</div>
      <ul class="divide-y divide-slate-100">
        <li
          v-for="c in db.configs"
          :key="c.key"
          class="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">{{ c.key }}</p>
            <p class="text-xs text-slate-500">{{ c.description }}</p>
          </div>
          <div class="flex items-center gap-3">
            <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{{ c.value }}</code>
            <button
              v-if="c.value === 'true' || c.value === 'false'"
              type="button"
              class="btn-ghost"
              @click="toggle(c.key, c.value)"
            >
              切换
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div class="panel overflow-hidden">
      <div class="border-b border-slate-100 px-4 py-3 font-medium text-slate-700">最近审计日志</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th class="px-4 py-2">时间</th>
              <th class="px-4 py-2">用户</th>
              <th class="px-4 py-2">动作</th>
              <th class="px-4 py-2">URI</th>
              <th class="px-4 py-2">状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log.id" class="border-t border-slate-100">
              <td class="px-4 py-2 text-slate-500">{{ log.created_at }}</td>
              <td class="px-4 py-2">{{ log.username || log.user_id || '—' }}</td>
              <td class="px-4 py-2 font-medium text-slate-800">{{ log.action_name }}</td>
              <td class="px-4 py-2 text-slate-500">{{ log.request_uri || '—' }}</td>
              <td class="px-4 py-2">{{ log.status_code }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
