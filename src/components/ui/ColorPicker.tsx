import { useEffect, useState } from 'react'
import Button from './Button'
import { CANDY_COLORS, isHexColor, valueOf } from '@/domain/constants'
import styles from './ColorPicker.module.css'

/** 扩展预设色，覆盖更多色相 */
const EXTRA_COLORS = [
  '#ff8fa3', '#ffb3c1', '#ff7b54', '#ffc94d',
  '#f4e285', '#a8d5a2', '#7bd88f', '#4ea8a0',
  '#6fc8e8', '#8ecae6', '#7b8cff', '#b79bff',
  '#c8a2c8', '#e0aaff', '#a07178', '#9aa5b1',
]

const RAINBOW = 'linear-gradient(135deg,#ff8fa3,#ffc94d,#7bd88f,#6fc8e8,#b79bff)'
const DEFAULT_HEX = '#ff8fa3'

interface Props {
  /** 预设 key（如 'pink'）或自定义 #RRGGBB */
  value: string
  onChange: (value: string) => void
}

export default function ColorPicker({ value, onChange }: Props) {
  const custom = isHexColor(value)
  const hex = custom ? value : DEFAULT_HEX
  const [open, setOpen] = useState(false)
  const [hexText, setHexText] = useState(hex)

  useEffect(() => {
    setHexText(hex.toUpperCase())
  }, [hex])

  function applyHex(text: string) {
    const t = text.trim().startsWith('#') ? text.trim() : `#${text.trim()}`
    if (isHexColor(t)) {
      onChange(t.toLowerCase())
      return true
    }
    setHexText(hex.toUpperCase())
    return false
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        {CANDY_COLORS.map((c) => (
          <button
            key={c.key}
            type="button"
            className={styles.swatch}
            style={{ background: c.value }}
            onClick={() => {
              onChange(c.key)
              setOpen(false)
            }}
            data-active={value === c.key}
            title={c.label}
            aria-label={c.label}
          />
        ))}

        <button
          type="button"
          className={styles.swatch}
          style={{ background: custom ? value : RAINBOW }}
          onClick={() => setOpen((v) => !v)}
          data-active={custom}
          title="自定义颜色"
          aria-label="自定义颜色"
        >
          {!custom && <span className={styles.swatchIcon}>🎨</span>}
        </button>
      </div>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelTitle}>🎨 自定义颜色</div>

          <div className={styles.pickerRow}>
            <label className={styles.colorWell}>
              <input
                type="color"
                value={hex}
                onChange={(e) => onChange(e.target.value.toLowerCase())}
                aria-label="调色盘"
              />
              <span className={styles.colorWellText}>点击色块打开调色盘</span>
            </label>
          </div>

          <div className={styles.hexRow}>
            <input
              className={styles.hexInput}
              value={hexText}
              onChange={(e) => setHexText(e.target.value)}
              onBlur={(e) => applyHex(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyHex((e.target as HTMLInputElement).value)
              }}
              placeholder="#RRGGBB"
              maxLength={7}
              spellCheck={false}
            />
            <Button size="sm" variant="soft" onClick={() => applyHex(hexText)}>
              应用
            </Button>
          </div>

          <div className={styles.extraGrid}>
            {EXTRA_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                className={styles.extraSwatch}
                style={{ background: c }}
                data-active={hex.toLowerCase() === c}
                onClick={() => onChange(c)}
                title={c}
              />
            ))}
          </div>

          <div className={styles.panelFoot}>
            <span className={styles.preview} style={{ background: valueOf(value) }} />
            <span className={styles.previewText}>{hex.toUpperCase()}</span>
            <Button size="sm" onClick={() => setOpen(false)}>
              完成
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
