import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input } from '@/components/ui/Field'
import { updateTodo } from '@/domain/repositories/todos'
import { PRIORITY_LABEL } from '@/domain/constants'
import type { Priority, Todo } from '@/domain/types'

interface Props {
  todo: Todo | null
  onClose: () => void
}

export default function EditTodoModal({ todo, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [priority, setPriority] = useState<Priority>(1)

  useEffect(() => {
    if (!todo) return
    setTitle(todo.title)
    setDate(todo.date)
    setPriority(todo.priority)
  }, [todo])

  async function handleOk() {
    if (!todo || !title.trim()) return
    await updateTodo(todo.id, { title: title.trim(), date, priority })
    onClose()
  }

  return (
    <Modal
      open={Boolean(todo)}
      title="✏️ 编辑待办"
      onClose={onClose}
      onOk={handleOk}
    >
      <Field label="内容">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </Field>
      <Field label="日期">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="优先级">
        <div style={{ display: 'flex', gap: 8 }}>
          {([0, 1, 2] as Priority[]).map((p) => (
            <Chip key={p} active={priority === p} onClick={() => setPriority(p)}>
              {PRIORITY_LABEL[p].label}
            </Chip>
          ))}
        </div>
      </Field>
    </Modal>
  )
}
