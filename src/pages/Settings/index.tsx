import { useEffect, useRef, useState } from 'react'
import Card from '@/components/Card'
import Button, { IconButton } from '@/components/ui/Button'
import { Chip, Input } from '@/components/ui/Field'
import { useSettings } from '@/hooks/useSchedule'
import { DEFAULT_PERIODS } from '@/domain/constants'
import { normalizePeriods, saveSettings } from '@/domain/repositories/settings'
import { clearAll, downloadJSON, exportAll, importAll } from '@/domain/repositories/backup'
import { useQuotes } from '@/hooks/useQuotes'
import { createQuote, ensureSeedQuotes, removeQuote } from '@/domain/repositories/quotes'
import { useAttendanceSlots } from '@/hooks/useAttendance'
import {
  createSlot,
  ensureDefaults,
  moveSlot,
  removeSlot,
  updateSlot,
} from '@/domain/repositories/attendanceSlots'
import { useToastStore } from '@/stores/toastStore'
import { askConfirm } from '@/components/ui/confirm'
import { today } from '@/utils/date'
import type { PeriodConfig } from '@/domain/types'
import styles from './Settings.module.css'

/** 名言管理 */
function QuotesCard() {
  const quotes = useQuotes()
  const show = useToastStore((s) => s.show)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')

  useEffect(() => {
    void ensureSeedQuotes()
  }, [])

  async function handleAdd() {
    const t = text.trim()
    if (!t) return
    await createQuote(t, author.trim())
    setText('')
    setAuthor('')
    show('名言已添加', '🦉')
  }

  return (
    <Card
      title="名言管理"
      emoji="🦉"
      tone="purple"
      extra={<span className={styles.label}>共 {quotes.length} 条</span>}
    >
      <p className={styles.tip} style={{ marginTop: 0, marginBottom: 10 }}>
        首页「每日一言」卡片的内容来源，点击卡片随机切换。
      </p>

      {quotes.length === 0 ? (
        <p className={styles.tip}>还没有名言，在下方添加吧。</p>
      ) : (
        <ul className={styles.quoteList}>
          {quotes.map((q) => (
            <li key={q.id} className={styles.quoteRow}>
              <div className={styles.quoteRowText}>
                {q.text}
                <span className={styles.quoteRowAuthor}>—— {q.author}</span>
              </div>
              <IconButton
                onClick={async () => {
                  const ok = await askConfirm({
                    title: '🗑️ 删除名言',
                    content: `确定删除「${q.text.slice(0, 12)}${q.text.length > 12 ? '…' : ''}」吗？`,
                    okText: '删除',
                    danger: true,
                  })
                  if (!ok) return
                  await removeQuote(q.id)
                  show('名言已删除', '🗑️')
                }}
                title="删除"
              >
                🗑️
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.quoteAddRow}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="名言内容"
        />
        <Input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="作者（选填）"
          className={styles.quoteAuthorInput}
        />
        <Button size="sm" onClick={handleAdd} disabled={!text.trim()}>
          ＋ 添加
        </Button>
      </div>
    </Card>
  )
}

/** 考勤时段管理 */
function AttendanceSlotCard() {
  const slots = useAttendanceSlots()
  const show = useToastStore((s) => s.show)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState('')

  useEffect(() => {
    void ensureDefaults()
  }, [])

  useEffect(() => {
    setDraft(Object.fromEntries(slots.map((s) => [s.id, s.name])))
  }, [slots])

  async function commitName(id: string, fallback: string) {
    const next = (draft[id] ?? '').trim()
    if (!next) {
      setDraft((prev) => ({ ...prev, [id]: fallback }))
      return
    }
    if (next !== fallback) {
      await updateSlot(id, { name: next })
      show('已重命名', '✅')
    }
  }

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    await createSlot(name)
    setNewName('')
    show('时段已添加', '📋')
  }

  async function handleRemove(id: string, name: string) {
    const ok = await askConfirm({
      title: '🗑️ 删除考勤时段',
      content: `确定删除时段「${name}」吗？该时段下已记录的考勤数据会一并删除，且不可恢复。`,
      okText: '删除',
      danger: true,
    })
    if (!ok) return
    await removeSlot(id)
    show('时段已删除', '🗑️')
  }

  return (
    <Card title="考勤时段" emoji="📋" tone="orange">
      <p className={styles.tip} style={{ marginTop: 0, marginBottom: 10 }}>
        在「考勤」模块中按这些时段分别打卡，例如早操、早读、课堂、午休。
      </p>

      {slots.length === 0 ? (
        <p className={styles.tip}>还没有时段，请在下方添加。</p>
      ) : (
        <ul className={styles.periods}>
          {slots.map((s, i) => (
            <li key={s.id} className={styles.period}>
              <span className={styles.periodIndex}>{i + 1}</span>
              <Input
                value={draft[s.id] ?? s.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, [s.id]: e.target.value }))}
                onBlur={() => commitName(s.id, s.name)}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                className={styles.periodName}
              />
              <IconButton
                onClick={() => moveSlot(s.id, -1)}
                title="上移"
                disabled={i === 0}
              >
                ↑
              </IconButton>
              <IconButton
                onClick={() => moveSlot(s.id, 1)}
                title="下移"
                disabled={i === slots.length - 1}
              >
                ↓
              </IconButton>
              <IconButton onClick={() => handleRemove(s.id, s.name)} title="删除时段">
                🗑️
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.addRow}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="新时段名称，例如：课堂"
        />
        <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>
          ＋ 添加
        </Button>
      </div>
    </Card>
  )
}

export default function Settings() {
  const settings = useSettings()
  const show = useToastStore((s) => s.show)
  const [periods, setPeriods] = useState<PeriodConfig[]>(DEFAULT_PERIODS)
  const [showWeekend, setShowWeekend] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!settings) return
    setPeriods(settings.periods ?? DEFAULT_PERIODS)
    setShowWeekend(settings.showWeekend ?? false)
  }, [settings])

  function patch(index: number, key: keyof PeriodConfig, value: string) {
    setPeriods((prev) =>
      prev.map((p) => (p.index === index ? { ...p, [key]: value } : p)),
    )
  }

  function addPeriod() {
    setPeriods((prev) => {
      const last = prev[prev.length - 1]
      const index = (last?.index ?? 0) + 1
      return [...prev, { index, name: `第${index}节`, startTime: '08:00', endTime: '08:45' }]
    })
  }

  function removePeriod(index: number) {
    setPeriods((prev) => prev.filter((p) => p.index !== index))
  }

  async function saveSchedule() {
    await saveSettings({
      periods: normalizePeriods(periods).map((p, i) => ({ ...p, index: i + 1 })),
      showWeekend,
    })
    show('课表设置已保存', '⚙️')
  }

  async function handleExport() {
    const text = await exportAll()
    downloadJSON(`班级小管家-备份-${today()}.json`, text)
    show('备份已导出', '💾')
  }

  async function handleImport(file: File) {
    const ok = await askConfirm({
      title: '📥 导入备份',
      content: '导入将覆盖当前全部数据，确定继续吗？建议先导出一份备份。',
      okText: '导入',
      danger: true,
    })
    if (!ok) return
    try {
      await importAll(await file.text(), 'replace')
      show('数据已导入', '📥')
      location.reload()
    } catch {
      show('导入失败：文件格式不正确', '⚠️')
    }
  }

  return (
    <div className={styles.wrap}>
      <Card
        title="课表设置"
        emoji="⚙️"
        tone="purple"
        extra={
          <Button size="sm" onClick={saveSchedule}>
            保存
          </Button>
        }
      >
        <div className={styles.row}>
          <span className={styles.label}>显示周末</span>
          <Chip active={showWeekend} onClick={() => setShowWeekend((v) => !v)}>
            {showWeekend ? '周六周日已显示' : '仅周一至周五'}
          </Chip>
        </div>

        <p className={styles.sectionTitle}>节次时间</p>
        <ul className={styles.periods}>
          {normalizePeriods(periods).map((p) => (
            <li key={p.index} className={styles.period}>
              <span className={styles.periodIndex}>{p.index}</span>
              <Input
                value={p.name}
                onChange={(e) => patch(p.index, 'name', e.target.value)}
                className={styles.periodName}
              />
              <Input
                type="time"
                value={p.startTime}
                onChange={(e) => patch(p.index, 'startTime', e.target.value)}
                className={styles.periodTime}
              />
              <span className={styles.tilde}>-</span>
              <Input
                type="time"
                value={p.endTime}
                onChange={(e) => patch(p.index, 'endTime', e.target.value)}
                className={styles.periodTime}
              />
              <IconButton onClick={() => removePeriod(p.index)} title="删除该节次">
                ×
              </IconButton>
            </li>
          ))}
        </ul>
        <Button variant="soft" size="sm" onClick={addPeriod}>
          ＋ 添加节次
        </Button>
      </Card>

      <AttendanceSlotCard />

      <QuotesCard />

      <Card title="数据管理" emoji="💾" tone="blue">
        <div className={styles.dataOps}>
          <Button variant="soft" onClick={handleExport}>
            📤 导出备份
          </Button>
          <Button variant="soft" onClick={() => fileRef.current?.click()}>
            📥 导入备份
          </Button>
          <Button
            variant="danger"
            onClick={async () => {
              const ok = await askConfirm({
                title: '🗑️ 清空数据',
                content: '确定清空全部数据吗？此操作不可恢复，建议先导出备份。',
                okText: '清空',
                danger: true,
              })
              if (!ok) return
              await clearAll()
              location.reload()
            }}
          >
            🗑️ 清空数据
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void handleImport(f)
            e.target.value = ''
          }}
        />
        <p className={styles.tip}>数据保存在本机浏览器中，清理浏览器数据前请先导出备份。</p>
      </Card>
    </div>
  )
}
