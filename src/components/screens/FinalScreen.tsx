'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '@/context/AppContext'
import { collectSubmissionData, submitData } from '@/lib/submitData'
import { buildReport, sendReport } from '@/lib/report'
import { asset } from '@/lib/asset'

export default function FinalScreen() {
  const { state, dispatch } = useApp()
  const [showRejection, setShowRejection] = useState(false)

  useEffect(() => {
    const data = collectSubmissionData(state)
    submitData(data)
    sendReport(buildReport(state))
  }, [state])

  function handleReset() {
    dispatch({ type: 'RESET' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="glass rounded-4xl p-10 md:p-12 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-soft border border-rose-400/20 relative bg-base-card"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl drop-shadow-glow">{'\u{1F60A}'}</span>
            </div>
            <img
              src={asset('/images/end_photo.png')}
              alt=""
              className="relative w-full h-full object-cover"
              draggable={false}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </motion.div>

          <div className="space-y-3">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-display font-semibold text-rose-300"
            >
              Маршрут готов.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-text-primary/90"
            >
              Осталось только встретиться.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-2xl text-rose-300/90 font-display"
            >
              До встречи {'\u{1F60A}'}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full py-4 px-8 btn-primary"
            >
              {'\u{1F60A}'} Увидимся
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
