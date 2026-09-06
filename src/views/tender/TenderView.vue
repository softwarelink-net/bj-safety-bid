<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="w-full max-w-4xl mx-auto">
    <div class="panel p-6 md:p-8">
      <div class="border-b border-slate-200 pb-4 mb-6">
        <span class="badge mb-2 bg-rose-50 text-rose-700 ring-rose-200">公开招标公告</span>
        <h1 class="text-2xl font-bold text-slate-900 leading-relaxed">
          安全生产监管综合信息平台（二期）项目（第一包：安全生产检查和隐患治理信息子系统软件开发）公开招标公告
        </h1>
      </div>

      <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">1. Title</h2>
          <p>
            安全生产监管综合信息平台（二期）项目（第一包：安全生产检查和隐患治理信息子系统软件开发）公开招标公告
          </p>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">2. Issuing Authority</h2>
          <p>北京市应急管理局机关 (Beijing Municipal Emergency Management Bureau)</p>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">3. Project Number</h2>
          <p>11000026210200183840-XM001</p>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">4. Publication Date</h2>
          <p>2026-09-04</p>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">5. Keywords</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="k in [
                '安全生产监管',
                '隐患治理',
                '北京应急管理局',
                '政府采购',
                '智慧安监',
                '京办升级',
                '一张图',
              ]"
              :key="k"
              class="badge bg-blue-50 text-blue-700 ring-blue-200"
              >{{ k }}</span
            >
          </div>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">6. Abstract</h2>
          <p>
            The Beijing Municipal Emergency Management Bureau is launching Phase II of its Safety
            Production Supervision Platform. Budget: 6.905 million RMB. Key deliverables include
            upgrading enterprise self-inspection modules, Jingban PC/Mobile apps, a "One Map"
            monitoring system, safety index calculation, and enterprise ledger upgrades. Completion
            deadline: March 31, 2027.
          </p>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">7. Technical Highlights</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Integration with "Jingban" ecosystem (PC &amp; Mobile).</li>
            <li>Real-time "One Map" GIS visualization for hazard monitoring.</li>
            <li>AI-assisted intelligent modules for auxiliary personnel.</li>
            <li>Seamless data exchange with existing vertical systems.</li>
          </ul>
        </section>
        <section>
          <h2 class="text-lg font-semibold text-blue-800 mb-2">8. Innovation Points</h2>
          <ul class="list-disc pl-5 space-y-1">
            <li>Shift from passive supervision to proactive governance via digital self-inspection.</li>
            <li>Unified data ledger for comprehensive enterprise profiling.</li>
            <li>High-performance client-side SQLite processing for offline-capable field inspections.</li>
          </ul>
        </section>
      </div>

      <div class="mt-8 pt-4 border-t border-slate-200 flex flex-wrap gap-4">
        <RouterLink to="/login" class="btn-primary">进入演示控制台</RouterLink>
        <a
          href="https://github.com/softwarelink-net/bj-safety-bid"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-ghost"
          >查看源码仓库</a
        >
      </div>
    </div>
  </div>
</template>
