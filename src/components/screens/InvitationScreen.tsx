'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import CuisineModal, { cuisines } from '@/components/ui/CuisineModal'

const MIN_DATE = '2026-08-01'
const MAX_DATE = '2026-10-01'

export default function InvitationScreen() {
  const { goTo, dispatch } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [comment, setComment] = useState('')
  const [done, setDone] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [showCuisine, setShowCuisine] = useState(false)

  function handleDateChange(value: string) {
    if (value > MAX_DATE) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      return
    }
    if (value < MIN_DATE) {
      setDate(MIN_DATE)
      return
    }
    setDate(value)
  }

  function handleSubmit() {
    if (!date || !time) return
    dispatch({ type: 'SET_INVITE', payload: { date, time, comment: comment || undefined } })
    setShowCuisine(true)
  }

  function handleCuisineSelect(cuisineIds: string[]) {
    dispatch({ type: 'SET_INVITE', payload: { date, time, comment: comment || undefined, cuisines: cuisineIds } })
    setShowCuisine(false)
    setDone(true)
    const names = cuisineIds.map((id) => cuisines.find((c) => c.id === id)?.name || id)
    const cuisineText = names.length
      ? `Кухни после прогулки: ${names.join(', ')}`
      : 'Кухни после прогулки: не выбраны'
    fetch('/api/route', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: cuisineText, append: true }),
    }).catch(() => {})
  }

  function handleDoneClose() {
    goTo('final')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {!showForm && !done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-4xl p-10 space-y-5"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-text-primary/90 leading-relaxed"
            >
              Кажется, маршрут получился очень интересным.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-text-primary/90 leading-relaxed"
            >
              Если однажды захочется пройти именно его...
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="text-xl md:text-2xl text-text-primary/90 leading-relaxed"
            >
              Какой день будет для тебя удобнее?
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary w-full text-lg"
              >
                Выбрать день
              </button>
            </motion.div>
          </motion.div>
        )}

        {showForm && !done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-4xl p-8 md:p-10 space-y-6"
          >
            <h2 className="text-2xl font-display font-semibold text-rose-300 text-center">
              {'\u{1F4C5}'} Выбери день и время
            </h2>

            <p className="text-sm text-text-secondary text-center -mt-3">
              Август — сентябрь 2026
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Дата
                </label>
                <input
                  type="date"
                  value={date}
                  min={MIN_DATE}
                  max={MAX_DATE}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-base-light/60 backdrop-blur-sm
                    border border-rose-400/20 text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-rose-400/30
                    transition-all duration-300 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Время
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-base-light/60 backdrop-blur-sm
                    border border-rose-400/20 text-text-primary
                    focus:outline-none focus:ring-2 focus:ring-rose-400/30
                    transition-all duration-300 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Комментарий (необязательно)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Может, хочешь что-то добавить?"
                  className="w-full px-4 py-3 rounded-2xl bg-base-light/60 backdrop-blur-sm
                    border border-rose-400/20 text-text-primary placeholder-text-muted
                    focus:outline-none focus:ring-2 focus:ring-rose-400/30
                    transition-all duration-300 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!date || !time}
              className={`w-full py-4 px-8 rounded-3xl font-medium text-lg transition-all duration-300
                ${date && time
                  ? 'btn-primary'
                  : 'bg-base-elevated text-text-muted cursor-not-allowed'}`}
            >
              {'\u2728'} Всё выбрано
            </button>
          </motion.div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-4xl p-10 text-center space-y-4"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-block text-4xl"
            >
              {'\u{1F60A}'}
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-text-primary/90 leading-relaxed"
            >
              Отлично!
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-text-secondary leading-relaxed"
            >
              Тогда я встречу тебя примерно за час до выбранного времени возле твоего дома,
              а затем мы вместе отправимся в Московский зоопарк.
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDoneClose}
              className="btn-primary w-full text-lg"
            >
              Хорошо
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      <CuisineModal
        open={showCuisine}
        onClose={() => setShowCuisine(false)}
        onSelect={handleCuisineSelect}
      />

      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="glass rounded-2xl px-6 py-3 shadow-soft-lg border border-rose-400/20">
              <p className="text-sm text-rose-300 font-medium">
                {'\u{1F63E}'} Эй, так мы вообще никогда не увидимся!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
