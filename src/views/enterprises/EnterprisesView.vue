<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import { LEVEL_LABELS } from '@/types/safety'

const auth = useAuthStore()
const db = useDbStore()
const q = ref('')
const editing = ref(false)

const form = reactive({
  id: 0,
  name: '',
  credit_code: '',
  address: '',
  district: '',
  industry_type: '',
  safety_level: 'Medium' as 'High' | 'Medium' | 'Low',
  contact_name: '',
  contact_phone: '',
  safety_index: 80,
})

const list = computed(() => {
  const keyword = q.value.trim()
  if (!keyword) return db.enterprises
  return db.enterprises.filter(
    (e) =>
      e.name.includes(keyword) ||
      (e.district || '').includes(keyword) ||
      (e.industry_type || '').includes(keyword),
  )
})

onMounted(() => db.refresh())

function openCreate() {
  editing.value = true
  Object.assign(form, {
    id: 0,
    name: '',
    credit_code: '',
    address: '',
    district: '',
    industry_type: '',
    safety_level: 'Medium',
    contact_name: '',
    contact_phone: '',
    safety_index: 80,
  })
}

function openEdit(id: number) {
  const e = db.enterprises.find((x) => x.id === id)
  if (!e) return
  editing.value = true
  Object.assign(form, {
    id: e.id,
    name: e.name,
    credit_code: e.credit_code || '',
    address: e.address || '',
    district: e.district || '',
    industry_type: e.industry_type || '',
    safety_level: e.safety_level,
    contact_name: e.contact_name || '',
    contact_phone: e.contact_phone || '',
    safety_index: e.safety_index,
  })
}

function save() {
  if (!form.name) return
  db.saveEnterprise({ ...form, id: form.id || undefined })
  editing.value = false
}

function levelClass(level: string) {
  if (level === 'High') return 'bg-rose-50 text-rose-700 ring-rose-200'
  if (level === 'Medium') return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-800">企业一企一档台账</h3>
        <p class="text-sm text-slate-500">统一信用代码主数据 · 风险等级 · 安全指数</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-model="q"
          placeholder="搜索企业 / 区县 / 行业"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          v-if="auth.hasRole(['SuperAdmin', 'SafetyInspector'])"
          type="button"
          class="btn-primary"
          @click="openCreate"
        >
          新增企业
        </button>
      </div>
    </div>

    <div v-if="editing" class="panel p-4">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">企业名称</span>
          <input v-model="form.name" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">统一社会信用代码</span>
          <input v-model="form.credit_code" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">区县</span>
          <input v-model="form.district" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">行业</span>
          <input v-model="form.industry_type" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm md:col-span-2">
          <span class="mb-1 block text-slate-600">地址</span>
          <input v-model="form.address" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">风险等级</span>
          <select v-model="form.safety_level" class="w-full rounded-lg border border-slate-200 px-3 py-2">
            <option value="High">高风险</option>
            <option value="Medium">中风险</option>
            <option value="Low">低风险</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">安全指数</span>
          <input
            v-model.number="form.safety_index"
            type="number"
            min="0"
            max="100"
            class="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">联系人</span>
          <input v-model="form.contact_name" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <label class="text-sm">
          <span class="mb-1 block text-slate-600">联系电话</span>
          <input v-model="form.contact_phone" class="w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button type="button" class="btn-ghost" @click="editing = false">取消</button>
        <button type="button" class="btn-primary" @click="save">保存</button>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article v-for="e in list" :key="e.id" class="panel p-4">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h4 class="font-semibold text-slate-800">{{ e.name }}</h4>
            <p class="mt-1 text-xs text-slate-500">{{ e.credit_code || '暂无信用代码' }}</p>
          </div>
          <span class="badge" :class="levelClass(e.safety_level)">{{ LEVEL_LABELS[e.safety_level] }}</span>
        </div>
        <dl class="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div><dt class="text-slate-400">区县</dt><dd>{{ e.district || '—' }}</dd></div>
          <div><dt class="text-slate-400">行业</dt><dd>{{ e.industry_type || '—' }}</dd></div>
          <div><dt class="text-slate-400">安全指数</dt><dd class="font-semibold text-blue-700">{{ e.safety_index }}</dd></div>
          <div><dt class="text-slate-400">联系人</dt><dd>{{ e.contact_name || '—' }}</dd></div>
        </dl>
        <p class="mt-2 line-clamp-2 text-xs text-slate-500">{{ e.address }}</p>
        <button
          v-if="auth.hasRole(['SuperAdmin', 'SafetyInspector'])"
          type="button"
          class="btn-ghost mt-3"
          @click="openEdit(e.id)"
        >
          编辑档案
        </button>
      </article>
    </div>
  </div>
</template>
