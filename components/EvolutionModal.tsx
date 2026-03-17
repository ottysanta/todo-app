'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { getAvailableEvolutions, EVOLUTION_OPTIONS } from '@/lib/evolutionEngine'
import type { EvolutionType } from '@/lib/types'

export default function EvolutionModal() {
  const { character, pendingEvolution, confirmEvolution, dismissEvolution } = useGameStore()
  const [selected, setSelected] = useState<EvolutionType | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  if (!pendingEvolution) return null

  const available = getAvailableEvolutions(character)
  const options = available.map((t) => EVOLUTION_OPTIONS[t])

  const handleConfirm = () => {
    if (!selected) return
    setConfirmed(true)
    setTimeout(() => {
      confirmEvolution(selected)
      setSelected(null)
      setConfirmed(false)
    }, 1800)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-full max-w-[390px] bg-[#0f0f1a] rounded-3xl border border-purple-500/40 overflow-hidden"
        >
          {confirmed ? (
            /* Evolution animation */
            <div className="p-10 text-center">
              <motion.div
                animate={{ scale: [1, 1.3, 1, 1.4, 1], rotate: [0, -10, 10, -5, 0] }}
                transition={{ duration: 1.6, ease: 'easeInOut' }}
                className="text-7xl mb-4"
              >
                {selected && EVOLUTION_OPTIONS[selected].emoji}
              </motion.div>
              <motion.div
                animate={{ opacity: [0, 1, 0, 1], scale: [0.8, 1.1, 0.9, 1] }}
                transition={{ duration: 1.6 }}
              >
                <h2 className="text-2xl font-black text-white">進化中…！</h2>
                <p className="text-purple-400 mt-2">
                  {selected && EVOLUTION_OPTIONS[selected].label}へ進化！
                </p>
              </motion.div>
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [0, 1.3, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 1, delay: i * 0.15, repeat: 1 }}
                    className="w-2 h-2 rounded-full bg-purple-400"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {/* Header */}
              <div className="text-center pt-2">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-5xl mb-3"
                >
                  ✨
                </motion.div>
                <h2 className="text-xl font-black text-white">進化の時！</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {character.name}がレベル10に達した！<br />
                  どの形に進化するか選ぼう
                </p>
              </div>

              {/* Evolution options */}
              <div className="space-y-2">
                {options.map((opt) => (
                  <motion.button
                    key={opt.type}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelected(selected === opt.type ? null : opt.type)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all ${
                      selected === opt.type
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-white/10 bg-white/3 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.color} flex items-center justify-center text-2xl shrink-0`}>
                        {opt.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{opt.label}</p>
                          {selected === opt.type && (
                            <span className="text-xs bg-purple-600 text-white rounded-full px-2 py-0.5">選択中</span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-0.5 leading-snug">{opt.description}</p>
                        <p className="text-gray-600 text-xs mt-1">条件: {opt.requirements}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={dismissEvolution}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-400 font-medium text-sm"
                >
                  後で
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleConfirm}
                  disabled={!selected}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                    selected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-900/40'
                      : 'bg-white/10 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  ✨ 進化する！
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
