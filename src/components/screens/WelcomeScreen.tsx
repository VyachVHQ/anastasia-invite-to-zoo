'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '@/context/AppContext'

const messages = [
  'Привет \u{1F60A}',
  'У меня появилась одна небольшая идея.',
  'Но сначала предлагаю сыграть в небольшую игру.',
  'Она займёт всего несколько минут.',
]

export default function WelcomeScreen() {
  const { goTo } = useApp()
  const [visibleMessages, setVisibleMessages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)

  const showNextMessage = useCallback(() => {
    if (currentIndex < messages.length) {
      setVisibleMessages((prev) => [...prev, messages[currentIndex]])
      setCurrentIndex((prev) => prev + 1)
    } else {
      setShowButton(true)
    }
  }, [currentIndex])

  useEffect(() => {
    const timer = setTimeout(showNextMessage, currentIndex === 0 ? 350 : 650)
    return () => clearTimeout(timer)
  }, [currentIndex, showNextMessage])

  return (
    <div className="h-screen flex items-center justify-center p-6 bg-base">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-4xl p-10 space-y-4">
          <AnimatePresence mode="popLayout">
            {visibleMessages.map((msg, i) => (
              <motion.p
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
                className="text-lg md:text-xl text-text-primary/90 leading-relaxed"
              >
                {msg}
              </motion.p>
            ))}
          </AnimatePresence>

          {showButton && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="pt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => goTo('likes')}
                className="btn-primary w-full text-lg"
              >
                Начать
              </motion.button>
            </motion.div>
          )}
        </div>

        {!showButton && (
          <div className="flex justify-center mt-6">
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-rose-400/50" />
              <span className="w-2 h-2 rounded-full bg-rose-400/50" />
              <span className="w-2 h-2 rounded-full bg-rose-400/50" />
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
