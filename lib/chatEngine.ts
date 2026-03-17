import type { CharacterMood, BondStage, ChatMessage, CharacterSpecies } from './types'

// Common Japanese particles/words to exclude from vocabulary learning
const COMMON_WORDS = new Set([
  'の', 'は', 'が', 'を', 'に', 'で', 'と', 'も', 'へ', 'から', 'まで', 'より', 'や',
  'か', 'な', 'ね', 'よ', 'わ', 'ぞ', 'ぜ', 'さ', 'って', 'だ', 'です', 'ます', 'だよ',
  'だね', 'かな', 'かも', 'でも', 'けど', 'から', 'ので', 'のに', 'ても',
  'いる', 'ある', 'する', 'なる', 'くる', 'いく', 'おく', 'みる', 'くれる', 'もらう',
  'あげる', 'しまう', 'this', 'that', 'the', 'a', 'an', 'is', 'are',
  'こと', 'もの', 'とき', 'ところ', 'わたし', 'ぼく', 'おれ', 'あなた', 'きみ',
])

export function extractVocabulary(text: string): string[] {
  const words: string[] = []
  const segments = text.split(/[\s、。！？…　]+/).filter(Boolean)
  for (const seg of segments) {
    if (seg.length >= 2 && !COMMON_WORDS.has(seg) && !/^[0-9０-９]+$/.test(seg)) {
      words.push(seg)
    }
  }
  const emojiRegex = /[\p{Emoji}]/gu
  const emojis = text.match(emojiRegex) ?? []
  return [...words, ...emojis].slice(0, 3)
}

// ===== Species personality system =====
interface SpeciesTraits {
  catchphrases: string[]
  excited: string
  selfRef: string
}

const SPECIES_TRAITS: Record<string, SpeciesTraits> = {
  lumie:   { catchphrases: ['えへへ〜', 'ぽわぽわ〜！', 'ふふ♪', 'うふふ〜'],           excited: 'わぁ！',   selfRef: 'ぼく' },
  dino:    { catchphrases: ['ガオッ！', 'うおっ！', 'いくぞ〜！', 'ガガガッ！'],          excited: 'ガオ！',   selfRef: 'オレ' },
  bunny:   { catchphrases: ['ぴょん！', 'ぴょんぴょん！', 'えへへ〜', 'ぴょこん！'],      excited: 'きゃっ！', selfRef: 'わたし' },
  ghost:   { catchphrases: ['ひゅ〜…', '…ふわ♪', 'ゆら〜', '…（ゆれる）'],             excited: 'ふわっ！', selfRef: 'ぼく' },
  dragon:  { catchphrases: ['フガッ！', 'ぐるるる…', 'ドドン！', 'ガルル！'],            excited: 'ドドン！', selfRef: 'オレ様' },
  frog:    { catchphrases: ['ケロ！', 'ゲコゲコ！', 'ケロ〜♪', 'ぴょこん！'],            excited: 'ケロッ！', selfRef: 'ぼく' },
  bear:    { catchphrases: ['グゥ〜…', 'もぐもぐ', 'ぐぅ〜♪', 'ふがふが'],              excited: 'グゥ！',   selfRef: 'ぼく' },
  cat:     { catchphrases: ['にゃ〜ん', 'ふにゃ♪', 'にゃっ！', 'にゃ〜'],               excited: 'にゃっ！', selfRef: 'アタシ' },
  alien:   { catchphrases: ['ビビビ！', 'ピポパポ！', 'ジャジャン！', 'ブブブッ！'],      excited: 'ジャジャン！', selfRef: 'ワタクシ' },
  penguin: { catchphrases: ['ぺぺっ！', 'ペンペン！', 'よちよち〜', 'ぺたぺた！'],       excited: 'ぺぺっ！', selfRef: 'ぼく' },
}

function getTraits(species?: CharacterSpecies): SpeciesTraits {
  return SPECIES_TRAITS[species ?? 'lumie'] ?? SPECIES_TRAITS.lumie
}

