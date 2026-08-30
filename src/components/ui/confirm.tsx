import { create } from 'zustand'
import Modal from './Modal'

interface ConfirmOptions {
  title: string
  content?: string
  okText?: string
  danger?: boolean
}

interface ConfirmState extends ConfirmOptions {
  open: boolean
}

export const useConfirmStore = create<ConfirmState>(() => ({
  open: false,
  title: '',
  content: '',
  okText: '确定',
  danger: false,
}))

let resolver: ((value: boolean) => void) | null = null

/** 应用内确认框：不依赖 window.confirm，任何环境下都可用 */
export function askConfirm(opts: ConfirmOptions): Promise<boolean> {
  if (resolver) resolver(false)
  useConfirmStore.setState({ open: true, okText: '确定', danger: false, ...opts })
  return new Promise<boolean>((resolve) => {
    resolver = resolve
  })
}

export function ConfirmHost() {
  const s = useConfirmStore()

  function close(value: boolean) {
    useConfirmStore.setState({ open: false })
    resolver?.(value)
    resolver = null
  }

  return (
    <Modal
      open={s.open}
      title={s.title}
      onClose={() => close(false)}
      onOk={() => close(true)}
      okText={s.okText}
      danger={s.danger}
      zIndex={160}
    >
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--c-ink-2)', wordBreak: 'break-word' }}>
        {s.content}
      </p>
    </Modal>
  )
}
