import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input, Select } from '@/components/ui/Field'
import ColorPicker from '@/components/ui/ColorPicker'
import { createClass, importFromTemplate, updateClass } from '@/domain/repositories/classes'
import { useTemplates } from '@/hooks/useTemplates'
import type { ClassEntity } from '@/domain/types'

interface Props {
  open: boolean
  onClose: () => void
  defaultTab?: 'manual' | 'import'
  /** 传入则为编辑模式 */
  editTarget?: ClassEntity
  onDone?: (classId: string) => void
}

export default function AddClassModal({
  open,
  onClose,
  defaultTab = 'manual',
  editTarget,
  onDone,
}: Props) {
  const templates = useTemplates()
  const [tab, setTab] = useState<'manual' | 'import'>(defaultTab)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [color, setColor] = useState<string>('pink')
  const [templateId, setTemplateId] = useState('')

  useEffect(() => {
    if (!open) return
    setTab(editTarget ? 'manual' : defaultTab)
    setName(editTarget?.name ?? '')
    setGrade(editTarget?.grade ?? '')
    setColor(editTarget?.color ?? 'pink')
    setTemplateId(templates[0]?.id ?? '')
  }, [open, defaultTab, editTarget, templates])

  const tpl = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId])

  const canSave = editTarget
    ? name.trim().length > 0
    : tab === 'manual'
      ? name.trim().length > 0
      : Boolean(templateId)

  async function handleOk() {
    if (!canSave) return
    if (editTarget) {
      await updateClass(editTarget.id, { name: name.trim(), grade: grade.trim(), color })
      onDone?.(editTarget.id)
    } else if (tab === 'manual') {
      const id = await createClass({ name: name.trim(), grade: grade.trim(), color })
      onDone?.(id)
    } else {
      const id = await importFromTemplate(templateId, { name: name.trim() || undefined, color })
      onDone?.(id)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={editTarget ? '✏️ 编辑班级' : tab === 'manual' ? '🏫 新建班级' : '📥 导入班级模板'}
      onClose={onClose}
      onOk={handleOk}
      okText={editTarget ? '保存' : tab === 'manual' ? '创建' : '导入'}
    >
      {!editTarget && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Chip active={tab === 'manual'} onClick={() => setTab('manual')}>
            🏫 手动创建
          </Chip>
          <Chip active={tab === 'import'} onClick={() => setTab('import')}>
            📥 从模板导入
          </Chip>
        </div>
      )}

      {tab === 'import' && !editTarget && (
        <Field label="选择模板" hint="模板来自首页「班级管理」">
          <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            <option value="">请选择</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}（{t.studentNames.length} 人）
              </option>
            ))}
          </Select>
        </Field>
      )}

      {(editTarget || tab === 'manual') && (
        <Field label="班级名称">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：三年级二班"
          />
        </Field>
      )}

      {tab === 'manual' && (
        <Field label="年级">
          <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="选填" />
        </Field>
      )}

      <Field label="班级颜色">
        <ColorPicker value={color} onChange={setColor} />
      </Field>

      {tab === 'import' && tpl && (
        <Field label={`名单预览（共 ${tpl.studentNames.length} 人）`}>
          <div
            style={{
              maxHeight: 120,
              overflow: 'auto',
              background: 'var(--c-bg)',
              borderRadius: 'var(--r-md)',
              padding: 10,
              fontSize: 13,
              color: 'var(--c-ink-2)',
              lineHeight: 1.9,
            }}
          >
            {tpl.studentNames.join('、')}
          </div>
        </Field>
      )}
    </Modal>
  )
}
