'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useGameStore } from '@/lib/store'

const ALL_ENEMIES = [
  { id: 'slime',      name: 'スライム',         emoji: '🟢', description: 'ぷるぷるしてる。弱い。',              hp: 180,  atk: 12,  rarity: 'common' },
  { id: 'goblin',     name: 'ゴブリン',         emoji: '👺', description: 'すばしっこい小悪魔。',               hp: 280,  atk: 22,  rarity: 'common' },
  { id: 'wolf',       name: 'ダークウルフ',     emoji: '🐺', description: '闇に潜む野生の狼。',                 hp: 320,  atk: 28,  rarity: 'common' },
  { id: 'zombie',     name: 'ゾンビ',           emoji: '🧟', description: 'どんな攻撃も気にしない。',           hp: 420,  atk: 20,  rarity: 'common' },
  { id: 'skeleton',   name: 'スケルトン',       emoji: '💀', description: '骨だけの戦士。意外と俊敏。',         hp: 360,  atk: 32,  rarity: 'common' },
  { id: 'imp',        name: 'インプ',           emoji: '😈', description: '小悪魔だが攻撃力が高い。',           hp: 300,  atk: 40,  rarity: 'uncommon' },
  { id: 'orc',        name: 'オーク戦士',       emoji: '👹', description: '力任せに攻撃してくる。',             hp: 520,  atk: 35,  rarity: 'uncommon' },
  { id: 'golem',      name: 'ゴーレム',         emoji: '🗿', description: '硬い。とにかく硬い。',               hp: 650,  atk: 30,  rarity: 'uncommon' },
  { id: 'mummy',      name: 'ミイラ',           emoji: '🏺', description: '包帯がほどけることはない。',         hp: 480,  atk: 28,  rarity: 'uncommon' },
  { id: 'witch',      name: 'ウィッチ',         emoji: '🧙', description: '魔法攻撃が鋭い。',                   hp: 380,  atk: 55,  rarity: 'uncommon' },
  { id: 'vampire',    name: 'ヴァンパイア',     emoji: '🧛', description: '血を吸って回復する。',               hp: 580,  atk: 48,  rarity: 'rare' },
  { id: 'troll',      name: 'トロール',         emoji: '🧌', description: '再生能力がある厄介な相手。',         hp: 750,  atk: 42,  rarity: 'rare' },
  { id: 'knight',     name: 'ダークナイト',     emoji: '⚔️', description: '攻守ともに優れた強敵。',             hp: 680,  atk: 45,  rarity: 'rare' },
  { id: 'dragon',     name: 'ドラゴン',         emoji: '🐉', description: '炎の息で焼き払う。',                 hp: 900,  atk: 65,  rarity: 'epic' },
  { id: 'phoenix',    name: 'フェニックス',     emoji: '🦅', description: '炎から蘇る不死鳥。',                 hp: 820,  atk: 58,  rarity: 'epic' },
  { id: 'hydra',      name: 'ヒュドラ',         emoji: '🐍', description: '3つの頭が次々と攻撃する。',          hp: 1100, atk: 55,  rarity: 'epic' },
  { id: 'boss',       name: '闇の魔王',         emoji: '👿', description: '全ての悪の根源。最強。',             hp: 1200, atk: 80,  rarity: 'legendary' },
  { id: 'demon_king', name: '魔王デモーノス',   emoji: '🔮', description: '神話に語られる最強の魔王。',         hp: 1500, atk: 95,  rarity: 'legendary' },
  { id: 'weekly_boss', name: '週ボス：影の支配者', emoji: '👹', description: '毎週日曜日に現れる強大な支配者。', hp: 1800, atk: 80,  rarity: 'legendary' },
]

const RARITY_COLOR: Record<string, string> = {
  common:    'border-gray-600/50 bg-gray-900/30 text-gray-400',
  uncommon:  'border-green-600/50 bg-green-900/20 text-green-400',
  rare:      'border-blue-600/50 bg-blue-900/20 text-blue-400',
  epic:      'border-purple-600/50 bg-purple-900/20 text-purple-400',
  legendary: 'border-yellow-600/50 bg-yellow-900/20 text-yellow-400',
}

const RARITY_LABEL: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
}

export default function BestiaryPage() {
  const { character } = useGameStore()
  const defeated = character.defeatedEnemies ?? {}
  const totalDefeated = Object.values(defeated).reduce((s, n) => s + n, 0)
  const uniqueDefeated = Object.keys(defeated).filter(k => defeated[k] > 0).length

  return (
    <div className="px-4 py-6 pb-24 space-y-4 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-bold text-xl">📖 モンスター図鑑</h1>
          <p className="text-gray-500 text-sm mt-0.5">倒した敵の記録</p>
        </div>
        <Link href="/battle" className="text-xs text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
          ← バトル
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-xl font-bold text-cyan-400">{uniqueDefeated}</p>
          <p className="text-xs text-gray-500 mt-0.5">種類発見</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-xl font-bold text-red-400">{totalDefeated}</p>
          <p className="text-xs text-gray-500 mt-0.5">総討伐数</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-3 border border-white/5 text-center">
          <p className="text-xl font-bold text-purple-400">{ALL_ENEMIES.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">全種類</p>
        </div>
      </div>

      {/* Enemy list */}
      <div className="space-y-2">
        {ALL_ENEMIES.map((enemy, i) => {
          const count = defeated[enemy.id] ?? 0
          const isDiscovered = count > 0
          return (
            <motion.div
              key={enemy.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-2xl p-4 border flex items-center gap-4 ${
                isDiscovered ? RARITY_COLOR[enemy.rarity] : 'border-white/5 bg-[#1a1a2e] opacity-40'
              }`}
            >
              <div className={`text-4xl ${isDiscovered ? '' : 'grayscale'}`}>
                {isDiscovered ? enemy.emoji : '❓'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white font-semibold text-sm">
                    {isDiscovered ? enemy.name : '???'}
                  </p>
                  <span className={`text-xs ${isDiscovered ? RARITY_COLOR[enemy.rarity].split(' ').find(c => c.startsWith('text-')) : 'text-gray-600'}`}>
                    {RARITY_LABEL[enemy.rarity]}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">
                  {isDiscovered ? enemy.description : '未討伐'}
                </p>
                {isDiscovered && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    HP {enemy.hp} / ATK {enemy.atk}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                {isDiscovered ? (
                  <div>
                    <p className="text-white font-bold text-lg">{count}</p>
                    <p className="text-gray-600 text-xs">討伐</p>
                  </div>
                ) : (
                  <p className="text-gray-700 text-xs">未発見</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
