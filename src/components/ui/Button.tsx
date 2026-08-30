import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './ui.module.css'

type Variant = 'primary' | 'soft' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  children?: ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
  ...rest
}: Props) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    className,
  ].join(' ')
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

export function IconButton({
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button type="button" className={`${styles.iconBtn} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Fab({ onClick, emoji = '＋' }: { onClick: () => void; emoji?: string }) {
  return (
    <button type="button" className={styles.fab} onClick={onClick} aria-label="新增">
      {emoji}
    </button>
  )
}
