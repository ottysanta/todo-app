export type TaskStatus = 0 | 1 | 2 | 3 | 4 | 5

export type CharacterMood = 'happy' | 'normal' | 'tired' | 'weak' | 'sleeping'

export type EvolutionType = 'scholar' | 'warrior' | 'steady' | 'leader' | 'harmony'

export type TaskCategory = 'work' | 'exercise' | 'study' | 'personal' | 'team'

/** 愛着度ステージ */
export type BondStage = 'scared' | 'wary' | 'curious' | 'neutral' | 'friendly' | 'loving'

/** キャラクター種類 */
export type CharacterSpecies =
  | 'lumie'    // ルミエ（ふわふわ紫）
  | 'dino'     // ディノ（恐竜・緑）
  | 'bunny'    // バニー（うさぎ・ピンク）
  | 'ghost'    // ゴースト（幽霊・白）
  | 'dragon'   // ドラゴン（赤橙）
  | 'frog'     // フロッグ（カエル・黄緑）
  | 'bear'     // ベア（クマ・茶）
  | 'cat'      // ニャコ（ネコ・橙）
  | 'alien'    // エイリアン（宇宙人・シアン）
  | 'penguin'  // ペンギン（青黒）

/** タップ時の反応 */
export type TapReaction =
  | 'idle'
  | 'bounce'       // 普通のバウンス
  | 'happy_jump'   // 嬉しくてジャンプ
  | 'flinch'       // びっくり逃げ
  | 'shy'          // 恥ずかしい
  | 'heart'        // ハート目
  | 'spin'         // くるっと回る
  | 'eat'          // 食べる

/** キャラクターのシーン */
export type CharacterSceneType = 'idle' | 'walking' | 'eating' | 'playing' | 'stretching' | 'sleeping_scene'

export interface ChatMessage {
  id: string
  role: 'user' | 'character'
  text: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  status: TaskStatus
  deadline?: string
  category: TaskCategory
  createdAt: string
  completedAt?: string
  isMultiStep?: boolean
}

export interface DailyMission {
  id: string
  title: string
  emoji: string
  type: 'complete_tasks' | 'tap_character' | 'feed_character' | 'complete_category' | 'progress_tasks'
  target: number
  progress: number
  completed: boolean
  claimed: boolean
  rewardXp: number
  rewardFood: number
}

export interface Achievement {
  id: string
  title: string
  desc: string
  emoji: string
  unlockedAt?: string
}

export interface Character {
  name: string
  level: number
  xp: number
  xpToNext: number
  hp: number
  hunger: number
  mood: number
  food: number
  coins: number
  evolutionType?: EvolutionType
  totalTasksCompleted: number
  taskCategoryCounts: Record<string, number>
  lastLoginDate?: string
  /** 愛着度 0〜100 */
  bondLevel: number
  /** 今日のタップ回数（上限5回まで愛着加算） */
  tapCountToday: number
  lastTapDate?: string
  /** キャラクター種類 */
  characterSpecies?: CharacterSpecies
  /** 連続ログイン日数 */
  streak: number
  /** 倒した敵の記録 */
  defeatedEnemies?: Record<string, number>
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  level: number
  hp: number
  mood: number
  evolutionType?: EvolutionType
  lastActive: string
}

// ===== Battle types =====

export type EnemyType = 'slime' | 'goblin' | 'zombie' | 'golem' | 'witch' | 'knight' | 'dragon' | 'boss'
  | 'wolf' | 'orc' | 'vampire' | 'mummy' | 'skeleton' | 'imp' | 'troll' | 'phoenix' | 'hydra' | 'demon_king'

export interface BattleEnemy {
  id: string
  name: string
  emoji: string
  hp: number
  maxHp: number
  attack: number
  defense: number
  xpReward: number
  foodReward: number
  coinReward: number
  type: EnemyType
  description: string
  isRare?: boolean
  isBoss?: boolean
}

export interface BattleStats {
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  critRate: number
}

export interface BattleRound {
  round: number
  playerDmg: number
  enemyDmg: number
  playerHp: number
  enemyHp: number
  playerCrit: boolean
  enemyCrit: boolean
  playerSkill?: string
}

export interface BattleResult {
  id: string
  date: string
  won: boolean
  enemy: BattleEnemy
  rounds: BattleRound[]
  xpGained: number
  foodGained: number
  coinsGained: number
  itemDropped?: string
  playerStats: BattleStats
  totalRounds: number
  isWeeklyBoss?: boolean
}

// ===== Item / Inventory types =====

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ItemCategory = 'food' | 'recovery' | 'battle' | 'material' | 'equipment' | 'special'

export interface ItemEffect {
  hp?: number
  hungerReduce?: number
  moodBoost?: number
  xpBonus?: number
  xpMultiplier?: number
  attackBonus?: number
  defenseBonus?: number
  critBonus?: number
  bondBonus?: number
  evolutionHint?: EvolutionType
}

export interface GameItem {
  id: string
  name: string
  emoji: string
  rarity: ItemRarity
  category: ItemCategory
  description: string
  flavorText: string
  effect: ItemEffect
  isEquippable?: boolean
}

export interface InventoryItem {
  itemId: string
  quantity: number
}

export interface EquippedItems {
  accessory?: string
  head?: string
  armor?: string
}

// ===== Evolution =====

export interface EvolutionOption {
  type: EvolutionType
  label: string
  description: string
  emoji: string
  color: string
  requirements: string
}
