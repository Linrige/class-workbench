import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input, Select, TextArea } from '@/components/ui/Field'
import { useClasses } from '@/hooks/useClasses'
import { syncRecords, updateHomework } from '@/domain/repositories/homework'
import type { HomeworkEntity } from '@/domain/types'

interface Props {
  open: boolean
  onClose: () => void
  homework: HomeworkEntity
  onDone?: () => void
}

export default function EditHomeworkModal({ open, onClose, homework, onDone }: Props) {
  const classes = useClasses()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [note, setNote] = useState('')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setTitle(homework.title)
    setSubject(homework.subject ?? '')
    setNote(homework.note ?? '')
    setSelected(homework.classIds)
  }, [open, homework])

  async function handleOk() {
    if (!title.trim()) return
    await updateHomework(homework.id, {
      title: title.trim(),
      subject: subject.trim() || undefined,
      note: note.trim() || undefined,
      classIds: selected,
    })
    await syncRecords(homework.id)
    onDone?.()
    onClose()
  }

  return (
    <Modal open={open} title="✏️ 编辑作业" onClose={onClose} onOk={handleOk}>
      <Field label="作业名称">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="布置班级">
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
        <TextArea value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
    </Modal>
  )
}
