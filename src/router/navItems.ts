export interface NavItem {
  path: string
  label: string
  icon: string
  color: string
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: '首页', icon: '🏠', color: 'var(--c-pink)' },
  { path: '/students', label: '学生', icon: '🧒', color: 'var(--c-blue)' },
  { path: '/schedule', label: '课表', icon: '📅', color: 'var(--c-purple)' },
  { path: '/todos', label: '待办', icon: '✅', color: 'var(--c-green)' },
  { path: '/homework', label: '作业', icon: '📝', color: 'var(--c-yellow)' },
  { path: '/attendance', label: '考勤', icon: '📋', color: 'var(--c-orange)' },
]

export function matchTitle(pathname: string): string {
  const item = NAV_ITEMS.find((i) => i.path === pathname)
  if (item) return item.label
  if (pathname === '/settings') return '设置'
  return '班级小管家'
}
