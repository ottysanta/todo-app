'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { playSound } from '@/lib/sound'

export default function DailyMissions() {
  const { dailyMissions, claimMission, soundEnabled } = useGameStore()

  if (!dailyMissions.length) return null

  const allDone = dailyMissions.every((m) => m.claimed)

  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-yellow-500/20">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🎯</span>
          <p className="text-sm font-semibold text-white">デイリーミッション</p>
        </div>
        {allDone && (
          <span className="text-xs text-yellow-400 font-medium">全完了！</span>
        )}
      </div>

      <div className="space-y-2">
        {dailyMissions.map((mission) => {
          const pct = Math.min(100, (mission.progress / mission.target) * 100)
          return (
            <motion.div
              key={mission.id}
              layout
              className={`rounded-xl p-3 border transition-colors ${
                mission.claimed
                  ? 'border-gray-700/30 bg-white/2 opacity-50'
                  : mission.completed
                  ? 'border-yellow-500/30 bg-yellow-900/10'
                  : 'border-white/5 bg-white/3'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl shrink-0">{mission.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium ${mission.claimed ? 'text-gray-600 line-through' : 'text-white'}`}>
                    {mission.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${mission.claimed ? 'bg-gray-600' : mission.completed ? 'bg-yellow-400' : 'bg-purple-500'}`}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{mission.progress}/{mission.target}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-yellow-600">+{mission.rewardXp} XP</span>
                    {mission.rewardFood > 0 && (
                      <span className="text-xs text-orange-600">🍖+{mission.rewardFood}</span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {mission.completed && !mission.claimed && (
                    <motion.button
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        playSound('complete', soundEnabled)
                        claimMission(mission.id)
                      }}
                      className="shrink-0 bg-gradient-to-r from-yellow-500 to-orange-400 text-white rounded-xl px-3 py-1.5 text-xs font-bold shadow-md shadow-yellow-900/30"
                    >
                      受取
                    </motion.button>
                  )}
                </AnimatePresence>

                {mission.claimed && (
                  <span className="text-green-500 text-lg shrink-0">✓</span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
