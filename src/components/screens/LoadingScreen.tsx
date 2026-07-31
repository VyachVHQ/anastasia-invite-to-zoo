'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'

const emojis = ['\u{1F981}', '\u{1F43C}', '\u{1F418}', '\u{1F989}', '\u{1F427}', '\u{1F40A}']

export default function LoadingScreen() {
  const { goTo } = useApp()
  const [emojiIndex, setEmojiIndex] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => goTo('welcome'), 2000)
    const interval = setInterval(() => {
      setEmojiIndex((i) => (i + 1) % emojis.length)
    }, 350)
    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [goTo])

  return (
    <div className="h-screen flex flex-col items-center justify-center p-6 bg-base">
      <div className="text-center space-y-8">
        <div className="relative h-20 flex items-center justify-center">
          <motion.div
            key={emojiIndex}
            initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
            className="text-6xl md:text-7xl"
          >
            {emojis[emojiIndex]}
          </motion.div>
        </div>
        <div className="space-y-3">
          <p className="text-lg text-text-secondary font-body">
            Готовим маленькое приключение
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-rose-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-rose-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-rose-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