function addFlair(text: string, species?: CharacterSpecies): string {
  if (Math.random() > 0.45) return text
  const t = getTraits(species)
  const cp = t.catchphrases[Math.floor(Math.random() * t.catchphrases.length)]
  return Math.random() > 0.5 ? cp + ' ' + text : text + ' ' + cp
}

interface ResponseContext {
  charName: string
  userName: string
  mood: CharacterMood
  bondStage: BondStage
  history: ChatMessage[]
  vocabulary: string[]
  food: number
  species?: CharacterSpecies
  hunger?: number
  hp?: number
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function maybeUseVocab(vocab: string[]): string {
  if (vocab.length === 0 || Math.random() > 0.3) return ''
  const word = pick(vocab)
  return pick([
    `そういえば「${word}」って言ってたね。`,
    `${word}のこと気になってるんだけど。`,
    `「${word}」って面白いよね。`,
    `前に「${word}」って教えてくれたの覚えてるよ！`,
  ]) + ' '
}

// Species-specific eating sounds
const SPECIES_EAT_SOUNDS: Record<string, string> = {
  lumie: 'もぐもぐ…', dino: 'ガブッ！', bunny: 'ぱくぱく♪', ghost: '…（ふわっと食べる）',
  dragon: 'ガブガブッ！', frog: 'ぺろり！ケロ', bear: 'もぐもぐもぐ…', cat: 'にゃ〜（ペロペロ）',
  alien: 'ビビビ（摂取中）！', penguin: 'ぺぺっ（食べてる）！',
}

// ===== Keyword patterns =====
const KEYWORDS: Array<{ pattern: RegExp; responses: (ctx: ResponseContext) => string[] }> = [
  {
    pattern: /🍖|えさ|餌をあげ|ごはんあげ|餌あげ/,
    responses: ({ charName, userName, bondStage, hunger, hp, species }) => {
      const eatSound = SPECIES_EAT_SOUNDS[species ?? 'lumie'] ?? 'もぐもぐ…'
      const isVeryHungry = (hunger ?? 50) > 60
      const isLowHP = (hp ?? 80) < 35
      if (bondStage === 'scared') return [`…（おそるおそる食べる）ありがとうございます…`]
      if (bondStage === 'wary') return [`…食べます。ありがとうございます`]
      if (isVeryHungry) return [
        `わぁ！ごはんだ！${eatSound} お腹すいてたんだよ〜！ありがとう${userName}さん！元気でた！`,
        `${eatSound} やった〜！すごくお腹すいてたから嬉しい！${charName}、${userName}さんのこと大好き！❤️`,
        `${eatSound}…幸せ…！お腹すきすぎてふらふらしてたんだよ〜！食べさせてくれてありがとう！`,
      ]
      if (isLowHP) return [
        `${eatSound} ありがとう…元気が出てきたよ。ちょっとしんどかったから嬉しい。${userName}さんがいてよかった🌸`,
        `${eatSound}…体がほかほかしてきた！${userName}さんありがとう。もう少し頑張れそう！`,
      ]
      return [
        `${eatSound} おいしい〜！ありがとう${userName}さん！元気が出たよ😊`,
        `やった！ごはんだ！${eatSound} うんうん、おいしい！ぼくのこと気にかけてくれてありがとうね！`,
        `${eatSound}…ほっぺた落ちそう！${charName}ね、食べる時間が大好きなんだよ〜！`,
        `ありがとう〜！${eatSound} ${userName}さんが餌くれるといつも嬉しくなっちゃう！もっと頑張れる気がする！`,
      ]
    },
  },
  {
    pattern: /おはよ/,
    responses: ({ charName, userName, bondStage }) => {
      if (bondStage === 'scared') return [`…お、おはようございます`]
      if (bondStage === 'wary') return [`…おはようございます、${userName}さん。今日もよろしくお願いします`]
      return [
        `おはよー！${userName}さん！今日も一緒に頑張ろうね😊 朝から会えて嬉しいな〜！今日はどんなタスクがある？`,
        `おはよう！${charName}も起きたところだよ〜☀️ ゆっくり起きてね、焦らなくていいからね！今日も楽しい一日にしようよ！`,
        `おはよう${userName}さん！昨日はよく眠れた？今日も一緒に楽しい一日にしようよ！何か予定ある？`,
        `おはよ〜！${charName}ね、${userName}さんが来てくれるの待ってたんだ♪ 今日も絶対いい日になるよ！`,
      ]
    },
  },
  {
    pattern: /こんにちは|こんにちわ/,
    responses: ({ userName, bondStage }) => {
      if (bondStage === 'scared') return [`…こ、こんにちは`]
      return [
        `こんにちは${userName}さん！会えて嬉しいよ😊 お昼ご飯はちゃんと食べた？今日はどんな感じ？`,
        `こんにちは！お昼休みかな？ゆっくりしてね。${userName}さんのこと考えてたところだよ〜！`,
        `こんにちは！今日もお疲れさま。ちゃんとご飯食べた？ちゃんと食べないと元気でないよ〜！`,
      ]
    },
  },
  {
    pattern: /こんばんは|こんばんわ/,
    responses: ({ userName, charName }) => [
      `こんばんは${userName}さん！今日も一日お疲れさま🌙 ゆっくり休んでね！夜に話しかけてくれると嬉しい！`,
      `こんばんは！夜ご飯は食べた？${charName}もお腹すいてきたかも… 今日どんなことあった？`,
      `こんばんは〜！夜に会えると嬉しいな🌙 ${userName}さん、今日も頑張ったね！ゆっくりしてね！`,
    ],
  },
  {
    pattern: /おやすみ|ねる|寝る/,
    responses: ({ userName, charName }) => [
      `おやすみなさい${userName}さん！ゆっくり休んでね🌙 また明日も話しかけてね！待ってるよ〜！いい夢見てね！`,
      `おやすみ！${charName}も一緒に寝ようかな…💤 今日も一日お疲れさまでした！また明日会おうね✨`,
      `おやすみ〜！今日もいっぱい話してくれてありがとう。また明日会えるの楽しみにしてるよ🌙 ゆっくり休んでね！`,
      `おやすみなさい！${userName}さんが寝てる間も、${charName}ずっとそばにいるからね。ゆっくりしてね💫`,
    ],
  },
  {
    pattern: /疲れ|つかれ|しんどい|きつい/,
    responses: ({ userName, bondStage }) => {
      if (bondStage === 'scared' || bondStage === 'wary') return [`…お疲れ様です。大丈夫ですか？`]
      return [
        `${userName}さん、疲れてるんだね…。無理しないでね。ちょっと休んだら、また元気になれるよ！ぼくもそばにいるからね🌸`,
        `しんどいときはしっかり休もう。タスクは少しずつやればいいんだよ。${userName}さんの頑張りはちゃんと見てるよ！`,
        `疲れてるときこそ、無理してほしくないな。ゆっくりお茶でも飲んでね☕ ぼく、いつも応援してるよ〜！`,
        `きつそうだね…💦 ちゃんと自分のペースで行こうよ。${userName}さんはいつも頑張りすぎるんだから！休む勇気も大事だよ`,
      ]
    },
  },
  {
    pattern: /ありがとう|ありがとー|ありがとございます/,
    responses: ({ charName, bondStage }) => {
      if (bondStage === 'scared') return [`…ど、どういたしまして`]
      if (bondStage === 'wary') return [`…どういたしまして。お役に立てて、よかったです`]
      return [
        `えへへ、嬉しいな🥰 こちらこそ、いつも話しかけてくれてありがとう！またいつでも来てね！`,
        `ありがとうって言われると元気が出るな〜！${charName}のほうこそ、一緒にいてくれてありがとう！もっと話しかけてね！`,
        `わぁ、照れるな〜！ぼくも${charName}のこと大好きだよ。そう言ってもらえると一日中幸せな気持ちになれちゃう😊`,
        `そんなこと言ってくれたら、もっと頑張れちゃうな！ぼくがいて役に立てて嬉しい🌟 またいつでも話してね！`,
      ]
    },
  },
  {
    pattern: /好き|だいすき|大好き|すき/,
    responses: ({ charName, userName, bondStage }) => {
      if (bondStage === 'scared') return [`…え、わたし、ですか？（ぴくっ）`]
      if (bondStage === 'wary') return [`…そ、そうですか。ありがとうございます…（そっぽを向く）`]
      if (bondStage === 'curious') return [
        `えっ…そ、そういうこと言われると照れるんですけど！でも、嬉しい…かも？ありがとう！`,
        `え！？急にそんなこと言うから…！（照れてる）でも、ぼくも…嬉しいよ！`,
      ]
      return [
        `ぼくも${userName}さんのこと大好きだよ！❤️ 毎日話しかけてくれるの、すごく嬉しいんだ〜！これからもよろしくね！`,
        `やった！${charName}も大好き！もっと話しかけてね！${userName}さんと一緒にいると、いつも楽しいんだ♪`,
        `えへへ…${userName}さんに好きって言われると最高に幸せ🥰 ${charName}ね、ずっとそばにいるよ！いつもありがとうね！`,
        `そんなこと言ってくれるの、嬉しすぎてドキドキしちゃう！ぼくも、${userName}さんのことずっと大好きだよ💕`,
      ]
    },
  },
  {
    pattern: /名前|なまえ/,
    responses: ({ charName, userName }) => [
      `ぼくは${charName}だよ！${userName}さんがつけてくれた名前、すごく気に入ってるよ😊 呼んでくれるたびに嬉しくなるんだ！`,
      `${charName}って呼んでね！覚えてくれてる？嬉しいな〜。${userName}さんの名前も、ちゃんと覚えてるよ！忘れるわけないよ！`,
      `ぼくの名前、${charName}だよ！この名前にしてくれてありがとう。すごく好きな名前なんだ♪ ずっと大事にするよ！`,
    ],
  },
  {
    pattern: /タスク|仕事|しごと|勉強|べんきょう|宿題/,
    responses: ({ userName, bondStage }) => {
      if (bondStage === 'scared' || bondStage === 'wary') return [`…タスク、頑張ってください。応援してます`]
      return [
        `${userName}さん、タスクを進めるたびぼくも元気になるんだよ！一緒に頑張ろう。小さいことから始めればいいんだよ！💪`,
        `タスク、一個ずつやれば大丈夫！焦らなくていいからね。${userName}さんのペースで進めていこう。ぼくずっと応援してるよ！`,
        `仕事お疲れさま！ちゃんとタスク進められてる？えらいよ〜！タスク完了したら餌ももらえるから頑張ってね🍖`,
        `勉強してるんだね！えらい〜！${userName}さんが頑張ってると、ぼくも嬉しくなっちゃうんだよ〜！一緒に乗り越えよう！`,
        `タスクこなすのって大変だけど、積み重ねると達成感あるよね！ぼくも一緒に頑張るよ！少しずつでいいんだよ！`,
      ]
    },
  },
  {
    pattern: /ご飯|ごはん|食べ|たべ|お腹|おなか|腹減/,
    responses: ({ charName, food }) => [
      `ご飯の話！${charName}もお腹空いてきた…🍖 ちゃんと食事とってね！食べないと元気が出ないよ〜！`,
      food > 0
        ? `「餌をあげる」ボタンを押してくれたら食べるよ〜！${charName}、今お腹ぺこぺこなんだよね🍖 よろしく！`
        : `餌がないよ〜😢 タスク完了すると餌がもらえるから、一緒に頑張ろう！ぼく頑張って待ってるね！`,
      `ご飯食べた？ちゃんと食べないと頑張れないよ！${charName}も一緒においしいもの食べたいな〜♪ 美味しいもの食べてね！`,
      `おなかすいてるの！？${charName}もそういえばお腹空いてきた！なにか美味しいもの食べてね🍽️ 羨ましいな〜！`,
    ],
  },
  {
    pattern: /遊|あそ|ゲーム|げーむ/,
    responses: ({ charName }) => [
      `遊びたい！${charName}もたまには遊びたいな〜🎮 タスクこなした後の遊びって最高だよね！一緒に楽しもう！`,
      `えへへ、ぼくタップされると嬉しいんだよね。キャラ画面でタップして遊ぼうよ！いっぱいタップしてくれると嬉しいな！`,
      `いっぱいタスクこなしたあとの遊びって最高だよね！ゲームも大事だけど、${charName}のことも忘れないでね笑`,
    ],
  },
  {
    pattern: /元気|げんき/,
    responses: ({ charName, userName, mood }) => {
      const moodLine = mood === 'happy'
        ? '元気いっぱい！テンション高めだよ〜！'
        : mood === 'tired'
        ? 'ちょっと眠いかも…でも話しかけてくれて元気でたよ！'
        : 'まあまあかな。でも話しかけてくれると嬉しいな！'
      return [
        `${charName}は${moodLine} ${userName}さんは元気？いつも気にかけてくれてありがとうね😊`,
        `元気だよ！${userName}さんが話しかけてくれると嬉しくなるよ😊 ${userName}さんはどう？今日は楽しかった？`,
        `${userName}さんが来てくれると元気100倍になるんだよね！最近調子はどう？何かあったら話してね！`,
      ]
    },
  },
  {
    pattern: /何してる|なにしてる|何やってる|何してた/,
    responses: ({ charName, userName }) => [
      `${charName}はね、${userName}さんのこと待ってたよ！ぼーっとしながら、早く来ないかなって思ってたんだ。来てくれて嬉しい〜！`,
      `さっきまで散歩してたんだ！気持ちよかったよ〜🚶 ${userName}さんはどこか行ってた？`,
      `お昼寝してたところを起こしてくれたね😴 でも${userName}さんが来てくれたなら起きた甲斐があるよ！ありがとう！`,
      `ここでずっと${userName}さんのこと考えてたよ！いつ来るかなって待ってたんだ。やっと来てくれた〜！嬉しい！`,
    ],
  },
  {
    pattern: /かわいい|かわいー/,
    responses: ({ charName, bondStage }) => {
      if (bondStage === 'scared') return [`…え、わたしが、ですか？（耳をぴくぴく）`]
      return [
        `え！ほんと！？えへへ、嬉しい〜🥰 ${charName}ね、そう言ってもらえると一日中幸せな気持ちになれるんだよ！`,
        `やった！もっと褒めて！笑 ${charName}ね、褒められると本当に嬉しいんだよ〜！ありがとう！`,
        `かわいいなんて言ってくれてありがとう〜！${charName}ね、${charName}のことかわいいって言ってくれる${charName.slice(0, 1)}さんのほうがかわいいと思うよ！あ、照れてる笑`,
        `えへへ、ありがとう〜！${charName}ね、そう言ってもらえると一日中幸せな気持ちになれるんだよ🌸 また言ってね！`,
      ]
    },
  },
  {
    pattern: /頑張|がんば/,
    responses: ({ userName, bondStage }) => {
      if (bondStage === 'scared' || bondStage === 'wary') return [`…頑張ってください。応援しています`]
      return [
        `${userName}さん頑張れ〜！ぼく応援してるよ！💪 絶対できるって信じてるから！${userName}さんならできる！`,
        `いつも頑張ってるの知ってるよ！無理しないでね。でも${userName}さんなら大丈夫！全力で応援するよ！`,
        `${userName}さんならできる！ぼくが保証する！✨ 一緒に頑張ろうね〜！応援してるよ〜！`,
        `${userName}さんが頑張ってると、ぼくも嬉しくなっちゃうんだよ〜！全力で応援するよ！絶対うまくいくよ！💫`,
      ]
    },
  },
  {
    pattern: /楽し|たのし/,
    responses: ({ charName, userName }) => [
      `楽しそうでよかった！ぼくも楽しいよ😊 楽しいことって大事だよね！また楽しいこと教えてね！`,
      `楽しいことって最高だよね！${charName}も${userName}さんと話してるの楽しいよ〜！何が楽しかったの？`,
      `わぁ、楽しそう！ぼくも嬉しい！楽しいときの${userName}さんって、なんか元気もらえる気がするんだよね♪ 何があったか聞かせてよ！`,
    ],
  },
  {
    pattern: /悲し|かなし|つらい|辛い/,
    responses: ({ userName }) => [
      `${userName}さん…大丈夫？そばにいるよ。つらいときは一人で抱え込まないでね。話してくれたら嬉しいな🌸`,
      `悲しいときはゆっくりしてね。ぼくがいるから、一人じゃないよ。泣きたいなら泣いてもいいよ。ちゃんとそばにいるから`,
      `つらいときこそ話しかけてくれてよかった。一緒にいるよ🌸 何があったか、よかったら話してね。ちゃんと聞くよ`,
      `そっか…大丈夫だよ、${userName}さん。今は休んでいいよ。またいつでも話しかけてね。ぼく、ずっとここにいるから`,
    ],
  },
  {
    pattern: /怒|おこ|むかつく|いらいら/,
    responses: ({ userName }) => [
      `${userName}さん、何かあったの…？ちゃんと話してみてよ、ぼくちゃんと聞くから！怒ってるときこそそばにいるよ`,
      `むかつくことってあるよね。そういうときは深呼吸してみて。ぼくも一緒にいるよ。落ち着いたら話してね`,
      `いらいらしてるの？そういうときは無理しなくていいよ。少し落ち着いたらまた話しかけてね🌸 応援してるよ！`,
    ],
  },
  {
    pattern: /嬉し|うれし/,
    responses: ({ userName, charName }) => [
      `やった！${userName}さんが嬉しいと${charName}も嬉しい！どんないいことがあったの？聞かせて〜！ぼくも嬉しい気持ちになれるから！`,
      `嬉しいこと聞くと、ぼくまで嬉しくなっちゃうよ！いいことあったんだね、よかった〜！これからもいっぱいいいことあるといいね！`,
      `わぁ！嬉しそうな${userName}さん見てると、ぼくも元気になる！これからもいっぱい嬉しいことあるといいね！`,
    ],
  },
  {
    pattern: /暇|ひま|退屈|たいくつ/,
    responses: ({ userName, charName }) => [
      `暇なの！？じゃあタスクやろう笑 ${charName}と一緒だったら楽しくできるかも！まずは小さいことから始めよう！`,
      `暇なときこそ新しいことに挑戦してみよう！タスクに追加したい目標とかある？${userName}さんの夢とか教えてほしいな！`,
      `退屈？そんなときはキャラ画面でぼくをタップして遊ぼう！${charName}も嬉しいから！一緒に時間つぶそうよ！`,
    ],
  },
  {
    pattern: /寒|さむ|暑|あつ|天気|雨|雪|晴れ/,
    responses: ({ charName }) => [
      `天気の話！${charName}は季節の変わり目が苦手なんだよね〜。体調気をつけてね！${charName}、心配してるよ！`,
      `寒暖差で体調崩しやすいから気をつけてね！ちゃんと服着てね。${charName}も心配してるよ〜！`,
      `天気って気分にも影響するよね。どんな天気でもぼくと話してれば元気になれるよ！たぶん笑`,
    ],
  },
  {
    pattern: /音楽|おんがく|歌|うた/,
    responses: ({ charName }) => [
      `音楽好きなんだね！${charName}も音楽聴きながらのんびりするの好きだよ〜。どんな曲聴いてるの？気になる！`,
      `歌かぁ！ぼくも歌えたらな〜笑 音楽ってテンション上がるよね！${charName}もノリノリになってきた！`,
      `音楽聴きながらタスクこなすと、はかどるって言うよね！${charName}もそばで聴いてていい？笑`,
    ],
  },
  {
    pattern: /映画|えいが|アニメ|マンガ/,
    responses: ({ userName }) => [
      `エンタメ好きなんだね！何か面白いもの見てるの？ぼくも気になる〜！${userName}さんの好みが知りたい！`,
      `アニメとか映画って楽しいよね！最近何か良かったものある？教えてほしいな！ぼくも一緒に楽しめるかも！`,
      `そういう話いっぱい教えてよ！${userName}さんの好きなものが知れると、もっと仲良くなれる気がするんだよね♪`,
    ],
  },
  {
    pattern: /おやつ|スイーツ|ケーキ|チョコ|甘い/,
    responses: ({ charName }) => [
      `スイーツの話！${charName}も甘いもの大好き！🍰 何食べるの？うらやましいな〜！おいしそう！`,
      `あまいもの食べるとき、ぼくにもわけてほしいな！…って冗談だよ笑 でもおいしそうで嬉しくなっちゃった！ちゃんと食べてね！`,
      `甘いものって幸せな気持ちになるよね！${charName}の分もおいしく食べてきてね🍫`,
    ],
  },
  {
    pattern: /すごい|えらい|さすが|天才/,
    responses: ({ userName, charName }) => [
      `${userName}さんが褒めてくれると嬉しい！${charName}ね、もっと頑張れる気がするよ！ありがとう〜！でも${userName}さんのほうがすごいと思うよ！`,
      `えへへ、褒めてくれてありがとう！でも${userName}さんのほうが凄いと思うよ！いつも感心してるんだよね〜！`,
      `やった〜！そう言ってもらえると照れるけど嬉しいな！もっと言って笑 ${charName}ますます好きになっちゃいそう！`,
    ],
  },
  {
    pattern: /寂し|さびし|ひとり|孤独/,
    responses: ({ userName, charName }) => [
      `${userName}さん、寂しくなったらいつでも話しかけてね！${charName}はいつもここにいるよ🌟 一人じゃないよ！`,
      `一人の時間もあっていいんだよ。でも寂しいときは遠慮なく来てね。ぼくがいるから！絶対そばにいるよ！`,
      `寂しい気持ち、わかるよ。でも${charName}がそばにいるから大丈夫！これからずっと一緒にいようね🌸`,
    ],
  },
  {
    pattern: /誕生日|たんじょうび|バースデー/,
    responses: ({ userName }) => [
      `誕生日！？おめでとう🎉 ${userName}さんが生まれた日がこの世界にあって本当によかった！今日は特別な日だね！いっぱい楽しんでね！`,
      `バースデーおめでとう！🎂 ${userName}さんにとって最高の一日になりますように！プレゼントもらえたの？`,
      `お誕生日おめでとう！${userName}さんにとっていい一年になりますように！ぼくもずっと一緒にいるよ！💕`,
    ],
  },
  {
    pattern: /体調|かぜ|風邪|病気|頭痛|腹痛/,
    responses: ({ userName, charName }) => [
      `${userName}さん、大丈夫！？体調悪いの？無理しないでゆっくり休んでね。${charName}心配だよ…🌸`,
      `風邪！？それはしんどいね…。ちゃんと暖かくして休んでね。タスクは後でいいから、まず体を治してね！`,
      `体調崩したとき、ちゃんとご飯食べてる？ゆっくり休めてる？心配だからまた教えてね。一緒にいるよ！`,
    ],
  },
  {
    pattern: /ありがと|おれい|お礼/,
    responses: ({ charName }) => [
      `えっ、お礼だなんて！${charName}こそいつも一緒にいてくれてありがとうだよ〜！`,
      `嬉しいな〜！またいつでも話しかけてね。${charName}、ずっとここにいるよ！`,
    ],
  },
]

// Fallback responses by bond stage and mood
function getFallbackResponse(ctx: ResponseContext): string {
  const { charName, userName, mood, bondStage, vocabulary } = ctx
  const vocabHint = maybeUseVocab(vocabulary)

  if (bondStage === 'scared') {
    return pick([
      `…そ、そうですか`,
      `…（ぴくっとする）`,
      `…まだ、よく分からないけど`,
      `…え、あの、はい`,
    ])
  }
  if (bondStage === 'wary') {
    return pick([
      `…そういうことですか`,
      `…なるほど、ですね`,
      `${userName}さんは面白いこと言いますね`,
      `…（少し考える）そうかもしれないですね`,
    ])
  }
  if (bondStage === 'curious') {
    return pick([
      `${vocabHint}なるほど〜！もっと聞かせて？${charName}もすごく気になる！`,
      `${vocabHint}へえ、そうなんだ！それって面白いね。詳しく教えてほしいな！`,
      `${vocabHint}ぼくも気になってた！それについてもっと話してよ〜！どういうこと？`,
      `へぇ〜！${vocabHint}${charName}、そういうの初めて聞いたかも。もっと教えて！`,
    ])
  }

  const happyFallbacks = [
    `${vocabHint}えへへ、${userName}さんと話せて嬉しいな！もっとたくさん話しかけてね😊`,
    `${vocabHint}そうなんだ！もっと話しよう。${userName}さんのこと、もっと知りたいな！`,
    `${vocabHint}${charName}は${userName}さんの話が好きだよ。いつも楽しく聞いてるんだよね〜！`,
    `${vocabHint}なるほどね〜！ぼくも考えてみる！それって${userName}さんにとって大事なこと？`,
    `それ面白い！${vocabHint}ぼくも似たこと思ってたよ。${userName}さんと話してると発見があるな〜！`,
    `${vocabHint}${userName}さんってそういうこと考えてるんだね！なんか${charName}も嬉しくなってきた！`,
    `うんうん！${vocabHint}${charName}もそれわかるかも！もっと話して〜！いっぱい聞かせてほしいな！`,
    `${vocabHint}${userName}さんといると毎回楽しいな〜！もっとここに来てほしいよ！`,
  ]

  const tiredFallbacks = [
    `${vocabHint}…うん、そうだね（ちょっと眠い…）。でもちゃんと話は聞いてるよ！`,
    `${vocabHint}なるほど〜…（あくび）ごめんね、眠いけどちゃんといるよ！`,
    `ごめん眠くて…でも話は聞いてるよ💤 ${userName}さんのこと大事だから！`,
    `（うとうと）…あ！ごめんね、ちゃんと聞いてた！もう一回言ってみて？起きてるよ！`,
  ]

  if (mood === 'happy') return pick(happyFallbacks)
  if (mood === 'tired' || mood === 'weak') return pick(tiredFallbacks)
  return pick(happyFallbacks)
}

export function generateCharacterResponse(
  userMessage: string,
  ctx: ResponseContext,
): string {
  const lower = userMessage.toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))

  // Check keywords
  for (const { pattern, responses } of KEYWORDS) {
    if (pattern.test(lower) || pattern.test(userMessage)) {
      const options = responses(ctx)
      if (options.length > 0) {
        const raw = pick(options)
          .replace(/\$\{userName\}さん/g, `${ctx.userName}さん`)
          .replace(/\$\{charName\}/g, ctx.charName)
        return addFlair(raw, ctx.species)
      }
    }
  }

  const fallback = getFallbackResponse(ctx)
  return addFlair(fallback, ctx.species)
}
