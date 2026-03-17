'use client'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGameStore } from '@/lib/store'
import { getCharacterMood, getCharacterMessage, getBondStage } from '@/lib/gameEngine'
import CharacterInteractive from '@/components/CharacterInteractive'
import CharacterScene from '@/components/CharacterScene'
import CharacterMessage from '@/components/CharacterMessage'
import StatusBars from '@/components/StatusBars'
import TaskCard from '@/components/TaskCard'
import LevelUpModal from '@/components/LevelUpModal'
import XPBar from '@/components/XPBar'
import { playSound } from '@/lib/sound'
import DailyMissions from '@/components/DailyMissions'
import EvolutionModal from '@/components/EvolutionModal'

export default function HomePage() {
  const router = useRouter()
  const {
    isOnboarded,
    _hasHydrated,
    userName,
    character,
    tasks,
    updateTaskStatus,
    dailyLogin,
    tapCharacter,
    showLevelUp,
    levelUpData,
    dismissLevelUp,
    soundEnabled,
    toggleSound,
    equippedItems,
  } = useGameStore()

  useEffect(() => {
    if (!_hasHydrated) return
    if (!isOnboarded) {
      router.replace('/onboarding')
      return
    }
    dailyLogin()
  }, [_hasHydrated, isOnboarded, dailyLogin, router])

  useEffect(() => {
    if (showLevelUp) playSound('levelup', soundEnabled)
  }, [showLevelUp, soundEnabled])

  const mood = getCharacterMood(character.hp)
  const bondStage = getBondStage(character.bondLevel)
  const hour = new Date().getHours()
  const message = useMemo(
    () => getCharacterMessage(mood, hour, userName, bondStage),
    [mood, hour, userName, bondStage]
  )

  const todayTasks = tasks
    .filter((t) => {
      if (!t.deadline) return t.status < 5
      const d = new Date(t.deadline)
      const today = new Date()
      return d.toDateString() === today.toDateString() || (d <= today && t.status < 5)
    })
    .sort((a, b) => {
      if (a.status === 5 && b.status !== 5) return 1
      if (a.status !== 5 && b.status === 5) return -1
      return 0
    })
    .slice(0, 3)

  const completedToday = tasks.filter((t) => {
    if (!t.completedAt) return false
    return new Date(t.completedAt).toDateString() === new Date().toDateString()
  }).length

  // ハイドレーション前はローディング
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isOnboarded) return null

  return (
    <div className="px-4 py-6 space-y-5">
      <LevelUpModal show={showLevelUp} level={levelUpData?.level ?? 1} onClose={dismissLevelUp} />
      <EvolutionModal />

      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-white font-bold text-xl tracking-tight">Taskling</h1>
          <p className="text-gray-500 text-sm">
            {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="text-gray-500 hover:text-gray-300 text-lg transition-colors"
            aria-label="音切替"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <Link href="/settings" className="bg-[#1a1a2e] rounded-xl px-2.5 py-2 text-gray-400 border border-white/10 text-base hover:text-gray-200 transition-colors">
            ⚙️
          </Link>
          <div className="bg-[#1a1a2e] rounded-xl px-3 py-2 text-sm text-purple-400 border border-purple-500/20 font-semibold">
            Lv {character.level}
          </div>
        </div>
      </div>

      {/* キャラクターエリア */}
      <div className="flex flex-col items-center gap-3 py-2">
        <CharacterMessage message={message} />
        <CharacterScene
          mood={mood}
          bondStage={bondStage}
          species={character.characterSpecies ?? 'lumie'}
          onTap={tapCharacter}
          soundEnabled={soundEnabled}
          equippedItems={equippedItems}
        />
        {character.bondLevel < 20 && (
          <p className="text-xs text-gray-600 animate-pulse">タップしてみよう</p>
        )}
      </div>

      {/* XPバー */}
      <div className="bg-[#1a1a2e] rounded-2xl px-4 pt-3 pb-4 border border-white/5">
        <XPBar xp={character.xp} xpToNext={character.xpToNext} level={character.level} />
      </div>

      {/* 状態バー */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-gray-500 mb-3 font-medium">{character.name}の状態</p>
        <StatusBars hp={character.hp} hunger={character.hunger} mood={character.mood} />
      </div>

      {/* サマリー */}
      <div className="flex gap-3">
        <div className="flex-1 bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-bold text-white">{completedToday}</p>
          <p className="text-xs text-gray-500 mt-0.5">今日の完了</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-bold text-orange-400">{character.food}</p>
          <p className="text-xs text-gray-500 mt-0.5">保有餌🍖</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-2xl font-bold text-orange-400">{character.streak > 0 ? `${character.streak}🔥` : '0'}</p>
          <p className="text-xs text-gray-500 mt-0.5">ストリーク</p>
        </div>
      </div>

      {/* デイリーミッション */}
      <DailyMissions />

      {/* バトルショートカット */}
      <Link
        href="/battle"
        className="flex items-center gap-3 bg-gradient-to-r from-purple-900/40 to-red-900/30 rounded-2xl p-4 border border-purple-500/30 active:opacity-75 transition-opacity"
      >
        <span className="text-2xl">⚔️</span>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">今日のバトル</p>
          <p className="text-gray-500 text-xs mt-0.5">タスクで鍛えた力で戦おう！</p>
        </div>
        <span className="text-purple-400 text-sm font-medium">→</span>
      </Link>

      {/* 今日のタスク */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-white font-semibold">今日のタスク</h2>
          <div className="flex items-center gap-3">
            <Link href="/tasks" className="text-purple-400 text-sm">全部見る →</Link>
            <Link
              href="/tasks"
              className="w-7 h-7 bg-purple-600 rounded-full text-white text-xl flex items-center justify-center shadow-md shadow-purple-900/50"
              aria-label="タスクを追加"
            >
              +
            </Link>
          </div>
        </div>
        <div className="space-y-2">
          {todayTasks.length === 0 ? (
            <div className="bg-[#1a1a2e] rounded-2xl p-6 border border-white/5 text-center">
              <p className="text-gray-500 text-sm">今日のタスクはないよ！ゆっくりしてね 🌙</p>
            </div>
          ) : (
            todayTasks.map((task) => (
              <TaskCard key={task.id} task={task} onStatusChange={updateTaskStatus} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
