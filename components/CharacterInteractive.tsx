'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CharacterDisplay from './CharacterDisplay'
import type { CharacterMood, BondStage, TapReaction, CharacterSpecies, EquippedItems } from '@/lib/types'
import { getTapReaction, getTapMessage } from '@/lib/gameEngine'
import { playSound } from '@/lib/sound'

interface Props {
  mood: CharacterMood
  bondStage: BondStage
  size?: 'sm' | 'md' | 'lg'
  onTap: () => void
  soundEnabled?: boolean
  species?: CharacterSpecies
  equippedItems?: EquippedItems
}

interface FloatingMessage {
  id: number
  text: string
  x: number
}

export default function CharacterInteractive({ mood, bondStage, size = 'lg', onTap, soundEnabled = true, species, equippedItems }: Props) {
  const [tapAnim, setTapAnim] = useState<TapReaction>('idle')
  const [floatingMsgs, setFloatingMsgs] = useState<FloatingMessage[]>([])
  const consecutiveTapsRef = useRef(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const msgIdRef = useRef(0)

  const handleTap = useCallback(() => {
    // 連打カウント更新
    consecutiveTapsRef.current += 1
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      consecutiveTapsRef.current = 0
    }, 2500)

    const count = consecutiveTapsRef.current
    const reaction = getTapReaction(bondStage, count)
    const message = getTapMessage(bondStage, count)

    playSound('tap', soundEnabled)

    // アニメーション発火
    setTapAnim(reaction)
    setTimeout(() => setTapAnim('idle'), 600)

    // フローティングメッセージ
    const id = ++msgIdRef.current
    const x = 40 + (Math.random() - 0.5) * 40 // ランダムなX位置（%）
    setFloatingMsgs((prev) => [...prev.slice(-3), { id, text: message, x }])
    setTimeout(() => {
      setFloatingMsgs((prev) => prev.filter((m) => m.id !== id))
    }, 1400)

    onTap()
  }, [bondStage, onTap])

  return (
    <div className="relative inline-block select-none" style={{ cursor: 'pointer' }}>
      {/* フローティングメッセージ */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <AnimatePresence>
          {floatingMsgs.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -50, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ position: 'absolute', left: `${msg.x}%`, top: '10%', transform: 'translateX(-50%)' }}
              className="bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap border border-white/20 shadow-lg"
            >
              {msg.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* タップエリア */}
      <div onPointerDown={handleTap}>
        <CharacterDisplay
          mood={mood}
          bondStage={bondStage}
          size={size}
          tapAnim={tapAnim === 'idle' ? null : tapAnim as 'bounce' | 'happy_jump' | 'flinch' | 'shy' | 'heart' | 'spin'}
          species={species}
          equippedItems={equippedItems}
        />
      </div>
    </div>
  )
}
