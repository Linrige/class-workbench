import { CANDY_COLORS } from '@/domain/constants'
import type { Student } from '@/domain/types'
import styles from './StudentAvatar.module.css'

function hashOf(text: string): number {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0
  return h
}

interface Props {
  name: string
  size?: number
  /** 取消作业时置灰 */
  dim?: boolean
  /** 传入后右下角显示性别徽标 */
  gender?: Student['gender']
}

export default function StudentAvatar({ name, size = 46, dim, gender }: Props) {
  const c = CANDY_COLORS[hashOf(name) % CANDY_COLORS.length]
  return (
    <div
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: c.soft,
        color: c.value,
        fontSize: Math.round(size * 0.34),
        opacity: dim ? 0.45 : 1,
      }}
    >
      {name.slice(-2)}
      {gender && (
        <span
          className={styles.gender}
          style={{
            background: gender === 'male' ? 'var(--c-blue)' : 'var(--c-pink)',
            width: Math.max(15, Math.round(size * 0.36)),
            height: Math.max(15, Math.round(size * 0.36)),
            fontSize: Math.max(9, Math.round(size * 0.24)),
          }}
          title={gender === 'male' ? '男' : '女'}
        >
          {gender === 'male' ? '♂' : '♀'}
        </span>
      )}
    </div>
  )
}
