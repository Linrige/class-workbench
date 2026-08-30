import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input, Select, TextArea } from '@/components/ui/Field'
import { useClasses } from '@/hooks/useClasses'
import { createHomework } from '@/domain/repositories/homework'

interface Props {
  open: boolean
  onClose: () => void
  onDone?: () => void
  /** 从班级详情进入时默认选中的班级 */
  defaultClassId?: string
}

export default function AssignHomeworkModal({
  open,
  onClose,
  onDone,
  defaultClassId,
}: Props) {
  const classes = useClasses()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setTitle('')
      setSubject('')
      setNote('')
      setSelected(defaultClassId ? [defaultClassId] : [])
    }
  }, [open, defaultClassId])

  const canSave = useMemo(() => title.trim().length > 0 && selected.length > 0, [title, selected])

  async function handleOk() {
    if (!canSave) return
    await createHomework({
      title: title.trim(),
      classIds: selected,
      subject: subject.trim() || undefined,
      note: note.trim() || undefined,
    })
    onDone?.()
    onClose()
  }

  return (
    <Modal open={open} title="📝 布置作业" onClose={onClose} onOk={handleOk} okText="布置">
      <Field label="作业名称">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：抄写古诗两首"
          autoFocus
        />
      </Field>

      <Field label="布置给哪些班级">
        {classes.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--c-ink-3)' }}>还没有班级，请先创建班级</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {classes.map((c) => (
              <Chip
                key={c.id}
                active={selected.includes(c.id)}
                onClick={() =>
                  setSelected((prev) =>
                    prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                  )
                }
              >
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </Field>

      <Field label="科目">
        <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">未指定</option>
          <option value="语文">语文</option>
          <option value="数学">数学</option>
          <option value="英语">英语</option>
          <option value="科学">科学</option>
          <option value="其他">其他</option>
        </Select>
      </Field>

      <Field label="备注">
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} placeholder="选填" />
      </Field>
    </Modal>
  )
}
