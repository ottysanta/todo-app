'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import Link from 'next/link'

export default function SettingsPage() {
  const { userName, character, changeUserName, changeCharacterName, soundEnabled, toggleSound, resetGame } = useGameStore()
  const [editingUser, setEditingUser] = useState(false)
  const [editingChar, setEditingChar] = useState(false)
  const [userNameInput, setUserNameInput] = useState(userName)
  const [charNameInput, setCharNameInput] = useState(character.name)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const saveUserName = () => {
    const v = userNameInput.trim()
    if (v) changeUserName(v)
    setEditingUser(false)
  }

  const saveCharName = () => {
    const v = charNameInput.trim()
    if (v) changeCharacterName(v)
    setEditingChar(false)
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-4 min-h-screen">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-gray-400 hover:text-white text-xl">←</Link>
        <h1 className="text-white font-bold text-xl">⚙️ 設定</h1>
      </div>

      {/* Profile */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-semibold text-white">プロフィール</p>
        </div>

        {/* User name */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">あなたの名前</p>
              {editingUser ? (
                <input
                  autoFocus
                  value={userNameInput}
                  onChange={e => setUserNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveUserName()}
                  maxLength={12}
                  className="bg-white/10 text-white text-sm font-semibold rounded-lg px-3 py-1.5 outline-none border border-purple-500/50 w-36"
                />
              ) : (
                <p className="text-white font-semibold">{userName}</p>
              )}
            </div>
            {editingUser ? (
              <div className="flex gap-2">
                <button onClick={() => setEditingUser(false)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg bg-white/5">キャンセル</button>
                <button onClick={saveUserName} className="text-xs text-white px-3 py-1.5 rounded-lg bg-purple-600">保存</button>
              </div>
            ) : (
              <button onClick={() => { setUserNameInput(userName); setEditingUser(true) }} className="text-xs text-purple-400 bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/20">変更</button>
            )}
          </div>
        </div>

        {/* Character name */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">キャラクター名</p>
              {editingChar ? (
                <input
                  autoFocus
                  value={charNameInput}
                  onChange={e => setCharNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && saveCharName()}
                  maxLength={12}
                  className="bg-white/10 text-white text-sm font-semibold rounded-lg px-3 py-1.5 outline-none border border-purple-500/50 w-36"
                />
              ) : (
                <p className="text-white font-semibold">{character.name}</p>
              )}
            </div>
            {editingChar ? (
              <div className="flex gap-2">
                <button onClick={() => setEditingChar(false)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg bg-white/5">キャンセル</button>
                <button onClick={saveCharName} className="text-xs text-white px-3 py-1.5 rounded-lg bg-purple-600">保存</button>
              </div>
            ) : (
              <button onClick={() => { setCharNameInput(character.name); setEditingChar(true) }} className="text-xs text-purple-400 bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-500/20">変更</button>
            )}
          </div>
        </div>
      </div>

      {/* Sound */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-semibold text-white">サウンド</p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-white text-sm">効果音</p>
            <p className="text-gray-500 text-xs mt-0.5">タップ・レベルアップ音など</p>
          </div>
          <button
            onClick={toggleSound}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ${soundEnabled ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${soundEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Game info */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-semibold text-white">ゲーム情報</p>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { label: 'レベル', value: `Lv ${character.level}` },
            { label: 'タスク完了数', value: `${character.totalTasksCompleted}個` },
            { label: '連続ログイン', value: `${character.streak}日` },
            { label: '絆レベル', value: `${Math.round(character.bondLevel)}%` },
          ].map(item => (
            <div key={item.label} className="px-4 py-3 flex items-center justify-between">
              <p className="text-gray-400 text-sm">{item.label}</p>
              <p className="text-white text-sm font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
        <div className="divide-y divide-white/5">
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-gray-400 text-sm">バージョン</p>
            <p className="text-gray-500 text-sm">1.0.0</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <p className="text-gray-400 text-sm">データ保存</p>
            <p className="text-gray-500 text-sm">ローカル (端末内)</p>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-[#1a1a2e] rounded-2xl border border-red-500/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-red-500/10">
          <p className="text-sm font-semibold text-red-400">危険ゾーン</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-gray-500 text-xs mb-3">
            ゲームデータをすべてリセットします。この操作は取り消せません。
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-xl border border-red-500/40 text-red-400 text-sm font-medium bg-red-900/10 active:opacity-70"
          >
            🗑️ データをリセットする
          </button>
        </div>
      </div>

      {/* Reset confirm modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-[#1a1a2e] rounded-3xl border border-red-500/30 p-6 w-full max-w-sm space-y-4"
            >
              <div className="text-center">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-white font-bold text-lg">本当にリセットしますか？</h3>
                <p className="text-gray-400 text-sm mt-2">
                  キャラクター、タスク、アイテムなど<br />すべてのデータが削除されます。
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-gray-300 font-medium text-sm"
                >
                  キャンセル
                </button>
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-bold text-sm"
                >
                  リセット
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
