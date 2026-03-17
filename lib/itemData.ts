import type { GameItem } from './types'

export const ITEMS: Record<string, GameItem> = {
  // ===== 餌/フード =====
  normal_food: {
    id: 'normal_food', name: 'ふつうのごはん', emoji: '🍙', rarity: 'common', category: 'food',
    description: '基本的な餌。空腹が回復する。',
    flavorText: '毎日食べても飽きない定番メニュー。',
    effect: { hungerReduce: 25, hp: 5 },
  },
  energy_fruit: {
    id: 'energy_fruit', name: '元気の実', emoji: '🍎', rarity: 'uncommon', category: 'food',
    description: 'HP・気分を大きく回復する。',
    flavorText: 'キラキラと輝く赤い実。食べると体中に力が湧く。',
    effect: { hp: 25, hungerReduce: 15, moodBoost: 15 },
  },
  idea_candy: {
    id: 'idea_candy', name: 'ひらめきキャンディ', emoji: '🍬', rarity: 'uncommon', category: 'food',
    description: '次に完了するタスクのXPが1.5倍になる。',
    flavorText: '食べた瞬間、頭の中がスパークする感覚。',
    effect: { xpMultiplier: 1.5, hungerReduce: 10 },
  },
  focus_soup: {
    id: 'focus_soup', name: '集中スープ', emoji: '🍵', rarity: 'rare', category: 'food',
    description: '今日のバトル攻撃力+20。気分も回復。',
    flavorText: '一口飲むと、頭がすっきり澄み渡る不思議なスープ。',
    effect: { attackBonus: 20, moodBoost: 20, hungerReduce: 20 },
  },
  reward_cake: {
    id: 'reward_cake', name: 'ごほうびケーキ', emoji: '🎂', rarity: 'rare', category: 'food',
    description: '全ステータスを大きく回復。絆も上がる。',
    flavorText: '特別な日のためのケーキ。一緒に食べると絆が深まる。',
    effect: { hp: 30, hungerReduce: 40, moodBoost: 30, bondBonus: 3 },
  },
  legendary_feast: {
    id: 'legendary_feast', name: '伝説のごちそう', emoji: '🍱', rarity: 'legendary', category: 'food',
    description: '完全回復 + XPボーナス + 絆大幅UP。',
    flavorText: '神話に語られる至高の料理。これを食べた者は無敵になると言われる。',
    effect: { hp: 100, hungerReduce: 100, moodBoost: 50, xpBonus: 200, bondBonus: 10 },
  },
  star_chocolate: {
    id: 'star_chocolate', name: '星のチョコ', emoji: '🍫', rarity: 'epic', category: 'food',
    description: '気分MAX + XP+100。',
    flavorText: '星屑を固めたような輝くチョコレート。',
    effect: { moodBoost: 50, xpBonus: 100, hungerReduce: 20 },
  },

  // ===== 回復/ケア =====
  heal_leaf: {
    id: 'heal_leaf', name: 'いやしの葉', emoji: '🌿', rarity: 'common', category: 'recovery',
    description: 'HP+20を回復する。',
    flavorText: '森の奥深くで採れる薬草。じんわりと体を癒す。',
    effect: { hp: 20 },
  },
  hot_milk: {
    id: 'hot_milk', name: 'ほっとミルク', emoji: '🥛', rarity: 'common', category: 'recovery',
    description: '気分+20。ぐっすり眠れる。',
    flavorText: '温かくてやさしい味。心がほぐれる。',
    effect: { moodBoost: 25, hp: 5 },
  },
  first_aid: {
    id: 'first_aid', name: '応急キット', emoji: '🩹', rarity: 'uncommon', category: 'recovery',
    description: 'HP+40を一気に回復。',
    flavorText: '緊急時に頼れるキット。素早い回復が可能。',
    effect: { hp: 40 },
  },
  heart_bandage: {
    id: 'heart_bandage', name: '心の絆創膏', emoji: '💝', rarity: 'rare', category: 'recovery',
    description: '冬眠状態から復活させる。全ステ大幅回復。',
    flavorText: '壊れかけた心を優しく包み込む、魔法の絆創膏。',
    effect: { hp: 60, moodBoost: 40, hungerReduce: 30, bondBonus: 5 },
  },
  phoenix_feather: {
    id: 'phoenix_feather', name: '不死鳥の羽', emoji: '🪶', rarity: 'epic', category: 'recovery',
    description: '全ステータス完全回復。',
    flavorText: '燃え上がる炎の色をした羽。触れると暖かい。',
    effect: { hp: 100, hungerReduce: 100, moodBoost: 100, bondBonus: 5 },
  },

  // ===== バトル補助 =====
  courage_badge: {
    id: 'courage_badge', name: '勇気のバッジ', emoji: '🏅', rarity: 'uncommon', category: 'battle',
    description: 'バトル攻撃力+15。',
    flavorText: '勇者が身に着けたと言われるバッジ。勇気が湧いてくる。',
    effect: { attackBonus: 15 },
  },
  speed_oil: {
    id: 'speed_oil', name: 'スピードオイル', emoji: '⚡', rarity: 'uncommon', category: 'battle',
    description: 'バトル速度+20。クリット率UP。',
    flavorText: '稲妻を瓶に閉じ込めたような輝くオイル。',
    effect: { critBonus: 0.10, attackBonus: 5 },
  },
  focus_charm: {
    id: 'focus_charm', name: '集中のお守り', emoji: '🔮', rarity: 'rare', category: 'battle',
    description: 'バトル攻防+15。クリット率大幅UP。',
    flavorText: '神社で授かった青いお守り。集中力を研ぎ澄ます。',
    effect: { attackBonus: 15, defenseBonus: 15, critBonus: 0.15 },
  },
  raid_whistle: {
    id: 'raid_whistle', name: 'レイドホイッスル', emoji: '📯', rarity: 'epic', category: 'battle',
    description: 'バトル全ステータス大幅UP。',
    flavorText: '鳴らすと遠くの仲間が集まってくる伝説の角笛。',
    effect: { attackBonus: 30, defenseBonus: 20, critBonus: 0.20 },
  },

  // ===== 進化素材 =====
  wisdom_crystal: {
    id: 'wisdom_crystal', name: '知恵の結晶', emoji: '💎', rarity: 'rare', category: 'material',
    description: '知性型進化に必要な素材。',
    flavorText: '知識を積み重ねた証が結晶となったもの。',
    effect: { evolutionHint: 'scholar' },
  },
  flame_core: {
    id: 'flame_core', name: '炎のコア', emoji: '🔥', rarity: 'rare', category: 'material',
    description: '力強い型進化に必要な素材。',
    flavorText: '激しい訓練の中で生まれた、燃えるような意志の塊。',
    effect: { evolutionHint: 'warrior' },
  },
  bond_drop: {
    id: 'bond_drop', name: '絆のしずく', emoji: '💧', rarity: 'rare', category: 'material',
    description: '調和型進化に必要な素材。',
    flavorText: '深い絆が結露して生まれた、透明な雫。',
    effect: { evolutionHint: 'harmony' },
  },
  continuity_proof: {
    id: 'continuity_proof', name: '継続の証', emoji: '📜', rarity: 'rare', category: 'material',
    description: '堅実型進化に必要な素材。',
    flavorText: '毎日コツコツと積み重ねた日々が形になったもの。',
    effect: { evolutionHint: 'steady' },
  },
  leader_crest: {
    id: 'leader_crest', name: 'リーダーの紋章', emoji: '👑', rarity: 'epic', category: 'material',
    description: 'リーダー型進化に必要な素材。',
    flavorText: 'チームを牽引した者だけが手にできる紋章。',
    effect: { evolutionHint: 'leader' },
  },
  moonlight_wing: {
    id: 'moonlight_wing', name: '月光の羽', emoji: '🌙', rarity: 'epic', category: 'material',
    description: '満月の夜に入手できる神秘の羽。',
    flavorText: '月光を浴びて輝く、幻の羽根。',
    effect: { xpBonus: 300 },
  },

  // ===== 装備/アクセサリ =====
  small_cape: {
    id: 'small_cape', name: '小さなマント', emoji: '🧣', rarity: 'uncommon', category: 'equipment',
    description: '防御+5。かっこよく見える。',
    flavorText: '風になびく小さなマント。着けると少し大人っぽい。',
    effect: { defenseBonus: 5 }, isEquippable: true,
  },
  study_glasses: {
    id: 'study_glasses', name: '勉強メガネ', emoji: '🤓', rarity: 'uncommon', category: 'equipment',
    description: 'XP獲得+10%。知的な雰囲気。',
    flavorText: '賢く見えるだけでなく、本当に頭が良くなる気がするメガネ。',
    effect: { xpMultiplier: 1.1 }, isEquippable: true,
  },
  battle_hachimaki: {
    id: 'battle_hachimaki', name: '勝負のハチマキ', emoji: '🎌', rarity: 'rare', category: 'equipment',
    description: '攻撃+8、クリット率+5%。',
    flavorText: '「絶対勝つ」の文字が刻まれたハチマキ。気合が入る。',
    effect: { attackBonus: 8, critBonus: 0.05 }, isEquippable: true,
  },
  star_necklace: {
    id: 'star_necklace', name: '星の首飾り', emoji: '✨', rarity: 'rare', category: 'equipment',
    description: '全ステータス小幅UP。',
    flavorText: '流れ星を模した首飾り。願いが叶うと言われている。',
    effect: { attackBonus: 5, defenseBonus: 5, critBonus: 0.03 }, isEquippable: true,
  },
  rainbow_ribbon: {
    id: 'rainbow_ribbon', name: '虹色リボン', emoji: '🎀', rarity: 'epic', category: 'equipment',
    description: '絆+5。全ステータスUP。',
    flavorText: '7色に輝くリボン。付けているだけで周りが明るくなる。',
    effect: { bondBonus: 5, attackBonus: 8, defenseBonus: 8, critBonus: 0.05 }, isEquippable: true,
  },
  legendary_crown: {
    id: 'legendary_crown', name: '伝説の王冠', emoji: '👑', rarity: 'legendary', category: 'equipment',
    description: '全ステータス大幅UP。最強の装備。',
    flavorText: '古の王が身に着けた伝説の王冠。その輝きは永遠に色褪せない。',
    effect: { attackBonus: 20, defenseBonus: 15, critBonus: 0.10, bondBonus: 3 }, isEquippable: true,
  },

  // ===== 記念/限定 =====
  first_evolution: {
    id: 'first_evolution', name: '初進化の証', emoji: '🌟', rarity: 'epic', category: 'special',
    description: '初めて進化した記念アイテム。',
    flavorText: 'あの瞬間の感動を永遠に刻み込んだ証。',
    effect: { xpBonus: 100 },
  },
  weekly_trophy: {
    id: 'weekly_trophy', name: '7日連続トロフィー', emoji: '🏆', rarity: 'rare', category: 'special',
    description: '7日連続ログインを達成した証。',
    flavorText: '一週間休まず続けた。その継続力こそが最大の武器。',
    effect: { xpBonus: 200, bondBonus: 5 },
  },
  boss_medal: {
    id: 'boss_medal', name: 'ボス討伐メダル', emoji: '🎖️', rarity: 'epic', category: 'special',
    description: 'ウィークリーボスを倒した証。',
    flavorText: '強大な敵を倒した栄光の証。永遠に輝き続ける。',
    effect: { xpBonus: 300 },
  },
}

