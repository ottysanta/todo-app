'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { dummyTeam } from '@/lib/dummyData'
import { getCharacterMood } from '@/lib/gameEngine'
import CharacterDisplay from '@/components/CharacterDisplay'
import { useGameStore } from '@/lib/store'

export default function TeamPage() {
  const { character, inviteCode, userName } = useGameStore()
  const myMood = getCharacterMood(character.hp)
  const [cheered, setCheered] = useState<Set<string>>(new Set())
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleCheer = (id: string) => {
    if (cheered.has(id)) return
    setCheered((prev) => new Set([...prev, id]))
  }

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(inviteCode).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoin = () => {
    if (!joinCode.trim()) return
    setJoined(true)
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-white font-bold text-xl">チーム</h1>

      {/* チーム連携 */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-gray-400 font-medium mb-3">🔗 チーム連携</p>
        {!isSignedIn ? (
          <div className="space-y-2">
            <p className="text-gray-500 text-xs">Googleでサインインしてチームと連携しよう</p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsSignedIn(true)}
              className="w-full bg-white text-gray-800 rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <span className="font-bold text-blue-500">G</span>
              Googleでサインイン
            </motion.button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-green-400 mb-1">
              <span>✓</span>
              <span>{userName}さんでサインイン済み</span>
            </div>

            {/* 自分の招待コード */}
            <div>
              <p className="text-xs text-gray-500 mb-1.5">あなたの招待コード</p>
              <div className="flex gap-2">
                <code className="flex-1 bg-[#0f0f1a] rounded-xl px-3 py-2 text-purple-400 font-mono text-sm text-center border border-purple-500/20 tracking-widest">
                  {inviteCode}
                </code>
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={handleCopyCode}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    copied ? 'bg-green-600/20 text-green-400' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  {copied ? '✓コピー済' : 'コピー'}
                </motion.button>
              </div>
              <p className="text-xs text-gray-600 mt-1">友達にこのコードを共有しよう</p>
            </div>

            {/* 招待コードで参加 */}
            {!joined ? (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">招待コードで参加</p>
                <div className="flex gap-2">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="コードを入力"
                    maxLength={8}
                    className="flex-1 bg-[#0f0f1a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500 placeholder-gray-600 font-mono tracking-widest"
                  />
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={handleJoin}
                    disabled={!joinCode.trim()}
                    className="px-4 py-2 bg-purple-600 disabled:bg-gray-700 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    参加
                  </motion.button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/20 border border-green-500/20 rounded-xl p-3 text-center"
              >
                <p className="text-green-400 text-sm font-medium">✓ チームに参加しました！</p>
                <p className="text-gray-500 text-xs mt-0.5">メンバーが表示されます</p>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* team progress */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-cyan-500/20">
        <p className="text-xs text-cyan-400 font-medium mb-1">今週のチーム達成率</p>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-4xl font-bold text-white">68</span>
          <span className="text-gray-400 pb-1 text-lg">%</span>
        </div>
        <div className="h-2.5 bg-gray-700/60 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">みんなで頑張ればもっと上がる！</p>
      </div>

      {/* my card */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-purple-500/30">
        <p className="text-xs text-purple-400 font-medium mb-3">あなた</p>
        <div className="flex items-center gap-4">
          <CharacterDisplay mood={myMood} size="sm" species={character.characterSpecies ?? 'lumie'} />
          <div>
            <p className="text-white font-semibold">{userName}さん</p>
            <p className="text-gray-500 text-sm">
              Lv {character.level} · {character.totalTasksCompleted}タスク完了
            </p>
            <p className="text-gray-600 text-xs mt-0.5">たった今アクティブ</p>
          </div>
        </div>
      </div>

      {/* members */}
      <div className="space-y-3">
        <p className="text-xs text-gray-500 font-medium">メンバー ({dummyTeam.length}人)</p>
        {dummyTeam.map((member) => {
          const mood = getCharacterMood(member.hp)
          const hasCheered = cheered.has(member.id)
          const isInactive = member.lastActive.includes('日前')

          return (
            <motion.div
              key={member.id}
              layout
              className={`bg-[#1a1a2e] rounded-2xl p-4 border transition-colors ${
                isInactive ? 'border-gray-700/50' : 'border-white/5'
              }`}
            >
              <div className="flex items-center gap-4">
                <CharacterDisplay mood={mood} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-white font-semibold text-sm">{member.name}</p>
                    <span className="text-base">{member.avatar}</span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Lv {member.level} · {member.lastActive}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="text-xs text-gray-600">元気</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          member.hp > 60 ? 'bg-green-400' : member.hp > 30 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${member.hp}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{member.hp}</span>
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => handleCheer(member.id)}
                  className={`shrink-0 flex flex-col items-center text-xs px-2.5 py-2 rounded-xl transition-all ${
                    hasCheered
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
                      : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <span className="text-base">{hasCheered ? '💖' : '👏'}</span>
                  <span className="mt-0.5">{hasCheered ? '応援済' : '応援'}</span>
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
