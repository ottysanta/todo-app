'use client'
import Link from 'next/link'
import { useGameStore } from '@/lib/store'
import { getCharacterMood, getCharacterMessage, getBondStage, getBondLabel } from '@/lib/gameEngine'
import { calculatePlayerStats } from '@/lib/battleEngine'
import CharacterInteractive from '@/components/CharacterInteractive'
import XPBar from '@/components/XPBar'
import StatusBars from '@/components/StatusBars'
import { motion } from 'framer-motion'
import EvolutionModal from '@/components/EvolutionModal'
import { ITEMS } from '@/lib/itemData'

const evolutionLabels: Record<string, { label: string; color: string }> = {
  scholar: { label: '知性型 📖', color: 'text-blue-400' },
  warrior: { label: '力強い型 ⚡', color: 'text-orange-400' },
  steady: { label: '堅実型 🌿', color: 'text-green-400' },
  leader: { label: 'リーダー型 👑', color: 'text-yellow-400' },
  harmony: { label: '調和型 ✨', color: 'text-purple-400' },
}

const moodLabels: Record<string, string> = {
  happy: '元気いっぱい 😄',
  normal: '普通 😊',
  tired: '少し疲れてる 😴',
  weak: 'ぐったり… 😢',
  sleeping: '冬眠中 💤',
}

const bondStageColors: Record<string, string> = {
  scared: 'bg-gray-500',
  wary: 'bg-blue-700',
  curious: 'bg-indigo-500',
  neutral: 'bg-purple-500',
  friendly: 'bg-fuchsia-500',
  loving: 'bg-pink-500',
}

const evolutionStages = [
  { minLevel: 1,  maxLevel: 2,  label: 'たまご期',  emoji: '🥚', color: 'text-gray-400' },
  { minLevel: 3,  maxLevel: 4,  label: '子供期',    emoji: '🐣', color: 'text-green-400' },
  { minLevel: 5,  maxLevel: 9,  label: '成長期',    emoji: '🌱', color: 'text-cyan-400' },
  { minLevel: 10, maxLevel: 14, label: '成熟期',    emoji: '⚡', color: 'text-purple-400' },
  { minLevel: 15, maxLevel: 999,label: '伝説',      emoji: '👑', color: 'text-yellow-400' },
]

function getEvolutionStage(level: number) {
  return evolutionStages.find((s) => level >= s.minLevel && level <= s.maxLevel) ?? evolutionStages[0]
}

