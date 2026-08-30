import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input, Select, TextArea } from '@/components/ui/Field'
import { addStudent, addStudentsBulk } from '@/domain/repositories/students'
import { parseNames } from '@/utils/names'

interface Props {
  open: boolean
  onClose: () => void
  classId: string
}

export default function AddStudentModal({ open, onClose, classId }: Props) {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')
  const [name, setName] = useState('')
  const [no, setNo] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [bulk, setBulk] = useState('')

  useEffect(() => {
    if (open) {
      setTab('single')
      setName('')
      setNo('')
      setGender('')
      setBulk('')
    }
  }, [open])

  const parsed = useMemo(() => parseNames(bulk), [bulk])
  const canSave = tab === 'single' ? name.trim().length > 0 : parsed.length > 0

  async function handleOk() {
    if (!canSave) return
    if (tab === 'single') {
      await addStudent(classId, {
        name: name.trim(),
        no: no.trim() || undefined,
        gender: gender || undefined,
      })
    } else {
      await addStudentsBulk(classId, parsed)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title="🧒 添加学生"
      onClose={onClose}
      onOk={handleOk}
      okText={tab === 'bulk' ? `添加 ${parsed.length} 人` : '添加'}
    >
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <Chip active={tab === 'single'} onClick={() => setTab('single')}>
          单个添加
        </Chip>
        <Chip active={tab === 'bulk'} onClick={() => setTab('bulk')}>
          📋 批量粘贴
        </Chip>
      </div>

      {tab === 'single' ? (
        <>
          <Field label="姓名">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="学生姓名"
              autoFocus
            />
          </Field>
          <div style={{ display: 'flex', gap: 10 }}>
            <Field label="学号">
              <Input value={no} onChange={(e) => setNo(e.target.value)} placeholder="选填" />
            </Field>
            <Field label="性别">
              <Select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')}>
                <option value="">未设置</option>
                <option value="male">男</option>
                <option value="female">女</option>
              </Select>
            </Field>
          </div>
        </>
      ) : (
        <Field
          label="粘贴名单"
          hint="支持换行、逗号、顿号、空格分隔，自动去重提示"
        >
          <TextArea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={'张三\n李四\n王五'}
            style={{ minHeight: 130 }}
          />
        </Field>
      )}

      {tab === 'bulk' && parsed.length > 0 && (
        <p style={{ fontSize: 13, color: 'var(--c-ink-2)' }}>
          已识别 <b style={{ color: 'var(--c-pink)' }}>{parsed.length}</b> 人：
          {parsed.slice(0, 12).join('、')}
          {parsed.length > 12 ? ' …' : ''}
        </p>
      )}
    </Modal>
  )
}
