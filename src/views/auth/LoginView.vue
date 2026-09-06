<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'

const auth = useAuthStore()
const db = useDbStore()
const router = useRouter()
const route = useRoute()

const username = ref('admin')
const password = ref('admin123')
const loading = ref(false)
const error = ref('')

const demos = [
  { role: 'SuperAdmin', user: 'admin', pass: 'admin123' },
  { role: 'Inspector', user: 'inspector01', pass: 'pass1234' },
  { role: 'Enterprise', user: 'ent_user01', pass: 'pass1234' },
]

async function onSubmit() {
  loading.value = true
  error.value = ''
  try {
    const res = await auth.login(username.value, password.value)
    if (!res.ok) {
      error.value = res.message
      return
    }
    db.refresh()
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}

function fill(user: string, pass: string) {
  username.value = user
  password.value = pass
}
</script>

<template>
  <div class="mx-auto w-full max-w-md">
    <div class="panel overflow-hidden">
      <div class="bg-gradient-to-r from-blue-800 to-sky-600 px-6 py-5 text-white">
        <h2 class="text-xl font-bold">控制台登录</h2>
        <p class="mt-1 text-sm text-sky-100">sql.js 本地鉴权 · Session 持久化 · RBAC 路由拦截</p>
      </div>
      <form class="space-y-4 p-6" @submit.prevent="onSubmit">
        <label class="block text-sm">
          <span class="mb-1 block text-slate-600">用户名</span>
          <input
            v-model="username"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            autocomplete="username"
          />
        </label>
        <label class="block text-sm">
          <span class="mb-1 block text-slate-600">密码</span>
          <input
            v-model="password"
            type="password"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            autocomplete="current-password"
          />
        </label>
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <button class="btn-primary w-full" type="submit" :disabled="loading">
          {{ loading ? '登录中…' : '进入监管平台' }}
        </button>
      </form>
      <div class="border-t border-slate-100 bg-slate-50 px-6 py-4">
        <p class="mb-2 text-xs font-medium text-slate-500">演示账号一键填充</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="d in demos"
            :key="d.user"
            type="button"
            class="btn-ghost"
            @click="fill(d.user, d.pass)"
          >
            {{ d.role }}
          </button>
        </div>
        <p class="mt-3 text-xs text-slate-400">
          <RouterLink to="/tender" class="text-blue-600 hover:underline">查看招标公告全文</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
