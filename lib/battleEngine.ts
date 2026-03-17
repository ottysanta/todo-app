import type { Character, Task, BattleEnemy, BattleStats, BattleRound, BattleResult } from './types'

// ===== Enemy pool (significantly buffed HP/defense for longer battles) =====
const ENEMY_POOL: Omit<BattleEnemy, 'hp'>[] = [
  // Common
  { id: 'slime',    name: 'スライム',        emoji: '🟢', maxHp: 180,  attack: 12,  defense: 5,   xpReward: 30,  foodReward: 1, coinReward: 5,  type: 'slime',    description: 'ぷるぷるしてる。弱い。' },
  { id: 'goblin',   name: 'ゴブリン',        emoji: '👺', maxHp: 280,  attack: 22,  defense: 10,  xpReward: 55,  foodReward: 1, coinReward: 10, type: 'goblin',   description: 'すばしっこい小悪魔。' },
  { id: 'wolf',     name: 'ダークウルフ',    emoji: '🐺', maxHp: 320,  attack: 28,  defense: 12,  xpReward: 65,  foodReward: 1, coinReward: 12, type: 'wolf',     description: '闇に潜む野生の狼。' },
  { id: 'zombie',   name: 'ゾンビ',          emoji: '🧟', maxHp: 420,  attack: 20,  defense: 18,  xpReward: 70,  foodReward: 2, coinReward: 15, type: 'zombie',   description: 'どんな攻撃も気にしない。' },
  { id: 'skeleton', name: 'スケルトン',      emoji: '💀', maxHp: 360,  attack: 32,  defense: 14,  xpReward: 75,  foodReward: 2, coinReward: 15, type: 'skeleton', description: '骨だけの戦士。意外と俊敏。' },
  { id: 'imp',      name: 'インプ',          emoji: '😈', maxHp: 300,  attack: 40,  defense: 8,   xpReward: 80,  foodReward: 2, coinReward: 18, type: 'imp',      description: '小悪魔だが攻撃力が高い。' },
  // Uncommon
  { id: 'orc',      name: 'オーク戦士',      emoji: '👹', maxHp: 520,  attack: 35,  defense: 25,  xpReward: 95,  foodReward: 2, coinReward: 22, type: 'orc',      description: '力任せに攻撃してくる。' },
  { id: 'golem',    name: 'ゴーレム',        emoji: '🗿', maxHp: 650,  attack: 30,  defense: 38,  xpReward: 95,  foodReward: 2, coinReward: 22, type: 'golem',    description: '硬い。とにかく硬い。' },
  { id: 'mummy',    name: 'ミイラ',          emoji: '🏺', maxHp: 480,  attack: 28,  defense: 32,  xpReward: 90,  foodReward: 2, coinReward: 20, type: 'mummy',    description: '包帯がほどけることはない。' },
  { id: 'witch',    name: 'ウィッチ',        emoji: '🧙', maxHp: 380,  attack: 55,  defense: 12,  xpReward: 110, foodReward: 2, coinReward: 25, type: 'witch',    description: '魔法攻撃が鋭い。' },
  // Rare
  { id: 'vampire',  name: 'ヴァンパイア',    emoji: '🧛', maxHp: 580,  attack: 48,  defense: 28,  xpReward: 130, foodReward: 3, coinReward: 35, type: 'vampire',  description: '血を吸って回復する。', isRare: true },
  { id: 'troll',    name: 'トロール',        emoji: '🧌', maxHp: 750,  attack: 42,  defense: 45,  xpReward: 140, foodReward: 3, coinReward: 38, type: 'troll',    description: '再生能力がある厄介な相手。', isRare: true },
  { id: 'knight',   name: 'ダークナイト',    emoji: '⚔️', maxHp: 680,  attack: 45,  defense: 40,  xpReward: 130, foodReward: 3, coinReward: 35, type: 'knight',   description: '攻守ともに優れた強敵。' },
  // Epic / Boss
  { id: 'dragon',   name: 'ドラゴン',        emoji: '🐉', maxHp: 900,  attack: 65,  defense: 35,  xpReward: 170, foodReward: 3, coinReward: 55, type: 'dragon',   description: '炎の息で焼き払う。', isBoss: true },
  { id: 'phoenix',  name: 'フェニックス',    emoji: '🦅', maxHp: 820,  attack: 58,  defense: 30,  xpReward: 160, foodReward: 3, coinReward: 50, type: 'phoenix',  description: '炎から蘇る不死鳥。', isRare: true, isBoss: true },
  { id: 'hydra',    name: 'ヒュドラ',        emoji: '🐍', maxHp: 1100, attack: 55,  defense: 40,  xpReward: 200, foodReward: 4, coinReward: 65, type: 'hydra',    description: '3つの頭が次々と攻撃する。', isBoss: true },
  { id: 'boss',     name: '闇の魔王',        emoji: '👿', maxHp: 1200, attack: 80,  defense: 50,  xpReward: 260, foodReward: 5, coinReward: 80, type: 'boss',     description: '全ての悪の根源。最強。', isBoss: true },
  { id: 'demon_king', name: '魔王デモーノス', emoji: '🔮', maxHp: 1500, attack: 95,  defense: 55,  xpReward: 350, foodReward: 6, coinReward: 100, type: 'demon_king', description: '神話に語られる最強の魔王。', isRare: true, isBoss: true },
]

