import type { Character, EvolutionType, EvolutionOption, Task } from './types'

export const EVOLUTION_OPTIONS: Record<EvolutionType, EvolutionOption> = {
  scholar: {
    type: 'scholar',
    label: '知性型',
    description: '知識と探求心で進化した姿。XP獲得量が大幅にアップ！',
    emoji: '🎓',
    color: 'from-blue-600 to-cyan-500',
    requirements: '勉強タスクを5個以上完了',
  },
  warrior: {
    type: 'warrior',
    label: '力強い型',
    description: '鍛錬と根性で進化した戦士の姿。バトル攻撃力が爆上がり！',
    emoji: '⚔️',
    color: 'from-orange-600 to-red-500',
    requirements: '運動タスクを5個以上完了',
  },
  steady: {
    type: 'steady',
    label: '堅実型',
    description: '毎日コツコツ続けて進化した安定の姿。HP・防御が高い！',
    emoji: '🌿',
    color: 'from-green-600 to-emerald-500',
    requirements: '5日以上連続ログイン',
  },
  leader: {
    type: 'leader',
    label: 'リーダー型',
    description: 'チームを引っ張る力で進化した頼もしい姿。絆ボーナスUP！',
    emoji: '👑',
    color: 'from-yellow-600 to-amber-400',
    requirements: 'チームタスクを3個以上完了',
  },
  harmony: {
    type: 'harmony',
    label: '調和型',
    description: '深い絆から生まれた神秘の姿。全ステータスがバランスよくUP！',
    emoji: '✨',
    color: 'from-purple-600 to-pink-500',
    requirements: '絆レベル60以上',
  },
}

export function getAvailableEvolutions(character: Character): EvolutionType[] {
  if (character.level < 10) return []
  if (character.evolutionType) return []

  const counts = character.taskCategoryCounts
  const available: EvolutionType[] = []

  if ((counts.study || 0) >= 5) available.push('scholar')
  if ((counts.exercise || 0) >= 5) available.push('warrior')
  if (character.streak >= 5) available.push('steady')
  if ((counts.team || 0) >= 3) available.push('leader')
  if (character.bondLevel >= 60) available.push('harmony')

  // Always at least one fallback at level 10
  if (available.length === 0) available.push('steady')

  return available
}

export function getEvolutionBonuses(type: EvolutionType): {
  xpMultiplier: number
  attackBonus: number
  defenseBonus: number
  critBonus: number
  hpBonus: number
  bondBonus: number
} {
  switch (type) {
    case 'scholar':
      return { xpMultiplier: 1.5, attackBonus: 5, defenseBonus: 5, critBonus: 0.03, hpBonus: 10, bondBonus: 0 }
    case 'warrior':
      return { xpMultiplier: 1.1, attackBonus: 20, defenseBonus: 10, critBonus: 0.10, hpBonus: 20, bondBonus: 0 }
    case 'steady':
      return { xpMultiplier: 1.2, attackBonus: 8, defenseBonus: 20, critBonus: 0.05, hpBonus: 30, bondBonus: 2 }
    case 'leader':
      return { xpMultiplier: 1.3, attackBonus: 12, defenseBonus: 12, critBonus: 0.07, hpBonus: 15, bondBonus: 10 }
    case 'harmony':
      return { xpMultiplier: 1.3, attackBonus: 15, defenseBonus: 15, critBonus: 0.08, hpBonus: 20, bondBonus: 15 }
  }
}
