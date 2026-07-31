'use client'

import React, { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider, useApp } from '@/context/AppContext'
import LoadingScreen from '@/components/screens/LoadingScreen'
import WelcomeScreen from '@/components/screens/WelcomeScreen'
import LikeScreen from '@/components/screens/LikeScreen'
import MapScreen from '@/components/screens/MapScreen'
import InvitationScreen from '@/components/screens/InvitationScreen'
import FinalScreen from '@/components/screens/FinalScreen'

function ScreenContent() {
  const { state } = useApp()
  switch (state.screen) {
    case 'loading': return <LoadingScreen />
    case 'welcome': return <WelcomeScreen />
    case 'likes': return <LikeScreen />
    case 'map': return <MapScreen />
    case 'invitation': return <InvitationScreen />
    case 'final': return <FinalScreen />
    default: return <LoadingScreen />
  }
}

export default function Home() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error: Error | null}> {
  constructor(props: {children: React.ReactNode}) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return <div className="min-h-screen bg-base flex items-center justify-center p-6"><div className="glass rounded-4xl p-8 max-w-md"><p className="text-rose-300 font-medium mb-2">Ошибка</p><p className="text-text-secondary text-sm">{this.state.error.message}</p><p className="text-text-muted text-xs mt-4">Открой консоль браузера (F12) для подробностей</p></div></div>
    }
    return this.props.children
  }
}

function Inner() {
  const { state } = useApp()
  const [mounted, setMounted] = useState(false)
  const prevScreen = useRef(state.screen)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isFirstRender = !mounted || prevScreen.current === state.screen
  prevScreen.current = state.screen

  return (
    <div className="min-h-screen bg-base">
      <AnimatePresence mode="wait">
        <motion.div
          key={state.screen}
          initial={isFirstRender ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <ErrorBoundary><ScreenContent /></ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
