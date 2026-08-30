import { db } from '@/db/db'
import type { Quote } from '@/domain/types'
import { uid } from '@/utils/id'

/** 首次使用时写入的默认名言 */
export const DEFAULT_QUOTES: { text: string; author: string }[] = [
  { text: '我思故我在。', author: '笛卡尔' },
  { text: '未经审视的人生不值得过。', author: '苏格拉底' },
  { text: '知人者智，自知者明。', author: '老子' },
  { text: '千里之行，始于足下。', author: '老子' },
  { text: '知之为知之，不知为不知，是知也。', author: '孔子' },
  { text: '吾生也有涯，而知也无涯。', author: '庄子' },
  { text: '人不能两次踏进同一条河流。', author: '赫拉克利特' },
  { text: '幸福是灵魂合乎德性的活动。', author: '亚里士多德' },
  { text: '凡不能毁灭我的，必使我更强大。', author: '尼采' },
  { text: '当你凝视深渊时，深渊也在凝视你。', author: '尼采' },
  { text: '人是万物的尺度。', author: '普罗泰戈拉' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
]

export async function listQuotes(): Promise<Quote[]> {
  return db.quotes.orderBy('createdAt').toArray()
}

let seedPromise: Promise<void> | null = null
const SEED_FLAG = 'quotesSeeded'

/** 首次使用时写入默认名言（标记 + 事务，防止严格模式重复写入） */
export function ensureSeedQuotes(): Promise<void> {
  if (seedPromise) return seedPromise
  seedPromise = (async () => {
    const flag = await db.settings.get(SEED_FLAG)
    if (flag) return
    await db.transaction('rw', [db.quotes, db.settings], async () => {
      const again = await db.settings.get(SEED_FLAG)
      if (again) return
      const count = await db.quotes.count()
      if (count === 0) {
        const now = Date.now()
        await db.quotes.bulkAdd(
          DEFAULT_QUOTES.map((q, i) => ({
            id: uid(),
            text: q.text,
            author: q.author,
            createdAt: now + i,
          })),
        )
      }
      await db.settings.put({ key: SEED_FLAG, value: true })
    })
  })()
  return seedPromise
}

export async function createQuote(text: string, author: string): Promise<string> {
  const id = uid()
  await db.quotes.add({ id, text: text.trim(), author: author.trim() || '佚名', createdAt: Date.now() })
  return id
}

export async function removeQuote(id: string): Promise<void> {
  await db.quotes.delete(id)
}
