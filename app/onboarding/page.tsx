'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store'
import CharacterDisplay from '@/components/CharacterDisplay'
import type { TaskStatus } from '@/lib/types'
import { getProgressLabel, getProgressColor, getProgressWidth } from '@/lib/gameEngine'

const STEPS = 6

const guideCards = [
  { icon: '✅', title: 'タスクをこなす', desc: '「進める」ボタンで6段階の進捗を更新。完了すると餌🍖と経験値がもらえるよ。間違えたら「◀」で戻せるよ！' },
  { icon: '🥚', title: 'キャラクターを育てる', desc: 'タスクを進めると餌をあげられる。餌をあげると元気になって成長していくよ。' },
  { icon: '👥', title: 'チームと一緒に', desc: '招待コードを送ることでチームメンバーと連携！お互い刺激し合えるよ。' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { completeOnboarding } = useGameStore()
  const [step, setStep] = useState(0)
  const [userName, setUserName] = useState('')
  const [charName, setCharName] = useState('')
  const [tutorialStatus, setTutorialStatus] = useState<TaskStatus>(0)
  const [showTutorialComplete, setShowTutorialComplete] = useState(false)

  const next = () => {
    if (step < STEPS - 1) setStep(step + 1)
  }

  const handleTutorialProgress = () => {
    if (tutorialStatus >= 5) return
    const nextStatus = (tutorialStatus + 1) as TaskStatus
    setTutorialStatus(nextStatus)
    if (nextStatus === 5) {
      setTimeout(() => setShowTutorialComplete(true), 300)
    }
  }

  const handleFinish = () => {
    const finalUserName = userName.trim() || 'あなた'
    const finalCharName = charName.trim() || 'Lumie'
    completeOnboarding(finalUserName, finalCharName, 'lumie')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col items-center justify-between px-6 py-10 max-w-[430px] mx-auto">

      {/* ステップインジケーター */}
      <div className="flex gap-1.5 w-full">
        {Array.from({ length: STEPS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-purple-500' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* Step 0: ウェルカム */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center gap-6 flex-1 justify-center py-8"
          >
            <CharacterDisplay mood="normal" bondStage="scared" size="lg" />
            <div className="space-y-3">
              <p className="text-gray-400 text-sm">…（じっとこちらを見ている）</p>
              <h1 className="text-white text-2xl font-bold leading-tight">
                Tasklingへ<br />ようこそ
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                タスクをこなすことで<br />
                キャラクターを育てるアプリです。<br />
                一緒に頑張ろう！
              </p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 text-left space-y-2 w-full border border-white/5">
              <p className="text-xs text-gray-500 font-medium">このアプリでできること</p>
              <p className="text-sm text-gray-300">📅 Googleカレンダーと連携してタスクを管理</p>
              <p className="text-sm text-gray-300">🥚 タスクをこなしてキャラクターを育成</p>
              <p className="text-sm text-gray-300">👥 招待コードでチームメンバーと連携</p>
            </div>
          </motion.div>
        )}

        {/* Step 1: ユーザー名 */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center gap-6 flex-1 justify-center py-8 w-full"
          >
            <CharacterDisplay mood="normal" bondStage="wary" size="md" />
            <p className="text-gray-400 text-sm italic">…あなたのこと、まだよく知らないんですが</p>
            <div className="space-y-2 w-full">
              <h2 className="text-white text-xl font-bold">あなたの名前は？</h2>
              <p className="text-gray-500 text-sm">呼んでほしい名前を教えてください</p>
            </div>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="例：雄亮"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-lg placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-gray-600">空白のままにすると「あなた」になります</p>
          </motion.div>
        )}

        {/* Step 2: キャラクター名 */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center gap-6 flex-1 justify-center py-8 w-full"
          >
            <CharacterDisplay mood="happy" bondStage="curious" size="lg" species="lumie" />
            <div className="space-y-2">
              <p className="text-gray-400 text-sm italic">
                {userName.trim() || 'あなた'}さん…！<br />ぼくにも名前をつけてほしいな
              </p>
              <h2 className="text-white text-xl font-bold">キャラクターの名前は？</h2>
            </div>
            <input
              type="text"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              placeholder="例：Lumie"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-lg placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
            />
            <p className="text-xs text-gray-600">空白のままにすると「Lumie」になります</p>
          </motion.div>
        )}

        {/* Step 3: 使い方ガイド */}
        {step === 3 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center gap-6 flex-1 justify-center py-8 w-full"
          >
            <h2 className="text-white text-xl font-bold text-center">使い方ガイド</h2>
            <div className="w-full space-y-3">
              {guideCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5 flex items-start gap-4"
                >
                  <span className="text-3xl">{card.icon}</span>
                  <div>
                    <p className="text-white font-semibold text-sm">{card.title}</p>
                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-4 w-full">
              <p className="text-purple-300 text-sm leading-relaxed">
                💡 キャラクターはタップすると反応するよ。<br />
                放置するとさみしがるから、毎日少しでも開いてあげてね！
              </p>
            </div>
          </motion.div>
        )}

        {/* Step 4: インタラクティブチュートリアル */}
        {step === 4 && (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center gap-5 flex-1 justify-center py-8 w-full"
          >
            <h2 className="text-white text-xl font-bold text-center">実際にやってみよう！</h2>
            <p className="text-gray-400 text-sm text-center">タスクを最後まで進めてみよう</p>

            <motion.div
              animate={showTutorialComplete ? { scale: [1, 1.25, 1], transition: { duration: 0.6 } } : {}}
            >
              <CharacterDisplay
                mood={tutorialStatus >= 5 ? 'happy' : tutorialStatus >= 3 ? 'normal' : 'tired'}
                bondStage="curious"
                size="lg"
                species="lumie"
              />
            </motion.div>

            {/* チュートリアルタスクカード */}
            <div className="w-full bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">👋</span>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">チュートリアルタスク: 挨拶をする</p>

                  <div className="mt-2.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">{getProgressLabel(tutorialStatus)}</span>
                      <span className="text-xs text-gray-600">{tutorialStatus}/5</span>
                    </div>
                    <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getProgressColor(tutorialStatus)}`}
                        animate={{ width: getProgressWidth(tutorialStatus) }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  {tutorialStatus < 5 ? (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleTutorialProgress}
                      className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors"
                    >
                      進める
                    </motion.button>
                  ) : (
                    <span className="text-green-400 text-xl">✓</span>
                  )}
                </div>
              </div>
            </div>

            {/* 完了メッセージ */}
            <AnimatePresence>
              {showTutorialComplete && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="w-full bg-gradient-to-r from-purple-900/40 to-cyan-900/40 rounded-2xl p-4 border border-purple-500/30 text-center"
                >
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-white font-bold">タスク完了！</p>
                  <p className="text-purple-300 text-sm mt-1">
                    {charName.trim() || 'Lumie'}が喜んでるよ！<br />
                    タスクを重ねると{charName.trim() || 'Lumie'}が成長するよ！
                  </p>
                  <p className="text-yellow-400 text-xs mt-2">+50 XP 🍖+1 獲得！</p>
                </motion.div>
              )}
            </AnimatePresence>

            {tutorialStatus < 5 && (
              <p className="text-gray-600 text-xs">「進める」を5回タップしてみよう</p>
            )}
          </motion.div>
        )}

        {/* Step 5: 完了 */}
        {step === 5 && (
          <motion.div
            key="step6"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="flex flex-col items-center text-center gap-6 flex-1 justify-center py-8"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            >
              <CharacterDisplay mood="happy" bondStage="curious" size="lg" species="lumie" />
            </motion.div>
            <div className="space-y-3">
              <p className="text-gray-400 text-sm italic">
                …よろしく、{userName.trim() || 'あなた'}さん。<br />
                えっと…ぼくの名前は{charName.trim() || 'Lumie'}です
              </p>
              <p className="text-purple-400 text-sm font-medium">🥚 タスクをこなして進化しよう！</p>
              <h2 className="text-white text-2xl font-bold">準備完了！</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                タスクを進めるほど仲良くなれるよ。<br />
                少しずつ一緒に頑張ろう。
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ボタン */}
      <div className="w-full space-y-3">
        {step < STEPS - 1 ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={next}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl py-4 font-bold text-base"
          >
            {step === 0 ? 'はじめる' :
             step === 3 ? 'わかった！' :
             step === 4 ? 'わかった！' :
             step === 5 ? (tutorialStatus >= 5 ? 'つぎへ' : 'スキップ') :
             'つぎへ'}
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl py-4 font-bold text-base"
          >
            {charName.trim() || 'Lumie'}と一緒に始めよう！
          </motion.button>
        )}
      </div>
    </div>
  )
}
