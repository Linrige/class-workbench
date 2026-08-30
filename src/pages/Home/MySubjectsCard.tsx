import { useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/ui/Button'
import { Chip } from '@/components/ui/Field'
import { Input } from '@/components/ui/Field'
import { useSettings } from '@/hooks/useSchedule'
import { SUBJECT_PRESETS } from '@/domain/constants'
import { saveSettings } from '@/domain/repositories/settings'
import { useToastStore } from '@/stores/toastStore'
import styles from './Home.module.css'

/** 首页：选择我任教的教学科目 */
export default function MySubjectsCard() {
  const settings = useSettings()
  const selected = settings?.mySubjects ?? []
  const [custom, setCustom] = useState('')
  const show = useToastStore((s) => s.show)

  const customList = selected.filter((s) => !SUBJECT_PRESETS.includes(s))

  function toggle(name: string) {
    const next = selected.includes(name)
      ? selected.filter((s) => s !== name)
      : [...selected, name]
    void saveSettings({ mySubjects: next })
  }

  async function addCustom() {
    const name = custom.trim()
    if (!name) return
    if (selected.includes(name)) {
      show('该科目已选择', '📚')
      setCustom('')
      return
    }
    await saveSettings({ mySubjects: [...selected, name] })
    setCustom('')
    show('已添加科目', '📚')
  }

  async function removeCustom(name: string) {
    await saveSettings({ mySubjects: selected.filter((s) => s !== name) })
  }

  return (
    <Card
      title="我的科目"
      emoji="📚"
      tone="blue"
      extra={<span className={styles.hintText}>已选 {selected.length} 科</span>}
    >
      <p className={styles.tplEmptyHint} style={{ marginTop: 0 }}>
        勾选你任教的科目，首页「今日速览」将按所选科目统计还剩几节课
      </p>

      <div className={styles.subjectRow}>
        {SUBJECT_PRESETS.map((name) => (
          <Chip key={name} active={selected.includes(name)} onClick={() => toggle(name)}>
            {name}
          </Chip>
        ))}
        {customList.map((name) => (
          <span key={name} className={styles.customChip}>
            <Chip active onClick={() => toggle(name)}>
              {name}
            </Chip>
            <button
              type="button"
              className={styles.customDel}
              onClick={() => removeCustom(name)}
              title="删除该自定义科目"
              aria-label={`删除 ${name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className={styles.subjectAddRow}>
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
          placeholder="添加其他科目，如：书法"
        />
        <Button size="sm" variant="soft" onClick={addCustom} disabled={!custom.trim()}>
          ＋ 添加
        </Button>
      </div>
    </Card>
  )
}
