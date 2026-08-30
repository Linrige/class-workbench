import type { ReactNode } from 'react'
import Button from './Button'
import styles from './ui.module.css'

interface ModalProps {
  open: boolean
  title?: string
  onClose: () => void
  children: ReactNode
  onOk?: () => void
  okText?: string
  cancelText?: string
  danger?: boolean
  /** 层级，需要盖在其他弹窗之上时调高 */
  zIndex?: number
}

export default function Modal({
  open,
  title,
  onClose,
  children,
  onOk,
  okText = '保存',
  cancelText = '取消',
  danger,
  zIndex,
}: ModalProps) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={onClose} style={zIndex ? { zIndex } : undefined}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className={styles.dialogHead}>
            <h3 className={styles.dialogTitle}>{title}</h3>
          </div>
        )}
        <div className={styles.dialogBody}>{children}</div>
        <div className={styles.dialogFoot}>
          <Button variant="soft" onClick={onClose}>
            {cancelText}
          </Button>
          {onOk && (
            <Button variant={danger ? 'danger' : 'primary'} onClick={onOk}>
              {okText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
