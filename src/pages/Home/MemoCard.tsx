import { useEffect, useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { TextArea } from '@/components/ui/Field'
import { useMemos } from '@/hooks/useMemos'
import { softOf, valueOf } from '@/domain/constants'
import ColorPicker from '@/components/ui/ColorPicker'
import { createMemo, removeMemo, togglePin, updateMemo } from '@/domain/repositories/memos'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import type { Memo } from '@/domain/types'
import styles from './Home.module.css'

export default function MemoCard() {
  const memos = useMemos()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Memo | null>(null)

  return (
    <>
      <Card
        title="备忘录"
        emoji="🗒️"
        tone="yellow"
        extra={
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}>
            ＋ 写一条
          </Button>
        }
      >
        {memos.length === 0 ? (
          <div className={styles.tplEmpty}>
            <div style={{ fontSize: 30 }}>📝</div>
            <p className={styles.tplEmptyText}>还没有备忘</p>
            <p className={styles.tplEmptyHint}>随手记：要带的东西、要通知的事</p>
          </div>
        ) : (
          <div className={styles.memoGrid}>
            {memos.map((m) => (
              <div
                key={m.id}
                className={styles.memo}
                style={{ background: softOf(m.color), borderColor: valueOf(m.color) }}
              >
                <div className={styles.memoOps}>
                  <button
                    type="button"
                    className={styles.memoOp}
                    onClick={() => togglePin(m.id)}
                    title={m.pinned ? '取消置顶' : '置顶'}
                  >
                    {m.pinned ? '📌' : '⚲'}
                  </button>
                  <button
                    type="button"
                    className={styles.memoOp}
                    onClick={() => { setEditing(m); setOpen(true) }}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className={styles.memoOp}
                    onClick={async () => {
                      const ok = await askConfirm({
                        title: '🗑️ 删除备忘',
                        content: '确定删除这条备忘吗？',
                        okText: '删除',
                        danger: true,
                      })
                      if (!ok) return
                      await removeMemo(m.id)
                      useToastStore.getState().show('已删除', '🗑️')
                    }}
                  >
                    🗑️
                  </button>
                </div>
                <p className={styles.memoText}>{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MemoModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </>
  )
}

function MemoModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Memo | null
}) {
  const [content, setContent] = useState('')
  const [color, setColor] = useState<string>('yellow')

  useEffect(() => {
    if (!open) return
    setContent(editing?.content ?? '')
    setColor(editing?.color ?? 'yellow')
  }, [open, editing])

  async function handleOk() {
    if (!content.trim()) return
    if (editing) {
      await updateMemo(editing.id, { content: content.trim(), color })
    } else {
      await createMemo(content.trim(), color)
    }
    onClose()
  }

  return (
    <Modal open={open} title={editing ? '✏️ 编辑备忘' : '🗒️ 新增备忘'} onClose={onClose} onOk={handleOk}>
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="写点什么…"
        autoFocus
      />
      <div style={{ marginTop: 12 }}>
        <ColorPicker value={color} onChange={setColor} />
      </div>
    </Modal>
  )
}
