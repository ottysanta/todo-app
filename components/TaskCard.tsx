'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Task, TaskStatus } from '@/lib/types'
import {
  getProgressLabel,
  getProgressColor,
  getProgressWidth,
  getCategoryEmoji,
  getDaysUntil,
} from '@/lib/gameEngine'

interface Props {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit?: () => void
}

export default function TaskCard({ task, onStatusChange, onEdit }: Props) {
  const [showReward, setShowReward] = useState(false)

  // isMultiStep is explicitly false → single-step mode
  // undefined or true → legacy multi-step mode
  const isSingleStep = task.isMultiStep === false

  const handleProgress = () => {
    if (task.status >= 5) return
    const next = isSingleStep ? 5 : ((task.status + 1) as TaskStatus)
    if (next === 5) {
      setShowReward(true)
      setTimeout(() => setShowReward(false), 1800)
    }
    onStatusChange(task.id, next)
  }

  const handleRegress = () => {
    if (task.status <= 0) return
    onStatusChange(task.id, (task.status - 1) as TaskStatus)
  }

  const days = task.deadline ? getDaysUntil(task.deadline) : null
  const isOverdue = days !== null && days < 0
  const isUrgent = days !== null && days <= 1 && days >= 0
  const isComplete = task.status === 5

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-[#1a1a2e] rounded-2xl p-4 border transition-colors ${
        isComplete ? 'border-green-500/30' : isOverdue ? 'border-red-500/20' : 'border-white/5'
      }`}
    >
      <AnimatePresence>
        {showReward && (
          <motion.div
            key="reward"
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -32, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute top-2 right-2 text-yellow-400 font-bold text-xs pointer-events-none z-10 bg-black/40 rounded-lg px-2 py-1"
          >
            +50 XP 🍖+1
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5 shrink-0">{getCategoryEmoji(task.category)}</span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium leading-snug ${isComplete ? 'text-gray-500 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {days !== null && (
            <p className={`text-xs mt-0.5 ${
              isComplete ? 'text-green-500' :
              isOverdue ? 'text-red-400' :
              isUrgent ? 'text-orange-400' : 'text-gray-500'
            }`}>
              {isComplete ? '完了済み ✓' :
               isOverdue ? `${Math.abs(days)}日超過` :
               days === 0 ? '今日が期限！' : `あと${days}日`}
            </p>
          )}

          {/* 進捗バー */}
          {isSingleStep ? (
            <div className="mt-2">
              <span className={`text-xs ${isComplete ? 'text-green-400' : 'text-gray-500'}`}>
                {isComplete ? '完了 ✓' : '未完了'}
              </span>
            </div>
          ) : (
            <div className="mt-2.5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{getProgressLabel(task.status)}</span>
                <span className="text-xs text-gray-600">{task.status}/5</span>
              </div>
              <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getProgressColor(task.status)}`}
                  animate={{ width: getProgressWidth(task.status) }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右側ボタン群 */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {!isComplete ? (
            <div className="flex items-center gap-1">
              {!isSingleStep && task.status > 0 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRegress}
                  className="bg-gray-700/40 hover:bg-gray-700/70 text-gray-500 rounded-xl px-2 py-1.5 text-xs font-medium transition-colors"
                  aria-label="戻す"
                >
                  ◀
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleProgress}
                className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
              >
                {isSingleStep ? '完了する' : '進める'}
              </motion.button>
            </div>
          ) : (
            <span className="text-green-400 text-xl">✓</span>
          )}

          {/* 編集ボタン */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-gray-600 hover:text-gray-400 text-xs px-1 py-0.5 transition-colors"
              aria-label="編集"
            >
              ✏️
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
