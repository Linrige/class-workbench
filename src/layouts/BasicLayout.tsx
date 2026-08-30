import { Link, Outlet, useLocation } from 'react-router-dom'
import { NAV_ITEMS, matchTitle } from '@/router/navItems'
import Toast from '@/components/ui/Toast'
import { ConfirmHost } from '@/components/ui/confirm'
import styles from './BasicLayout.module.css'

export default function BasicLayout() {
  const { pathname } = useLocation()
  const title = matchTitle(pathname)

  return (
    <div className={styles.shell}>
      <Toast />
      <ConfirmHost />
      {/* 桌面端：左侧悬浮导航 */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🍭</span>
          <span className={styles.brandText}>班级小管家</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                style={active ? { background: `color-mix(in srgb, ${item.color} 18%, white)` } : undefined}
              >
                <span className={styles.navEmoji}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <Link to="/settings" className={styles.settingsLink}>
          ⚙️ 设置
        </Link>
      </aside>

      {/* 主区域 */}
      <div className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <Link to="/settings" className={styles.headerSettings} aria-label="设置">
            ⚙️
          </Link>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      {/* 移动端：底部 TabBar */}
      <nav className={styles.tabbar}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
            >
              <span className={styles.tabEmoji}>{item.icon}</span>
              <span className={styles.tabLabel}>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
