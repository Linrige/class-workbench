import { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import TimePicker from '@/components/ui/TimePicker'
import { updateTodo } from '@/domain/repositories/todos'
import type { Todo } from '@/domain/types'

interface Props {
  todo: Todo | null
  onClose: () => void
}

export default function EditTodoModal({ todo, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  useEffect(() => {
    if (!todo) return
    setTitle(todo.title)
    setDate(todo.date)
    setTime(todo.time ?? '')
  }, [todo])

  async function handleOk() {
    if (!todo || !title.trim()) return
    await updateTodo(todo.id, {
      title: title.trim(),
      date,
      time: time || undefined,
    })
    onClose()
  }

  return (
    <Modal open={Boolean(todo)} title="✏️ 编辑待办" onClose={onClose} onOk={handleOk}>
      <Field label="内容">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </Field>
      <Field label="日期">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <Field label="开始时间" hint="选填；填写后待办按时间先后排序">
        <TimePicker value={time} onChange={setTime} />
      </Field>
    </Modal>
  )
}
