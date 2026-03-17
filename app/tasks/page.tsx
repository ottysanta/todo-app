'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import TaskCard from '@/components/TaskCard'
import TaskEditSheet from '@/components/TaskEditSheet'
import type { Task, TaskCategory, TaskStatus } from '@/lib/types'

const tabs = ['今日', '今週', 'すべて']

const categories: { value: TaskCategory; label: string; emoji: string }[] = [
  { value: 'work', label: '仕事', emoji: '💼' },
  { value: 'study', label: '勉強', emoji: '📚' },
  { value: 'exercise', label: '運動', emoji: '💪' },
  { value: 'personal', label: '個人', emoji: '✨' },
  { value: 'team', label: 'チーム', emoji: '👥' },
]

export default function TasksPage() {
  const { tasks, updateTaskStatus, addTask, editTask, deleteTask } = useGameStore()
  const [activeTab, setActiveTab] = useState(0)
  const [showAdd, setShowAdd] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // 追加フォーム状態
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('work')
  const [newDeadline, setNewDeadline] = useState('')
  const [newIsMultiStep, setNewIsMultiStep] = useState(false)

  const quickDate = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const filteredTasks = tasks
    .filter((t) => {
      if (activeTab === 0) {
        if (!t.deadline) return t.status < 5  // 締切なしは未完のもののみ今日表示
        const d = new Date(t.deadline)
        const today = new Date()
        return d.toDateString() === today.toDateString() || (d <= today && t.status < 5)
      }
      if (activeTab === 1) {
        if (!t.deadline) return true
        const d = new Date(t.deadline)
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        return d <= weekFromNow
      }
      return true
    })
    // 未完了を上、完了を下
    .sort((a, b) => {
      if (a.status === 5 && b.status !== 5) return 1
      if (a.status !== 5 && b.status === 5) return -1
      return 0
    })

  const completedCount = filteredTasks.filter((t) => t.status === 5).length

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addTask(newTitle.trim(), newCategory, newDeadline || undefined, newIsMultiStep || undefined)
    setNewTitle('')
    setNewDeadline('')
    setNewCategory('work')
    setNewIsMultiStep(false)
    setShowAdd(false)
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">タスク</h1>
        <a href="/calendar" className="text-xs text-gray-500 bg-white/5 rounded-xl px-3 py-2 flex items-center gap-1.5">
          <span>📅</span><span>カレンダー</span>
        </a>
      </div>

      {/* タブ */}
      <div className="flex gap-2">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === i ? 'bg-purple-600 text-white' : 'bg-[#1a1a2e] text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 進捗サマリー */}
      {filteredTasks.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>{completedCount}/{filteredTasks.length} 完了</span>
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-green-400 rounded-full transition-all duration-500"
              style={{ width: `${filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* タスクリスト */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={(id, status) => updateTaskStatus(id, status as TaskStatus)}
              onEdit={() => setEditingTask(task)}
            />
          ))}
        </AnimatePresence>
        {filteredTasks.length === 0 && (
          <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 text-center">
            <p className="text-gray-500 text-sm">タスクがありません</p>
            <p className="text-gray-600 text-xs mt-1">右下の ＋ から追加しよう</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-24 right-4 w-14 h-14 bg-purple-600 rounded-full text-white text-3xl flex items-center justify-center shadow-lg shadow-purple-900/60 z-40"
      >
        +
      </motion.button>

      {/* 追加モーダル（中央表示・キーボード対応） */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="bg-[#1a1a2e] rounded-3xl w-full max-w-[400px] border border-white/10 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div className="flex justify-between items-center px-5 pt-5 pb-3">
                <h2 className="text-white font-bold text-lg">タスクを追加</h2>
                <button onClick={() => setShowAdd(false)} className="text-gray-500 hover:text-gray-300 text-xl leading-none transition-colors">✕</button>
              </div>

              {/* スクロール可能なフォーム本体 */}
              <div className="px-5 pb-2 space-y-4 overflow-y-auto max-h-[60vh]">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleAdd()}
                  placeholder="タスク名を入力..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none focus:border-purple-500 transition-colors text-base"
                  autoFocus
                />

                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">カテゴリ</p>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat.value}
                        onClick={() => setNewCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-colors ${
                          newCategory === cat.value ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">締切（任意）</p>
                  <div className="flex gap-1.5 mb-2">
                    {[{ label: '今日', days: 0 }, { label: '明日', days: 1 }, { label: '来週', days: 7 }].map(({ label, days }) => (
                      <button
                        key={label}
                        onClick={() => setNewDeadline(quickDate(days))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                          newDeadline === quickDate(days) ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500 transition-colors [color-scheme:dark]"
                    />
                    {newDeadline && (
                      <button
                        onClick={() => setNewDeadline('')}
                        className="px-3 py-2 bg-white/5 text-gray-500 rounded-xl text-sm hover:bg-white/10 transition-colors"
                      >
                        クリア
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm text-white font-medium">5段階進捗</p>
                    <p className="text-xs text-gray-500 mt-0.5">ONにすると細かく進捗を記録できる</p>
                  </div>
                  <button
                    onClick={() => setNewIsMultiStep(!newIsMultiStep)}
                    className={`relative w-11 h-6 rounded-full transition-all duration-200 ${newIsMultiStep ? 'bg-purple-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${newIsMultiStep ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              {/* 固定ボタン */}
              <div className="px-5 py-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => setShowAdd(false)}
                  className="flex-1 bg-white/5 text-gray-400 rounded-xl py-3 font-medium text-sm"
                >
                  キャンセル
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 disabled:from-gray-700 disabled:to-gray-700 text-white rounded-xl py-3 font-bold text-sm transition-all"
                >
                  追加する ✓
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 編集シート */}
      {editingTask && (
        <TaskEditSheet
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={editTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  )
}
