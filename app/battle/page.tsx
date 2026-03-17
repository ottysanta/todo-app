'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useGameStore } from '@/lib/store'
import { buildDailyBattleSetup, simulateBattle } from '@/lib/battleEngine'
import CharacterDisplay from '@/components/CharacterDisplay'
import { getCharacterMood, getBondStage } from '@/lib/gameEngine'
import { playSound } from '@/lib/sound'
import type { BattleEnemy, BattleResult, BattleStats } from '@/lib/types'
import { ITEMS } from '@/lib/itemData'

type Phase = 'ready' | 'fighting' | 'result'

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const colorClass = pct > 50 ? color : pct > 25 ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <div className="h-3 bg-gray-700/60 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.4 }}
      />
    </div>
  )
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-2 text-center">
      <p className="text-white font-bold text-sm">{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  )
}

export default function BattlePage() {
  const { character, tasks, userName, applyBattleResult, lastBattleResult, lastBattleDate, soundEnabled } = useGameStore()
  const [phase, setPhase] = useState<Phase>('ready')
  const [currentRound, setCurrentRound] = useState(0)
  const [playerHp, setPlayerHp] = useState(0)
  const [enemyHp, setEnemyHp] = useState(0)
  const [playerShake, setPlayerShake] = useState(false)
  const [enemyShake, setEnemyShake] = useState(false)
  const [dmgPlayer, setDmgPlayer] = useState<{ val: number; crit: boolean } | null>(null)
  const [dmgEnemy, setDmgEnemy] = useState<{ val: number; crit: boolean; skill?: string } | null>(null)
  const [result, setResult] = useState<BattleResult | null>(null)
  const [setup, setSetup] = useState<{ playerStats: BattleStats; enemy: BattleEnemy; seed: number; isWeeklyBoss: boolean } | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [rewardClaimed, setRewardClaimed] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  const mood = getCharacterMood(character.hp)
  const bondStage = getBondStage(character.bondLevel)
  const todayStr = new Date().toDateString()
  const alreadyBattledToday = lastBattleDate === todayStr

  useEffect(() => {
    const s = buildDailyBattleSetup(character, tasks)
    setSetup(s)
    setPlayerHp(s.playerStats.hp)
    setEnemyHp(s.enemy.hp)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [battleLog])

  const startBattle = () => {
    if (!setup) return
    setPhase('fighting')
    setBattleLog([`⚔️ バトル開始！ ${setup.enemy.name} が現れた！`])

    const { rounds, won } = simulateBattle(setup.playerStats, setup.enemy, tasks, setup.seed + Date.now() % 1000)
    const battleResult: BattleResult = {
      id: todayStr,
      date: new Date().toISOString(),
      won,
      enemy: setup.enemy,
      rounds,
      xpGained: won ? setup.enemy.xpReward : Math.floor(setup.enemy.xpReward * 0.2),
      foodGained: won ? setup.enemy.foodReward : 0,
      coinsGained: won ? setup.enemy.coinReward : 0,
      playerStats: setup.playerStats,
      totalRounds: rounds.length,
      isWeeklyBoss: setup.isWeeklyBoss,
    }
    setResult(battleResult)

    // Animate rounds
    rounds.forEach((round, i) => {
      setTimeout(() => {
        setCurrentRound(round.round)
        setEnemyHp(round.enemyHp)
        setPlayerHp(round.playerHp)

        // Player attacks enemy
        setDmgEnemy({ val: round.playerDmg, crit: round.playerCrit, skill: round.playerSkill })
        setEnemyShake(true)
        if (round.playerCrit) playSound('battle_crit', soundEnabled)
        else playSound('battle_hit', soundEnabled)
        setTimeout(() => {
          setEnemyShake(false)
          setDmgEnemy(null)
          // Enemy attacks player
          setDmgPlayer({ val: round.enemyDmg, crit: round.enemyCrit })
          setPlayerShake(true)
          if (round.enemyCrit) playSound('battle_crit', soundEnabled)
          else playSound('battle_hit', soundEnabled)
          setTimeout(() => {
            setPlayerShake(false)
            setDmgPlayer(null)
          }, 300)
        }, 350)

        // Build log
        const logLine = round.playerCrit
          ? `🌟 クリティカル！ ${round.playerSkill ?? 'アタック'} → ${round.playerDmg}ダメージ！ 敵HP: ${round.enemyHp}`
          : round.enemyCrit
          ? `⚠️ 敵のクリティカル！ → ${round.enemyDmg}ダメージを受けた… HP: ${round.playerHp}`
          : `⚔️ ${round.playerDmg}ダメージ / 🛡️ ${round.enemyDmg}受けた — Round ${round.round}`
        setBattleLog(prev => [...prev, logLine])
      }, i * 950)
    })

    // Show result
    setTimeout(() => {
      setPhase('result')
      if (won) playSound('battle_win', soundEnabled)
      else playSound('battle_lose', soundEnabled)
    }, rounds.length * 950 + 600)
  }

  const claimReward = () => {
    if (!result || rewardClaimed) return
    applyBattleResult(result)
    setRewardClaimed(true)
  }

  const completedToday = tasks.filter(t =>
    t.completedAt && new Date(t.completedAt).toDateString() === todayStr
  ).length

  if (!setup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] px-4 py-6 pb-24 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-white font-bold text-xl">⚔️ バトル</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">今日完了: <span className="text-purple-400 font-bold">{completedToday}</span></span>
          <Link href="/bestiary" className="text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            📖 図鑑
          </Link>
        </div>
      </div>

      {/* Already battled today notice */}
      {alreadyBattledToday && phase === 'ready' && lastBattleResult && (
        <div className={`rounded-2xl p-3 border text-sm flex items-center gap-2 ${
          lastBattleResult.won
            ? 'bg-green-900/20 border-green-500/30 text-green-400'
            : 'bg-red-900/20 border-red-500/30 text-red-400'
        }`}>
          <span>{lastBattleResult.won ? '✅' : '💀'}</span>
          <span>今日はもう戦った — {lastBattleResult.won ? '勝利' : '敗北'} vs {lastBattleResult.enemy.name}</span>
        </div>
      )}

      {/* ===== READY PHASE ===== */}
      {phase === 'ready' && (
        <div className="space-y-4">
          {/* Weekly boss banner */}
          {setup.isWeeklyBoss && (
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="bg-gradient-to-r from-red-900/40 to-orange-900/40 rounded-2xl p-3 border border-red-500/50 text-center"
            >
              <p className="text-red-300 font-bold text-sm">🔥 週ボス出現中！ 🔥</p>
              <p className="text-gray-400 text-xs mt-0.5">日曜限定・強敵！倒せばレアドロップ確定！</p>
            </motion.div>
          )}

          {/* VS card */}
          <div className="bg-[#1a1a2e] rounded-3xl p-5 border border-white/5">
            <p className="text-xs text-gray-500 text-center mb-4 font-medium">今日の対戦相手</p>
            <div className="flex items-center justify-between gap-4">
              {/* Player */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <CharacterDisplay
                  mood={mood}
                  bondStage={bondStage}
                  size="md"
                  species={character.characterSpecies ?? 'lumie'}
                />
                <p className="text-white text-sm font-bold">{character.name}</p>
                <p className="text-purple-400 text-xs">Lv {character.level}</p>
              </div>

              {/* VS */}
              <div className="flex flex-col items-center gap-1">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl font-black text-yellow-400"
                >
                  VS
                </motion.div>
              </div>

              {/* Enemy */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl"
                >
                  {setup.enemy.emoji}
                </motion.div>
                <p className="text-white text-sm font-bold text-center">{setup.enemy.name}</p>
                <p className="text-red-400 text-xs">HP {setup.enemy.maxHp}</p>
              </div>
            </div>
            <p className="text-gray-600 text-xs text-center mt-3 italic">「{setup.enemy.description}」</p>
          </div>

          {/* Player stats */}
          <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-purple-500/20">
            <p className="text-xs text-purple-400 font-medium mb-3">あなたのステータス</p>
            <div className="grid grid-cols-3 gap-2">
              <StatBadge label="HP" value={setup.playerStats.hp} />
              <StatBadge label="攻撃" value={setup.playerStats.attack} />
              <StatBadge label="防御" value={setup.playerStats.defense} />
              <StatBadge label="速さ" value={setup.playerStats.speed} />
              <StatBadge label="クリット" value={`${Math.round(setup.playerStats.critRate * 100)}%`} />
              <StatBadge label="今日完了" value={`${completedToday}タスク`} />
            </div>
            <p className="text-gray-600 text-xs mt-3 text-center">
              💡 タスクをこなすほど攻撃・速度が上がる！
            </p>
          </div>

          {/* Start button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={startBattle}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-red-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-purple-900/40"
          >
            ⚔️ バトル開始！
          </motion.button>

          {/* Past result */}
          {lastBattleResult && !alreadyBattledToday && (
            <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-gray-500 mb-2">前回の結果</p>
              <div className={`text-sm font-semibold ${lastBattleResult.won ? 'text-green-400' : 'text-red-400'}`}>
                {lastBattleResult.won ? '🏆 勝利' : '💀 敗北'} — {lastBattleResult.enemy.name}
                <span className="text-gray-500 font-normal ml-2">+{lastBattleResult.xpGained}XP</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FIGHTING PHASE ===== */}
      {phase === 'fighting' && (
        <div className="space-y-4">
          {/* Battle arena */}
          <div className="bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] rounded-3xl p-5 border border-purple-500/20 relative overflow-hidden min-h-[260px]">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 to-transparent pointer-events-none" />

            {/* Round indicator */}
            <div className="text-center mb-4">
              <span className="text-xs text-gray-500 bg-white/5 rounded-full px-3 py-1">
                Round {currentRound}
              </span>
            </div>

            <div className="flex items-end justify-between gap-4 relative">
              {/* Player side */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="relative">
                  <motion.div
                    animate={playerShake ? { x: [-5, 5, -5, 5, 0] } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CharacterDisplay
                      mood={playerHp < setup.playerStats.hp * 0.3 ? 'weak' : mood}
                      bondStage={bondStage}
                      size="md"
                      species={character.characterSpecies ?? 'lumie'}
                    />
                  </motion.div>
                  {/* Damage to player */}
                  <AnimatePresence>
                    {dmgPlayer && (
                      <motion.div
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -35, scale: 1.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 font-black text-sm pointer-events-none ${
                          dmgPlayer.crit ? 'text-yellow-300' : 'text-red-400'
                        }`}
                      >
                        -{dmgPlayer.val}{dmgPlayer.crit ? '!!!' : ''}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-white text-xs font-bold">{character.name}</p>
                <HpBar current={playerHp} max={setup.playerStats.maxHp} color="bg-green-400" />
                <p className="text-xs text-gray-400">{playerHp} / {setup.playerStats.maxHp}</p>
              </div>

              {/* Center flash */}
              <div className="flex flex-col items-center justify-center self-center">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.95, repeat: Infinity }}
                  className="text-2xl"
                >
                  ⚡
                </motion.div>
              </div>

              {/* Enemy side */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="relative">
                  <motion.div
                    animate={enemyShake ? { x: [6, -6, 6, -6, 0] } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-5xl text-center"
                    style={{ filter: enemyHp < setup.enemy.maxHp * 0.3 ? 'grayscale(0.6)' : 'none' }}
                  >
                    {setup.enemy.emoji}
                  </motion.div>
                  {/* Damage to enemy */}
                  <AnimatePresence>
                    {dmgEnemy && (
                      <motion.div
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -40, scale: 1.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 font-black text-sm pointer-events-none whitespace-nowrap ${
                          dmgEnemy.crit ? 'text-yellow-300' : 'text-cyan-300'
                        }`}
                      >
                        {dmgEnemy.skill && <span className="text-xs mr-1">{dmgEnemy.skill}！</span>}
                        -{dmgEnemy.val}{dmgEnemy.crit ? '💥' : ''}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-white text-xs font-bold">{setup.enemy.name}</p>
                <HpBar current={enemyHp} max={setup.enemy.maxHp} color="bg-red-400" />
                <p className="text-xs text-gray-400">{enemyHp} / {setup.enemy.maxHp}</p>
              </div>
            </div>
          </div>

          {/* Battle log */}
          <div
            ref={logRef}
            className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5 h-32 overflow-y-auto space-y-1"
          >
            {battleLog.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-gray-400 leading-relaxed"
              >
                {line}
              </motion.p>
            ))}
            {phase === 'fighting' && currentRound === 0 && (
              <p className="text-xs text-gray-600 animate-pulse">バトル中…</p>
            )}
          </div>
        </div>
      )}

      {/* ===== RESULT PHASE ===== */}
      {phase === 'result' && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          {/* Result banner */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`rounded-3xl p-6 border text-center ${
              result.won
                ? 'bg-gradient-to-br from-yellow-900/30 to-green-900/20 border-yellow-500/40'
                : 'bg-gradient-to-br from-gray-900/60 to-red-900/20 border-red-500/30'
            }`}
          >
            <motion.div
              animate={{ rotate: result.won ? [0, -10, 10, -10, 10, 0] : [0, 5, -5, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl mb-3"
            >
              {result.won ? '🏆' : '💀'}
            </motion.div>
            <h2 className={`text-2xl font-black mb-1 ${result.won ? 'text-yellow-300' : 'text-red-400'}`}>
              {result.won ? '勝利！' : '敗北…'}
            </h2>
            <p className="text-gray-400 text-sm">
              {result.won
                ? `${result.totalRounds}ラウンドで ${setup!.enemy.name} を倒した！`
                : `${result.totalRounds}ラウンド戦ったが力尽きた…`}
            </p>
          </motion.div>

          {/* Character reaction */}
          <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <CharacterDisplay
              mood={result.won ? 'happy' : 'tired'}
              bondStage={bondStage}
              size="sm"
              species={character.characterSpecies ?? 'lumie'}
            />
            <p className="text-white text-sm leading-relaxed">
              {result.won
                ? `やった〜！${userName}さんのおかげで勝てたよ！タスクをいっぱいこなしてくれてありがとう！💪`
                : `うう…今回は負けちゃった。でも諦めないよ！明日もタスクこなして強くなろう！🔥`}
            </p>
          </div>

          {/* Rewards */}
          <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 font-medium mb-3">獲得報酬</p>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-purple-400">+{result.xpGained}</p>
                <p className="text-xs text-gray-500 mt-0.5">XP</p>
              </div>
              <div className="bg-orange-900/20 border border-orange-500/20 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-orange-400">+{result.foodGained}</p>
                <p className="text-xs text-gray-500 mt-0.5">🍖 餌</p>
              </div>
              <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-yellow-400">+{result.coinsGained}</p>
                <p className="text-xs text-gray-500 mt-0.5">🪙 コイン</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-black text-gray-300">{result.totalRounds}</p>
                <p className="text-xs text-gray-500 mt-0.5">ラウンド</p>
              </div>
            </div>
            {result.itemDropped && (() => {
              const dropped = ITEMS[result.itemDropped]
              return dropped ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-3 flex items-center gap-3"
                >
                  <span className="text-3xl">{dropped.emoji}</span>
                  <div>
                    <p className="text-yellow-300 font-bold text-sm">✨ アイテムドロップ！</p>
                    <p className="text-gray-400 text-xs">{dropped.name} を入手した</p>
                  </div>
                </motion.div>
              ) : null
            })()}
          </div>

          {/* Battle stats */}
          <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-gray-500 font-medium mb-3">バトル詳細</p>
            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>最大ダメージ</span>
                <span className="text-white font-medium">{Math.max(...result.rounds.map(r => r.playerDmg))}</span>
              </div>
              <div className="flex justify-between">
                <span>クリティカル数</span>
                <span className="text-yellow-400 font-medium">{result.rounds.filter(r => r.playerCrit).length}回</span>
              </div>
              <div className="flex justify-between">
                <span>残りHP</span>
                <span className={result.won ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                  {result.won
                    ? `${result.rounds[result.rounds.length - 1]?.playerHp ?? 0} / ${result.playerStats.maxHp}`
                    : '0（敗北）'}
                </span>
              </div>
            </div>
          </div>

          {/* Claim button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={claimReward}
            disabled={rewardClaimed}
            className={`w-full py-4 rounded-2xl font-bold text-white text-base transition-all ${
              rewardClaimed
                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                : 'bg-gradient-to-r from-purple-600 to-cyan-500 shadow-lg shadow-purple-900/40'
            }`}
          >
            {rewardClaimed ? '✅ 受け取り済み' : '🎁 報酬を受け取る'}
          </motion.button>

          {!result.won && (
            <p className="text-xs text-gray-600 text-center">
              💡 今日タスクをこなすと明日のバトルが強くなるよ！
            </p>
          )}
        </motion.div>
      )}
    </div>
  )
}
