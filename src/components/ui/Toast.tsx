import { useEffect } from 'react'
import { useToastStore } from '@/stores/toastStore'
import styles from './ui.module.css'

export default function Toast() {
  const { msg, emoji, hide } = useToastStore()
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(hide, 1800)
    return () => clearTimeout(t)
  }, [msg, hide])
  if (!msg) return null
  return (
    <div className={styles.toast}>
      <span>{emoji}</span>
      {msg}
    </div>
  )
}
