'use client'
import { motion } from 'framer-motion'

interface Props {
  xp: number
  xpToNext: number
  level: number
}

export default function XPBar({ xp, xpToNext, level }: Props) {
  const pct = Math.min(100, (xp / xpToNext) * 100)
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1.5">
        <span className="font-medium text-purple-400">Lv {level}</span>
        <span>
          {xp} / {xpToNext} XP
        </span>
      </div>
      <div className="h-2.5 bg-gray-700/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
