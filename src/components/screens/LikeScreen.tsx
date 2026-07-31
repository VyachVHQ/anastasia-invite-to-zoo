'use client'

import { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import animalsData from '@/data/animals.json'
import markersData from '@/../markers.json'
import { getEmoji } from '@/lib/emojis'
import { useImageOrientation } from '@/lib/useImageOrientation'
import { Heart, X, Sparkles } from 'lucide-react'

export default function LikeScreen() {
  const { state, goTo, dispatch } = useApp()
  const [finished, setFinished] = useState(false)
  const isFirstRender = useRef(true)

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  const markerIds = useMemo(() => new Set(markersData.markers.map(m => m.id)), [])

  const excludedFromQuiz = useMemo(() => new Set(['waterfowl', 'penguin', 'swan']), [])

  const animals = useMemo(
    () => (animalsData.animals as any[])
      .filter((a: any) => markerIds.has(a.id))
      .filter((a: any) => !excludedFromQuiz.has(a.id)),
    [markerIds, excludedFromQuiz],
  )

  const current = animals[state.currentAnimalIndex]
  const isLast = state.currentAnimalIndex >= animals.length - 1
  const progress = Math.round((state.currentAnimalIndex / animals.length) * 100)

  const handleLike = useCallback(() => {
    dispatch({ type: 'ADD_LIKE', payload: current.id })
    if (isLast) {
      setFinished(true)
      setTimeout(() => goTo('map'), 500)
    } else {
      dispatch({ type: 'NEXT_ANIMAL' })
    }
  }, [current?.id, isLast, dispatch, goTo])

  const handleDislike = useCallback(() => {
    dispatch({ type: 'ADD_DISLIKE', payload: current.id })
    if (isLast) {
      setFinished(true)
      setTimeout(() => goTo('map'), 500)
    } else {
      dispatch({ type: 'NEXT_ANIMAL' })
    }
  }, [current?.id, isLast, dispatch, goTo])

  const handleLikeAll = useCallback(() => {
    const remaining = animals.slice(state.currentAnimalIndex)
    for (const a of remaining) {
      dispatch({ type: 'ADD_LIKE', payload: a.id })
    }
    setFinished(true)
    setTimeout(() => goTo('map'), 500)
  }, [animals, state.currentAnimalIndex, dispatch, goTo])

  if (!current) return null

  const { orientation, aspectRatio } = useImageOrientation(current.image)
  const isPortrait = orientation === 'portrait'
  const imgRatio = aspectRatio ? `${aspectRatio}` : undefined

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-base">
      <div className="w-full max-w-xl mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-text-muted font-medium">
            {state.currentAnimalIndex + 1}/{animals.length}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-base-elevated overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-rose-400"
              initial={isFirstRender.current ? `${progress}%` : { width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!finished && (
          <motion.div
            key={current.id}
            initial={isFirstRender.current ? false : { opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-2xl"
          >
            <div className="glass rounded-4xl overflow-hidden">
              {isPortrait ? (
                <div className="flex">
                  <div
                    className="relative w-[45%] flex-shrink-0"
                    style={{ aspectRatio: imgRatio, minHeight: 320 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400/25 via-base-card to-base-card" />
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <img
                        src={current.image}
                        alt={current.name}
                        className="w-full h-full object-contain"
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-base/70 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-3 w-11 h-11 rounded-2xl bg-base-card/80 backdrop-blur-md flex items-center justify-center text-xl border border-rose-400/30 shadow-soft">
                      {getEmoji(current.name)}
                    </span>
                  </div>
                  <div className="flex-1 p-7 flex flex-col">
                    <h2 className="text-3xl font-display font-semibold text-rose-300 leading-tight">
                      {current.name}
                    </h2>
                    <p className="text-sm text-text-muted italic mt-1">
                      {current.latinName}
                    </p>

                    <div className="glass p-5 rounded-3xl mt-5">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-2 font-medium">{'\u{1F4D6}'} Факт</p>
                      <p className="text-base text-text-secondary leading-relaxed">
                        {current.fact}
                      </p>
                    </div>

                    <div className="flex gap-3 justify-center mt-auto pt-5">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleDislike}
                        className="w-16 h-16 rounded-full bg-base-elevated flex items-center justify-center
                          text-text-muted hover:text-rose-300 hover:bg-rose-400/15
                          border border-border-subtle hover:border-rose-400/30
                          transition-all duration-200"
                      >
                        <X className="w-7 h-7" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleLike}
                        className="w-16 h-16 rounded-full bg-rose-400 flex items-center justify-center
                          text-white shadow-glow hover:shadow-glow-lg
                          transition-all duration-200"
                      >
                        <Heart className="w-7 h-7" fill="currentColor" />
                      </motion.button>
                    </div>

                    <button
                      onClick={handleLikeAll}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl mt-3
                        bg-rose-400/10 text-rose-300 text-sm font-medium
                        hover:bg-rose-400/20 transition-all duration-200"
                    >
                      <Sparkles className="w-4 h-4" /> Нравятся все
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: imgRatio || '4/3' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-400/25 via-base-card to-base-card flex items-center justify-center">
                        <span className="text-6xl drop-shadow-glow">{getEmoji(current.name)}</span>
                      </div>
                      <img
                        src={current.image}
                        alt={current.name}
                        className="relative w-full h-full object-contain p-4"
                        draggable={false}
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-base/95 via-base/30 to-transparent pointer-events-none" />
                      <span className="absolute top-4 right-4 w-12 h-12 rounded-2xl bg-base-card/80 backdrop-blur-md flex items-center justify-center text-2xl border border-rose-400/30 shadow-soft">
                        {getEmoji(current.name)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                      <h2 className="text-2xl font-display font-semibold text-white drop-shadow-md">
                        {current.name}
                      </h2>
                      <p className="text-xs text-white/60 italic mt-0.5">
                        {current.latinName}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="glass p-4 rounded-3xl">
                      <p className="text-xs text-text-muted uppercase tracking-widest mb-1.5 font-medium">{'\u{1F4D6}'} Факт</p>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {current.fact}
                      </p>
                    </div>

                    <div className="flex gap-4 justify-center pt-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleDislike}
                        className="w-16 h-16 rounded-full bg-base-elevated flex items-center justify-center
                          text-text-muted hover:text-rose-300 hover:bg-rose-400/15
                          border border-border-subtle hover:border-rose-400/30
                          transition-all duration-200"
                      >
                        <X className="w-7 h-7" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={handleLike}
                        className="w-16 h-16 rounded-full bg-rose-400 flex items-center justify-center
                          text-white shadow-glow hover:shadow-glow-lg
                          transition-all duration-200"
                      >
                        <Heart className="w-7 h-7" fill="currentColor" />
                      </motion.button>
                    </div>

                    <div className="pt-2 border-t border-border-subtle/50">
                      <button
                        onClick={handleLikeAll}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-3xl
                          bg-rose-400/10 text-rose-300 text-sm font-medium
                          hover:bg-rose-400/20 transition-all duration-200"
                      >
                        <Sparkles className="w-4 h-4" /> Нравятся все
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {finished && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-rose-300"
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse-soft" />
          <span className="text-sm text-text-secondary">Обрабатываем твои ответы...</span>
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse-soft" />
        </motion.div>
      )}
    </div>
  )
}
