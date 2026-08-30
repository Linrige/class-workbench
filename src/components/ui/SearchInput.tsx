import styles from './ui.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = '搜索', className = '' }: Props) {
  return (
    <div className={`${styles.searchBox} ${className}`}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        className={styles.searchInput}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          className={styles.searchClear}
          onClick={() => onChange('')}
          aria-label="清空"
        >
          ×
        </button>
      )}
    </div>
  )
}
