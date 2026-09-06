export interface Env {
  STORAGE?: R2Bucket
  SITES?: R2Bucket
  ASSETS?: Fetcher
  PROJECT_SLUG?: string
  REPO_NAME?: string
  SITE_SLUG?: string
  DEPLOYMENT_HOST?: string
  HOST_DOMAIN?: string
  ROOT_DOMAIN?: string
  SITE_HOST?: string
  APP_NAME?: string
  TABLE_PREFIX?: string
  R2_SITE_PREFIX?: string
}

/** 与前端 sql.js 加载路径一致 */
export const SQLITE_PATH = '/data/bsb_database.sqlite'

export const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS_HEADERS },
  })
}
