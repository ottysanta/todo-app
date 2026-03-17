'use client'
import { motion } from 'framer-motion'

interface Props {
  hp: number
  hunger: number
  mood: number
}

function Bar({
  label,
  value,
  color,
  emoji,
}: {
  label: string
  value: number
  color: string
  emoji: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-5">{emoji}</span>
      <span className="text-xs text-gray-400 w-12 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-700/60 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs text-gray-500 w-7 text-right">{value}</span>
    </div>
  )
}

export default function StatusBars({ hp, hunger, mood }: Props) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <Bar label="元気" value={hp} color="bg-green-400" emoji="💚" />
      <Bar label="満腹" value={100 - hunger} color="bg-orange-400" emoji="🍖" />
      <Bar label="ご機嫌" value={mood} color="bg-pink-400" emoji="😊" />
    </div>
  )
}
