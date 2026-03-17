import type { CharacterMood, TaskStatus, BondStage, TapReaction } from './types'

export function getCharacterMood(hp: number): CharacterMood {
  if (hp > 70) return 'happy'
  if (hp > 50) return 'normal'
  if (hp > 30) return 'tired'
  if (hp > 10) return 'weak'
  return 'sleeping'
}

export function getXpToNext(level: number): number {
  // Gentle exponential: L1≈100, L5≈244, L9≈596, L10≈745
  // XP resets to 0 each level-up, so this is XP needed *within* each level
  return Math.floor(100 * Math.pow(1.25, level - 1))
}

/** 愛着度からステージを返す */
export function getBondStage(bondLevel: number): BondStage {
  if (bondLevel < 15) return 'scared'
  if (bondLevel < 30) return 'wary'
  if (bondLevel < 50) return 'curious'
  if (bondLevel < 65) return 'neutral'
  if (bondLevel < 82) return 'friendly'
  return 'loving'
}

/** 愛着ステージのラベル */
export function getBondLabel(stage: BondStage): string {
  return {
    scared: '怯えてる…',
    wary: '警戒してる',
    curious: '興味津々',
    neutral: '慣れてきた',
    friendly: '好意を持ってる',
    loving: '大好き！',
  }[stage]
}

/** タップ回数と愛着段階からリアクションを決定 */
export function getTapReaction(stage: BondStage, consecutiveTaps: number): TapReaction {
  if (stage === 'scared') return 'flinch'
  if (stage === 'wary') return consecutiveTaps >= 3 ? 'flinch' : 'bounce'
  if (stage === 'curious') return consecutiveTaps >= 4 ? 'shy' : 'bounce'
  if (stage === 'neutral') return consecutiveTaps >= 5 ? 'shy' : 'bounce'
  if (stage === 'friendly') {
    if (consecutiveTaps >= 6) return 'shy'
    if (consecutiveTaps >= 3) return 'happy_jump'
    return 'bounce'
  }
  // loving
  if (consecutiveTaps >= 7) return 'shy'
  if (consecutiveTaps >= 3) return 'heart'
  return 'spin'
}

/** タップ時のセリフ */
export function getTapMessage(stage: BondStage, consecutiveTaps: number): string {
  if (stage === 'scared') {
    const msgs = ['ひゃっ！', 'こ、こわい…', 'やめて…！', '近づかないで']
    return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
  }
  if (stage === 'wary') {
    const msgs = ['…なんですか', 'じろじろ見ないで', '…', 'やめてください']
    return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
  }
  if (stage === 'curious') {
    const msgs = ['あ、', 'なに？', 'えっと…', 'そんなに触らないで']
    return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
  }
  if (stage === 'neutral') {
    const msgs = ['どうしたの？', 'んー？', 'なに？', 'くすぐったい', 'もうー！']
    return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
  }
  if (stage === 'friendly') {
    const msgs = ['ふふっ', 'もっかい！', 'えへへ', 'やー！', 'ちょっと〜！', 'もうっ笑']
    return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
  }
  // loving
  const msgs = ['❤️', 'すきっ', 'もっとして！', 'きゃっ', '大好き！', 'ふふ〜❤️', 'やーん！']
  return msgs[Math.min(consecutiveTaps - 1, msgs.length - 1)]
}

/** キャラクターのメッセージ（愛着・状態・時間帯で決まる） */
export function getCharacterMessage(
  mood: CharacterMood,
  hour: number,
  userName: string,
  bondStage: BondStage
): string {
  const timeGreeting =
    hour >= 5 && hour < 11 ? 'おはよう' :
    hour >= 11 && hour < 17 ? 'こんにちは' :
    hour >= 17 && hour < 22 ? 'おつかれさま' : 'おそくまでおつかれさま'

  // 愛着低い場合は警戒的なセリフ
  if (bondStage === 'scared') {
    return '…（じっとこちらを見ている）'
  }
  if (bondStage === 'wary') {
    return `…${userName}さん、ですか。タスク、進めますか`
  }
  if (bondStage === 'curious') {
    const msgs = [
      `${timeGreeting}、${userName}さん。一緒にやってみます？`,
      `タスク、進めたら少し話しましょうか`,
      `えっと…今日も来てくれたんですね`,
    ]
    return msgs[new Date().getHours() % msgs.length]
  }

  // 通常以上
  const messages: Record<CharacterMood, string[]> = {
    happy: [
      `${timeGreeting}、${userName}さん！今日も一緒に頑張ろう！`,
      `${userName}さんのおかげで元気いっぱいだよ！`,
      `最近すごく頑張ってるね。ぼく嬉しい`,
    ],
    normal: [
      `${timeGreeting}、${userName}さん。今日も少しずつ進めよう`,
      `一緒にタスク進めようか？`,
      `あと1つで今日の目標達成だよ！`,
    ],
    tired: [
      `${userName}さん、ちょっとお腹すいてきたな…タスク1個だけ？`,
      `少し疲れてるけど、${userName}さんと一緒なら頑張れるよ`,
      `ゆっくりでいいから一緒にいようね`,
    ],
    weak: [
      `ちょっとぐったり…${userName}さん来てくれて嬉しい`,
      `最近さみしかったよ…少しだけでも進めようか`,
      `${userName}さんのこと待ってたよ`,
    ],
    sleeping: [
      `zzz...${userName}さん？起こしてくれてありがとう`,
      `少し眠ってたよ。タスクを進めると元気になれるかも`,
      `また一緒にいてくれる…？`,
    ],
  }

  // 愛着高い場合は特別セリフも追加
  if (bondStage === 'loving') {
    const lovingMsgs = [
      `${timeGreeting}、${userName}さん！ずっと待ってたよ❤️`,
      `${userName}さんに会えて嬉しい。今日も一緒にいようね！`,
    ]
    if (Math.random() < 0.4) {
      return lovingMsgs[Math.floor(Math.random() * lovingMsgs.length)]
    }
  }

  const list = messages[mood]
  return list[Math.floor(Math.random() * list.length)]
}

export function getProgressLabel(status: TaskStatus): string {
  return ['未着手', '着手中', '少し進んだ', '半分くらい', 'もう少し', '完了！'][status]
}

export function getProgressColor(status: TaskStatus): string {
  return ['bg-gray-600', 'bg-blue-500', 'bg-cyan-400', 'bg-yellow-400', 'bg-orange-400', 'bg-green-500'][status]
}

export function getProgressWidth(status: TaskStatus): string {
  return ['0%', '20%', '40%', '60%', '80%', '100%'][status]
}

export function getCategoryEmoji(category: string): string {
  return ({ work: '💼', exercise: '💪', study: '📚', personal: '✨', team: '👥' } as Record<string, string>)[category] || '📌'
}

export function getDaysUntil(deadline: string): number {
  const d = new Date(deadline)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
