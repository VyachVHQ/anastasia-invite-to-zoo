'use client'

import { useMemo, useCallback, useState, useEffect } from 'react'
import { motion, Reorder } from 'framer-motion'
import Image from 'next/image'
import { useApp } from '@/context/AppContext'
import { buildOptimalRoute, buildLongRoute, getRoutePath } from '@/lib/routing'
import { buildRanking } from '@/lib/ranking'
import { getEmoji } from '@/lib/emojis'
import animalsData from '@/data/animals.json'
import type { RouteMode } from '@/types'

const { animals } = animalsData

interface Point {
  x: number
  y: number
}

export default function RouteScreen() {
  const { state, goTo } = useApp()
  const [routeMode, setRouteModeState] = useState<RouteMode['id']>('optimal')
  const [routeOrderOverride, setRouteOrderOverride] = useState<string[]>([])
  const [animProgress, setAnimProgress] = useState(0)

  const ranking = useMemo(() => buildRanking(state.likedAnimals), [state.likedAnimals])

  const entrance: Point = { x: 3, y: 50 }
  const exit: Point = { x: 50, y: 92 }

  const optimalRoute = useMemo(
    () => buildOptimalRoute(ranking, entrance, exit),
    [ranking],
  )

  const longRoute = useMemo(
    () => buildLongRoute(ranking, entrance, exit),
    [ranking],
  )

  const currentRoute = useMemo(() => {
    if (routeOrderOverride.length > 0) {
      return routeOrderOverride
        .map((id) => animals.find((a) => a.id === id))
        .filter(Boolean) as typeof animals
    }
    return routeMode === 'optimal' ? optimalRoute : longRoute
  }, [routeOrderOverride, routeMode, optimalRoute, longRoute])

  const path = useMemo(
    () => getRoutePath(currentRoute, entrance, exit),
    [currentRoute],
  )

  useEffect(() => {
    if (path.length < 2) return
    const duration = 6000
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setAnimProgress(progress)
      if (progress >= 1) clearInterval(timer)
    }, 30)
    return () => clearInterval(timer)
  }, [path])

  const setMode = useCallback((mode: RouteMode['id']) => {
    setRouteModeState(mode)
    setRouteOrderOverride([])
  }, [])

  const handleReorder = useCallback((reordered: typeof animals) => {
    setRouteOrderOverride(reordered.map((a) => a.id))
  }, [])

  const moveItem = useCallback(
    (index: number, direction: -1 | 1) => {
      const newOrder = [...currentRoute]
      const target = index + direction
      if (target < 0 || target >= newOrder.length) return
      ;[newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]]
      handleReorder(newOrder)
    },
    [currentRoute, handleReorder],
  )

  function animPoint(index: number): Point {
    if (path.length < 2) return path[0] || { x: 0, y: 0 }
    const totalSegments = path.length - 1
    const progress = animProgress * totalSegments
    const segIndex = Math.min(Math.floor(progress), totalSegments - 1)
    const segProgress = progress - segIndex
    const from = path[segIndex]
    const to = path[segIndex + 1]
    return {
      x: from.x + (to.x - from.x) * segProgress,
      y: from.y + (to.y - from.y) * segProgress,
    }
  }

  const currentPos = useMemo(() => animPoint(0), [animProgress, path])
  const totalDistance = useMemo(() => {
    let d = 0
    for (let i = 1; i < path.length; i++) {
      d += Math.sqrt((path[i].x - path[i - 1].x) ** 2 + (path[i].y - path[i - 1].y) ** 2)
    }
    return Math.round(d)
  }, [path])

  function handleSaveRoute() {
    goTo('invitation')
    const routeNames = ['Старт', ...currentRoute.map((a) => a.name), 'Выход']
    const content = routeNames.join(' -> ')
    fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    }).catch(() => {})
  }

  return (
    <div className="min-h-screen flex flex-col p-3 md:p-6 bg-base">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-semibold text-rose-300 mb-1">
            {'\u{1F9ED}'} Твой маршрут
          </h2>
          <p className="text-text-secondary text-xs md:text-sm">
            {currentRoute.length} точек, ~{totalDistance} шагов
          </p>
        </div>
      </motion.div>

      <div className="flex items-center justify-center gap-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('optimal')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all duration-300 ${
            routeMode === 'optimal'
              ? 'bg-rose-400 text-white shadow-soft'
              : 'glass text-text-secondary hover:shadow-soft hover:text-rose-300'
          }`}
        >
          {'\u{1F3AF}'} Оптимальный
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('long')}
          className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-medium transition-all duration-300 ${
            routeMode === 'long'
              ? 'bg-rose-400 text-white shadow-soft'
              : 'glass text-text-secondary hover:shadow-soft hover:text-rose-300'
          }`}
        >
          {'\u{1F3C3}'} Длинная прогулка
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 max-w-5xl mx-auto w-full">
        <div className="relative w-full md:w-3/5 aspect-[4/3] rounded-3xl overflow-hidden shadow-soft border border-rose-400/10 flex-shrink-0">
          <div className="absolute inset-0">
            <Image src="/images/zoo-map.png" alt="Карта зоопарка" fill className="object-cover" priority />
          </div>

          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <path
              d={path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke="#FF8FAB"
              strokeWidth="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.2}
            />
            <path
              d={path.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
              fill="none"
              stroke="#FF6B9D"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.5}
              strokeDasharray="0.8,0.5"
            />
            {path.slice(1, -1).map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="0.6" fill="#E84393" opacity={0.3} />
            ))}
            {currentPos && (
              <image
                href="/images/user-icon.png"
                x={currentPos.x - 2}
                y={currentPos.y - 2}
                width={4}
                height={4}
              />
            )}
          </svg>

          <div
            className="absolute w-4 h-4 flex items-center justify-center"
            style={{ left: '3%', top: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-3 h-3 rounded-full bg-rose-400 text-white flex items-center justify-center text-[6px] font-bold shadow-md border border-white/30">
              A
            </div>
          </div>
          <div
            className="absolute w-4 h-4 flex items-center justify-center"
            style={{ left: '50%', top: '92%', transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-3 h-3 rounded-full bg-rose-300 text-white flex items-center justify-center text-[6px] font-bold shadow-md border border-white/30">
              B
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="relative rounded-3xl glass flex-1 min-h-0 max-h-[360px]">
            <div className="relative p-2 h-full overflow-y-auto">
              <Reorder.Group
                axis="y"
                values={currentRoute}
                onReorder={handleReorder}
                className="space-y-1"
              >
                {currentRoute.map((animal, i) => (
                  <Reorder.Item
                    key={animal.id}
                    value={animal}
                    className="bg-base-light/50 backdrop-blur-sm rounded-2xl p-2.5 cursor-grab active:cursor-grabbing
                      hover:bg-base-elevated/50 transition-colors duration-200 list-none border border-rose-400/10"
                    whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(255,107,157,0.15)' }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center text-[10px] font-display font-bold text-rose-300 flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-base flex-shrink-0">{getEmoji(animal.name)}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-text-primary truncate block">
                          {animal.name}
                        </span>
                      </div>
                      <div className="flex gap-1 md:hidden">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveItem(i, -1) }}
                          disabled={i === 0}
                          className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center text-[10px] text-rose-300 disabled:opacity-30"
                        >
                          {'\u25B2'}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveItem(i, 1) }}
                          disabled={i === currentRoute.length - 1}
                          className="w-6 h-6 rounded-full bg-rose-400/20 flex items-center justify-center text-[10px] text-rose-300 disabled:opacity-30"
                        >
                          {'\u25BC'}
                        </button>
                      </div>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-center"
          >
            <button
              onClick={handleSaveRoute}
              className="btn-primary"
            >
              {'\u2728'} Маршрут готов
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
