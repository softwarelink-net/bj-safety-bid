import type { Database, SqlJsStatic } from 'sql.js'
import { md5 } from './md5'
import type {
  AuditLog,
  BsbUser,
  DashboardStats,
  Enterprise,
  HazardSeverity,
  HazardStatus,
  HiddenDanger,
  SystemConfig,
} from '@/types/safety'

let SQL: SqlJsStatic | null = null
let db: Database | null = null
let readyPromise: Promise<void> | null = null

type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>

async function loadInitSqlJs(): Promise<InitSqlJs> {
  const mod = await import('sql.js/dist/sql-wasm.js')
  const factory = (mod as { default?: InitSqlJs }).default ?? (mod as unknown as InitSqlJs)
  return factory
}

function rowsFromExec<T>(sql: string, params: unknown[] = []): T[] {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  const stmt = db.prepare(sql)
  stmt.bind(params as never[])
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

export async function initSqlEngine(): Promise<void> {
  if (db) return
  if (readyPromise) return readyPromise

  readyPromise = (async () => {
    const initSqlJs = await loadInitSqlJs()
    SQL = await initSqlJs({
      locateFile: (file) => `/${file}`,
    })
    const response = await fetch('/data/bsb_database.sqlite')
    if (!response.ok) {
      throw new Error(`无法加载 SQLite 数据库: ${response.status}`)
    }
    const buffer = await response.arrayBuffer()
    db = new SQL.Database(new Uint8Array(buffer))
  })()

  return readyPromise
}

export function isEngineReady() {
  return !!db
}

export async function login(username: string, password: string): Promise<BsbUser | null> {
  await initSqlEngine()
  const hash = md5(password)
  const users = rowsFromExec<BsbUser & { password_hash: string }>(
    `SELECT id, username, password_hash, full_name, org_name, role, phone, status
     FROM bsb_users WHERE username = ? AND status = 1 LIMIT 1`,
    [username],
  )
  const user = users[0]
  if (!user || user.password_hash !== hash) {
    writeAuditLog({ username, action_name: 'LOGIN_FAILED', request_uri: '/login', status_code: 401 })
    return null
  }
  const { password_hash: _ph, ...safe } = user
  writeAuditLog({
    user_id: safe.id,
    username: safe.username,
    action_name: 'LOGIN_SUCCESS',
    request_uri: '/login',
    status_code: 200,
  })
  return safe
}

export function getEnterprises(): Enterprise[] {
  return rowsFromExec<Enterprise>(
    `SELECT * FROM bsb_enterprises ORDER BY
      CASE safety_level WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, safety_index ASC`,
  )
}

export function getEnterpriseById(id: number): Enterprise | null {
  return rowsFromExec<Enterprise>(`SELECT * FROM bsb_enterprises WHERE id = ?`, [id])[0] ?? null
}

export function upsertEnterprise(payload: Partial<Enterprise> & { name: string }): number {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  if (payload.id) {
    db.run(
      `UPDATE bsb_enterprises SET name=?, credit_code=?, address=?, district=?, industry_type=?,
       safety_level=?, contact_name=?, contact_phone=?, safety_index=? WHERE id=?`,
      [
        payload.name,
        payload.credit_code ?? null,
        payload.address ?? null,
        payload.district ?? null,
        payload.industry_type ?? null,
        payload.safety_level ?? 'Medium',
        payload.contact_name ?? null,
        payload.contact_phone ?? null,
        payload.safety_index ?? 80,
        payload.id,
      ],
    )
    return payload.id
  }
  db.run(
    `INSERT INTO bsb_enterprises (name, credit_code, address, district, industry_type, safety_level, contact_name, contact_phone, location_lat, location_lng, safety_index)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.name,
      payload.credit_code ?? null,
      payload.address ?? null,
      payload.district ?? null,
      payload.industry_type ?? null,
      payload.safety_level ?? 'Medium',
      payload.contact_name ?? null,
      payload.contact_phone ?? null,
      payload.location_lat ?? 39.9,
      payload.location_lng ?? 116.4,
      payload.safety_index ?? 80,
    ],
  )
  const row = rowsFromExec<{ id: number }>(`SELECT last_insert_rowid() as id`)[0]
  return row.id
}

export function getHazards(): HiddenDanger[] {
  return rowsFromExec<HiddenDanger>(
    `SELECT h.*, e.name as enterprise_name, u.full_name as reporter_name
     FROM bsb_hidden_dangers h
     LEFT JOIN bsb_enterprises e ON e.id = h.enterprise_id
     LEFT JOIN bsb_users u ON u.id = h.reporter_id
     ORDER BY
       CASE h.severity WHEN 'Critical' THEN 1 WHEN 'Major' THEN 2 ELSE 3 END,
       CASE h.status WHEN 'Closed' THEN 2 ELSE 1 END,
       h.created_at DESC`,
  )
}

export function createHazard(input: {
  enterprise_id: number
  reporter_id: number
  title: string
  description: string
  severity: HazardSeverity
  deadline?: string
}): number {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  const ent = getEnterpriseById(input.enterprise_id)
  db.run(
    `INSERT INTO bsb_hidden_dangers (enterprise_id, reporter_id, title, description, severity, status, location_lat, location_lng, deadline)
     VALUES (?, ?, ?, ?, ?, 'Reported', ?, ?, ?)`,
    [
      input.enterprise_id,
      input.reporter_id,
      input.title,
      input.description,
      input.severity,
      ent?.location_lat ?? null,
      ent?.location_lng ?? null,
      input.deadline ?? null,
    ],
  )
  const row = rowsFromExec<{ id: number }>(`SELECT last_insert_rowid() as id`)[0]
  writeAuditLog({
    user_id: input.reporter_id,
    action_name: 'CREATE_HAZARD',
    request_uri: '/hazards',
    status_code: 200,
  })
  return row.id
}

export function updateHazardStatus(id: number, status: HazardStatus, operatorId?: number): void {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  db.run(`UPDATE bsb_hidden_dangers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
    status,
    id,
  ])
  writeAuditLog({
    user_id: operatorId ?? null,
    action_name: `HAZARD_${status.toUpperCase()}`,
    request_uri: '/hazards',
    status_code: 200,
  })
}

