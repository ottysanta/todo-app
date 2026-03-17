'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { getCategoryEmoji, getDaysUntil } from '@/lib/gameEngine'

function getWeekDays() {
  const days: Date[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

const dayNames = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarPage() {
  const { tasks } = useGameStore()
  const weekDays = getWeekDays()
  const [gcalConnected, setGcalConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const handleGCalConnect = () => {
    setConnecting(true)
    // Mock: simulate OAuth flow
    setTimeout(() => {
      setConnecting(false)
      setGcalConnected(true)
    }, 1800)
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-4">
      <div>
        <h1 className="text-white font-bold text-xl">📅 カレンダー</h1>
        <p className="text-gray-500 text-sm mt-0.5">締切から逆算して今やることを整理しよう</p>
      </div>

      {/* Google Calendar integration */}
      <div className={`rounded-2xl border overflow-hidden ${gcalConnected ? 'border-green-500/30 bg-green-900/10' : 'border-white/10 bg-[#1a1a2e]'}`}>
        <div className="flex items-center gap-3 p-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${gcalConnected ? 'bg-green-900/40' : 'bg-white/5'}`}>
            {gcalConnected ? '✅' : '📆'}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">
              {gcalConnected ? 'Googleカレンダー連携中' : 'Googleカレンダー連携'}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {gcalConnected
                ? '予定がタスクと同期されています'
                : '予定をタスクに取り込んで自動で締切設定！'}
            </p>
          </div>
          {!gcalConnected && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleGCalConnect}
              disabled={connecting}
              className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-60"
            >
              {connecting ? '接続中…' : '連携する'}
            </motion.button>
          )}
          {gcalConnected && (
            <button
              onClick={() => setGcalConnected(false)}
              className="shrink-0 text-xs text-gray-500 bg-white/5 px-3 py-2 rounded-xl"
            >
              解除
            </button>
          )}
        </div>
        {gcalConnected && (
          <div className="px-4 pb-4 space-y-1.5">
            {/* Mock calendar events */}
            {[
              { title: 'チームMTG', time: '10:00', color: 'text-blue-400', dot: 'bg-blue-500' },
              { title: 'プロジェクト締切', time: '17:00', color: 'text-red-400', dot: 'bg-red-500' },
              { title: '勉強会', time: '19:00', color: 'text-purple-400', dot: 'bg-purple-500' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ev.dot}`} />
                <span className="text-gray-500 w-10 shrink-0">{ev.time}</span>
                <span className={ev.color}>{ev.title}</span>
                <span className="text-gray-600 ml-auto">→ タスク化</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week view */}
      <div className="space-y-2.5">
        {weekDays.map((day, i) => {
          const isToday = i === 0
          const dayTasks = tasks.filter((t) => {
            if (!t.deadline) return false
            return new Date(t.deadline).toDateString() === day.toDateString()
          })

          return (
            <div
              key={i}
              className={`rounded-2xl border overflow-hidden ${
                isToday
                  ? 'border-purple-500/40 bg-purple-900/10'
                  : 'border-white/5 bg-[#1a1a2e]'
              }`}
            >
              <div
                className={`flex items-center gap-3 px-4 py-3 ${
                  isToday ? 'border-b border-purple-500/20' : dayTasks.length > 0 ? 'border-b border-white/5' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    isToday
                      ? 'bg-purple-600 text-white'
                      : day.getDay() === 0
                      ? 'bg-red-900/30 text-red-400'
                      : day.getDay() === 6
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${
                    isToday ? 'text-white'
                    : day.getDay() === 0 ? 'text-red-400'
                    : day.getDay() === 6 ? 'text-blue-400'
                    : 'text-gray-300'
                  }`}>
                    {dayNames[day.getDay()]}曜日
                  </span>
                  {isToday && (
                    <span className="text-xs text-purple-400 ml-2 bg-purple-500/20 px-2 py-0.5 rounded-full">
                      今日
                    </span>
                  )}
                  {day.getDay() === 0 && (
                    <span className="text-xs text-red-400 ml-2 bg-red-500/10 px-2 py-0.5 rounded-full">
                      ⚔️ 週ボス
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 shrink-0">
                  {dayTasks.length > 0 ? `${dayTasks.length}件` : ''}
                </span>
              </div>

              {dayTasks.length > 0 && (
                <div className="px-4 py-2 space-y-2">
                  {dayTasks.map((task) => {
                    const days = getDaysUntil(task.deadline!)
                    return (
                      <div key={task.id} className="flex items-center gap-2 py-0.5">
                        <span className="text-base shrink-0">{getCategoryEmoji(task.category)}</span>
                        <span
                          className={`text-sm flex-1 leading-snug ${
                            task.status === 5 ? 'line-through text-gray-600' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className={`text-xs font-medium shrink-0 ${
                            task.status === 5
                              ? 'text-green-500'
                              : days < 0
                              ? 'text-red-400'
                              : days <= 1
                              ? 'text-orange-400'
                              : 'text-gray-500'
                          }`}
                        >
                          {task.status === 5
                            ? '完了✓'
                            : days === 0
                            ? '今日'
                            : days < 0
                            ? `${Math.abs(days)}日超過`
                            : `あと${days}日`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {dayTasks.length === 0 && (
                <div className="px-4 py-2.5 text-xs text-gray-600">余裕あり ✓</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming tasks sorted by deadline */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">期限が近いタスク</p>
          <span className="text-xs text-gray-600">締切順</span>
        </div>
        <div className="p-4 space-y-2.5">
          {tasks
            .filter((t) => t.deadline && t.status < 5)
            .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
            .slice(0, 6)
            .map((task) => {
              const days = getDaysUntil(task.deadline!)
              return (
                <div key={task.id} className="flex items-center gap-2.5">
                  <span className="text-base shrink-0">{getCategoryEmoji(task.category)}</span>
                  <span className="text-sm text-white flex-1 leading-snug">{task.title}</span>
                  <span
                    className={`text-xs font-semibold shrink-0 ${
                      days < 0
                        ? 'text-red-400'
                        : days <= 1
                        ? 'text-orange-400'
                        : days <= 3
                        ? 'text-yellow-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {days < 0
                      ? `${Math.abs(days)}日超過`
                      : days === 0
                      ? '今日！'
                      : `あと${days}日`}
                  </span>
                </div>
              )
            })}
          {tasks.filter((t) => t.deadline && t.status < 5).length === 0 && (
            <p className="text-gray-500 text-sm text-center py-2">期限のあるタスクがありません</p>
          )}
        </div>
      </div>

      {/* Push notifications section */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">🔔 リマインダー通知</p>
        </div>
        <div className="space-y-2">
          {[
            { label: '締切24時間前', enabled: true },
            { label: '毎朝9時（今日のタスク確認）', enabled: true },
            { label: 'キャラがお腹を空かせている', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <p className="text-sm text-gray-400">{item.label}</p>
              <div className={`w-10 h-5 rounded-full flex items-center transition-all ${item.enabled ? 'bg-purple-600 justify-end' : 'bg-gray-700 justify-start'}`}>
                <div className="w-4 h-4 bg-white rounded-full m-0.5" />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3">
          💡 ブラウザの通知許可が必要です
        </p>
      </div>
    </div>
  )
}
