<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import {
  SEVERITY_LABELS,
  STATUS_LABELS,
  type HazardSeverity,
  type HazardStatus,
} from '@/types/safety'

const auth = useAuthStore()
const db = useDbStore()
const showForm = ref(false)
const filter = ref<'all' | HazardStatus>('all')

const form = reactive({
  enterprise_id: 0,
  title: '',
  description: '',
  severity: 'General' as HazardSeverity,
  deadline: '',
})

const filtered = computed(() => {
  if (filter.value === 'all') return db.hazards
  return db.hazards.filter((h) => h.status === filter.value)
})

const nextStatus: Partial<Record<HazardStatus, HazardStatus>> = {
  Reported: 'Assigned',
  Assigned: 'Rectifying',
  Rectifying: 'Verified',
  Verified: 'Closed',
}

onMounted(() => {
  db.refresh()
  if (db.enterprises[0]) form.enterprise_id = db.enterprises[0].id
})

function submit() {
  if (!auth.user || !form.enterprise_id || !form.title || !form.description) return
  db.addHazard({
    enterprise_id: form.enterprise_id,
    reporter_id: auth.user.id,
    title: form.title,
    description: form.description,
    severity: form.severity,
    deadline: form.deadline || undefined,
  })
  form.title = ''
  form.description = ''
  form.severity = 'General'
  form.deadline = ''
  showForm.value = false
}

function advance(id: number, status: HazardStatus) {
  const n = nextStatus[status]
  if (!n) return
  db.setHazardStatus(id, n, auth.user?.id)
}

function severityClass(s: HazardSeverity) {
  if (s === 'Critical') return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (s === 'Major') return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-sky-50 text-sky-700 ring-sky-200'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-800">隐患上报 · 分派 · 整改 · 核销</h3>
        <p class="text-sm text-slate-500">支持企业自查与巡查员现场录入，数据写入浏览器 SQLite</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="filter" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="all">全部状态</option>
          <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
        </select>
        <button
          v-if="auth.hasRole(['SuperAdmin', 'SafetyInspector', 'EnterpriseUser'])"
          type="button"
          class="btn-primary"
          @click="showForm = !showForm"
        >
          {{ showForm ? '收起表单' : '新建隐患' }}
        </button>
      </div>
    </div>

    <div v-if="showForm" class="panel p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">企业</span>
          <select v-model.number="form.enterprise_id" class="w-full rounded-lg border border-slate-200 px-3 py-2">
            <option v-for="e in db.enterprises" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">严重程度</span>
          <select v-model="form.severity" class="w-full rounded-lg border border-slate-200 px-3 py-2">
            <option v-for="(label, key) in SEVERITY_LABELS" :key="key" :value="key">{{ label }}</option>
          </select>
        </label>
        <label class="text-sm md:col-span-2">
          <span class="mb-1 block text-slate-600">标题</span>
          <input v-model="form.title" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm md:col-span-2">
          <span class="mb-1 block text-slate-600">描述</span>
          <textarea
            v-model="form.description"
            rows="3"
            class="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">整改期限</span>
          <input v-model="form.deadline" type="date" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
      </div>
      <div class="mt-4 flex justify-end">
        <button type="button" class="btn-primary" @click="submit">提交隐患（模拟）</button>
      </div>
    </div>

    <div class="panel overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th class="px-4 py-3">隐患</th>
              <th class="px-4 py-3">企业</th>
              <th class="px-4 py-3">等级</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">期限</th>
              <th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="h in filtered" :key="h.id" class="border-t border-slate-100 hover:bg-slate-50/80">
              <td class="px-4 py-3">
                <p class="font-medium text-slate-800">{{ h.title || '未命名隐患' }}</p>
                <p class="mt-0.5 line-clamp-2 text-xs text-slate-500">{{ h.description }}</p>
              </td>
              <td class="px-4 py-3 text-slate-600">{{ h.enterprise_name || '—' }}</td>
              <td class="px-4 py-3">
                <span class="badge" :class="severityClass(h.severity)">{{ SEVERITY_LABELS[h.severity] }}</span>
              </td>
              <td class="px-4 py-3 text-slate-700">{{ STATUS_LABELS[h.status] }}</td>
              <td class="px-4 py-3 text-slate-500">{{ h.deadline || '—' }}</td>
              <td class="px-4 py-3">
                <button
                  v-if="nextStatus[h.status] && auth.hasRole(['SuperAdmin', 'SafetyInspector'])"
                  type="button"
                  class="btn-ghost"
                  @click="advance(h.id, h.status)"
                >
                  推进至 {{ STATUS_LABELS[nextStatus[h.status]!] }}
                </button>
                <span v-else class="text-xs text-slate-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
