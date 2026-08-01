'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import animalsData from '@/data/animals.json'
import exhibitionsData from '@/data/exhibitions.json'
import markersData from '@/../markers.json'
import { getEmoji } from '@/lib/emojis'
import { useImageOrientation } from '@/lib/useImageOrientation'
import { asset } from '@/lib/asset'

const { animals } = animalsData
const { exhibitions } = exhibitionsData

interface MarkerItem {
  key: string
  id: string
  x: number
  y: number
}

interface DisplayItem {
  id: string
  name: string
  emoji: string
  image?: string
  imageFit?: string
  category?: string
  fact?: string
  legend?: string
  residents?: string[]
  isExhibition?: boolean
}

function resolveMarker(id: string): DisplayItem | null {
  const animal = animals.find((a) => a.id === id)
  if (animal) return { id: animal.id, name: animal.name, emoji: getEmoji(animal.name), image: asset(animal.image), imageFit: animal.imageFit, category: animal.category, fact: animal.fact, legend: animal.legend }
  const exhibition = exhibitions.find((e) => e.id === id)
  if (exhibition) return { id: exhibition.id, name: exhibition.name, emoji: exhibition.emoji, image: asset(exhibition.image || ''), category: exhibition.category, fact: exhibition.fact, legend: exhibition.legend, residents: exhibition.residents, isExhibition: true }
  return null
}

let markerCounter = 0
function nextKey() { return 'm' + (++markerCounter) }
const MIN_ZOOM = 0.8
const MAX_ZOOM = 5
const INITIAL_ZOOM = 1.5
const FRICTION = 0.92
const VELOCITY_THRESHOLD = 0.5

