import { useCallback, useEffect, useRef } from 'react'
import type { Stroke } from '@/domain/types'

interface Props {
  active: boolean
  strokes: Stroke[]
  onChange: (strokes: Stroke[]) => void
  color: string
  /** 画笔粗细（px） */
  width: number
  eraser: boolean
}

/** 归一化坐标 + px 线宽，缩放时涂鸦会等比跟随 */
export default function DoodleLayer({ active, strokes, onChange, color, width, eraser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const strokesRef = useRef<Stroke[]>(strokes)
  const drawingRef = useRef<Stroke | null>(null)
  const sizeRef = useRef({ w: 1, h: 1 })

  strokesRef.current = strokes

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    for (const s of strokesRef.current) {
      if (s.points.length < 2) continue
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.width * dpr
      ctx.beginPath()
      for (let i = 0; i < s.points.length; i += 2) {
        const x = s.points[i] * canvas.width
        const y = s.points[i + 1] * canvas.height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return
    const resize = () => {
      const rect = parent.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      sizeRef.current = { w: rect.width, h: rect.height }
      canvas.width = Math.max(1, Math.round(rect.width * dpr))
      canvas.height = Math.max(1, Math.round(rect.height * dpr))
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      redraw()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [redraw])

  useEffect(() => {
    redraw()
  }, [strokes, redraw])

  function toNorm(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return [
      (e.clientX - rect.left) / rect.width,
      (e.clientY - rect.top) / rect.height,
    ] as const
  }

  function handleDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const [x, y] = toNorm(e)
    if (eraser) {
      // 橡皮：删除与落点接近的整条笔画
      const radius = 0.03
      const next = strokesRef.current.filter((s) => {
        for (let i = 0; i < s.points.length; i += 2) {
          const dx = s.points[i] - x
          const dy = s.points[i + 1] - y
          if (Math.hypot(dx, dy) < radius) return false
        }
        return true
      })
      if (next.length !== strokesRef.current.length) onChange(next)
      return
    }
    drawingRef.current = { color, width, points: [x, y] }
    strokesRef.current = [...strokesRef.current, drawingRef.current]
    redraw()
  }

  function handleMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!active || eraser || !drawingRef.current) return
    const [x, y] = toNorm(e)
    drawingRef.current.points.push(x, y)
    redraw()
  }

  function handleUp() {
    if (!drawingRef.current) return
    drawingRef.current = null
    onChange([...strokesRef.current])
  }

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
      onPointerLeave={handleUp}
      style={{
        position: 'absolute',
        inset: 0,
        touchAction: 'none',
        pointerEvents: active ? 'auto' : 'none',
        borderRadius: 'var(--r-md)',
      }}
    />
  )
}