export default function CharacterPage() {
  const { character, tapCharacter, userName, soundEnabled, achievements, equippedItems, tasks } = useGameStore()
  const mood = getCharacterMood(character.hp)
  const bondStage = getBondStage(character.bondLevel)
  const hour = new Date().getHours()
  const message = getCharacterMessage(mood, hour, userName, bondStage)
  const evo = character.evolutionType ? evolutionLabels[character.evolutionType] : null
  const evoStage = getEvolutionStage(character.level)
  const nextStage = evolutionStages.find((s) => s.minLevel > character.level)

  return (
    <div className="px-4 py-6 space-y-4">
      <EvolutionModal />
      <h1 className="text-white font-bold text-xl">キャラクター</h1>

      {/* メインショーケース */}
      <div className="bg-[#1a1a2e] rounded-3xl p-6 border border-white/5 flex flex-col items-center gap-4">
        <CharacterInteractive
          mood={mood}
          bondStage={bondStage}
          size="lg"
          onTap={tapCharacter}
          soundEnabled={soundEnabled}
          species={character.characterSpecies ?? 'lumie'}
          equippedItems={equippedItems}
        />
        <div className="text-center">
          <h2 className="text-white text-2xl font-bold">{character.name}</h2>
          <p className="text-gray-400 text-sm mt-0.5">{moodLabels[mood]}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className={`text-sm font-semibold ${evoStage.color}`}>{evoStage.emoji} {evoStage.label}</span>
            {character.streak > 0 && (
              <span className="text-xs text-orange-400 font-medium">🔥 {character.streak}日</span>
            )}
          </div>
          {evo && <p className={`text-xs mt-1 font-medium ${evo.color}`}>{evo.label}</p>}
        </div>
        <div className="w-full">
          <XPBar xp={character.xp} xpToNext={character.xpToNext} level={character.level} />
        </div>
      </div>

      {/* 愛着度 */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-pink-500/20">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-white">絆レベル</p>
          <span className="text-xs text-pink-400 font-medium">{getBondLabel(bondStage)}</span>
        </div>
        <div className="h-2.5 bg-gray-700/60 rounded-full overflow-hidden mb-1.5">
          <motion.div
            className={`h-full rounded-full ${bondStageColors[bondStage]}`}
            initial={{ width: 0 }}
            animate={{ width: `${character.bondLevel}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>怯え</span>
          <span>警戒</span>
          <span>興味</span>
          <span>慣れ</span>
          <span>好意</span>
          <span>大好き</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 タスクを完了・タップ・餌やりで絆が深まるよ。放置すると薄れていくから注意！
        </p>
      </div>

      {/* 状態 */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5 space-y-3">
        <p className="text-sm font-semibold text-white">状態</p>
        <StatusBars hp={character.hp} hunger={character.hunger} mood={character.mood} />
      </div>

      {/* バトルステータス */}
      {(() => {
        const bs = calculatePlayerStats(character, tasks)
        const eqItems = Object.values(equippedItems).filter(Boolean).map(id => ITEMS[id!]).filter(Boolean)
        const atkBonus = eqItems.reduce((s, it) => s + (it.effect.attackBonus ?? 0), 0)
        const defBonus = eqItems.reduce((s, it) => s + (it.effect.defenseBonus ?? 0), 0)
        const critBonus = eqItems.reduce((s, it) => s + (it.effect.critBonus ?? 0), 0)
        const xpMult = eqItems.reduce((s, it) => s * (it.effect.xpMultiplier ?? 1), 1)
        return (
          <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">⚔️ バトルステータス</p>
              {eqItems.length > 0 && (
                <span className="text-xs text-cyan-400 bg-cyan-900/20 px-2 py-0.5 rounded-full">装備ボーナス込み</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'HP', value: bs.hp, color: 'text-green-400', bonus: 0 },
                { label: '攻撃力', value: bs.attack + atkBonus, color: 'text-red-400', bonus: atkBonus },
                { label: '防御力', value: bs.defense + defBonus, color: 'text-blue-400', bonus: defBonus },
                { label: '速さ', value: bs.speed, color: 'text-yellow-400', bonus: 0 },
                { label: 'クリット', value: `${Math.round((bs.critRate + critBonus) * 100)}%`, color: 'text-orange-400', bonus: 0 },
                { label: 'XP倍率', value: `×${xpMult.toFixed(1)}`, color: 'text-purple-400', bonus: 0 },
              ].map(({ label, value, color, bonus }) => (
                <div key={label} className="bg-white/5 rounded-xl p-2.5 text-center">
                  <p className={`text-base font-bold ${color}`}>{value}</p>
                  {bonus > 0 && <p className="text-xs text-cyan-400">+{bonus}</p>}
                  <p className="text-gray-600 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2.5 text-center">
              💡 タスク完了・装備でステータスが上がる。毎日更新。
            </p>
          </div>
        )
      })()}

      {/* 冬眠警告 */}
      {character.hp <= 10 && (
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-gradient-to-br from-blue-900/30 to-gray-900/30 rounded-2xl border border-blue-500/30 p-4"
        >
          <p className="text-blue-300 font-bold text-sm mb-1">💤 冬眠状態！</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            {character.name}のHPが限界…冬眠してしまった。<br />
            持ち物から「心の絆創膏」か「不死鳥の羽」を使って復活させよう！
          </p>
          <Link
            href="/inventory"
            className="mt-3 flex items-center justify-center gap-2 bg-blue-600/30 border border-blue-500/30 rounded-xl py-2 text-blue-300 text-sm font-medium"
          >
            🎒 持ち物を見る
          </Link>
        </motion.div>
      )}

      {/* クイックリンク */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/chat"
          className="bg-[#1a1a2e] rounded-2xl p-4 border border-orange-500/20 flex items-center gap-3 active:opacity-75 transition-opacity"
        >
          <span className="text-2xl">💬</span>
          <div>
            <p className="text-sm font-semibold text-white">チャット</p>
            <p className="text-orange-400 text-xs mt-0.5">餌 {character.food}個 🍖</p>
          </div>
        </Link>
        <Link
          href="/team"
          className="bg-[#1a1a2e] rounded-2xl p-4 border border-blue-500/20 flex items-center gap-3 active:opacity-75 transition-opacity"
        >
          <span className="text-2xl">👥</span>
          <div>
            <p className="text-sm font-semibold text-white">チーム</p>
            <p className="text-blue-400 text-xs mt-0.5">仲間を見る</p>
          </div>
        </Link>
      </div>

      {/* メッセージ */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-purple-500/20">
        <p className="text-xs text-purple-400 font-medium mb-2">{character.name}より</p>
        <p className="text-sm text-white leading-relaxed">{message}</p>
      </div>

      {/* 進化ステージ */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
        <p className="text-sm font-semibold text-white mb-3">成長ロードマップ</p>
        <div className="flex items-center justify-between">
          {evolutionStages.map((stage, i) => {
            const reached = character.level >= stage.minLevel
            const current = character.level >= stage.minLevel && (i === evolutionStages.length - 1 || character.level < evolutionStages[i + 1].minLevel)
            return (
              <div key={stage.label} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                  current ? 'bg-purple-600/40 ring-2 ring-purple-500 scale-110' :
                  reached ? 'bg-white/10' : 'bg-white/3 opacity-40'
                }`}>
                  {stage.emoji}
                </div>
                <p className={`text-xs text-center leading-tight ${reached ? stage.color : 'text-gray-600'}`}>
                  {stage.label}
                </p>
                <p className="text-xs text-gray-700">Lv{stage.minLevel}</p>
              </div>
            )
          })}
        </div>
        {nextStage && (
          <p className="text-xs text-gray-600 mt-3 text-center">
            次の進化「{nextStage.label}」まであと {nextStage.minLevel - character.level} レベル
          </p>
        )}
      </div>

      {/* 統計 */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
        <p className="text-sm font-semibold text-white mb-3">統計</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400">{character.totalTasksCompleted}</p>
            <p className="text-xs text-gray-500 mt-0.5">完了タスク</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-400">{character.level}</p>
            <p className="text-xs text-gray-500 mt-0.5">レベル</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-400">{character.streak}</p>
            <p className="text-xs text-gray-500 mt-0.5">🔥連続日数</p>
          </div>
        </div>
      </div>

      {/* アチーブメント */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-semibold text-white">実績バッジ</p>
          <span className="text-xs text-gray-500">{achievements.length} / 14 解除済み</span>
        </div>
        {achievements.length === 0 ? (
          <p className="text-gray-600 text-xs text-center py-3">まだ実績なし。タスクを進めよう！</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border border-purple-500/20 rounded-xl p-2.5 flex items-center gap-2"
              >
                <span className="text-2xl shrink-0">{a.emoji}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{a.title}</p>
                  <p className="text-gray-500 text-xs leading-tight mt-0.5">{a.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