// Player skill names based on task categories
const SKILL_NAMES: Record<string, string[]> = {
  work:     ['集中アタック', 'デスクストライク', 'プレッシャーブレイク'],
  study:    ['知識の一撃', '集中閃光', 'ひらめきアタック'],
  exercise: ['パワースマッシュ', 'スプリントアタック', 'スタミナバースト'],
  personal: ['インスピレーション', 'セルフブースト', 'メンタルストライク'],
  team:     ['チームコンボ', '絆の一撃', '協力アタック'],
  default:  ['アタック', 'ストライク', 'スラッシュ'],
}

function pickSkill(tasks: Task[]): string {
  const today = new Date().toDateString()
  const recentTask = tasks.find(t => t.completedAt && new Date(t.completedAt).toDateString() === today)
  const pool = recentTask ? (SKILL_NAMES[recentTask.category] ?? SKILL_NAMES.default) : SKILL_NAMES.default
  return pool[Math.floor(Math.random() * pool.length)]
}

// Seeded RNG (deterministic per day)
function seededRng(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

export function calculatePlayerStats(character: Character, tasks: Task[]): BattleStats {
  const today = new Date().toDateString()
  const completedToday = tasks.filter(t =>
    t.completedAt && new Date(t.completedAt).toDateString() === today
  ).length
  const exerciseCount = tasks.filter(t =>
    t.category === 'exercise' && t.completedAt && new Date(t.completedAt).toDateString() === today
  ).length
  const studyCount = tasks.filter(t =>
    t.category === 'study' && t.completedAt && new Date(t.completedAt).toDateString() === today
  ).length

  const hp      = Math.floor(120 + character.level * 20 + character.hp * 0.8 + exerciseCount * 15)
  const attack  = Math.floor(15  + character.level * 6  + completedToday * 12 + character.bondLevel * 0.4 + studyCount * 6)
  const defense = Math.floor(8   + (character.streak ?? 0) * 3 + character.level * 3 + exerciseCount * 4)
  const speed   = Math.floor(completedToday * 8 + character.level * 4)
  const critRate = Math.min(0.40, 0.05 + completedToday * 0.035 + character.bondLevel * 0.002)

  return { hp, maxHp: hp, attack, defense, speed, critRate }
}

export function selectEnemy(level: number, seed: number): BattleEnemy {
  const rng = seededRng(seed)

  // Chance of rare enemy increases with level
  const rareChance = Math.min(0.20, level * 0.015)
  const bossChance = Math.min(0.10, (level - 5) * 0.01)

  // Determine pool based on level
  const maxIdx = Math.min(ENEMY_POOL.length - 5, Math.floor(level / 2))  // -5 to keep late bosses exclusive to higher levels

  let pool = ENEMY_POOL.slice(0, Math.max(3, maxIdx + 1))

  // Possibly include rare/boss enemies at higher levels
  if (level >= 8 && rng() < rareChance) {
    const rares = ENEMY_POOL.filter(e => e.isRare && !e.isBoss)
    if (rares.length > 0) {
      const base = rares[Math.floor(rng() * rares.length)]
      const scale = 1 + (level - 1) * 0.08
      return {
        ...base,
        hp:      Math.floor(base.maxHp * scale),
        maxHp:   Math.floor(base.maxHp * scale),
        attack:  Math.floor(base.attack * scale),
        defense: Math.floor(base.defense * scale),
        coinReward: Math.floor(base.coinReward * scale),
      }
    }
  }

  if (level >= 15 && rng() < bossChance) {
    const bosses = ENEMY_POOL.filter(e => e.isBoss && !e.isRare)
    if (bosses.length > 0) {
      const base = bosses[Math.floor(rng() * bosses.length)]
      const scale = 1 + (level - 1) * 0.08
      return {
        ...base,
        hp:      Math.floor(base.maxHp * scale),
        maxHp:   Math.floor(base.maxHp * scale),
        attack:  Math.floor(base.attack * scale),
        defense: Math.floor(base.defense * scale),
        coinReward: Math.floor(base.coinReward * scale),
      }
    }
  }

  const idx = Math.floor(rng() * pool.length)
  const base = pool[idx]
  const scale = 1 + (level - 1) * 0.08

  return {
    ...base,
    hp:      Math.floor(base.maxHp * scale),
    maxHp:   Math.floor(base.maxHp * scale),
    attack:  Math.floor(base.attack * scale),
    defense: Math.floor(base.defense * scale),
    coinReward: Math.floor(base.coinReward * scale),
  }
}

export function simulateBattle(
  playerStats: BattleStats,
  enemy: BattleEnemy,
  tasks: Task[],
  seed: number,
): { rounds: BattleRound[]; won: boolean } {
  const rng = seededRng(seed)
  let playerHp = playerStats.hp
  let enemyHp = enemy.hp
  const rounds: BattleRound[] = []

  for (let i = 0; i < 30; i++) {
    if (playerHp <= 0 || enemyHp <= 0) break

    const playerCrit = rng() < playerStats.critRate
    const enemyCrit  = rng() < 0.08

    const playerVariance = Math.floor(rng() * 16) - 8
    const enemyVariance  = Math.floor(rng() * 12) - 6

    const rawPlayerDmg = Math.max(1, playerStats.attack - enemy.defense + playerVariance)
    const rawEnemyDmg  = Math.max(1, enemy.attack - playerStats.defense + enemyVariance)

    const playerDmg = playerCrit ? Math.floor(rawPlayerDmg * 2.2) : rawPlayerDmg
    const enemyDmg  = enemyCrit  ? Math.floor(rawEnemyDmg  * 2.0) : rawEnemyDmg

    // Speed bonus: high speed player gets an extra hit occasionally
    const speedBonus = playerStats.speed > 15 && rng() < 0.18 ? Math.floor(playerDmg * 0.35) : 0

    enemyHp = Math.max(0, enemyHp - playerDmg - speedBonus)
    playerHp = Math.max(0, playerHp - enemyDmg)

    rounds.push({
      round: i + 1,
      playerDmg: playerDmg + speedBonus,
      enemyDmg,
      playerHp,
      enemyHp,
      playerCrit,
      enemyCrit,
      playerSkill: playerCrit ? pickSkill(tasks) : undefined,
    })
  }

  return { rounds, won: enemyHp <= 0 }
}

export function buildDailyBattleSetup(character: Character, tasks: Task[]): {
  playerStats: BattleStats
  enemy: BattleEnemy
  seed: number
  isWeeklyBoss: boolean
} {
  const today = new Date()
  const isWeeklyBoss = today.getDay() === 0  // Sunday = weekly boss day
  const seed = today.getDate() * 31 + today.getMonth() * 7 + character.level * 13
  const playerStats = calculatePlayerStats(character, tasks)

  let enemy: BattleEnemy
  if (isWeeklyBoss) {
    // Weekly boss: powered-up boss with scaling
    const scale = 1 + (character.level - 1) * 0.12
    enemy = {
      id: 'weekly_boss',
      name: '週ボス：影の支配者',
      emoji: '👹',
      hp: Math.floor(1800 * scale),
      maxHp: Math.floor(1800 * scale),
      attack: Math.floor(80 * scale),
      defense: Math.floor(50 * scale),
      xpReward: Math.floor(500 * scale),
      foodReward: 8,
      coinReward: Math.floor(150 * scale),
      type: 'boss',
      description: '毎週日曜日に現れる強大な支配者。倒せば特別な報酬が！',
      isBoss: true,
    }
  } else {
    enemy = selectEnemy(character.level, seed)
  }

  return { playerStats, enemy, seed, isWeeklyBoss }
}
