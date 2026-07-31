'use client'

import { useState, useRef, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function InteractiveMap({ children, className = '' }: Props) {
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const pinchDist = useRef(0)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })

  function handleMouseDown(e: React.MouseEvent) {
    isDragging.current = true
    lastPos.current = { x: e.clientX, y: e.clientY }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging.current) return
    const dx = e.clientX - lastPos.current.x
    const dy = e.clientY - lastPos.current.y
    lastPos.current = { x: e.clientX, y: e.clientY }
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
  }

  function handleMouseUp() {
    isDragging.current = false
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.5, Math.min(5, prev.scale + delta)),
    }))
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      isDragging.current = true
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    } else if (e.touches.length === 2) {
      isDragging.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchDist.current = Math.sqrt(dx * dx + dy * dy)
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 1 && isDragging.current) {
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }))
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const s = dist / pinchDist.current
      pinchDist.current = dist
      setTransform((prev) => ({
        ...prev,
        scale: Math.max(0.5, Math.min(5, prev.scale * s)),
      }))
    }
  }

  function handleTouchEnd() {
    isDragging.current = false
  }

  return (
    <div
      className={`relative overflow-hidden cursor-grab active:cursor-grabbing select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="w-full h-full"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {children}
      </div>
    </div>
  )
}
