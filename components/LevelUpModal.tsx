'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  show: boolean
  level: number
  onClose: () => void
}

export default function LevelUpModal({ show, level, onClose }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="bg-[#1a1a2e] border border-purple-500/50 rounded-3xl p-8 text-center max-w-[280px] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl mb-3"
            >
              ⭐
            </motion.div>
            <div className="text-purple-400 text-sm font-semibold tracking-widest mb-1">
              LEVEL UP!
            </div>
            <div className="text-white text-5xl font-bold mb-4">Lv {level}</div>
            <p className="text-gray-400 text-sm mb-6">Lumieがさらに成長したよ！</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl px-6 py-3 font-semibold w-full"
            >
              やった！🎉
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
