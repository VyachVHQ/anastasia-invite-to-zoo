'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'

type Phase = 'ask' | 'second' | 'input' | 'thanks' | 'final'

const labels = [
  'Точно нет?',
  'Может, чуть позже?',
]

export default function RejectionDialog({
  onClose,
}: {
  onClose: () => void
}) {
  const { state, dispatch } = useApp()
  const [phase, setPhase] = useState<Phase>('ask')
  const [inputValue, setInputValue] = useState('')
  const noRef = useRef<HTMLButtonElement>(null)

  const handleNo = useCallback(() => {
    dispatch({ type: 'INCREMENT_REJECTION' })
    if (phase === 'ask') {
      setPhase('second')
    } else if (phase === 'second') {
      setPhase('input')
    } else if (phase === 'thanks') {
      setPhase('final')
    }
  }, [phase, dispatch])

  const handleInputSubmit = useCallback(() => {
    if (inputValue.trim()) {
      dispatch({ type: 'SET_REJECTION', payload: inputValue })
    }
    setPhase('thanks')
  }, [inputValue, dispatch])

  const shakeNo = state.rejectionCount > 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative glass rounded-4xl p-8 md:p-10 max-w-md w-full text-center space-y-5"
      >
        {phase === 'ask' && (
          <>
            <p className="text-xl md:text-2xl text-text-primary/90 font-display">
              Ты уверена? {'\u{1F60A}'}
            </p>
          </>
        )}

        {phase === 'second' && (
          <p className="text-xl md:text-2xl text-text-primary/90 font-display">
            Кажется, некоторые животные уже приготовились встречать гостей {'\u{1F43C}'}
          </p>
        )}

        {phase === 'input' && (
          <div className="space-y-4">
            <p className="text-xl md:text-2xl text-text-primary/90 font-display">
              Что тебя немного смущает?
            </p>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              rows={3}
              placeholder="Напиши пару слов..."
              className="w-full px-4 py-3 rounded-2xl bg-base-light/60 backdrop-blur-sm
                border border-rose-400/20 text-text-primary placeholder-text-muted
                focus:outline-none focus:ring-2 focus:ring-rose-400/30
                transition-all duration-300 resize-none"
            />
            <button
              onClick={handleInputSubmit}
              className="w-full py-3 px-8 btn-primary"
            >
              {'\u{1F64F}'} Ответить
            </button>
          </div>
        )}

        {phase === 'thanks' && (
          <div className="space-y-3">
            <p className="text-xl text-text-primary/90">
              {'\u{1F60A}'} Спасибо!
            </p>
            <p className="text-base text-text-secondary">
              Я обязательно это учту.
            </p>
          </div>
        )}

        {phase === 'final' && (
          <div className="space-y-4">
            <p className="text-base text-text-primary/90 leading-relaxed">
              {'\u{1F64F}'} Спасибо, что уделила время этой небольшой игре.
            </p>
            <p className="text-base text-text-secondary leading-relaxed">
              Если когда-нибудь захочется пройти этот маршрут — он уже будет ждать.
            </p>
            <button
              onClick={onClose}
              className="w-full py-4 px-8 btn-primary text-lg"
            >
              Хорошо {'\u{1F60A}'}
            </button>
          </div>
        )}

        {phase !== 'final' && phase !== 'input' && (
          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 px-8 btn-primary text-lg"
            >
              Увидимся
            </motion.button>

            <motion.button
              ref={noRef}
              animate={
                shakeNo
                  ? {
                      x: [0, -3, 3, -2, 2, 0],
                    }
                  : {}
              }
              transition={{ duration: 0.4, repeat: shakeNo ? 1 : 0 }}
              whileHover={{
                x: shakeNo ? [0, -3, 3, -1, 1, 0] : 0,
                scale: 1.01,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNo}
              className="w-full py-3 px-8 text-text-secondary rounded-3xl font-medium hover:bg-rose-400/10 hover:text-rose-300 transition-colors"
            >
              {phase === 'ask'
                ? labels[0]
                : phase === 'second'
                  ? labels[1]
                  : 'В другой раз'}
            </motion.button>
          </div>
        )}

        {phase === 'thanks' && (
          <div className="flex flex-col gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-4 px-8 btn-primary text-lg"
            >
              Увидимся
            </motion.button>
            <motion.button
              animate={{ x: [0, -3, 3, -2, 2, 0] }}
              transition={{ duration: 0.4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNo}
              className="w-full py-3 px-8 text-text-secondary rounded-3xl font-medium hover:bg-rose-400/10 hover:text-rose-300 transition-colors"
            >
              В другой раз
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
