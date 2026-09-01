import type { AttendStatus, PeriodConfig, SubmitStatus } from './types'

export const CANDY_COLORS = [
  { key: 'pink', label: '草莓粉', value: 'var(--c-pink)', soft: 'var(--c-pink-soft)' },
  { key: 'blue', label: '天空蓝', value: 'var(--c-blue)', soft: 'var(--c-blue-soft)' },
  { key: 'yellow', label: '柠檬黄', value: 'var(--c-yellow)', soft: 'var(--c-yellow-soft)' },
  { key: 'green', label: '薄荷绿', value: 'var(--c-green)', soft: 'var(--c-green-soft)' },
  { key: 'purple', label: '葡萄紫', value: 'var(--c-purple)', soft: 'var(--c-purple-soft)' },
  { key: 'orange', label: '蜜桃橙', value: 'var(--c-orange)', soft: 'var(--c-orange-soft)' },
] as const

export type CandyColorKey = (typeof CANDY_COLORS)[number]['key']

/** 自定义色值统一用 #RRGGBB 存储 */
export function isHexColor(value?: string): boolean {
  return Boolean(value && /^#[0-9a-fA-F]{6}$/.test(value))
}

/** 取主色：支持预设 key 或自定义十六进制 */
export function valueOf(key?: string): string {
  if (isHexColor(key)) return key as string
  return CANDY_COLORS.find((c) => c.key === key)?.value ?? 'var(--c-pink)'
}

/** 取浅色底：预设取对应浅色，自定义色按比例与白色混合 */
export function softOf(key?: string): string {
  if (isHexColor(key)) return `color-mix(in srgb, ${key} 20%, white)`
  return CANDY_COLORS.find((c) => c.key === key)?.soft ?? 'var(--c-pink-soft)'
}

export const SUBMIT_STATUS: Record<
  SubmitStatus,
  { label: string; emoji: string; bg: string; fg: string }
> = {
  0: { label: '待完成', emoji: '⬜', bg: 'var(--c-bg-soft)', fg: 'var(--c-ink-3)' },
  1: { label: '已完成', emoji: '✅', bg: 'var(--c-green-soft)', fg: '#3f9a56' },
  2: { label: '订正', emoji: '✏️', bg: 'var(--c-yellow-soft)', fg: '#c98a1e' },
  3: { label: '缺交', emoji: '❌', bg: 'var(--c-pink-soft)', fg: '#d9607a' },
}

/** 作业状态的点击循环顺序：待完成 → 已完成 → 订正 → 缺交 */
export const SUBMIT_CYCLE: SubmitStatus[] = [0, 1, 2, 3]

export const ATTEND_STATUS: Record<
  AttendStatus,
  { label: string; emoji: string; bg: string; fg: string }
> = {
  0: { label: '到达', emoji: '✅', bg: 'var(--c-green-soft)', fg: '#3f9a56' },
  1: { label: '迟到', emoji: '⏰', bg: 'var(--c-yellow-soft)', fg: '#c98a1e' },
  2: { label: '缺勤', emoji: '❌', bg: 'var(--c-pink-soft)', fg: '#d9607a' },
  3: { label: '请假', emoji: '🏖️', bg: 'var(--c-purple-soft)', fg: '#7a5cc4' },
}

/** 考勤状态的点击循环顺序：到达 → 迟到 → 缺勤 → 请假 */
export const ATTEND_CYCLE: AttendStatus[] = [0, 1, 2, 3]

export const WEEKDAY_LABEL = ['一', '二', '三', '四', '五', '六', '日']

/** 常用教学科目预设，可在首页「我的科目」中自定义补充 */
export const SUBJECT_PRESETS = ['语文', '数学', '英语', '音乐', '体育']

/** 默认考勤时段：只保留「早读」，其余可在设置中自行添加 */
export const DEFAULT_ATTENDANCE_SLOTS = ['早读']

/** 默认值是否已写入，避免重复补默认值（严格模式下副作用会执行两次） */
export const ATTENDANCE_DEFAULTS_FLAG = 'attendanceDefaultsReady'

export const DEFAULT_PERIODS: PeriodConfig[] = [
  { index: 1, name: '第一节', startTime: '08:00', endTime: '08:45' },
  { index: 2, name: '第二节', startTime: '08:55', endTime: '09:40' },
  { index: 3, name: '第三节', startTime: '10:00', endTime: '10:45' },
  { index: 4, name: '第四节', startTime: '10:55', endTime: '11:40' },
  { index: 5, name: '第五节', startTime: '14:00', endTime: '14:45' },
  { index: 6, name: '第六节', startTime: '14:55', endTime: '15:40' },
  { index: 7, name: '第七节', startTime: '16:00', endTime: '16:45' },
]
