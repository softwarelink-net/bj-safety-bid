export type UserRole = 'SuperAdmin' | 'SafetyInspector' | 'EnterpriseUser' | 'Viewer'

export const ROLE_LABELS: Record<UserRole, string> = {
  SuperAdmin: '系统管理员',
  SafetyInspector: '现场巡查员',
  EnterpriseUser: '企业安管员',
  Viewer: '公众观察员',
}

export interface BsbUser {
  id: number
  username: string
  full_name: string | null
  org_name: string | null
  role: UserRole
  phone: string | null
  status: number
}

export interface Enterprise {
  id: number
  name: string
  credit_code: string | null
  address: string | null
  district: string | null
  industry_type: string | null
  safety_level: 'High' | 'Medium' | 'Low'
  contact_name: string | null
  contact_phone: string | null
  location_lat: number | null
  location_lng: number | null
  safety_index: number
  created_at?: string
}

export type HazardSeverity = 'Critical' | 'Major' | 'General'
export type HazardStatus = 'Reported' | 'Assigned' | 'Rectifying' | 'Verified' | 'Closed'

export interface HiddenDanger {
  id: number
  enterprise_id: number | null
  reporter_id: number | null
  title: string | null
  description: string
  severity: HazardSeverity
  status: HazardStatus
  location_lat: number | null
  location_lng: number | null
  deadline: string | null
  created_at?: string
  updated_at?: string
  enterprise_name?: string
  reporter_name?: string
}

export interface SystemConfig {
  key: string
  value: string
  description: string | null
}

export interface AuditLog {
  id: number
  user_id: number | null
  username: string | null
  action_name: string
  request_uri: string | null
  status_code: number | null
  created_at: string
}

export interface DashboardStats {
  enterpriseCount: number
  openHazards: number
  criticalHazards: number
  avgSafetyIndex: number
  closedThisMonth: number
  districtCounts: { district: string; count: number }[]
  severityShares: { name: string; value: number }[]
  statusPipeline: { status: string; count: number }[]
  indexTrend: { day: string; value: number }[]
  feedItems: { id: string; text: string; time: string; tone: 'ok' | 'warn' | 'danger' }[]
  mapPoints: {
    id: number
    name: string
    lat: number
    lng: number
    safety_level: string
    safety_index: number
    hazardCount: number
  }[]
}

export const SEVERITY_LABELS: Record<HazardSeverity, string> = {
  Critical: '重大',
  Major: '较大',
  General: '一般',
}

export const STATUS_LABELS: Record<HazardStatus, string> = {
  Reported: '已上报',
  Assigned: '已分派',
  Rectifying: '整改中',
  Verified: '已核验',
  Closed: '已销号',
}

export const LEVEL_LABELS: Record<string, string> = {
  High: '高风险',
  Medium: '中风险',
  Low: '低风险',
}
