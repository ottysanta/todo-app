'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import Link from 'next/link'

export default function SettingsPage() {
  const {
    userName, character, changeUserName, changeCharacterName,
    soundEnabled, toggleSound, resetGame,
    isAdminMode, unlockAdmin,
    adminSetLevel, adminSetStats, adminGiveAllItems, adminResetEvolution,
  } = useGameStore()

  const [editingUser, setEditingUser] = useState(false)
  const [editingChar, setEditingChar] = useState(false)
  const [userNameInput, setUserNameInput] = useState(userName)
  const [charNameInput, setCharNameInput] = useState(character.name)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Admin
  const [adminCode, setAdminCode] = useState('')
  const [adminCodeError, setAdminCodeError] = useState(false)
  const [adminLevel, setAdminLevel] = useState(character.level)
  const [adminHp, setAdminHp] = useState(character.hp)
  const [adminCoins, setAdminCoins] = useState(character.coins ?? 0)
  const [adminFood, setAdminFood] = useState(character.food)
  const [adminBond, setAdminBond] = useState(Math.round(character.bondLevel))

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

  const handleUnlockAdmin = () => {
    const ok = unlockAdmin(adminCode.trim())
    if (!ok) {
      setAdminCodeError(true)
      setTimeout(() => setAdminCodeError(false), 1500)
    }
    setAdminCode('')
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

      {/* Admin unlock */}
      {!isAdminMode && (
        <div className="bg-[#1a1a2e] rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-semibold text-white">Codeを入力</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-gray-500 text-xs mb-3">特別コードを入力すると開発者モードが解放されます</p>
            <div className="flex gap-2">
              <input
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlockAdmin()}
                placeholder="コードを入力..."
                className={`flex-1 bg-white/5 border rounded-xl px-3 py-2.5 text-white text-sm outline-none transition-colors ${
                  adminCodeError ? 'border-red-500/60' : 'border-white/10 focus:border-purple-500'
                }`}
              />
              <button
                onClick={handleUnlockAdmin}
                className="px-4 py-2.5 bg-white/10 text-gray-300 rounded-xl text-sm font-medium active:bg-white/20 transition-colors"
              >
                解放
              </button>
            </div>
            {adminCodeError && (
              <p className="text-red-400 text-xs mt-1.5">コードが正しくありません</p>
            )}
          </div>
        </div>
      )}

      {/* Admin panel */}
      {isAdminMode && (
        <div className="bg-[#1a1a2e] rounded-2xl border border-green-500/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-green-500/20">
            <p className="text-sm font-semibold text-green-400">🛠 開発者モード</p>
          </div>
          <div className="px-4 py-4 space-y-4">

            {/* Level */}
            <div>
              <p className="text-xs text-gray-500 mb-2">レベル設定</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={adminLevel}
                  onChange={e => setAdminLevel(Number(e.target.value))}
                  className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-green-500"
                />
                <button
                  onClick={() => adminSetLevel(adminLevel)}
                  className="flex-1 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium"
                >
                  Lvを設定
                </button>
              </div>
            </div>

            {/* Stats */}
            <div>
              <p className="text-xs text-gray-500 mb-2">ステータス設定</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'hp',        label: 'HP',       value: adminHp,    set: setAdminHp,    max: 100 },
                  { key: 'coins',     label: 'コイン',    value: adminCoins, set: setAdminCoins, max: 99999 },
                  { key: 'food',      label: '食料',      value: adminFood,  set: setAdminFood,  max: 999 },
                  { key: 'bondLevel', label: '絆レベル',  value: adminBond,  set: setAdminBond,  max: 100 },
                ] as const).map(({ key, label, value, set, max }) => (
                  <div key={key}>
                    <p className="text-xs text-gray-600 mb-1">{label}</p>
                    <input
                      type="number"
                      min={0}
                      max={max}
                      value={value}
                      onChange={e => (set as (v: number) => void)(Number(e.target.value))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-green-500"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => adminSetStats({ hp: adminHp, coins: adminCoins, food: adminFood, bondLevel: adminBond })}
                className="w-full mt-2 py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl text-sm font-medium"
              >
                ステータスを適用
              </button>
            </div>

            {/* All items */}
            <button
              onClick={adminGiveAllItems}
              className="w-full py-3 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-xl text-sm font-medium"
            >
              🎒 全アイテム×99追加
            </button>

            {/* Reset evolution */}
            <button
              onClick={adminResetEvolution}
              className="w-full py-3 bg-red-600/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium"
            >
              🔄 進化をリセット
            </button>
          </div>
        </div>
      )}

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
