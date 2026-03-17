'use client'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { ITEMS, RARITY_TEXT, RARITY_LABELS } from '@/lib/itemData'

export default function ItemDropToast() {
  const { lastItemDrop, clearItemDrop } = useGameStore()

  useEffect(() => {
    if (!lastItemDrop) return
    const timer = setTimeout(clearItemDrop, 3500)
    return () => clearTimeout(timer)
  }, [lastItemDrop, clearItemDrop])

  const item = lastItemDrop ? ITEMS[lastItemDrop.itemId] : null

  return (
    <AnimatePresence>
      {item && lastItemDrop && (
        <motion.div
          key={lastItemDrop.itemId + Date.now()}
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          style={{ maxWidth: 'calc(100vw - 32px)', width: 320 }}
        >
          <div className="bg-[#1a1a2e]/95 backdrop-blur border border-yellow-500/40 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl shadow-black/50">
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
              className="text-3xl shrink-0"
            >
              {item.emoji}
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-yellow-300 font-bold text-xs mb-0.5">✨ アイテムドロップ！</p>
              <p className="text-white font-semibold text-sm truncate">{item.name}</p>
              <p className={`text-xs ${RARITY_TEXT[item.rarity]}`}>{RARITY_LABELS[item.rarity]}</p>
            </div>
            <div className="text-xs text-gray-500 shrink-0">🎒 持ち物へ</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
