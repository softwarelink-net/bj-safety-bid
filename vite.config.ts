import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

const SITE_TITLE = '北京应急局安全生产监管平台二期招标-隐患治理子系统开发'
const SITE_KEYWORDS =
  '安全生产监管, 隐患治理, 北京应急管理局, 政府采购, 智慧安监, 京办升级, 一张图'
const SITE_DESCRIPTION =
  '北京市应急管理局发布安全生产监管综合信息平台（二期）招标公告，预算690.5万元。涵盖隐患自查、监测分析一张图及京办端升级，2027年3月验收。'
const SITE_URL = 'https://bj-safety-bid.softwarelink.net/'

const routeMeta: Record<string, { title: string; description?: string }> = {
  '/': {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  '/login': {
    title: '用户登录 · 安全生产检查和隐患治理子系统',
    description: '演示账号登录北京市应急管理局安全生产监管平台原型控制台。',
  },
  '/tender': {
    title: '招标公告全文 · 安全生产监管综合信息平台（二期）',
    description: SITE_DESCRIPTION,
  },
  '/dashboard': {
    title: '监测分析一张图 · 安全生产监管平台',
    description: '企业点位、隐患告警与安全指数趋势的 GIS 态势可视化演示。',
  },
  '/hazards': {
    title: '隐患治理闭环 · 安全生产监管平台',
    description: '隐患上报、分派、整改与核销全流程演示。',
  },
  '/enterprises': {
    title: '企业一企一档 · 安全生产监管平台',
    description: '生产经营单位统一台账与合规状态管理演示。',
  },
  '/system': {
    title: '系统配置 · 安全生产监管平台',
    description: '功能开关、字典与角色配置演示。',
  },
}

function seoInjectPlugin(): Plugin {
  return {
    name: 'seo-inject',
    transformIndexHtml(html) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: SITE_TITLE,
        description: SITE_DESCRIPTION,
        datePublished: '2026-09-04',
        author: { '@type': 'Organization', name: '北京市应急管理局' },
        publisher: { '@type': 'Organization', name: 'SoftwareLink' },
        mainEntityOfPage: { '@type': 'WebPage', '@id': SITE_URL },
      }
      return {
        html,
        tags: [
          { tag: 'title', children: SITE_TITLE, injectTo: 'head' },
          {
            tag: 'meta',
            attrs: { name: 'keywords', content: SITE_KEYWORDS },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { name: 'description', content: SITE_DESCRIPTION },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { property: 'og:type', content: 'article' },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { property: 'og:title', content: SITE_TITLE },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { property: 'og:description', content: SITE_DESCRIPTION },
            injectTo: 'head',
          },
          {
            tag: 'meta',
            attrs: { property: 'og:url', content: SITE_URL },
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(jsonLd),
            injectTo: 'head',
          },
        ],
      }
    },
  }
}

export default defineConfig({
  plugins: [vue(), seoInjectPlugin()],
  define: {
    __ROUTE_META__: JSON.stringify(routeMeta),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    include: ['sql.js/dist/sql-wasm.js'],
  },
  assetsInclude: ['**/*.wasm'],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          echarts: ['echarts'],
          leaflet: ['leaflet'],
          vendor: ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
})
