import { useEffect, useState } from 'react'
import Card from '@/components/Card'
import Empty from '@/components/Empty'
import { useQuotes } from '@/hooks/useQuotes'
import { ensureSeedQuotes } from '@/domain/repositories/quotes'
import { dayjs } from '@/utils/date'
import styles from './Home.module.css'

function randomIndex(exclude: number, length: number): number {
  if (length <= 1) return 0
  let i = Math.floor(Math.random() * length)
  if (i === exclude) i = (i + 1) % length
  return i
}

/** 首页：点击切换的哲学名言卡片（内容在设置中管理） */
export default function QuoteCard() {
  const quotes = useQuotes()
  const [idx, setIdx] = useState(0)
  const todayText = dayjs().format('YYYY年MM月DD日 ddd')

  useEffect(() => {
    void ensureSeedQuotes()
  }, [])

  // 数据变化（删除等）时防止下标越界
  const safeIdx = quotes.length ? idx % quotes.length : 0
  const current = quotes.length ? quotes[safeIdx] : undefined

  return (
    <Card
      title="每日一言"
      emoji="🦉"
      tone="purple"
      extra={quotes.length > 1 ? <span className={styles.hintText}>点击换一句</span> : undefined}
    >
      {!current ? (
        <Empty
          emoji="🦉"
          text="还没有名言"
          hint="去「设置 → 名言管理」添加你喜欢的句子"
        />
      ) : (
        <button
          type="button"
          className={styles.quote}
          onClick={() => setIdx(randomIndex(safeIdx, quotes.length))}
          aria-label="切换一句哲学名言"
        >
          <span className={styles.quoteMark}>“</span>
          <p className={styles.quoteText}>{current.text}</p>
          <p className={styles.quoteAuthor}>—— {current.author}</p>
          <span className={styles.quoteDate}>{todayText}</span>
        </button>
      )}
    </Card>
  )
}
