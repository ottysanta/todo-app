import { NextRequest, NextResponse } from 'next/server'

const SPECIES_PERSONALITY: Record<string, string> = {
  lumie:   'やわらかくて感情豊か。いつも前向きで、ほっとする言葉をかけてくれる。',
  alien:   '知的で論理的。難しい言葉をたまに使うが、心はあたたかい。',
  dragon:  '勇敢で熱血。少し強がりだが、実は心配症。',
  bear:    'のんびりマイペース。ゆっくりした口調で、どっしりと安心感を与える。',
  penguin: 'きっちりしていて礼儀正しい。リーダー気質で頼りになる。',
  dino:    '元気いっぱいで無邪気。少し天然なところがある。',
  bunny:   'かわいくて甘えん坊。ちょっと恥ずかしがり屋。',
  ghost:   'ちょっと不思議でミステリアス。独特な世界観を持つ。',
  frog:    'のんびり自然体。雨の日が好き。哲学的なことを言う。',
  cat:     '気まぐれでクール。でも内心はすごく懐いている。',
}

const BOND_CONTEXT: Record<string, string> = {
  scared:   'まだ怖がっていて、短い言葉しか言えない',
  wary:     '少し警戒しているが、少しずつ心を開き始めている',
  curious:  '興味津々で質問したがる',
  neutral:  '慣れてきて自然に話せる',
  friendly: '仲良しで、楽しく会話できる',
  loving:   '大好きで、甘えたり感謝を伝えたりする',
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  const { message, charName, userName, mood, bondStage, species, hunger, hp, food, history } = await req.json()

  const personality = SPECIES_PERSONALITY[species ?? 'lumie'] ?? SPECIES_PERSONALITY.lumie
  const bondCtx = BOND_CONTEXT[bondStage ?? 'neutral'] ?? BOND_CONTEXT.neutral

  const moodDesc = mood === 'happy' ? '元気いっぱい' : mood === 'tired' ? '少し疲れている' : mood === 'weak' ? 'ぐったりしている' : '普通'
  const foodStatus = food <= 0 ? 'お腹が空いていてごはんが欲しい' : `餌が${food}個ある`
  const hpStatus = hp < 30 ? '体が弱っている' : hp < 60 ? 'やや疲れ気味' : '元気'

  const systemPrompt = `あなたは「${charName}」というキャラクターです。
性格: ${personality}
現在の状態: ${moodDesc}、${hpStatus}、${foodStatus}
ユーザー「${userName}さん」との関係: ${bondCtx}

ルール:
- 必ず日本語で答える
- 1〜3文の短い返答をする（チャット形式なので簡潔に）
- キャラクターとして話す（AIとして話さない）
- 「${userName}さん」と呼ぶ
- 感情豊かに、自然な会話をする
- タスクやゲームのことについて話してもよい`

  const messages = [
    ...(history ?? []).slice(-8).map((m: { role: string; text: string }) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.text,
    })),
    { role: 'user', content: message },
  ]

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages,
      }),
    })

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    const data = await res.json()
    const text = data.content?.[0]?.text ?? '…（うまく聞こえなかった）'
    return NextResponse.json({ text })
  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
