import type { Character, Task, BattleEnemy, BattleStats, BattleRound, BattleResult } from './types'

// ===== Enemy pool =====
const ENEMY_POOL: Omit<BattleEnemy, 'hp'>[] = [
  { id: 'slime',  name: 'スライム',      emoji: '🟢', maxHp: 60,  attack: 8,  defense: 2,  xpReward: 30,  foodReward: 1, type: 'slime',  description: 'ぷるぷるしてる。弱い。' },
  { id: 'goblin', name: 'ゴブリン',      emoji: '👺', maxHp: 100, attack: 18, defense: 6,  xpReward: 55,  foodReward: 1, type: 'goblin', description: 'すばしっこい小悪魔。' },
  { id: 'zombie', name: 'ゾンビ',        emoji: '🧟', maxHp: 160, attack: 14, defense: 10, xpReward: 70,  foodReward: 2, type: 'zombie', description: 'どんな攻撃も気にしない。' },
  { id: 'golem',  name: 'ゴーレム',      emoji: '🗿', maxHp: 220, attack: 22, defense: 20, xpReward: 95,  foodReward: 2, type: 'golem',  description: '硬い。とにかく硬い。' },
  { id: 'witch',  name: 'ウィッチ',      emoji: '🧙', maxHp: 130, attack: 38, defense: 7,  xpReward: 110, foodReward: 2, type: 'witch',  description: '魔法攻撃が鋭い。' },
  { id: 'knight', name: 'ダークナイト',  emoji: '⚔️', maxHp: 250, attack: 28, defense: 24, xpReward: 130, foodReward: 3, type: 'knight', description: '攻守ともに優れた強敵。' },
  { id: 'dragon', name: 'ドラゴン',      emoji: '🐉', maxHp: 320, attack: 48, defense: 22, xpReward: 170, foodReward: 3, type: 'dragon', description: '炎の息で焼き払う。' },
  { id: 'boss',   name: '闇の魔王',      emoji: '👿', maxHp: 420, attack: 58, defense: 32, xpReward: 260, foodReward: 5, type: 'boss',   description: '全ての悪の根源。最強。' },
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

  const hp      = Math.floor(60 + character.level * 15 + character.hp * 0.4 + exerciseCount * 10)
  const attack  = Math.floor(8  + character.level * 5  + completedToday * 14 + character.bondLevel * 0.3 + studyCount * 5)
  const defense = Math.floor(4  + (character.streak ?? 0) * 3 + character.level * 2)
  const speed   = Math.floor(completedToday * 10 + character.level * 3)
  const critRate = Math.min(0.40, 0.05 + completedToday * 0.04 + character.bondLevel * 0.002)

  return { hp, maxHp: hp, attack, defense, speed, critRate }
}

export function selectEnemy(level: number, seed: number): BattleEnemy {
  const rng = seededRng(seed)
  const maxIdx = Math.min(ENEMY_POOL.length - 1, Math.floor(level / 2.5))
  // Weight lower enemies more early on
  const idx = Math.floor(rng() * (maxIdx + 1))
  const base = ENEMY_POOL[idx]
  const scale = 1 + (level - 1) * 0.07

  return {
    ...base,
    hp:      Math.floor(base.maxHp * scale),
    maxHp:   Math.floor(base.maxHp * scale),
    attack:  Math.floor(base.attack * scale),
    defense: Math.floor(base.defense * scale),
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

  for (let i = 0; i < 20; i++) {
    if (playerHp <= 0 || enemyHp <= 0) break

    const playerCrit = rng() < playerStats.critRate
    const enemyCrit  = rng() < 0.06

    const playerVariance = Math.floor(rng() * 12) - 6
    const enemyVariance  = Math.floor(rng() * 8)  - 4

    const rawPlayerDmg = Math.max(1, playerStats.attack - enemy.defense + playerVariance)
    const rawEnemyDmg  = Math.max(1, enemy.attack - playerStats.defense + enemyVariance)

    const playerDmg = playerCrit ? rawPlayerDmg * 2 : rawPlayerDmg
    const enemyDmg  = enemyCrit  ? rawEnemyDmg  * 2 : rawEnemyDmg

    // Speed bonus: high speed player gets a small extra hit occasionally
    const speedBonus = playerStats.speed > 20 && rng() < 0.15 ? Math.floor(playerDmg * 0.3) : 0

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
    // Weekly boss: powered-up boss
    const scale = 1 + (character.level - 1) * 0.12
    enemy = {
      id: 'weekly_boss',
      name: '週ボス：影の支配者',
      emoji: '👹',
      hp: Math.floor(600 * scale),
      maxHp: Math.floor(600 * scale),
      attack: Math.floor(65 * scale),
      defense: Math.floor(35 * scale),
      xpReward: Math.floor(500 * scale),
      foodReward: 8,
      type: 'boss',
      description: '毎週日曜日に現れる強大な支配者。倒せば特別な報酬が！',
    }
  } else {
    enemy = selectEnemy(character.level, seed)
  }

  return { playerStats, enemy, seed, isWeeklyBoss }
}
