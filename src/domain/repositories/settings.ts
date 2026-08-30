import { db } from '@/db/db'
import { DEFAULT_PERIODS } from '@/domain/constants'
import type { AppSettings, PeriodConfig } from '@/domain/types'

export const DEFAULT_SETTINGS: AppSettings = {
  periods: DEFAULT_PERIODS,
  showWeekend: false,
  theme: 'light',
  /** 默认任教科目，可随时在首页「我的科目」中增删 */
  mySubjects: ['语文', '数学', '英语', '体育'],
}

export async function getSettings(): Promise<AppSettings> {
  const row = await db.settings.get('app')
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<AppSettings>) ?? {}) }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<void> {
  const cur = await getSettings()
  await db.settings.put({ key: 'app', value: { ...cur, ...patch } })
}

export function normalizePeriods(periods: PeriodConfig[]): PeriodConfig[] {
  return [...periods].sort((a, b) => a.index - b.index)
}
