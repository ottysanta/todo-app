'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import CharacterDisplay from '@/components/CharacterDisplay'

const STAGE_EMOJIS: Record<string, string> = {
  '子供期': '🌱',
  '成長期': '⚡',
  '伝説':   '👑',
}

const STAGE_DESC: Record<string, string> = {
  '子供期': 'たまごから子供へ。少しずつ大きくなってきたよ！',
  '成長期': 'ぐんぐん成長中！もっと強くなれる予感がする。',
  '伝説':   '伝説の領域へ突入！唯一無二の存在となった！',
}

export default function StageEvolutionModal() {
  const { pendingStageEvolution, dismissStageEvolution, character } = useGameStore()

  if (!pendingStageEvolution) return null

  const emoji = STAGE_EMOJIS[pendingStageEvolution.stageName] ?? '✨'
  const desc = STAGE_DESC[pendingStageEvolution.stageName] ?? '新たなステージへ進化した！'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          className="w-full max-w-[360px] bg-[#0f0f1a] rounded-3xl border border-yellow-500/40 overflow-hidden"
        >
          <div className="p-8 text-center space-y-5">
            {/* Sparkle ring */}
            <div className="relative flex justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="absolute text-4xl opacity-30"
              >
                ✦ · ✦ · ✦ · ✦
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-5xl z-10"
              >
                {emoji}
              </motion.div>
            </div>

            <CharacterDisplay
              mood="happy"
              bondStage="loving"
              size="md"
              species={character.characterSpecies ?? 'lumie'}
            />

            <div className="space-y-2">
              <p className="text-yellow-400 text-sm font-medium tracking-wide">
                Lv {pendingStageEvolution.level} 達成
              </p>
              <h2 className="text-white text-2xl font-black">
                {pendingStageEvolution.stageName}へ進化！
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>

            {/* Particle dots */}
            <div className="flex justify-center gap-1.5">
              {[...Array(7)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [0, 1.4, 0], opacity: [0, 1, 0] }}
                  transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity, repeatDelay: 0.8 }}
                  className="w-2 h-2 rounded-full bg-yellow-400"
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={dismissStageEvolution}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base shadow-lg shadow-yellow-900/40"
            >
              やった！🎉
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
