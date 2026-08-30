import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '@/components/Card'
import Button from '@/components/ui/Button'
import { Chip } from '@/components/ui/Field'
import { useClasses } from '@/hooks/useClasses'
import { useStudents } from '@/hooks/useStudents'
import styles from './Home.module.css'

const CONFETTI = ['🎉', '⭐', '🎊', '✨', '🍬', '🎈']

export default function RandomPicker() {
  const classes = useClasses()
  const [classId, setClassId] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!classId && classes[0]) setClassId(classes[0].id)
  }, [classes, classId])

  return (
    <>
      <Card title="随机点名" emoji="🎲" tone="purple">
        {classes.length === 0 ? (
          <div className={styles.tplEmpty}>
            <div style={{ fontSize: 30 }}>🙋</div>
            <p className={styles.tplEmptyText}>还没有班级</p>
            <p className={styles.tplEmptyHint}>先去「学生」模块创建班级</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {classes.map((c) => (
                <Chip key={c.id} active={c.id === classId} onClick={() => setClassId(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </div>
            <Button block onClick={() => setOpen(true)}>
              🎯 开始点名
            </Button>
          </>
        )}
      </Card>

      <PickerModal open={open} onClose={() => setOpen(false)} classId={classId} />
    </>
  )
}

function PickerModal({ open, onClose, classId }: { open: boolean; onClose: () => void; classId: string }) {
  const students = useStudents(classId)
  const [rolling, setRolling] = useState(false)
  const [current, setCurrent] = useState('准备')
  const [result, setResult] = useState<string | null>(null)
  const [picked, setPicked] = useState<string[]>([])
  const [noRepeat, setNoRepeat] = useState(true)
  const timerRef = useRef<number | null>(null)

  const pool = useMemo(
    () => (noRepeat ? students.filter((s) => !picked.includes(s.id)) : students),
    [students, picked, noRepeat],
  )

  useEffect(() => {
    if (open) {
      setRolling(false)
      setResult(null)
      setCurrent('准备')
      setPicked([])
    }
  }, [open, classId])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    },
    [],
  )

  function start() {
    if (pool.length === 0) return
    setResult(null)
    setRolling(true)
    timerRef.current = window.setInterval(() => {
      setCurrent(pool[Math.floor(Math.random() * pool.length)].name)
    }, 70)
  }

  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    const chosen = pool[Math.floor(Math.random() * pool.length)]
    setCurrent(chosen.name)
    setResult(chosen.name)
    setPicked((prev) => [...prev, chosen.id])
    setRolling(false)
  }

  if (!open) return null

  return (
    <div className={styles.picker}>
      <button type="button" className={styles.pickerClose} onClick={onClose}>
        ✕
      </button>

      <div className={styles.pickerInner}>
        <p className={styles.pickerHint}>
          {rolling ? '点到谁呢…' : result ? '就是你了！' : '点击下方按钮开始'}
        </p>

        <div
          className={`${styles.pickerName} ${rolling ? styles.pickerRolling : ''} ${
            result ? styles.pickerResult : ''
          }`}
        >
          {current}
        </div>

        {result && (
          <div className={styles.confetti}>
            {Array.from({ length: 14 }, (_, i) => (
              <span
                key={i}
                style={{
                  left: `${Math.random() * 92}%`,
                  animationDelay: `${Math.random() * 0.4}s`,
                }}
              >
                {CONFETTI[i % CONFETTI.length]}
              </span>
            ))}
          </div>
        )}

        <div className={styles.pickerOps}>
          {rolling ? (
            <Button size="lg" onClick={stop}>
              🛑 停！
            </Button>
          ) : (
            <Button size="lg" onClick={start} disabled={pool.length === 0}>
              {result ? '🎲 再点一次' : '🎯 开始'}
            </Button>
          )}
          <Chip active={noRepeat} onClick={() => setNoRepeat((v) => !v)}>
            不重复抽取
          </Chip>
        </div>

        <p className={styles.pickerMeta}>
          已点 {picked.length} / {students.length} 人
          {picked.length > 0 && (
            <button type="button" className={styles.linkBtn} onClick={() => setPicked([])}>
              重置
            </button>
          )}
        </p>
      </div>
    </div>
  )
}
