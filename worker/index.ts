/**
 * Cloudflare Worker — allworld（共享，非 Pages）
 * 本站 slug: bj-safety-bid
 * D1: Allworld / 表前缀 bsb_
 * R2: bj-safety-bid-assets + allworld-sites/bj-safety-bid/
 *
 * 多站点安全约束：
 * - 仅对本站主机处理业务路径
 * - 其他子域只读 allworld-sites/<slug>/，绝不写入/删除其他前缀
 */
import { CORS_HEADERS, SQLITE_PATH, type Env } from './utils'

const PROJECT_SLUG = 'bj-safety-bid'

function siteIdFromHost(hostname: string, rootDomain: string): string {
  const host = hostname.toLowerCase()
  const root = rootDomain.toLowerCase()
  if (host === root) return '_root'
  if (host === `www.${root}`) return 'www'
  if (host.endsWith(`.${root}`)) return host.slice(0, -(root.length + 1))
  return host
}

function isProjectHost(hostname: string, env: Env): boolean {
  const host = hostname.toLowerCase().replace(/\.$/, '')
  const root = (env.ROOT_DOMAIN || 'softwarelink.net').toLowerCase()
  const slug = (env.PROJECT_SLUG || env.SITE_SLUG || PROJECT_SLUG).toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost')) return true
  if (host.endsWith('.workers.dev')) return true
  if (host === 'bj-safety-bid.softwarelink.net') return true
  if (host === `${slug}.${root}`) return true
  if (host.startsWith(`${slug}.`)) return true
  if (host.includes('bj-safety-bid')) return true
  if (host.includes(slug)) return true
  return false
}

function contentTypeFor(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || ''
  const map: Record<string, string> = {
    html: 'text/html; charset=utf-8',
    js: 'application/javascript; charset=utf-8',
    css: 'text/css; charset=utf-8',
    json: 'application/json; charset=utf-8',
    svg: 'image/svg+xml',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    ico: 'image/x-icon',
    txt: 'text/plain; charset=utf-8',
    map: 'application/json',
    xml: 'application/xml; charset=utf-8',
    woff: 'font/woff',
    woff2: 'font/woff2',
    wasm: 'application/wasm',
    sqlite: 'application/x-sqlite3',
  }
  return map[ext] || 'application/octet-stream'
}

function emptySitePage(siteId: string): Response {
  if (siteId === '_root' || siteId === 'www') {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>allworld · softwarelink.net</title>
</head>
<body style="font-family:system-ui;padding:2rem;background:#0f172a;color:#e2e8f0">
  <h1>allworld</h1>
  <p>共享 Worker + R2 allworld-sites 多站点边缘托管。</p>
  <ul>
    <li><a href="https://bj-safety-bid.softwarelink.net/" style="color:#60a5fa">北京安全生产监管平台二期</a></li>
  </ul>
</body>
</html>`
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }

  const html = `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8"/><title>${siteId}</title></head>
<body style="font-family:system-ui;padding:2rem"><h1>${siteId}</h1><p>R2 尚无静态文件。</p></body></html>`
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function handleSiteSqlite(request: Request, bucket: R2Bucket, key: string): Promise<Response> {
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (method === 'GET') {
    const obj = await bucket.get(key)
    if (!obj) return new Response(null, { status: 404, headers: CORS_HEADERS })
    const headers = new Headers(CORS_HEADERS)
    headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/x-sqlite3')
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }

  if (method === 'PUT') {
    const body = await request.arrayBuffer()
    await bucket.put(key, body, {
      httpMetadata: { contentType: 'application/x-sqlite3' },
    })
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
    })
  }

  return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  })
}

async function serveR2Site(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const siteId = siteIdFromHost(url.hostname, env.ROOT_DOMAIN || 'softwarelink.net')

  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ success: false, error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    })
  }

  if (url.pathname === SQLITE_PATH && env.SITES) {
    return handleSiteSqlite(request, env.SITES, `${siteId}${SQLITE_PATH}`)
  }

  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/')) pathname += 'index.html'
  if (pathname === '') pathname = '/index.html'

  const candidates = [
    `${siteId}${pathname}`,
    `${siteId}${pathname}.html`,
    `${siteId}${pathname}/index.html`,
    `${siteId}/index.html`,
  ]

  for (const key of candidates) {
    const obj = await env.SITES?.get(key)
    if (!obj) continue
    const headers = new Headers()
    headers.set('Content-Type', obj.httpMetadata?.contentType || contentTypeFor(key))
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }

  if (!pathname.split('/').pop()?.includes('.')) {
    const indexObj = await env.SITES?.get(`${siteId}/index.html`)
    if (indexObj) {
      return new Response(indexObj.body, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
  }

  return emptySitePage(siteId)
}

async function serveProjectStorage(request: Request, env: Env): Promise<Response | null> {
  if (!env.STORAGE) return null
  const url = new URL(request.url)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.endsWith('/') || pathname === '') pathname = '/index.html'
  const key = pathname.replace(/^\//, '')
  const slug = env.PROJECT_SLUG || env.SITE_SLUG || PROJECT_SLUG
  const keys = [key, `${slug}/${key}`]
  if (!key.includes('.')) keys.push('index.html', `${slug}/index.html`)

  for (const candidate of keys) {
    const obj = await env.STORAGE.get(candidate)
    if (!obj) continue
    const headers = new Headers()
    headers.set('Content-Type', obj.httpMetadata?.contentType || contentTypeFor(candidate))
    if (obj.httpEtag) headers.set('ETag', obj.httpEtag)
    return new Response(obj.body, { headers })
  }
  return null
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (isProjectHost(url.hostname, env)) {
      if (url.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({
            ok: true,
            message: 'Demo prototype — business logic runs in browser sql.js',
            slug: PROJECT_SLUG,
          }),
          { headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS } },
        )
      }
      if (url.pathname === SQLITE_PATH && env.STORAGE) {
        const slug = env.PROJECT_SLUG || env.SITE_SLUG || PROJECT_SLUG
        return handleSiteSqlite(request, env.STORAGE, `${slug}${SQLITE_PATH}`)
      }
      const fromR2 = await serveProjectStorage(request, env)
      if (fromR2) return fromR2
      if (env.ASSETS) return env.ASSETS.fetch(request)
      return new Response('ASSETS / STORAGE not configured', { status: 500 })
    }

    try {
      return await serveR2Site(request, env)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error'
      return new Response(JSON.stringify({ ok: false, error: message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      })
    }
  },
} satisfies ExportedHandler<Env>
