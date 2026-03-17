'use client'
import { motion } from 'framer-motion'

interface Props {
  message: string
}

export default function CharacterMessage({ message }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      key={message}
      className="relative bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 text-sm text-white max-w-[280px] text-center border border-white/10"
    >
      {message}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-3 overflow-hidden">
        <div className="w-3 h-3 bg-white/10 border-b border-r border-white/10 rotate-45 -translate-y-1 mx-auto" />
      </div>
    </motion.div>
  )
}
