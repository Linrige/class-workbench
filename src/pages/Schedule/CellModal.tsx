import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Field, Input, TextArea } from '@/components/ui/Field'
import { setCell } from '@/domain/repositories/schedule'
import ColorPicker from '@/components/ui/ColorPicker'
import { askConfirm } from '@/components/ui/confirm'
import type { ScheduleCell } from '@/domain/types'

interface Props {
  open: boolean
  onClose: () => void
  classId: string
  day: number
  period: number
  periodName: string
  cell?: ScheduleCell
}

const WEEK = ['一', '二', '三', '四', '五', '六', '日']

export default function CellModal({
  open,
  onClose,
  classId,
  day,
  period,
  periodName,
  cell,
}: Props) {
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [color, setColor] = useState('blue')

  useEffect(() => {
    if (!open) return
    setSubject(cell?.subject ?? '')
    setNote(cell?.note ?? '')
    setColor(cell?.color ?? 'blue')
  }, [open, cell])

  async function handleOk() {
    await setCell({
      classId,
      day,
      period,
      subject: subject.trim(),
      note: note.trim() || undefined,
      color,
    })
    onClose()
  }

  return (
    <Modal
      open={open}
      title={`周${WEEK[day - 1]} · ${periodName}`}
      onClose={onClose}
      onOk={handleOk}
    >
      <Field label="科目">
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="例如：语文"
          autoFocus
        />
      </Field>

      <Field label="备注" hint="会显示成 📌 角标">
        <TextArea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如：带跳绳 / 在多功能厅上课"
          style={{ minHeight: 76 }}
        />
      </Field>

      <Field label="颜色">
        <ColorPicker value={color} onChange={setColor} />
      </Field>

      {cell && (
        <button
          type="button"
          style={{ fontSize: 13, color: 'var(--c-pink)', fontWeight: 700 }}
          onClick={async () => {
            const ok = await askConfirm({
              title: '🧹 清空这一格',
              content: '确定清空这一格的科目与备注吗？',
              okText: '清空',
              danger: true,
            })
            if (!ok) return
            await setCell({ classId, day, period, subject: '' })
            onClose()
          }}
        >
          🧹 清空这一格
        </button>
      )}
    </Modal>
  )
}
