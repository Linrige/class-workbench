import type { CSSProperties, ReactNode } from 'react'
import styles from './Card.module.css'

interface CardProps {
  title?: string
  emoji?: string
  extra?: ReactNode
  children?: ReactNode
  tone?: 'pink' | 'blue' | 'yellow' | 'green' | 'purple' | 'orange'
  style?: CSSProperties
  bodyStyle?: CSSProperties
}

const TONE_BG: Record<NonNullable<CardProps['tone']>, string> = {
  pink: 'var(--c-pink-soft)',
  blue: 'var(--c-blue-soft)',
  yellow: 'var(--c-yellow-soft)',
  green: 'var(--c-green-soft)',
  purple: 'var(--c-purple-soft)',
  orange: 'var(--c-orange-soft)',
}

export default function Card({
  title,
  emoji,
  extra,
  children,
  tone = 'pink',
  style,
  bodyStyle,
}: CardProps) {
  return (
    <section className={styles.card} style={style}>
      {(title || extra) && (
        <header className={styles.head}>
          {emoji && (
            <span className={styles.emoji} style={{ background: TONE_BG[tone] }}>
              {emoji}
            </span>
          )}
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.extra}>{extra}</div>
        </header>
      )}
      <div className={styles.body} style={bodyStyle}>
        {children}
      </div>
    </section>
  )
}