export default function MapScreen() {
  const { state, goTo } = useApp()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedAnimal, setSelectedAnimal] = useState<DisplayItem | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [markers, setMarkers] = useState<MarkerItem[]>([])
  const [draggingKey, setDraggingKey] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clientX: number; clientY: number } | null>(null)
  const [search, setSearch] = useState('')
  const [markerScale, setMarkerScale] = useState(1)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [canDrag, setCanDrag] = useState(true)
  const [ready, setReady] = useState(false)
  const [imgRatio, setImgRatio] = useState(1)
  const [finishVisible, setFinishVisible] = useState(true)

  const containerRef = useRef<HTMLDivElement>(null)
  const imageAreaRef = useRef<HTMLDivElement>(null)
  const imgRatioRef = useRef(1)
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDragging = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const pinchDist = useRef(0)
  const velocity = useRef({ x: 0, y: 0 })
  const history = useRef<{ x: number; y: number; t: number }[]>([])
  const inertiaRef = useRef<number | null>(null)
  const currentPan = useRef({ x: 0, y: 0 })
  const currentZoom = useRef(INITIAL_ZOOM)
  const wheelHandlerRef = useRef<((e: WheelEvent) => void) | null>(null)

  useEffect(() => {
    const loaded = markersData.markers.map((mk: any) => ({ key: nextKey(), id: mk.id, x: mk.x, y: mk.y }))
    setMarkers(loaded)
  }, [])

  function getBounds(z: number) {
    const c = containerRef.current
    if (!c) return { minX: 0, maxX: 0, minY: 0, maxY: 0 }
    const w = c.clientWidth
    const h = c.clientHeight
    const ratio = imgRatioRef.current || 1
    const imgBaseH = w / ratio
    const imgW = w * z
    const imgH = imgBaseH * z
    const topBase = ((h - imgBaseH) / 2) * z
    let minX: number, maxX: number
    if (imgW <= w) {
      minX = maxX = (w - imgW) / 2
    } else {
      minX = w - imgW
      maxX = 0
    }
    let minY: number, maxY: number
    if (imgH <= h) {
      minY = maxY = (h - imgH) / 2 - topBase
    } else {
      minY = h - imgH - topBase
      maxY = -topBase
    }
    return { minX, maxX, minY, maxY }
  }

  function clampPan(x: number, y: number, z: number) {
    const { minX, maxX, minY, maxY } = getBounds(z)
    return { x: Math.max(minX, Math.min(maxX, x)), y: Math.max(minY, Math.min(maxY, y)) }
  }

  function updatePan(x: number, y: number, z: number) {
    const clamped = clampPan(x, y, z)
    currentPan.current = clamped; currentZoom.current = z
    setPan(clamped); setZoom(z)
    const c = containerRef.current
    if (c) setCanDrag(c.clientWidth * z > c.clientWidth)
  }

  function centerAtZoom(z: number) {
    const c = containerRef.current; if (!c) return
    const ratio = imgRatioRef.current || 1
    const imgBaseH = c.clientWidth / ratio
    const imgW = c.clientWidth * z
    const imgH = imgBaseH * z
    const topBase = ((c.clientHeight - imgBaseH) / 2) * z
    const x = (c.clientWidth - imgW) / 2
    const y = (c.clientHeight - imgH) / 2 - topBase
    const clamped = clampPan(x, y, z)
    currentPan.current = clamped; currentZoom.current = z
    setPan(clamped); setZoom(z)
    setCanDrag(c.clientWidth * z > c.clientWidth)
  }

  function getClientPos(e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) {
    if ('touches' in e) {
      if ((e as TouchEvent).touches.length > 0) return { x: (e as TouchEvent).touches[0].clientX, y: (e as TouchEvent).touches[0].clientY }
      return null
    }
    return { x: (e as MouseEvent).clientX, y: (e as MouseEvent).clientY }
  }

  function handleDragStart(e: React.MouseEvent | React.TouchEvent) {
    if (editMode || !canDrag) return
    hideFinish()
    const pos = getClientPos(e); if (!pos) return
    isDragging.current = true; lastPos.current = pos
    history.current = [{ ...pos, t: Date.now() }]
    if (inertiaRef.current) { cancelAnimationFrame(inertiaRef.current); inertiaRef.current = null }
    velocity.current = { x: 0, y: 0 }
  }

  function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
    if (editMode || !isDragging.current || !canDrag) return
    hideFinish()
    const pos = getClientPos(e); if (!pos) return
    const dx = pos.x - lastPos.current.x; const dy = pos.y - lastPos.current.y
    lastPos.current = pos
    const now = Date.now()
    history.current.push({ ...pos, t: now })
    if (history.current.length > 5) history.current.shift()
    updatePan(currentPan.current.x + dx, currentPan.current.y + dy, currentZoom.current)
  }

  function handleDragEnd() {
    isDragging.current = false
    if (!canDrag) return
    if (history.current.length >= 2) {
      const first = history.current[0]; const last = history.current[history.current.length - 1]
      const dt = last.t - first.t
      if (dt > 0 && dt < 150) {
        velocity.current = { x: ((last.x - first.x) / dt) * 12, y: ((last.y - first.y) / dt) * 12 }
        const step = () => {
          const v = velocity.current
          if (Math.abs(v.x) < VELOCITY_THRESHOLD && Math.abs(v.y) < VELOCITY_THRESHOLD) { inertiaRef.current = null; return }
          updatePan(currentPan.current.x + v.x, currentPan.current.y + v.y, currentZoom.current)
          v.x *= FRICTION; v.y *= FRICTION
          inertiaRef.current = requestAnimationFrame(step)
        }
        inertiaRef.current = requestAnimationFrame(step)
      }
    }
    history.current = []
  }

  function handleWheel(e: WheelEvent) {
    if (editMode) return
    e.preventDefault()
    hideFinish()
    const c = containerRef.current; if (!c) return
    const rect = c.getBoundingClientRect()
    const mx = e.clientX - rect.left; const my = e.clientY - rect.top
    const z = currentZoom.current
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + (e.deltaY > 0 ? -0.12 : 0.12)))
    if (c.clientWidth * newZoom <= c.clientWidth) { centerAtZoom(newZoom); return }
    const ratio = newZoom / z
    updatePan(mx - (mx - currentPan.current.x) * ratio, my - (my - currentPan.current.y) * ratio, newZoom)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      if (editMode) return
      e.preventDefault()
      hideFinish()
      const c = containerRef.current; if (!c) return
      const rect = c.getBoundingClientRect()
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top
      const z = currentZoom.current
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + (e.deltaY > 0 ? -0.12 : 0.12)))
      if (c.clientWidth * newZoom <= c.clientWidth) { centerAtZoom(newZoom); return }
      const ratio = newZoom / z
      updatePan(mx - (mx - currentPan.current.x) * ratio, my - (my - currentPan.current.y) * ratio, newZoom)
    }
    wheelHandlerRef.current = handler
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [editMode])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      if (!ready) { centerAtZoom(INITIAL_ZOOM); setReady(true) }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ready])

  useEffect(() => {
    return () => { if (inertiaRef.current) cancelAnimationFrame(inertiaRef.current) }
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    if (editMode) return
    hideFinish()
    if (e.touches.length === 1) {
      if (!canDrag) return
      isDragging.current = true
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      history.current = [{ x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }]
      if (inertiaRef.current) { cancelAnimationFrame(inertiaRef.current); inertiaRef.current = null }
      velocity.current = { x: 0, y: 0 }
    } else if (e.touches.length === 2) {
      isDragging.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchDist.current = Math.sqrt(dx * dx + dy * dy)
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (editMode) return
    if (e.touches.length === 1 && isDragging.current && canDrag) {
      const dx = e.touches[0].clientX - lastPos.current.x
      const dy = e.touches[0].clientY - lastPos.current.y
      lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      const now = Date.now()
      history.current.push({ x: e.touches[0].clientX, y: e.touches[0].clientY, t: now })
      if (history.current.length > 5) history.current.shift()
      updatePan(currentPan.current.x + dx, currentPan.current.y + dy, currentZoom.current)
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      const s = dist / pinchDist.current; pinchDist.current = dist
      const c = containerRef.current; if (!c) return
      const rect = c.getBoundingClientRect()
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top
      const z = currentZoom.current
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z * s))
      if (c.clientWidth * newZoom <= c.clientWidth) { centerAtZoom(newZoom); return }
      const ratio = newZoom / z
      updatePan(cx - (cx - currentPan.current.x) * ratio, cy - (cy - currentPan.current.y) * ratio, newZoom)
    }
  }

  function handleTouchEnd() { handleDragEnd(); history.current = [] }

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight
    imgRatioRef.current = ratio
    setImgRatio(ratio)
  }

  function hideFinish() {
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current)
    setFinishVisible(false)
    finishTimerRef.current = setTimeout(() => setFinishVisible(true), 800)
  }

  function finishMap() {
    const markerIds = new Set(markersData.markers.map((m: any) => m.id))
    const excluded = new Set(['waterfowl', 'penguin', 'swan'])
    const quizAnimals = animals
      .filter((a) => markerIds.has(a.id))
      .filter((a) => !excluded.has(a.id))
    const likedSet = new Set(state.likedAnimals)
    const dislikedSet = new Set(state.dislikedAnimals)
    const lines = quizAnimals.map((a) => {
      const verdict = likedSet.has(a.id) ? 'нравится' : dislikedSet.has(a.id) ? 'не нравится' : 'не оценил(а)'
      return `${a.name} - ${verdict}`
    })
    const content = ['Ответы на опрос:', ...lines].join('\n')
    fetch('/api/route', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).catch(() => {})
    goTo('invitation')
  }

  function saveMarkers() {
    fetch('/api/markers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entrance: { x: 3, y: 50 }, exit: { x: 50, y: 92 }, markers: markers.map((m) => ({ id: m.id, x: m.x, y: m.y })) }),
    }).then(() => { setEditMode(false) }).catch(console.error)
  }

  function restoreBaseMarkers() {
    fetch('/api/markers/base')
      .then((r) => r.json())
      .then((data) => {
        if (data.markers?.length) {
          setMarkers(data.markers.map((mk: any) => ({ key: nextKey(), id: mk.id, x: mk.x, y: mk.y })))
        }
      })
      .catch(console.error)
  }

  function getImageRect() {
    const el = imageAreaRef.current
    if (!el) return null
    return el.getBoundingClientRect()
  }

  function screenToImagePercent(cx: number, cy: number): { x: number; y: number } | null {
    const rect = getImageRect()
    if (!rect) return null
    return {
      x: Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100)),
    }
  }

  function startMarkerDrag(e: React.MouseEvent | React.TouchEvent, key: string) {
    if (!editMode) return
    e.stopPropagation(); e.preventDefault()
    setDraggingKey(key)
    function onMove(ev: MouseEvent | TouchEvent) {
      let cx: number, cy: number
      if ('touches' in ev) { if (ev.touches.length === 0) return; cx = ev.touches[0].clientX; cy = ev.touches[0].clientY }
      else { cx = ev.clientX; cy = ev.clientY }
      const pos = screenToImagePercent(cx, cy)
      if (pos) setMarkers((prev) => prev.map((m) => m.key === key ? { ...m, x: pos.x, y: pos.y } : m))
    }
    function onUp() { setDraggingKey(null); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.removeEventListener('touchmove', onMove); document.removeEventListener('touchend', onUp) }
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false }); document.addEventListener('touchend', onUp)
  }

  function removeMarker(key: string) {
    setMarkers((prev) => prev.filter((m) => m.key !== key))
  }

  function handleContextMenu(e: React.MouseEvent) {
    if (!editMode) return
    e.preventDefault()
    const rect = imageAreaRef.current?.getBoundingClientRect()
    if (!rect) return
    setSearch('')
    setContextMenu({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      clientX: e.clientX,
      clientY: e.clientY,
    })
  }

  function placeFromMenu(animalId: string) {
    if (!contextMenu) return
    setMarkers((prev) => [...prev, { key: nextKey(), id: animalId, x: contextMenu.x, y: contextMenu.y }])
    setContextMenu(null)
  }

  const { orientation: selectedOrientation, aspectRatio: selectedRatio } = useImageOrientation(selectedAnimal ? selectedAnimal.image || '' : '')

  return (
    <div className="h-screen w-screen flex flex-col bg-base overflow-hidden">
      <div className="z-20 flex-shrink-0 bg-base/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-2">
          <p className="text-xs text-text-muted">
            {editMode ? 'Таскай маркеры, удаляй лишние' : 'Тащи карту — найди маркер и нажми'}
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="map-area flex-1 relative overflow-hidden select-none"
        style={{ background: '#1C1C28' }}
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
            cursor: editMode ? 'default' : (canDrag ? 'grab' : 'default'),
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-0" style={{ paddingBottom: `${100 / imgRatio}%` }}>
              <img
                src={asset('/images/zoo-map.png')}
                alt=""
                className="absolute inset-0 w-full h-full"
                draggable={false}
                onLoad={onImgLoad}
                style={{ imageRendering: 'auto' }}
              />

              <div className="absolute inset-0" ref={imageAreaRef}>
              {markers.map((m, idx) => {
                const item = resolveMarker(m.id)
                if (!item) return null
                return (
                  <div
                    key={m.key}
                    className="absolute"
                    style={{
                      left: `${m.x}%`,
                      top: `${m.y}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: hoveredId === m.key || selectedAnimal?.id === item.id || draggingKey === m.key ? 30 : 10,
                      cursor: editMode ? 'move' : 'pointer',
                    }}
                    onMouseEnter={() => !editMode && setHoveredId(m.key)}
                    onMouseLeave={() => !editMode && setHoveredId(null)}
                    onClick={(e) => { e.stopPropagation(); if (!editMode) setSelectedAnimal(item) }}
                    onMouseDown={(e) => startMarkerDrag(e, m.key)}
                    onTouchStart={(e) => startMarkerDrag(e, m.key)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div className={`flex items-center justify-center transition-all duration-200 rounded-full
                      bg-base-card/80 border-2 border-rose-400/70 shadow-glow
                      ${editMode && draggingKey === m.key
                        ? 'scale-125 border-rose-200 shadow-glow-lg'
                        : editMode
                          ? 'cursor-move border-rose-400 shadow-glow'
                          : selectedAnimal?.id === item.id
                            ? 'scale-110 border-rose-200 shadow-glow-lg'
                            : hoveredId === m.key
                              ? 'scale-110 border-rose-200 shadow-glow-lg'
                              : 'border-rose-400/70 shadow-glow'}`}
                      style={{
                        width: `${Math.max(10, 18 / zoom) * markerScale}px`,
                        height: `${Math.max(10, 18 / zoom) * markerScale}px`,
                        fontSize: `${Math.max(7, 13 / zoom) * markerScale}px`,
                        lineHeight: 1,
                      }}
                    >
                      {item.emoji}
                    </div>
                    {editMode && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); removeMarker(m.key) }}
                        className="absolute -top-1.5 -right-1.5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-500"
                        style={{ width: `${Math.max(4, 6 / zoom)}px`, height: `${Math.max(4, 6 / zoom)}px` }}
                      >
                        <X style={{ width: `${Math.max(2, 3.5 / zoom)}px`, height: `${Math.max(2, 3.5 / zoom)}px` }} />
                      </button>
                    )}
                    {hoveredId === m.key && !editMode && (
                      <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap" style={{ bottom: `${Math.max(6, 14 / zoom)}px` }}>
                        <div className="bg-base-card/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-soft border border-rose-400/20" style={{ fontSize: `${Math.max(8, 11 / zoom)}px` }}>
                          <span className="text-rose-200 font-medium">{item.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      </div>

      {contextMenu && editMode && (
        <div
          className="fixed z-40"
          style={{
            left: Math.min(contextMenu.clientX, window.innerWidth - 230),
            top: Math.min(contextMenu.clientY, window.innerHeight - 350),
          }}
        >
          <div className="glass rounded-2xl p-2 max-h-[380px] overflow-y-auto shadow-soft-lg border border-rose-400/20" style={{ width: 220 }}>
            <div className="px-2 pt-1.5 pb-2 sticky top-0 bg-base-card/95 backdrop-blur-md">
              <p className="text-[10px] text-text-muted uppercase tracking-wider mb-2 font-medium">{'\u{1F4CD}'} Выбери животное</p>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найти животное или выставку..."
                className="w-full px-3 py-2 rounded-xl bg-base-light/60 backdrop-blur-sm
                  border border-rose-400/20 text-text-primary text-xs placeholder-text-muted
                  focus:outline-none focus:ring-2 focus:ring-rose-400/30 transition-all duration-300"
              />
            </div>
            {[...exhibitions]
              .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
              .filter((e) => e.name.toLowerCase().includes(search.trim().toLowerCase()))
              .map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setSearch(''); placeFromMenu(e.id) }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-rose-300/90 hover:bg-rose-400/15 transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-rose-400/15 border border-rose-400/25 flex items-center justify-center text-sm flex-shrink-0">
                    {e.emoji}
                  </span>
                  <span className="truncate flex-1">{e.name}</span>
                </button>
              ))}
            {exhibitions.length > 0 && (
              <div className="my-1.5 mx-2 border-t border-border-subtle/60" />
            )}
            {[...animals]
              .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
              .filter((a) => a.name.toLowerCase().includes(search.trim().toLowerCase()))
              .map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setSearch(''); placeFromMenu(a.id) }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-text-secondary hover:bg-rose-400/15 hover:text-rose-300 transition-colors text-left"
                >
                  <span className="w-6 h-6 rounded-full bg-base-elevated/80 flex items-center justify-center text-sm flex-shrink-0">
                    {getEmoji(a.name)}
                  </span>
                  <span className="truncate flex-1">{a.name}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* click outside closes context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null) }} />
      )}

      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAnimal(null)}
          >
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative glass rounded-4xl overflow-hidden max-w-lg w-full"
            >
              <button onClick={() => setSelectedAnimal(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-base-elevated/80 backdrop-blur-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-rose-400/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
              {selectedAnimal.isExhibition ? (
                <>
                  {selectedAnimal.image ? (
                    <div className="relative overflow-hidden" style={{ aspectRatio: selectedRatio ? `${selectedRatio}` : '4/3' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-400/25 via-base-card to-base-card flex items-center justify-center">
                        <span className="text-7xl drop-shadow-glow">{selectedAnimal.emoji}</span>
                      </div>
                      <img
                        src={selectedAnimal.image}
                        alt={selectedAnimal.name}
                        className="relative w-full h-full object-contain p-4"
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-base/70 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-rose-400/20 via-base-card to-base-card flex items-center justify-center">
                      <span className="text-7xl drop-shadow-glow">{selectedAnimal.emoji}</span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-display font-semibold text-rose-300 flex-1">{selectedAnimal.name}</h3>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-400/15 text-[10px] text-rose-300 font-medium uppercase tracking-wider">
                        {'\u{1F3D4}\u{FE0F}'} Выставка
                      </span>
                    </div>
                    {selectedAnimal.category && (
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-base-elevated text-[10px] text-text-muted font-medium uppercase tracking-wider">
                        {selectedAnimal.category}
                      </span>
                    )}
                    <div className="glass p-4 rounded-3xl mt-4">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F4D6}'} Факт</p>
                      <p className="text-sm text-text-primary/90 leading-relaxed">{selectedAnimal.fact}</p>
                    </div>
                    {selectedAnimal.residents && selectedAnimal.residents.length > 0 && (
                      <div className="glass p-4 rounded-3xl mt-3">
                        <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-medium">{'\u{1F98E}'} Обитатели</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedAnimal.residents.map((r) => (
                            <span key={r} className="px-2.5 py-1 rounded-full bg-base-elevated/70 text-[11px] text-text-secondary border border-border-subtle/50">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : selectedOrientation === 'portrait' ? (
                <>
                  <div className="flex">
                    <div className="relative w-[42%] flex-shrink-0" style={{ aspectRatio: selectedRatio ? `${selectedRatio}` : undefined, minHeight: 380 }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-400/25 via-base-card to-base-card" />
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <img
                          src={selectedAnimal.image}
                          alt={selectedAnimal.name}
                          className="w-full h-full object-contain"
                          draggable={false}
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-base/70 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-3 w-10 h-10 rounded-2xl bg-base-card/80 backdrop-blur-md flex items-center justify-center text-lg border border-rose-400/30 shadow-soft">
                        {selectedAnimal.emoji}
                      </span>
                    </div>
                    <div className="flex-1 p-5 flex flex-col">
                      <h3 className="text-xl font-display font-semibold text-rose-300 leading-tight">{selectedAnimal.name}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-rose-400/15 text-[10px] text-rose-300 font-medium uppercase tracking-wider self-start">
                        {selectedAnimal.category}
                      </span>
                      <div className="glass p-4 rounded-3xl mt-4">
                        <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F4D6}'} Факт</p>
                        <p className="text-sm text-text-primary/90 leading-relaxed">{selectedAnimal.fact}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="glass p-4 rounded-3xl">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F9DD}'} Легенда</p>
                      <p className="text-sm text-rose-200/80 leading-relaxed italic">{selectedAnimal.legend}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative overflow-hidden" style={{ aspectRatio: selectedRatio ? `${selectedRatio}` : '4/3' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400/25 via-base-card to-base-card flex items-center justify-center">
                      <span className="text-6xl drop-shadow-glow">{getEmoji(selectedAnimal.name)}</span>
                    </div>
                    <img
                      src={selectedAnimal.image}
                      alt={selectedAnimal.name}
                      className="relative w-full h-full object-contain p-4"
                      draggable={false}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-base via-base/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-display font-semibold text-white drop-shadow-md">{selectedAnimal.name}</h3>
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full bg-rose-400/20 backdrop-blur-md text-[10px] text-rose-200 font-medium uppercase tracking-wider border border-rose-400/30">
                        {selectedAnimal.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="glass p-4 rounded-3xl">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F4D6}'} Факт</p>
                      <p className="text-sm text-text-primary/90 leading-relaxed">{selectedAnimal.fact}</p>
                    </div>
                    <div className="glass p-4 rounded-3xl">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F9DD}'} Легенда</p>
                      <p className="text-sm text-rose-200/80 leading-relaxed italic">{selectedAnimal.legend}</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={{ opacity: finishVisible && !editMode ? 1 : 0, y: finishVisible && !editMode ? 0 : 24 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={finishMap}
          className="pointer-events-auto flex items-center gap-2 px-8 py-3.5 rounded-full bg-rose-400 text-white text-sm font-medium hover:bg-rose-300 transition-colors shadow-glow"
        >
          {'\u2728'} Завершить
        </motion.button>
      </motion.div>
    </div>
  )
}
