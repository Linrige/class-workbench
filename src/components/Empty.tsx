import type { ReactNode } from 'react'
import styles from './Empty.module.css'

interface EmptyProps {
  emoji?: string
  text: string
  hint?: string
  action?: ReactNode
}

export default function Empty({ emoji = '🌱', text, hint, action }: EmptyProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.emoji}>{emoji}</div>
      <p className={styles.text}>{text}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
