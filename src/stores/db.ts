import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Enterprise, HiddenDanger, SystemConfig, DashboardStats } from '@/types/safety'
import {
  createHazard,
  getDashboardStats,
  getEnterprises,
  getHazards,
  getSystemConfigs,
  updateHazardStatus,
  updateSystemConfig,
  upsertEnterprise,
} from '@/utils/sqljs-engine'
import type { HazardSeverity, HazardStatus } from '@/types/safety'

export const useDbStore = defineStore('db', () => {
  const enterprises = ref<Enterprise[]>([])
  const hazards = ref<HiddenDanger[]>([])
  const configs = ref<SystemConfig[]>([])
  const stats = ref<DashboardStats | null>(null)
  const revision = ref(0)

  function refresh() {
    enterprises.value = getEnterprises()
    hazards.value = getHazards()
    configs.value = getSystemConfigs()
    stats.value = getDashboardStats()
    revision.value += 1
  }

  function addHazard(input: {
    enterprise_id: number
    reporter_id: number
    title: string
    description: string
    severity: HazardSeverity
    deadline?: string
  }) {
    const id = createHazard(input)
    refresh()
    return id
  }

  function setHazardStatus(id: number, status: HazardStatus, operatorId?: number) {
    updateHazardStatus(id, status, operatorId)
    refresh()
  }

  function saveEnterprise(payload: Partial<Enterprise> & { name: string }) {
    const id = upsertEnterprise(payload)
    refresh()
    return id
  }

  function setConfig(key: string, value: string) {
    updateSystemConfig(key, value)
    refresh()
  }

  return {
    enterprises,
    hazards,
    configs,
    stats,
    revision,
    refresh,
    addHazard,
    setHazardStatus,
    saveEnterprise,
    setConfig,
  }
})