export function getSystemConfigs(): SystemConfig[] {
  return rowsFromExec<SystemConfig>(`SELECT * FROM bsb_system_configs ORDER BY key`)
}

export function updateSystemConfig(key: string, value: string): void {
  if (!db) throw new Error('SQLite 引擎尚未初始化')
  db.run(`UPDATE bsb_system_configs SET value = ? WHERE key = ?`, [value, key])
  writeAuditLog({
    action_name: 'TOGGLE_FEATURE_FLAG',
    request_uri: '/system',
    status_code: 200,
  })
}

export function getAuditLogs(limit = 50): AuditLog[] {
  return rowsFromExec<AuditLog>(
    `SELECT * FROM bsb_audit_logs ORDER BY created_at DESC LIMIT ?`,
    [limit],
  )
}

export function writeAuditLog(partial: {
  user_id?: number | null
  username?: string | null
  action_name: string
  request_uri?: string | null
  status_code?: number | null
}): void {
  if (!db) return
  db.run(
    `INSERT INTO bsb_audit_logs (user_id, username, action_name, request_uri, status_code)
     VALUES (?, ?, ?, ?, ?)`,
    [
      partial.user_id ?? null,
      partial.username ?? null,
      partial.action_name,
      partial.request_uri ?? null,
      partial.status_code ?? 200,
    ],
  )
}

export function getDashboardStats(): DashboardStats {
  const enterprises = getEnterprises()
  const hazards = getHazards()
  const open = hazards.filter((h) => h.status !== 'Closed')
  const critical = open.filter((h) => h.severity === 'Critical')
  const avg =
    enterprises.length === 0
      ? 0
      : Math.round(
          (enterprises.reduce((s, e) => s + (e.safety_index || 0), 0) / enterprises.length) * 10,
        ) / 10

  const districtMap = new Map<string, number>()
  for (const e of enterprises) {
    const d = e.district || '未知'
    districtMap.set(d, (districtMap.get(d) || 0) + 1)
  }

  const severityShares = (['Critical', 'Major', 'General'] as const).map((s) => ({
    name: s === 'Critical' ? '重大' : s === 'Major' ? '较大' : '一般',
    value: hazards.filter((h) => h.severity === s).length,
  }))

  const statusPipeline = (['Reported', 'Assigned', 'Rectifying', 'Verified', 'Closed'] as const).map(
    (s) => ({
      status: s,
      count: hazards.filter((h) => h.status === s).length,
    }),
  )

  const indexTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date('2026-09-04')
    d.setDate(d.getDate() - (6 - i))
    return {
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.round((avg - 4 + i * 0.8 + (i % 3)) * 10) / 10,
    }
  })

  const hazardCountByEnt = new Map<number, number>()
  for (const h of open) {
    if (h.enterprise_id == null) continue
    hazardCountByEnt.set(h.enterprise_id, (hazardCountByEnt.get(h.enterprise_id) || 0) + 1)
  }

  return {
    enterpriseCount: enterprises.length,
    openHazards: open.length,
    criticalHazards: critical.length,
    avgSafetyIndex: avg,
    closedThisMonth: hazards.filter((h) => h.status === 'Closed').length,
    districtCounts: [...districtMap.entries()].map(([district, count]) => ({ district, count })),
    severityShares,
    statusPipeline,
    indexTrend,
    feedItems: [
      { id: 'f1', text: '朝阳危化仓储消防通道占用隐患已分派整改', time: '14:18', tone: 'warn' },
      { id: 'f2', text: '丰台施工临边防护核验通过，待销号', time: '13:42', tone: 'ok' },
      { id: 'f3', text: '顺义燃气输配站周边杂物堆积升为重大隐患', time: '12:05', tone: 'danger' },
      { id: 'f4', text: '京办移动端隐患自查表单已同步企业端', time: '11:20', tone: 'ok' },
      { id: 'f5', text: '房山边坡监测点离线告警触发一张图高亮', time: '10:08', tone: 'danger' },
    ],
    mapPoints: enterprises
      .filter((e) => e.location_lat != null && e.location_lng != null)
      .map((e) => ({
        id: e.id,
        name: e.name,
        lat: e.location_lat as number,
        lng: e.location_lng as number,
        safety_level: e.safety_level,
        safety_index: e.safety_index,
        hazardCount: hazardCountByEnt.get(e.id) || 0,
      })),
  }
}

export function exportDatabaseBytes(): Uint8Array | null {
  if (!db) return null
  return db.export()
}
