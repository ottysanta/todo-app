'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { ITEMS, RARITY_COLORS, RARITY_TEXT, RARITY_LABELS } from '@/lib/itemData'
import type { GameItem, ItemCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<ItemCategory, { label: string; emoji: string }> = {
  food:      { label: '餌/フード', emoji: '🍙' },
  recovery:  { label: '回復/ケア', emoji: '💊' },
  battle:    { label: 'バトル補助', emoji: '⚔️' },
  material:  { label: '進化素材', emoji: '💎' },
  equipment: { label: '装備', emoji: '👑' },
  special:   { label: '特別/記念', emoji: '🌟' },
}

const SLOT_LABELS = {
  head:      { label: '頭', emoji: '🎩' },
  accessory: { label: '装飾', emoji: '✨' },
  armor:     { label: '防具', emoji: '🛡️' },
}

export default function InventoryPage() {
  const { inventory, equippedItems, character, useItem, equipItem, unequipItem } = useGameStore()
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null)
  const [filter, setFilter] = useState<ItemCategory | 'all'>('all')
  const [useResult, setUseResult] = useState<string | null>(null)

  const filteredInventory = inventory.filter((slot) => {
    const item = ITEMS[slot.itemId]
    if (!item) return false
    if (filter === 'all') return true
    return item.category === filter
  })

  const handleUse = (itemId: string) => {
    const item = ITEMS[itemId]
    if (!item) return
    if (item.isEquippable) {
      equipItem(itemId)
      setUseResult(`${item.emoji} ${item.name}を装備した！`)
      setSelectedItem(null)
    } else {
      const ok = useItem(itemId)
      if (ok) {
        setUseResult(`${item.emoji} ${item.name}を使った！`)
        setSelectedItem(null)
      }
    }
    setTimeout(() => setUseResult(null), 2000)
  }

  const isEquipped = (itemId: string) =>
    Object.values(equippedItems).includes(itemId)

  return (
    <div className="px-4 py-6 pb-24 space-y-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">🎒 持ち物</h1>
          <p className="text-gray-500 text-sm mt-0.5">アイテムを使って{character.name}をサポートしよう</p>
        </div>
        <div className="text-xs text-gray-500 bg-white/5 rounded-xl px-3 py-2">
          {inventory.reduce((sum, i) => sum + i.quantity, 0)} 個
        </div>
      </div>

      {/* 装備スロット */}
      <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-purple-500/20">
        <p className="text-xs text-purple-400 font-medium mb-3">装備中</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(SLOT_LABELS) as Array<keyof typeof SLOT_LABELS>).map((slot) => {
            const equippedId = equippedItems[slot]
            const item = equippedId ? ITEMS[equippedId] : null
            return (
              <button
                key={slot}
                onClick={() => item && unequipItem(slot)}
                className={`rounded-xl p-3 border text-center transition-all ${
                  item
                    ? 'border-purple-500/40 bg-purple-900/20 active:opacity-70'
                    : 'border-white/10 bg-white/3 opacity-50'
                }`}
              >
                <div className="text-2xl mb-1">{item ? item.emoji : SLOT_LABELS[slot].emoji}</div>
                <p className="text-xs text-gray-400 truncate">
                  {item ? item.name : SLOT_LABELS[slot].label}
                </p>
                {item && (
                  <p className="text-xs text-red-400 mt-0.5">×外す</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilter('all')}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
          }`}
        >
          全て
        </button>
        {(Object.keys(CATEGORY_LABELS) as ItemCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              filter === cat ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400'
            }`}
          >
            {CATEGORY_LABELS[cat].emoji} {CATEGORY_LABELS[cat].label}
          </button>
        ))}
      </div>

      {/* アイテムグリッド */}
      {filteredInventory.length === 0 ? (
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-white/5 text-center">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400 text-sm">アイテムがありません</p>
          <p className="text-gray-600 text-xs mt-1">タスク完了・バトル・ログインでドロップするよ！</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {filteredInventory.map((slot) => {
            const item = ITEMS[slot.itemId]
            if (!item) return null
            const equipped = isEquipped(slot.itemId)
            return (
              <motion.button
                key={slot.itemId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedItem(item)}
                className={`relative rounded-2xl border p-3 text-center transition-all ${RARITY_COLORS[item.rarity]} ${
                  equipped ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                {equipped && (
                  <span className="absolute top-1.5 right-1.5 text-xs bg-purple-600 rounded-full w-4 h-4 flex items-center justify-center">E</span>
                )}
                <div className="text-3xl mb-1">{item.emoji}</div>
                <p className={`text-xs font-semibold ${RARITY_TEXT[item.rarity]} leading-tight`}>{item.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">×{slot.quantity}</p>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 pb-4"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-[430px] rounded-3xl border bg-[#1a1a2e] flex flex-col ${RARITY_COLORS[selectedItem.rarity]}`}
              style={{ maxHeight: '80vh' }}
            >
              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{selectedItem.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${RARITY_TEXT[selectedItem.rarity]}`}>
                        {RARITY_LABELS[selectedItem.rarity]}
                      </span>
                      <span className="text-xs text-gray-600">{CATEGORY_LABELS[selectedItem.category]?.label}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg">{selectedItem.name}</h3>
                    <p className="text-gray-400 text-sm mt-0.5">{selectedItem.description}</p>
                  </div>
                </div>

                <p className="text-gray-600 text-xs italic border-t border-white/5 pt-3">
                  「{selectedItem.flavorText}」
                </p>

                {/* Effects */}
                <div className="flex flex-wrap gap-2">
                  {selectedItem.effect.hp && (
                    <span className="bg-green-900/30 text-green-400 text-xs rounded-full px-2.5 py-1">HP +{selectedItem.effect.hp}</span>
                  )}
                  {selectedItem.effect.hungerReduce && (
                    <span className="bg-orange-900/30 text-orange-400 text-xs rounded-full px-2.5 py-1">空腹 -{selectedItem.effect.hungerReduce}</span>
                  )}
                  {selectedItem.effect.moodBoost && (
                    <span className="bg-yellow-900/30 text-yellow-400 text-xs rounded-full px-2.5 py-1">気分 +{selectedItem.effect.moodBoost}</span>
                  )}
                  {selectedItem.effect.xpBonus && (
                    <span className="bg-purple-900/30 text-purple-400 text-xs rounded-full px-2.5 py-1">XP +{selectedItem.effect.xpBonus}</span>
                  )}
                  {selectedItem.effect.xpMultiplier && (
                    <span className="bg-purple-900/30 text-purple-400 text-xs rounded-full px-2.5 py-1">XP ×{selectedItem.effect.xpMultiplier}</span>
                  )}
                  {selectedItem.effect.attackBonus && (
                    <span className="bg-red-900/30 text-red-400 text-xs rounded-full px-2.5 py-1">攻撃 +{selectedItem.effect.attackBonus}</span>
                  )}
                  {selectedItem.effect.defenseBonus && (
                    <span className="bg-blue-900/30 text-blue-400 text-xs rounded-full px-2.5 py-1">防御 +{selectedItem.effect.defenseBonus}</span>
                  )}
                  {selectedItem.effect.critBonus && (
                    <span className="bg-yellow-900/30 text-yellow-400 text-xs rounded-full px-2.5 py-1">クリット +{Math.round(selectedItem.effect.critBonus * 100)}%</span>
                  )}
                  {selectedItem.effect.bondBonus && (
                    <span className="bg-pink-900/30 text-pink-400 text-xs rounded-full px-2.5 py-1">絆 +{selectedItem.effect.bondBonus}</span>
                  )}
                </div>

                {/* How to get */}
                <div className="bg-white/3 rounded-xl p-3 border border-white/5">
                  <p className="text-xs text-gray-500 font-medium mb-1.5">📦 入手方法</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {selectedItem.category === 'food' || selectedItem.category === 'recovery'
                      ? 'タスク完了・ログインボーナス・ミッション達成でドロップ'
                      : selectedItem.category === 'battle'
                      ? 'バトル勝利でドロップ（確率約40%）'
                      : selectedItem.category === 'material'
                      ? 'バトル勝利・週ボス撃破でドロップ'
                      : selectedItem.category === 'equipment'
                      ? '週ボス撃破・特定ミッション達成で入手'
                      : '特定の条件達成で入手できる特別アイテム'}
                  </p>
                </div>
              </div>

              {/* Fixed buttons at bottom */}
              <div className="p-4 border-t border-white/5 flex gap-3 shrink-0">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3.5 rounded-2xl bg-white/5 text-gray-400 font-medium text-sm active:opacity-70"
                >
                  キャンセル
                </button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleUse(selectedItem.id)}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30"
                >
                  {selectedItem.isEquippable ? '🎽 装備する' : '✨ 使う'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Use result toast */}
      <AnimatePresence>
        {useResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-green-900/90 border border-green-500/40 text-green-300 text-sm font-medium px-4 py-2.5 rounded-2xl z-50 shadow-lg whitespace-nowrap"
          >
            {useResult}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
