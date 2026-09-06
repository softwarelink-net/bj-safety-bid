<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="mx-auto max-w-lg panel p-8 text-center">
    <p class="text-5xl font-bold text-blue-800">403</p>
    <h2 class="mt-3 text-xl font-semibold text-slate-800">无权访问该模块</h2>
    <p class="mt-2 text-sm text-slate-500">当前角色不具备该路由的 RBAC 权限，请联系系统管理员。</p>
    <div class="mt-6 flex justify-center gap-3">
      <RouterLink to="/dashboard" class="btn-primary">返回一张图</RouterLink>
      <RouterLink to="/login" class="btn-ghost">重新登录</RouterLink>
    </div>
  </div>
</template>
