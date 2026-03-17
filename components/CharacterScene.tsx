'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CharacterDisplay from './CharacterDisplay'
import type { CharacterMood, BondStage, CharacterSpecies, CharacterSceneType, EquippedItems } from '@/lib/types'

interface Props {
  mood: CharacterMood
  bondStage: BondStage
  species?: CharacterSpecies
  onTap?: () => void
  soundEnabled?: boolean
  forceScene?: CharacterSceneType
  onSceneEnd?: () => void
  equippedItems?: EquippedItems
}

const SCENE_WEIGHTS: { scene: CharacterSceneType; weight: number }[] = [
  { scene: 'idle',          weight: 50 },
  { scene: 'walking',       weight: 20 },
  { scene: 'playing',       weight: 15 },
  { scene: 'stretching',    weight: 10 },
  { scene: 'sleeping_scene', weight: 5 },
]

function pickRandomScene(): CharacterSceneType {
  const total = SCENE_WEIGHTS.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const { scene, weight } of SCENE_WEIGHTS) {
    r -= weight
    if (r <= 0) return scene
  }
  return 'idle'
}

const SCENE_DURATION: Record<CharacterSceneType, number> = {
  idle:          12000,
  walking:       8000,
  playing:       6000,
  stretching:    5000,
  sleeping_scene: 10000,
  eating:        4000,
}

const SCENE_LABELS: Record<CharacterSceneType, string> = {
  idle:          '',
  walking:       '散歩中…🚶',
  playing:       '遊んでる！',
  stretching:    'ストレッチ中…',
  sleeping_scene: 'うとうと…💤',
  eating:        'もぐもぐ…🍖',
}

export default function CharacterScene({
  mood,
  bondStage,
  species = 'lumie',
  onTap,
  forceScene,
  onSceneEnd,
  equippedItems,
}: Props) {
  const [scene, setScene] = useState<CharacterSceneType>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [tapAnim, setTapAnim] = useState<'bounce' | 'happy_jump' | 'flinch' | 'shy' | 'heart' | 'spin' | 'eat' | null>(null)
  const [floatingFood, setFloatingFood] = useState(false)

  const startScene = (s: CharacterSceneType) => {
    setScene(s)
    if (s === 'eating') {
      setFloatingFood(true)
      setTapAnim('eat')
      setTimeout(() => setTapAnim(null), 1400)
      setTimeout(() => setFloatingFood(false), 1800)
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const next = pickRandomScene()
      startScene(next)
      onSceneEnd?.()
    }, SCENE_DURATION[s])
  }

  useEffect(() => {
    startScene('idle')
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    if (forceScene && forceScene !== scene) {
      if (timerRef.current) clearTimeout(timerRef.current)
      startScene(forceScene)
    }
  }, [forceScene])

  const handleTap = () => {
    onTap?.()
    if (scene !== 'eating') {
      setTapAnim('bounce')
      setTimeout(() => setTapAnim(null), 500)
    }
  }

  // Walking: translate left-right
  const walkAnim = scene === 'walking'
    ? {
        x: [0, 40, 40, -40, -40, 0],
        scaleX: [1, 1, -1, -1, 1, 1],
        transition: { duration: 8, ease: 'easeInOut' as const, times: [0, 0.25, 0.3, 0.7, 0.75, 1] },
      }
    : undefined

  // Playing: bigger bounce
  const playAnim = scene === 'playing'
    ? {
        y: [0, -30, 0, -20, 0, -28, 0],
        rotate: [0, 5, -5, 5, -5, 5, 0],
        transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : undefined

  // Stretching: arms up via scale/rotate
  const stretchAnim = scene === 'stretching'
    ? {
        scaleY: [1, 1.08, 1, 1.08, 1],
        y: [0, -5, 0, -5, 0],
        transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : undefined

  // Sleeping: slow rock
  const sleepAnim = scene === 'sleeping_scene'
    ? {
        rotate: [0, -3, 3, -3, 0],
        y: [0, 2, 0, 2, 0],
        transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : undefined

  const sceneAnim = walkAnim ?? playAnim ?? stretchAnim ?? sleepAnim

  const displayMood = scene === 'sleeping_scene' ? 'sleeping' :
                      scene === 'playing' ? 'happy' :
                      scene === 'eating' ? 'happy' :
                      mood

  const label = SCENE_LABELS[scene]

  return (
    <div className="relative flex flex-col items-center">
      {/* シーンラベル */}
      <AnimatePresence>
        {label && (
          <motion.div
            key={scene}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -top-6 text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 食べ物フロート */}
      <AnimatePresence>
        {floatingFood && (
          <motion.div
            key="food"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -50, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 text-3xl pointer-events-none z-10"
          >
            🍖
          </motion.div>
        )}
      </AnimatePresence>

      {/* キャラクター本体 */}
      <motion.div
        animate={sceneAnim}
        onPointerDown={handleTap}
        className="cursor-pointer select-none"
      >
        <CharacterDisplay
          mood={displayMood}
          bondStage={bondStage}
          size="lg"
          species={species}
          tapAnim={tapAnim}
          equippedItems={equippedItems}
        />
      </motion.div>
    </div>
  )
}
