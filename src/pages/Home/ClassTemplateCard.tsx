import { useEffect, useMemo, useState } from 'react'
import Card from '@/components/Card'
import Button, { IconButton } from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { Chip, Field, Input, Select, TextArea } from '@/components/ui/Field'
import { useTemplates } from '@/hooks/useTemplates'
import { useClasses } from '@/hooks/useClasses'
import {
  createTemplate,
  removeTemplate,
  saveClassAsTemplate,
  updateTemplate,
} from '@/domain/repositories/templates'
import { parseNames } from '@/utils/names'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import type { ClassTemplate } from '@/domain/types'
import styles from './Home.module.css'

export default function ClassTemplateCard() {
  const templates = useTemplates()
  const [editing, setEditing] = useState<ClassTemplate | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card
        title="班级管理"
        emoji="🏫"
        tone="blue"
        extra={
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true) }}>
            ＋ 新建模板
          </Button>
        }
      >
        {templates.length === 0 ? (
          <div className={styles.tplEmpty}>
            <div style={{ fontSize: 30 }}>📚</div>
            <p className={styles.tplEmptyText}>还没有班级模板</p>
            <p className={styles.tplEmptyHint}>保存后可在「学生」模块一键导入班级</p>
          </div>
        ) : (
          <ul className={styles.tplList}>
            {templates.map((t) => (
              <li key={t.id} className={styles.tplItem}>
                <span className={styles.tplEmoji}>🏫</span>
                <div className={styles.tplInfo}>
                  <div className={styles.tplName}>{t.name}</div>
                  <div className={styles.tplMeta}>{t.studentNames.length} 人</div>
                </div>
                <IconButton
                  onClick={() => { setEditing(t); setOpen(true) }}
                  title="编辑"
                >
                  ✏️
                </IconButton>
                <IconButton
                  onClick={async () => {
                    const ok = await askConfirm({
                      title: '🗑️ 删除模板',
                      content: `确定删除模板「${t.name}」吗？此操作不可恢复。`,
                      okText: '删除',
                      danger: true,
                    })
                    if (!ok) return
                    await removeTemplate(t.id)
                    useToastStore.getState().show('模板已删除', '🗑️')
                  }}
                  title="删除"
                >
                  🗑️
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <TemplateModal open={open} onClose={() => setOpen(false)} editing={editing} />
    </>
  )
}

function TemplateModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: ClassTemplate | null
}) {
  const classes = useClasses()
  const show = useToastStore((s) => s.show)
  const [tab, setTab] = useState<'manual' | 'fromClass'>('manual')
  const [name, setName] = useState('')
  const [raw, setRaw] = useState('')
  const [classId, setClassId] = useState('')

  useEffect(() => {
    if (!open) return
    setTab('manual')
    setName(editing?.name ?? '')
    setRaw(editing?.studentNames.join('\n') ?? '')
    setClassId(classes[0]?.id ?? '')
  }, [open, editing, classes])

  const parsed = useMemo(() => parseNames(raw), [raw])
  const canSave =
    tab === 'manual' ? name.trim().length > 0 && parsed.length > 0 : Boolean(classId) && name.trim().length > 0

  async function handleOk() {
    if (!canSave) return
    if (editing) {
      await updateTemplate(editing.id, { name: name.trim(), studentNames: parsed })
      show('模板已更新', '✅')
    } else if (tab === 'manual') {
      await createTemplate(name.trim(), parsed)
      show('模板已保存', '📚')
    } else {
      await saveClassAsTemplate(classId, name.trim())
      show('已根据班级生成模板', '📚')
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      title={editing ? '✏️ 编辑模板' : '📚 新建班级模板'}
      onClose={onClose}
      onOk={handleOk}
      okText="保存"
    >
      {!editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Chip active={tab === 'manual'} onClick={() => setTab('manual')}>
            ✍️ 手动录入
          </Chip>
          <Chip active={tab === 'fromClass'} onClick={() => setTab('fromClass')}>
            🏫 从班级生成
          </Chip>
        </div>
      )}

      {tab === 'fromClass' && !editing ? (
        <>
          <Field label="选择班级">
            <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">请选择</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="模板名称">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：三年级二班" />
          </Field>
        </>
      ) : (
        <>
          <Field label="模板名称">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：三年级二班" />
          </Field>
          <Field label="学生名单" hint="一行一个，也支持逗号 / 顿号分隔">
            <TextArea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={'张三\n李四\n王五'}
              style={{ minHeight: 140 }}
            />
          </Field>
          {parsed.length > 0 && (
            <p style={{ fontSize: 13, color: 'var(--c-ink-2)' }}>
              已识别 <b style={{ color: 'var(--c-pink)' }}>{parsed.length}</b> 人
            </p>
          )}
        </>
      )}
    </Modal>
  )
}
