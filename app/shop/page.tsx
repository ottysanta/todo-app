'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store'
import { ITEMS, SHOP_ITEMS, RARITY_COLORS, RARITY_TEXT, RARITY_LABELS } from '@/lib/itemData'

export default function ShopPage() {
  const { character, buyItem } = useGameStore()
  const [boughtMsg, setBoughtMsg] = useState<string | null>(null)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)

  const coins = character.coins ?? 0

  const availableItems = SHOP_ITEMS.filter(s => character.level >= s.unlockLevel)
  const lockedItems = SHOP_ITEMS.filter(s => character.level < s.unlockLevel)

  const handleBuy = (itemId: string, price: number) => {
    const item = ITEMS[itemId]
    if (!item) return
    if (coins < price) {
      setBoughtMsg(`🪙 コインが足りない！(${coins}/${price})`)
    } else {
      const ok = buyItem(itemId, price)
      if (ok) {
        setBoughtMsg(`${item.emoji} ${item.name}を購入した！`)
      }
    }
    setSelectedItemId(null)
    setTimeout(() => setBoughtMsg(null), 2500)
  }

  return (
    <div className="px-4 py-6 pb-24 space-y-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">🏪 ショップ</h1>
          <p className="text-gray-500 text-sm mt-0.5">コインで装備・アイテムを購入</p>
        </div>
        <Link href="/inventory" className="text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
          🎒 持ち物
        </Link>
      </div>

      {/* コイン残高 */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 rounded-2xl p-4 border border-yellow-500/30 flex items-center gap-3">
        <span className="text-3xl">🪙</span>
        <div>
          <p className="text-yellow-300 font-bold text-xl">{coins}</p>
          <p className="text-gray-400 text-xs">所持コイン — バトルに勝つと増える</p>
        </div>
      </div>

      {/* 購入可能アイテム */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">購入可能 ({availableItems.length}種)</p>
        <div className="space-y-2">
          {availableItems.map(({ itemId, price }) => {
            const item = ITEMS[itemId]
            if (!item) return null
            const canAfford = coins >= price
            const isSelected = selectedItemId === itemId
            return (
              <motion.div
                key={itemId}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedItemId(isSelected ? null : itemId)}
                className={`rounded-2xl p-4 border cursor-pointer transition-all ${RARITY_COLORS[item.rarity]} ${
                  isSelected ? 'ring-2 ring-purple-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{item.name}</p>
                      <span className={`text-xs ${RARITY_TEXT[item.rarity]}`}>{RARITY_LABELS[item.rarity]}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">{item.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-sm ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>🪙{price}</p>
                    <p className="text-gray-600 text-xs">{canAfford ? '購入可' : '不足'}</p>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-white/5">
                        {/* Effects */}
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {item.effect.attackBonus && <span className="bg-red-900/30 text-red-400 text-xs rounded-full px-2 py-0.5">ATK+{item.effect.attackBonus}</span>}
                          {item.effect.defenseBonus && <span className="bg-blue-900/30 text-blue-400 text-xs rounded-full px-2 py-0.5">DEF+{item.effect.defenseBonus}</span>}
                          {item.effect.critBonus && <span className="bg-yellow-900/30 text-yellow-400 text-xs rounded-full px-2 py-0.5">CRIT+{Math.round(item.effect.critBonus * 100)}%</span>}
                          {item.effect.xpMultiplier && <span className="bg-purple-900/30 text-purple-400 text-xs rounded-full px-2 py-0.5">XP×{item.effect.xpMultiplier}</span>}
                          {item.effect.hp && <span className="bg-green-900/30 text-green-400 text-xs rounded-full px-2 py-0.5">HP+{item.effect.hp}</span>}
                          {item.effect.bondBonus && <span className="bg-pink-900/30 text-pink-400 text-xs rounded-full px-2 py-0.5">絆+{item.effect.bondBonus}</span>}
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); handleBuy(itemId, price) }}
                          disabled={!canAfford}
                          className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                            canAfford
                              ? 'bg-gradient-to-r from-yellow-600 to-orange-500 text-white shadow-lg'
                              : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? `🪙 ${price}コインで購入` : `🪙 コイン不足 (${coins}/${price})`}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ロックアイテム */}
      {lockedItems.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-3">🔒 解放待ち ({lockedItems.length}種)</p>
          <div className="space-y-2">
            {lockedItems.slice(0, 4).map(({ itemId, price, unlockLevel }) => {
              const item = ITEMS[itemId]
              if (!item) return null
              return (
                <div key={itemId} className="rounded-2xl p-4 border border-white/5 bg-[#1a1a2e] opacity-50 flex items-center gap-3">
                  <span className="text-3xl grayscale">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-gray-400 text-sm font-semibold">{item.name}</p>
                    <p className="text-gray-600 text-xs">Lv{unlockLevel}で解放</p>
                  </div>
                  <p className="text-gray-600 text-sm">🪙{price}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {boughtMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1a1a2e] border border-yellow-500/40 text-yellow-300 text-sm font-medium px-4 py-2.5 rounded-2xl z-50 shadow-lg whitespace-nowrap"
          >
            {boughtMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