export const RARITY_COLORS: Record<string, string> = {
  common:    'border-gray-500/40 bg-gray-900/20',
  uncommon:  'border-green-500/40 bg-green-900/20',
  rare:      'border-blue-500/40 bg-blue-900/20',
  epic:      'border-purple-500/40 bg-purple-900/20',
  legendary: 'border-yellow-500/40 bg-yellow-900/20',
}

export const RARITY_TEXT: Record<string, string> = {
  common:    'text-gray-400',
  uncommon:  'text-green-400',
  rare:      'text-blue-400',
  epic:      'text-purple-400',
  legendary: 'text-yellow-400',
}

export const RARITY_LABELS: Record<string, string> = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary',
}

// Which items can drop from various sources
export const DROP_TABLES = {
  taskComplete: ['normal_food', 'heal_leaf', 'hot_milk', 'energy_fruit', 'courage_badge'],
  missionClaim: ['energy_fruit', 'idea_candy', 'heal_leaf', 'focus_soup', 'speed_oil'],
  dailyLogin:   ['normal_food', 'hot_milk', 'heal_leaf'],
  battleWin:    ['courage_badge', 'speed_oil', 'wisdom_crystal', 'flame_core', 'bond_drop', 'continuity_proof'],
  weeklyBoss:   ['focus_charm', 'raid_whistle', 'moonlight_wing', 'leader_crest', 'boss_medal', 'small_cape', 'study_glasses'],
  streak7:      ['weekly_trophy', 'star_chocolate', 'reward_cake'],
  levelUp:      ['energy_fruit', 'idea_candy', 'wisdom_crystal'],
}
