'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Task, TaskStatus, TaskCategory } from '@/lib/types'
import { getProgressLabel, getCategoryEmoji } from '@/lib/gameEngine'

const categories: { value: TaskCategory; label: string }[] = [
  { value: 'work', label: '仕事' },
  { value: 'study', label: '勉強' },
  { value: 'exercise', label: '運動' },
  { value: 'personal', label: '個人' },
  { value: 'team', label: 'チーム' },
]

const statusOptions: TaskStatus[] = [0, 1, 2, 3, 4, 5]

interface Props {
  task: Task | null
  onClose: () => void
  onSave: (id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'deadline' | 'status'>>) => void
  onDelete: (id: string) => void
}

export default function TaskEditSheet({ task, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [category, setCategory] = useState<TaskCategory>(task?.category ?? 'work')
  const [deadline, setDeadline] = useState(
    task?.deadline ? task.deadline.slice(0, 10) : ''
  )
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!task) return null

  const handleSave = () => {
    if (!title.trim()) return
    onSave(task.id, { title: title.trim(), category, deadline: deadline || undefined, status })
    onClose()
  }

  const handleDelete = () => {
    onDelete(task.id)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 32 }}
          className="bg-[#1a1a2e] rounded-t-3xl w-full max-w-[430px] mx-auto border-t border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ハンドル */}
          <div className="flex justify-center pt-4 pb-2">
            <div className="w-10 h-1 bg-gray-600 rounded-full" />
          </div>

          <div className="px-6 pb-8 space-y-5">
            <h2 className="text-white font-bold text-lg">タスクを編集</h2>

            {/* タイトル */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">タスク名</p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* ステータス */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">進捗</p>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`py-2 rounded-xl text-xs font-medium transition-colors ${
                      status === s ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {getProgressLabel(s)}
                  </button>
                ))}
              </div>
            </div>

            {/* カテゴリ */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">カテゴリ</p>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-colors ${
                      category === cat.value ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                    }`}
                  >
                    {getCategoryEmoji(cat.value)} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 締切 */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">締切（任意）</p>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
              />
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl py-3 font-semibold"
            >
              保存する
            </button>

            {/* 削除 */}
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-red-400 text-sm py-2 hover:text-red-300 transition-colors"
              >
                タスクを削除する
              </button>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 space-y-3">
                <p className="text-sm text-red-300 text-center">本当に削除しますか？</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white/5 text-gray-400 rounded-xl py-2 text-sm"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white rounded-xl py-2 text-sm font-semibold"
                  >
                    削除する
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
