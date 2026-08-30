import ClassTemplateCard from './ClassTemplateCard'
import MemoCard from './MemoCard'
import MySubjectsCard from './MySubjectsCard'
import QuoteCard from './QuoteCard'
import RandomPicker from './RandomPicker'
import RankingCard from './RankingCard'
import TodaySummary from './TodaySummary'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.grid}>
      <TodaySummary />
      <MySubjectsCard />
      <QuoteCard />
      <RankingCard />
      <RandomPicker />
      <ClassTemplateCard />
      <MemoCard />
    </div>
  )
}
