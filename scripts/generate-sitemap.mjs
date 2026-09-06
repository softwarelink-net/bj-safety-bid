#!/usr/bin/env node
/**
 * 生成完整 sitemap.xml + robots.txt
 * 规范：xsi:schemaLocation；仅首页含 image:image
 */
import { mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const host = 'https://bj-safety-bid.softwarelink.net'
const lastmod = '2026-09-04'

const paths = [
  {
    loc: '/',
    changefreq: 'daily',
    priority: '1.0',
    image: {
      loc: `${host}/docs/assets/dashboard-preview.png`,
      title: '北京安全生产监管综合信息平台（二期）控制台预览',
      caption: '隐患治理与监测分析一张图演示截图',
    },
  },
  { loc: '/tender', changefreq: 'weekly', priority: '0.9' },
  { loc: '/login', changefreq: 'monthly', priority: '0.7' },
  { loc: '/dashboard', changefreq: 'daily', priority: '0.8' },
  { loc: '/hazards', changefreq: 'daily', priority: '0.8' },
  { loc: '/enterprises', changefreq: 'daily', priority: '0.8' },
  { loc: '/system', changefreq: 'monthly', priority: '0.5' },
]

function urlEntry(p) {
  const lines = [
    '  <url>',
    `    <loc>${host}${p.loc === '/' ? '/' : p.loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${p.changefreq}</changefreq>`,
    `    <priority>${p.priority}</priority>`,
  ]
  if (p.image) {
    lines.push('    <image:image>')
    lines.push(`      <image:loc>${p.image.loc}</image:loc>`)
    lines.push(`      <image:title>${p.image.title}</image:title>`)
    if (p.image.caption) {
      lines.push(`      <image:caption>${p.image.caption}</image:caption>`)
    }
    lines.push('    </image:image>')
  }
  lines.push('  </url>')
  return lines.join('\n')
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd
                            http://www.google.com/schemas/sitemap-image/1.1 http://www.google.com/schemas/sitemap-image/1.1/sitemap-image.xsd">
${paths.map(urlEntry).join('\n')}
</urlset>
`

const robots = `User-agent: *
Allow: /

Sitemap: ${host}/sitemap.xml
`

const targets = [join(root, 'public')]
const dist = join(root, 'dist')
if (existsSync(dist)) targets.push(dist)

for (const dir of targets) {
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'sitemap.xml'), sitemap, 'utf8')
  writeFileSync(join(dir, 'robots.txt'), robots, 'utf8')
}

// Ensure preview image lands in dist for R2 upload
const previewSrc = join(root, 'docs', 'assets', 'dashboard-preview.png')
if (existsSync(previewSrc) && existsSync(dist)) {
  const previewDist = join(dist, 'docs', 'assets')
  mkdirSync(previewDist, { recursive: true })
  copyFileSync(previewSrc, join(previewDist, 'dashboard-preview.png'))
}

console.log(`✓ sitemap.xml (${paths.length} urls) + robots.txt → ${host}`)
