<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import L from 'leaflet'
import { useAuthStore } from '@/stores/auth'
import { useDbStore } from '@/stores/db'
import { STATUS_LABELS } from '@/types/safety'

const auth = useAuthStore()
const db = useDbStore()

const mapEl = ref<HTMLDivElement | null>(null)
const severityEl = ref<HTMLDivElement | null>(null)
const trendEl = ref<HTMLDivElement | null>(null)
const pipelineEl = ref<HTMLDivElement | null>(null)

let map: L.Map | null = null
let markersLayer: L.LayerGroup | null = null
let severityChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let pipelineChart: echarts.ECharts | null = null

function levelColor(level: string) {
  if (level === 'High') return '#dc2626'
  if (level === 'Medium') return '#d97706'
  return '#059669'
}

function renderMap() {
  if (!mapEl.value || !db.stats) return
  if (!map) {
    map = L.map(mapEl.value, { zoomControl: true }).setView([39.9042, 116.4074], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map)
    markersLayer = L.layerGroup().addTo(map)
  }
  markersLayer?.clearLayers()
  for (const p of db.stats.mapPoints) {
    const marker = L.circleMarker([p.lat, p.lng], {
      radius: 8 + Math.min(p.hazardCount, 4),
      color: '#fff',
      weight: 2,
      fillColor: levelColor(p.safety_level),
      fillOpacity: 0.9,
    })
    marker.bindPopup(
      `<strong>${p.name}</strong><br/>安全指数 ${p.safety_index}<br/>未销号隐患 ${p.hazardCount}`,
    )
    markersLayer?.addLayer(marker)
  }
  nextTick(() => map?.invalidateSize())
}

function renderCharts() {
  if (!db.stats) return
  if (severityEl.value) {
    severityChart ??= echarts.init(severityEl.value)
    severityChart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['42%', '70%'],
          data: db.stats.severityShares,
          label: { color: '#334155' },
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          color: ['#dc2626', '#d97706', '#0284c7'],
        },
      ],
    })
  }
  if (trendEl.value) {
    trendChart ??= echarts.init(trendEl.value)
    trendChart.setOption({
      grid: { left: 36, right: 12, top: 24, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: db.stats.indexTrend.map((i) => i.day) },
      yAxis: { type: 'value', min: 60, max: 100 },
      series: [
        {
          type: 'line',
          smooth: true,
          data: db.stats.indexTrend.map((i) => i.value),
          areaStyle: { color: 'rgba(30,64,175,0.15)' },
          lineStyle: { color: '#1e40af', width: 3 },
          itemStyle: { color: '#0284c7' },
        },
      ],
    })
  }
  if (pipelineEl.value) {
    pipelineChart ??= echarts.init(pipelineEl.value)
    pipelineChart.setOption({
      grid: { left: 56, right: 16, top: 16, bottom: 28 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: db.stats.statusPipeline.map((s) => STATUS_LABELS[s.status as keyof typeof STATUS_LABELS]),
      },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          type: 'bar',
          data: db.stats.statusPipeline.map((s) => s.count),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#1e3a8a' },
            ]),
            borderRadius: [6, 6, 0, 0],
          },
        },
      ],
    })
  }
}

function refreshAll() {
  if (auth.engineReady) {
    db.refresh()
    renderMap()
    renderCharts()
  }
}

function onResize() {
  severityChart?.resize()
  trendChart?.resize()
  pipelineChart?.resize()
  map?.invalidateSize()
}

onMounted(() => {
  refreshAll()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  severityChart?.dispose()
  trendChart?.dispose()
  pipelineChart?.dispose()
  map?.remove()
})

watch(
  () => db.revision,
  () => {
    renderMap()
    renderCharts()
  },
)
</script>

<template>
  <div class="space-y-4">
    <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div class="panel p-4">
        <p class="text-xs text-slate-500">监管企业</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">{{ db.stats?.enterpriseCount ?? '—' }}</p>
      </div>
      <div class="panel p-4">
        <p class="text-xs text-slate-500">未销号隐患</p>
        <p class="mt-1 text-2xl font-bold text-amber-600">{{ db.stats?.openHazards ?? '—' }}</p>
      </div>
      <div class="panel p-4">
        <p class="text-xs text-slate-500">重大隐患</p>
        <p class="mt-1 text-2xl font-bold text-rose-600">{{ db.stats?.criticalHazards ?? '—' }}</p>
      </div>
      <div class="panel p-4">
        <p class="text-xs text-slate-500">全市安全指数</p>
        <p class="mt-1 text-2xl font-bold text-blue-700">{{ db.stats?.avgSafetyIndex ?? '—' }}</p>
      </div>
    </div>

    <div class="grid gap-4 xl:grid-cols-3">
      <div class="panel overflow-hidden xl:col-span-2">
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <h3 class="font-semibold text-slate-800">安全生产监测分析一张图</h3>
            <p class="text-xs text-slate-500">企业点位 · 风险等级着色 · 隐患热力示意（Leaflet）</p>
          </div>
          <span class="badge bg-blue-50 text-blue-700 ring-blue-200">京办联动模拟</span>
        </div>
        <div ref="mapEl" class="h-[420px] w-full bg-slate-100" />
      </div>

      <div class="panel p-4">
        <h3 class="font-semibold text-slate-800">实时动态</h3>
        <ul class="mt-3 space-y-3">
          <li
            v-for="item in db.stats?.feedItems || []"
            :key="item.id"
            class="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
          >
            <div class="flex items-start justify-between gap-2">
              <p class="text-slate-700">{{ item.text }}</p>
              <span class="shrink-0 text-xs text-slate-400">{{ item.time }}</span>
            </div>
            <span
              class="mt-1 inline-block text-[11px] font-medium"
              :class="{
                'text-emerald-600': item.tone === 'ok',
                'text-amber-600': item.tone === 'warn',
                'text-rose-600': item.tone === 'danger',
              }"
            >
              {{ item.tone === 'ok' ? '正常' : item.tone === 'warn' ? '关注' : '告警' }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="panel p-4">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">隐患严重程度分布</h3>
        <div ref="severityEl" class="h-56" />
      </div>
      <div class="panel p-4">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">安全指数近7日趋势</h3>
        <div ref="trendEl" class="h-56" />
      </div>
      <div class="panel p-4">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">治理闭环管道</h3>
        <div ref="pipelineEl" class="h-56" />
      </div>
    </div>
  </div>
</template>
