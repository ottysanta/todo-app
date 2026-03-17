'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { getCharacterMood, getBondStage } from '@/lib/gameEngine'
import CharacterDisplay from '@/components/CharacterDisplay'
import { playSound } from '@/lib/sound'

export default function ChatPage() {
  const {
    character,
    userName,
    chatHistory,
    sendUserMessage,
    addCharacterMessage,
    feedCharacter,
    soundEnabled,
  } = useGameStore()

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [feedAnim, setFeedAnim] = useState(false)
  const [eatAnim, setEatAnim] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const mood = getCharacterMood(character.hp)
  const bondStage = getBondStage(character.bondLevel)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isTyping])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')
    playSound('tap', soundEnabled)
    const fallbackResponse = sendUserMessage(text)
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: text,
          charName: character.name,
          userName,
          mood: getCharacterMood(character.hp),
          bondStage,
          species: character.characterSpecies ?? 'lumie',
          hunger: character.hunger,
          hp: character.hp,
          food: character.food,
          history: chatHistory.slice(-8),
        }),
      })
      const data = await res.json()
      const responseText = data.text ?? fallbackResponse
      const delay = Math.min(2200, Math.max(600, responseText.length * 20))
      setTimeout(() => {
        addCharacterMessage(responseText)
        setIsTyping(false)
      }, delay)
    } catch {
      const delay = Math.min(2200, Math.max(700, fallbackResponse.length * 25))
      setTimeout(() => {
        addCharacterMessage(fallbackResponse)
        setIsTyping(false)
      }, delay)
    }
  }

  const handleFeed = async () => {
    if (character.food <= 0 || isTyping) return
    feedCharacter()
    playSound('feed', soundEnabled)
    setFeedAnim(true)
    setEatAnim(true)
    setTimeout(() => setFeedAnim(false), 1800)
    setTimeout(() => setEatAnim(false), 2000)
    const fallback = sendUserMessage('🍖 餌をあげる')
    setIsTyping(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: '🍖 ごはんをあげるよ！',
          charName: character.name,
          userName,
          mood: getCharacterMood(character.hp),
          bondStage,
          species: character.characterSpecies ?? 'lumie',
          hunger: character.hunger,
          hp: character.hp,
          food: character.food,
          history: chatHistory.slice(-4),
        }),
      })
      const data = await res.json()
      setTimeout(() => { addCharacterMessage(data.text ?? fallback); setIsTyping(false) }, 1000)
    } catch {
      setTimeout(() => { addCharacterMessage(fallback); setIsTyping(false) }, 1200)
    }
  }

  const displayAnim = eatAnim ? 'eat' : null

  return (
    <div className="flex flex-col h-screen max-h-screen bg-[#0f0f1a]">
      {/* ヘッダー */}
      <div className="px-4 py-3 bg-[#1a1a2e] border-b border-white/5 flex items-center gap-3 shrink-0">
        <div className="relative">
          <CharacterDisplay
            mood={mood}
            bondStage={bondStage}
            size="sm"
            species={character.characterSpecies ?? 'lumie'}
            tapAnim={displayAnim}
          />
          {/* 食べるアニメーション */}
          <AnimatePresence>
            {feedAnim && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -40, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl pointer-events-none z-20"
              >
                🍖
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-sm">{character.name}</p>
          <p className="text-gray-500 text-xs">
            Lv {character.level} · {bondStage === 'loving' ? '大好き❤️' : bondStage === 'friendly' ? '仲良し' : bondStage === 'curious' ? '興味津々' : bondStage === 'neutral' ? '慣れてきた' : bondStage === 'wary' ? '警戒中' : '怯えてる'}
          </p>
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <CharacterDisplay
              mood="happy"
              bondStage={bondStage}
              size="lg"
              species={character.characterSpecies ?? 'lumie'}
            />
            <div>
              <p className="text-white font-medium">{character.name}に話しかけてみよう！</p>
              <p className="text-gray-500 text-sm mt-1">いっぱい話すとどんどん仲良くなれるよ</p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* キャラアイコン (characterメッセージのみ) */}
              {msg.role === 'character' && (
                <div className="shrink-0 mb-1">
                  <CharacterDisplay
                    mood={mood}
                    bondStage={bondStage}
                    size="sm"
                    species={character.characterSpecies ?? 'lumie'}
                  />
                </div>
              )}

              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-sm'
                    : 'bg-[#1a1a2e] text-white border border-white/5 rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* タイピングインジケーター */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="shrink-0 mb-1">
                <CharacterDisplay
                  mood={mood}
                  bondStage={bondStage}
                  size="sm"
                  species={character.characterSpecies ?? 'lumie'}
                />
              </div>
              <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* 入力エリア */}
      <div className="px-4 py-3 bg-[#1a1a2e] border-t border-white/5 shrink-0 pb-safe">
        {/* クイック返信 */}
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
          {['おはよう！', '元気？', 'ありがとう', '頑張ってる', 'かわいいね'].map((quick) => (
            <button
              key={quick}
              onClick={() => { setInput(quick); inputRef.current?.focus() }}
              className="shrink-0 rounded-full px-3 py-1 text-xs border bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 transition-colors"
            >
              {quick}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {/* 餌ボタン */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleFeed}
            disabled={character.food <= 0}
            className={`flex flex-col items-center gap-0 px-2.5 py-1.5 rounded-2xl text-xs font-medium transition-all shrink-0 ${
              character.food > 0
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-gray-700/20 text-gray-600 border border-gray-700/30'
            }`}
          >
            <span className="text-xl">🍖</span>
            <span className="text-xs leading-none">{character.food}</span>
          </motion.button>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.nativeEvent.isComposing && handleSend()}
            placeholder={`${character.name}に話しかけよう…`}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-purple-500 transition-colors"
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-12 h-12 bg-purple-600 disabled:bg-gray-700 text-white rounded-2xl flex items-center justify-center text-lg transition-colors shrink-0"
          >
            ↑
          </motion.button>
        </div>
      </div>
    </div>
  )
}
