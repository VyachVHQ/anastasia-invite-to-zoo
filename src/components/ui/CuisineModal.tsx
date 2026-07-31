'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

export const cuisines = [
  { id: 'italian', name: 'Итальянская', emoji: '🍕', tag: 'Паста · Пицца' },
  { id: 'serbian', name: 'Сербская', emoji: '🧆', tag: 'Чевапи · Плескавица' },
  { id: 'russian', name: 'Русская', emoji: '🫖', tag: 'Борщ · Блины' },
  { id: 'israeli', name: 'Израильская', emoji: '🥘', tag: 'Хумус · Шакшука' },
  { id: 'georgian', name: 'Грузинская', emoji: '🥟', tag: 'Хинкали · Хачапури' },
  { id: 'asian', name: 'Азиатская', emoji: '🍜', tag: 'Вок · Фо' },
]

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (ids: string[]) => void
}

export default function CuisineModal({ open, onClose, onSelect }: Props) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  function handleConfirm() {
    onSelect(selected)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl glass rounded-4xl p-6 md:p-8 shadow-soft-lg border border-rose-400/15"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-base-elevated/80 backdrop-blur-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-rose-400/20 transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6 md:mb-8">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="inline-block text-4xl mb-3"
              >
                🍽️
              </motion.span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-rose-300">
                Куда бы ты хотел сходить после?
              </h2>
              <p className="text-sm text-text-secondary mt-2">
                Можно выбрать несколько кухонь
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {cuisines.map((c, i) => {
                const isSelected = selected.includes(c.id)
                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.35, ease: 'easeOut' }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggle(c.id)}
                    className={`group relative flex flex-col items-center gap-2.5 p-5 rounded-3xl
                      bg-base-card/70 backdrop-blur-md border transition-all duration-300 cursor-pointer
                      shadow-soft hover:shadow-glow-lg
                      ${
                        isSelected
                          ? 'border-rose-400/70 bg-gradient-to-br from-rose-400/20 via-base-card to-base-card shadow-glow-lg'
                          : 'border-border-subtle/60 hover:border-rose-400/40 hover:bg-gradient-to-br hover:from-rose-400/15 hover:via-base-card hover:to-base-card'
                      }`}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-rose-400 flex items-center justify-center shadow-glow"
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </motion.span>
                    )}
                    <span className="text-4xl md:text-5xl drop-shadow-soft group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300">
                      {c.emoji}
                    </span>
                    <span className="text-sm md:text-base font-medium text-white text-center leading-tight" style={{ color: '#FFFFFF' }}>
                      {c.name}
                    </span>
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">
                      {c.tag}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className={`mt-6 w-full py-4 px-8 rounded-3xl font-medium text-white text-lg transition-all duration-300
                ${
                  selected.length > 0
                    ? 'bg-rose-400 shadow-glow'
                    : 'bg-base-elevated text-white/50 cursor-not-allowed'
                }`}
            >
              {'\u2728'} Готово{selected.length > 0 ? ` (${selected.length})` : ''}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
