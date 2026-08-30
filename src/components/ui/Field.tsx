import type { ComponentProps, ReactNode } from 'react'
import styles from './ui.module.css'

interface FieldProps {
  label?: string
  children: ReactNode
  hint?: string
}

export function Field({ label, children, hint }: FieldProps) {
  return (
    <div className={styles.field}>
      {label && <span className={styles.label}>{label}</span>}
      {children}
      {hint && <span className={styles.label} style={{ fontWeight: 500 }}>{hint}</span>}
    </div>
  )
}

export function Input(props: ComponentProps<'input'>) {
  return <input className={styles.input} {...props} />
}

export function TextArea(props: ComponentProps<'textarea'>) {
  return <textarea className={styles.textarea} {...props} />
}

export function Select(props: ComponentProps<'select'>) {
  return <select className={styles.select} {...props} />
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${active ? styles.chipActive : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
