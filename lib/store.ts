import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Character, TaskStatus, TaskCategory, CharacterSpecies, DailyMission, Achievement, ChatMessage, BattleResult, InventoryItem, EquippedItems, EvolutionType } from './types'
import { extractVocabulary, generateCharacterResponse } from './chatEngine'
import { getXpToNext } from './gameEngine'
import { ITEMS, DROP_TABLES } from './itemData'
import { getAvailableEvolutions } from './evolutionEngine'

function rollDrop(table: readonly string[], chance = 0.35): string | null {
  if (Math.random() > chance) return null
  return table[Math.floor(Math.random() * table.length)]
}

function makeDummyTasks(): Task[] {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  const day = (n: number) => new Date(base.getTime() + n * 86400000).toISOString()
  return [
    { id: '1', title: '企画書を仕上げる', status: 3, deadline: day(2), category: 'work', createdAt: day(0) },
    { id: '2', title: '30分ランニング', status: 0, deadline: day(0), category: 'exercise', createdAt: day(0) },
    { id: '3', title: 'TypeScript本 第3章', status: 1, deadline: day(4), category: 'study', createdAt: day(0) },
    { id: '4', title: '週次レポート提出', status: 4, deadline: day(1), category: 'work', createdAt: day(0) },
    { id: '5', title: 'チームMTG準備', status: 2, deadline: day(3), category: 'team', createdAt: day(0) },
    { id: '6', title: '部屋の片付け', status: 0, deadline: day(5), category: 'personal', createdAt: day(0) },
  ]
}

function generateDailyMissions(dateStr: string): DailyMission[] {
  // 日付をシードとして毎日同じミッションを生成
  const seed = dateStr.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pool: Omit<DailyMission, 'progress' | 'completed' | 'claimed'>[] = [
    { id: 'complete3', title: 'タスクを3個完了する', emoji: '✅', type: 'complete_tasks', target: 3, rewardXp: 100, rewardFood: 2 },
    { id: 'complete5', title: 'タスクを5個完了する', emoji: '🏆', type: 'complete_tasks', target: 5, rewardXp: 200, rewardFood: 3 },
    { id: 'tap10', title: 'キャラクターを10回タップ', emoji: '👆', type: 'tap_character', target: 10, rewardXp: 50, rewardFood: 1 },
    { id: 'feed2', title: '餌を2回あげる', emoji: '🍖', type: 'feed_character', target: 2, rewardXp: 60, rewardFood: 0 },
    { id: 'progress5', title: 'タスクを5段階進める', emoji: '⚡', type: 'progress_tasks', target: 5, rewardXp: 80, rewardFood: 1 },
    { id: 'complete_work', title: '仕事タスクを完了する', emoji: '💼', type: 'complete_category', target: 1, rewardXp: 70, rewardFood: 1 },
    { id: 'complete_study', title: '勉強タスクを完了する', emoji: '📚', type: 'complete_category', target: 1, rewardXp: 70, rewardFood: 1 },
    { id: 'complete_exercise', title: '運動タスクを完了する', emoji: '💪', type: 'complete_category', target: 1, rewardXp: 70, rewardFood: 1 },
    { id: 'tap20', title: 'キャラクターを20回タップ', emoji: '💝', type: 'tap_character', target: 20, rewardXp: 120, rewardFood: 2 },
    { id: 'complete2', title: 'タスクを2個完了する', emoji: '🎯', type: 'complete_tasks', target: 2, rewardXp: 60, rewardFood: 1 },
  ]
  // seedで3つ選ぶ
  const picks: DailyMission[] = []
  const used = new Set<number>()
  for (let i = 0; i < 3; i++) {
    let idx = (seed * (i + 1) * 7 + i * 13) % pool.length
    while (used.has(idx)) idx = (idx + 1) % pool.length
    used.add(idx)
    picks.push({ ...pool[idx], id: pool[idx].id + '_' + dateStr, progress: 0, completed: false, claimed: false })
  }
  return picks
}

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlockedAt'>[] = [
  { id: 'first_task',    title: '初めての一歩',     desc: 'タスクを初めて完了した',     emoji: '🌟' },
  { id: 'tasks_10',      title: 'コツコツ屋',       desc: 'タスクを10個完了した',        emoji: '🔟' },
  { id: 'tasks_50',      title: '努力家',           desc: 'タスクを50個完了した',        emoji: '💪' },
  { id: 'tasks_100',     title: '伝説のタスカー',   desc: 'タスクを100個完了した',       emoji: '👑' },
  { id: 'level_5',       title: '成長中',           desc: 'レベル5に到達した',           emoji: '🌱' },
  { id: 'level_10',      title: '一人前',           desc: 'レベル10に到達した',          emoji: '⚡' },
  { id: 'level_20',      title: 'マスター',         desc: 'レベル20に到達した',          emoji: '✨' },
  { id: 'bond_friendly', title: '仲良し',           desc: 'キャラクターと仲良しになった', emoji: '🤝' },
  { id: 'bond_loving',   title: '大親友',           desc: 'キャラクターと大好きになった', emoji: '💖' },
  { id: 'streak_3',      title: '三日坊主卒業',     desc: '3日連続ログインした',         emoji: '🔥' },
  { id: 'streak_7',      title: '一週間継続',       desc: '7日連続ログインした',         emoji: '🗓️' },
  { id: 'streak_30',     title: '習慣化マスター',   desc: '30日連続ログインした',        emoji: '🏅' },
  { id: 'all_categories', title: '全ジャンル制覇',  desc: '全カテゴリのタスクを完了した', emoji: '🌈' },
  { id: 'feed_10',       title: '食いしん坊',       desc: '餌を10回あげた',              emoji: '🍖' },
]

interface GameStore {
  isOnboarded: boolean
  userName: string
  tasks: Task[]
  character: Character
  showLevelUp: boolean
  levelUpData: { level: number } | null
  _hasHydrated: boolean
  soundEnabled: boolean
  inviteCode: string

  // ゲーム機能
  dailyMissions: DailyMission[]
  lastMissionDate: string
  achievements: Achievement[]
  totalTapsToday: number
  totalFeedCount: number
  totalProgressSteps: number  // 当日のタスク進捗ステップ数

  completeOnboarding: (userName: string, charName: string, species: CharacterSpecies) => void
  setHasHydrated: (v: boolean) => void
  toggleSound: () => void
  addTask: (title: string, category: TaskCategory, deadline?: string) => void
  updateTaskStatus: (id: string, status: TaskStatus) => void
  editTask: (id: string, updates: Partial<Pick<Task, 'title' | 'category' | 'deadline' | 'status'>>) => void
  deleteTask: (id: string) => void
  feedCharacter: () => void
  tapCharacter: () => void
  dailyLogin: () => void
  dismissLevelUp: () => void
  claimMission: (id: string) => void

  // チャット
  chatHistory: ChatMessage[]
  characterVocabulary: string[]
  sendUserMessage: (text: string) => string  // adds user msg, returns generated response text
  addCharacterMessage: (text: string) => void
  clearChatHistory: () => void

  // バトル
  lastBattleResult: BattleResult | null
  lastBattleDate: string
  lastWeeklyBossDate: string
  applyBattleResult: (result: BattleResult) => void

  // 持ち物
  inventory: InventoryItem[]
  equippedItems: EquippedItems
  addToInventory: (itemId: string, quantity?: number) => void
  useItem: (itemId: string) => boolean
  equipItem: (itemId: string) => void
  unequipItem: (slot: keyof EquippedItems) => void

  // 進化
  pendingEvolution: boolean
  confirmEvolution: (type: EvolutionType) => void
  dismissEvolution: () => void

  // 通知
  lastItemDrop: { itemId: string; quantity: number } | null
  clearItemDrop: () => void

  // 設定
  changeUserName: (name: string) => void
  changeCharacterName: (name: string) => void
  resetGame: () => void
}

const initialCharacter: Character = {
  name: 'Lumie',
  level: 1,
  xp: 0,
  xpToNext: getXpToNext(1),
  hp: 80,
  hunger: 20,
  mood: 70,
  food: 0,
  totalTasksCompleted: 0,
  taskCategoryCounts: { work: 0, study: 0, exercise: 0, personal: 0, team: 0 },
  bondLevel: 5,
  tapCountToday: 0,
  streak: 0,
}

function checkAndUnlockAchievements(
  character: Character,
  existing: Achievement[]
): Achievement[] {
  const unlockedIds = new Set(existing.map((a) => a.id))
  const newAchievements: Achievement[] = [...existing]
  const now = new Date().toISOString()

  const tryUnlock = (id: string) => {
    if (!unlockedIds.has(id)) {
      const def = ACHIEVEMENT_DEFS.find((a) => a.id === id)
      if (def) {
        newAchievements.push({ ...def, unlockedAt: now })
        unlockedIds.add(id)
      }
    }
  }

  if (character.totalTasksCompleted >= 1) tryUnlock('first_task')
  if (character.totalTasksCompleted >= 10) tryUnlock('tasks_10')
  if (character.totalTasksCompleted >= 50) tryUnlock('tasks_50')
  if (character.totalTasksCompleted >= 100) tryUnlock('tasks_100')
  if (character.level >= 5) tryUnlock('level_5')
  if (character.level >= 10) tryUnlock('level_10')
  if (character.level >= 20) tryUnlock('level_20')

  const counts = character.taskCategoryCounts
  if (['work','study','exercise','personal','team'].every((c) => (counts[c] || 0) > 0)) tryUnlock('all_categories')

  return newAchievements
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      userName: '雄亮',
      tasks: [],
      character: initialCharacter,
      showLevelUp: false,
      levelUpData: null,
      _hasHydrated: false,
      soundEnabled: true,
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      dailyMissions: [],
      lastMissionDate: '',
      achievements: [],
      totalTapsToday: 0,
      totalFeedCount: 0,
      totalProgressSteps: 0,
      chatHistory: [],
      characterVocabulary: [],
      lastBattleResult: null,
      lastBattleDate: '',
      lastWeeklyBossDate: '',
      inventory: [],
      equippedItems: {},
      pendingEvolution: false,
      lastItemDrop: null,

      setHasHydrated: (v) => set({ _hasHydrated: v }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      completeOnboarding: (userName, charName, species) => {
        const today = new Date().toDateString()
        set({
          isOnboarded: true,
          userName,
          tasks: makeDummyTasks(),
          character: { ...initialCharacter, name: charName, characterSpecies: species },
          dailyMissions: generateDailyMissions(today),
          lastMissionDate: today,
        })
      },

      addTask: (title, category, deadline) => {
        const task: Task = {
          id: Date.now().toString(),
          title,
          status: 0,
          deadline,
          category,
          createdAt: new Date().toISOString(),
        }
        set((s) => ({ tasks: [task, ...s.tasks] }))
      },

      updateTaskStatus: (id, status) => {
        const { tasks, character, dailyMissions, achievements, totalProgressSteps } = get()
        const task = tasks.find((t) => t.id === id)
        if (!task) return

        const isCompleting = status === 5 && task.status !== 5
        const isProgressing = status > task.status && status !== 5
        const isRegressing = status < task.status

        let xpGain = 0, hpGain = 0, moodGain = 0, foodGain = 0, hungerReduction = 0, bondGain = 0
        if (isCompleting) { xpGain = 50; hpGain = 5; moodGain = 10; foodGain = 1; hungerReduction = 10; bondGain = 2 }
        else if (isProgressing) { xpGain = 10; hpGain = 2; bondGain = 0.5 }

        let levelXp = character.xp + xpGain
        let newLevel = character.level
        let newXpToNext = character.xpToNext
        let leveledUp = false
        if (xpGain > 0 && levelXp >= character.xpToNext) {
          newLevel = character.level + 1
          newXpToNext = getXpToNext(newLevel)
          levelXp = Math.max(0, levelXp - character.xpToNext) // reset XP, carry over excess
          leveledUp = true
        }

        const newTotalCompleted = isCompleting ? character.totalTasksCompleted + 1 : character.totalTasksCompleted
        const newCategoryCounts = isCompleting
          ? { ...character.taskCategoryCounts, [task.category]: (character.taskCategoryCounts[task.category] || 0) + 1 }
          : character.taskCategoryCounts

        const newCharacter: Character = {
          ...character,
          xp: levelXp,
          level: newLevel,
          xpToNext: newXpToNext,
          hp: Math.min(100, character.hp + hpGain),
          mood: Math.min(100, character.mood + moodGain),
          food: character.food + foodGain,
          hunger: Math.max(0, character.hunger - hungerReduction),
          bondLevel: Math.min(100, character.bondLevel + bondGain),
          totalTasksCompleted: newTotalCompleted,
          taskCategoryCounts: newCategoryCounts,
        }

        // ミッション進捗更新
        const newProgressSteps = isProgressing ? totalProgressSteps + 1 : totalProgressSteps
        const updatedMissions = dailyMissions.map((m) => {
          if (m.completed) return m
          let newProgress = m.progress
          if (m.type === 'complete_tasks' && isCompleting) newProgress++
          if (m.type === 'progress_tasks' && (isProgressing || isCompleting)) newProgress++
          if (m.type === 'complete_category' && isCompleting && task.category === m.id.split('_')[1]) newProgress++
          const completed = newProgress >= m.target
          return { ...m, progress: newProgress, completed }
        })

        // アチーブメントチェック
        const newAchievements = checkAndUnlockAchievements(newCharacter, achievements)
        // 絆アチーブメント
        if (newCharacter.bondLevel >= 65 && !newAchievements.find((a) => a.id === 'bond_friendly' && a.unlockedAt)) {
          const def = ACHIEVEMENT_DEFS.find((a) => a.id === 'bond_friendly')
          if (def) newAchievements.push({ ...def, unlockedAt: new Date().toISOString() })
        }
        if (newCharacter.bondLevel >= 82 && !newAchievements.find((a) => a.id === 'bond_loving' && a.unlockedAt)) {
          const def = ACHIEVEMENT_DEFS.find((a) => a.id === 'bond_loving')
          if (def) newAchievements.push({ ...def, unlockedAt: new Date().toISOString() })
        }

        // Item drop on task complete
        let newInventory = get().inventory
        let taskDropped: string | null = null
        if (isCompleting) {
          taskDropped = rollDrop(DROP_TABLES.taskComplete)
          if (taskDropped) {
            const existing = newInventory.find(i => i.itemId === taskDropped!)
            if (existing) {
              newInventory = newInventory.map(i => i.itemId === taskDropped ? { ...i, quantity: i.quantity + 1 } : i)
            } else {
              newInventory = [...newInventory, { itemId: taskDropped, quantity: 1 }]
            }
          }
        }

        // Check evolution trigger
        const evos = getAvailableEvolutions(newCharacter)
        const pendingEvolution = evos.length > 0 && !newCharacter.evolutionType

        set({
          tasks: tasks.map((t) =>
            t.id === id
              ? { ...t, status, completedAt: isCompleting ? new Date().toISOString() : (isRegressing ? undefined : t.completedAt) }
              : t
          ),
          character: newCharacter,
          showLevelUp: leveledUp,
          levelUpData: leveledUp ? { level: newLevel } : null,
          dailyMissions: updatedMissions,
          achievements: newAchievements,
          totalProgressSteps: newProgressSteps,
          inventory: newInventory,
          pendingEvolution: pendingEvolution || get().pendingEvolution,
          lastItemDrop: taskDropped ? { itemId: taskDropped, quantity: 1 } : get().lastItemDrop,
        })
      },

      editTask: (id, updates) => {
        const { tasks } = get()
        set({
          tasks: tasks.map((t) => {
            if (t.id !== id) return t
            const updated = { ...t, ...updates }
            if (updates.status !== undefined && updates.status < 5 && t.status === 5) {
              updated.completedAt = undefined
            }
            return updated
          }),
        })
      },

      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      feedCharacter: () => {
        const { character, dailyMissions, achievements, totalFeedCount } = get()
        if (character.food <= 0) return
        const newFeedCount = totalFeedCount + 1

        const updatedMissions = dailyMissions.map((m) => {
          if (m.completed || m.type !== 'feed_character') return m
          const newProgress = m.progress + 1
          return { ...m, progress: newProgress, completed: newProgress >= m.target }
        })

        const newCharacter = {
          ...character,
          food: character.food - 1,
          hp: Math.min(100, character.hp + 15),
          hunger: Math.max(0, character.hunger - 30),
          mood: Math.min(100, character.mood + 5),
          bondLevel: Math.min(100, character.bondLevel + 1),
        }

        let newAchievements = [...achievements]
        if (newFeedCount >= 10 && !newAchievements.find((a) => a.id === 'feed_10')) {
          const def = ACHIEVEMENT_DEFS.find((a) => a.id === 'feed_10')
          if (def) newAchievements.push({ ...def, unlockedAt: new Date().toISOString() })
        }

        set({ character: newCharacter, dailyMissions: updatedMissions, achievements: newAchievements, totalFeedCount: newFeedCount })
      },

      tapCharacter: () => {
        const { character, dailyMissions } = get()
        const today = new Date().toDateString()
        const isSameDay = character.lastTapDate === today
        const tapCountToday = isSameDay ? character.tapCountToday : 0
        const bondGain = tapCountToday < 5 ? 0.5 : 0
        const newTapCount = tapCountToday + 1

        const updatedMissions = dailyMissions.map((m) => {
          if (m.completed || m.type !== 'tap_character') return m
          const newProgress = m.progress + 1
          return { ...m, progress: newProgress, completed: newProgress >= m.target }
        })

        set({
          character: {
            ...character,
            bondLevel: Math.min(100, character.bondLevel + bondGain),
            tapCountToday: newTapCount,
            lastTapDate: today,
          },
          dailyMissions: updatedMissions,
        })
      },

      dailyLogin: () => {
        const { character, achievements } = get()
        const today = new Date().toDateString()
        if (character.lastLoginDate === today) return

        // ストリーク計算
        let newStreak = 1
        if (character.lastLoginDate) {
          const last = new Date(character.lastLoginDate)
          const now = new Date()
          now.setHours(0, 0, 0, 0)
          last.setHours(0, 0, 0, 0)
          const diff = Math.floor((now.getTime() - last.getTime()) / 86400000)
          newStreak = diff === 1 ? (character.streak || 0) + 1 : 1
        }

        // 放置ペナルティ
        let daysAbsent = 0
        if (character.lastLoginDate) {
          const last = new Date(character.lastLoginDate)
          const now = new Date()
          now.setHours(0, 0, 0, 0); last.setHours(0, 0, 0, 0)
          daysAbsent = Math.floor((now.getTime() - last.getTime()) / 86400000) - 1
        }
        let bondDecay = 0
        if (daysAbsent >= 5) bondDecay = 15
        else if (daysAbsent >= 3) bondDecay = 10
        else if (daysAbsent >= 2) bondDecay = 5
        else if (daysAbsent >= 1) bondDecay = 2
        const hpDecay = Math.min(50, daysAbsent * 8)

        // ストリーク実績
        let newAchievements = [...achievements]
        const tryUnlockAch = (id: string) => {
          if (!newAchievements.find((a) => a.id === id)) {
            const def = ACHIEVEMENT_DEFS.find((a) => a.id === id)
            if (def) newAchievements.push({ ...def, unlockedAt: new Date().toISOString() })
          }
        }
        if (newStreak >= 3) tryUnlockAch('streak_3')
        if (newStreak >= 7) tryUnlockAch('streak_7')
        if (newStreak >= 30) tryUnlockAch('streak_30')

        // ミッションリセット
        const missions = generateDailyMissions(today)

        // Daily login item drop
        let newInventory = get().inventory
        const loginDrop = rollDrop(DROP_TABLES.dailyLogin, 0.5)
        if (loginDrop) {
          const existing = newInventory.find(i => i.itemId === loginDrop)
          if (existing) {
            newInventory = newInventory.map(i => i.itemId === loginDrop ? { ...i, quantity: i.quantity + 1 } : i)
          } else {
            newInventory = [...newInventory, { itemId: loginDrop, quantity: 1 }]
          }
        }

        // streak 7 drop
        if (newStreak >= 7 && newStreak % 7 === 0) {
          const streakDrop = DROP_TABLES.streak7[Math.floor(Math.random() * DROP_TABLES.streak7.length)]
          const existing = newInventory.find(i => i.itemId === streakDrop)
          if (existing) {
            newInventory = newInventory.map(i => i.itemId === streakDrop ? { ...i, quantity: i.quantity + 1 } : i)
          } else {
            newInventory = [...newInventory, { itemId: streakDrop, quantity: 1 }]
          }
        }

        set({
          character: {
            ...character,
            hp: Math.max(5, character.hp - hpDecay + 2),
            xp: character.xp + 5,
            bondLevel: Math.max(0, character.bondLevel - bondDecay + 1),
            lastLoginDate: today,
            streak: newStreak,
          },
          dailyMissions: missions,
          lastMissionDate: today,
          totalTapsToday: 0,
          totalFeedCount: 0,
          totalProgressSteps: 0,
          achievements: newAchievements,
          inventory: newInventory,
        })
      },

      dismissLevelUp: () => set({ showLevelUp: false, levelUpData: null }),

      sendUserMessage: (text) => {
        const { character, userName, chatHistory, characterVocabulary } = get()
        const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text,
          timestamp: new Date().toISOString(),
        }

        // Extract new vocabulary
        const newWords = extractVocabulary(text)
        const updatedVocab = [...new Set([...characterVocabulary, ...newWords])].slice(-30)

        // Generate response (but don't add to history yet)
        const { getCharacterMood, getBondStage } = require('./gameEngine')
        const mood = getCharacterMood(character.hp)
        const bondStage = getBondStage(character.bondLevel)
        const responseText = generateCharacterResponse(text, {
          charName: character.name,
          userName,
          mood,
          bondStage,
          history: chatHistory.slice(-10),
          vocabulary: updatedVocab,
          food: character.food,
          species: character.characterSpecies,
          hunger: character.hunger,
          hp: character.hp,
        })

        set({
          chatHistory: [...chatHistory.slice(-50), userMsg],
          characterVocabulary: updatedVocab,
        })

        return responseText
      },

      addCharacterMessage: (text) => {
        const { chatHistory } = get()
        const charMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'character',
          text,
          timestamp: new Date().toISOString(),
        }
        set({ chatHistory: [...chatHistory, charMsg] })
      },

      clearChatHistory: () => set({ chatHistory: [] }),

      applyBattleResult: (result) => {
        const { character, inventory, lastWeeklyBossDate } = get()
        let levelXp = character.xp + result.xpGained
        let newLevel = character.level
        let newXpToNext = character.xpToNext
        let leveledUp = false
        if (levelXp >= character.xpToNext) {
          newLevel = character.level + 1
          newXpToNext = getXpToNext(newLevel)
          levelXp = Math.max(0, levelXp - character.xpToNext)
          leveledUp = true
        }

        // Item drop from battle
        const dropTable = result.isWeeklyBoss ? DROP_TABLES.weeklyBoss : DROP_TABLES.battleWin
        const dropped = result.won ? rollDrop(dropTable, result.isWeeklyBoss ? 1.0 : 0.4) : null
        let newInventory = inventory
        if (dropped) {
          const existing = newInventory.find(i => i.itemId === dropped)
          if (existing) {
            newInventory = newInventory.map(i => i.itemId === dropped ? { ...i, quantity: i.quantity + 1 } : i)
          } else {
            newInventory = [...newInventory, { itemId: dropped, quantity: 1 }]
          }
        }

        const newChar: Character = {
          ...character,
          xp: levelXp,
          level: newLevel,
          xpToNext: newXpToNext,
          food: character.food + result.foodGained,
        }
        const evos = getAvailableEvolutions(newChar)
        const pendingEvolution = evos.length > 0 && !newChar.evolutionType

        set({
          lastBattleResult: { ...result, itemDropped: dropped ?? undefined },
          lastBattleDate: new Date().toDateString(),
          lastWeeklyBossDate: result.isWeeklyBoss ? new Date().toDateString() : lastWeeklyBossDate,
          character: newChar,
          showLevelUp: leveledUp,
          levelUpData: leveledUp ? { level: newLevel } : null,
          inventory: newInventory,
          pendingEvolution: pendingEvolution || get().pendingEvolution,
          lastItemDrop: dropped ? { itemId: dropped, quantity: 1 } : get().lastItemDrop,
        })
      },

      claimMission: (id) => {
        const { dailyMissions, character, inventory } = get()
        const mission = dailyMissions.find((m) => m.id === id)
        if (!mission || !mission.completed || mission.claimed) return

        // Item drop on mission claim
        let newInventory = inventory
        const dropped = rollDrop(DROP_TABLES.missionClaim, 0.45)
        if (dropped) {
          const existing = newInventory.find(i => i.itemId === dropped)
          if (existing) {
            newInventory = newInventory.map(i => i.itemId === dropped ? { ...i, quantity: i.quantity + 1 } : i)
          } else {
            newInventory = [...newInventory, { itemId: dropped, quantity: 1 }]
          }
        }

        set({
          dailyMissions: dailyMissions.map((m) => m.id === id ? { ...m, claimed: true } : m),
          character: {
            ...character,
            xp: character.xp + mission.rewardXp,
            food: character.food + mission.rewardFood,
          },
          inventory: newInventory,
          lastItemDrop: dropped ? { itemId: dropped, quantity: 1 } : get().lastItemDrop,
        })
      },

      addToInventory: (itemId, quantity = 1) => {
        const { inventory } = get()
        const existing = inventory.find(i => i.itemId === itemId)
        if (existing) {
          set({ inventory: inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i), lastItemDrop: { itemId, quantity } })
        } else {
          set({ inventory: [...inventory, { itemId, quantity }], lastItemDrop: { itemId, quantity } })
        }
      },

      useItem: (itemId) => {
        const { inventory, character } = get()
        const slot = inventory.find(i => i.itemId === itemId)
        if (!slot || slot.quantity <= 0) return false
        const item = ITEMS[itemId]
        if (!item || item.isEquippable) return false

        const eff = item.effect
        const newChar: Character = {
          ...character,
          hp: eff.hp ? Math.min(100, character.hp + eff.hp) : character.hp,
          hunger: eff.hungerReduce ? Math.max(0, character.hunger - eff.hungerReduce) : character.hunger,
          mood: eff.moodBoost ? Math.min(100, character.mood + eff.moodBoost) : character.mood,
          xp: eff.xpBonus ? character.xp + eff.xpBonus : character.xp,
          bondLevel: eff.bondBonus ? Math.min(100, character.bondLevel + eff.bondBonus) : character.bondLevel,
        }

        const newInventory = inventory
          .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)

        set({ inventory: newInventory, character: newChar })
        return true
      },

      equipItem: (itemId) => {
        const { inventory, equippedItems } = get()
        const slot = inventory.find(i => i.itemId === itemId)
        if (!slot || slot.quantity <= 0) return
        const item = ITEMS[itemId]
        if (!item || !item.isEquippable) return

        // Determine slot type by item id
        const slotKey: keyof EquippedItems =
          item.category === 'equipment'
            ? item.id.includes('glasses') || item.id.includes('hachimaki') || item.id.includes('crown') ? 'head'
            : item.id.includes('cape') || item.id.includes('armor') ? 'armor'
            : 'accessory'
            : 'accessory'

        const newInventory = inventory
          .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)

        // Return currently equipped item to inventory if any
        let returnInv = newInventory
        const currentEquipped = equippedItems[slotKey]
        if (currentEquipped) {
          const existing = returnInv.find(i => i.itemId === currentEquipped)
          if (existing) {
            returnInv = returnInv.map(i => i.itemId === currentEquipped ? { ...i, quantity: i.quantity + 1 } : i)
          } else {
            returnInv = [...returnInv, { itemId: currentEquipped, quantity: 1 }]
          }
        }

        set({
          inventory: returnInv,
          equippedItems: { ...equippedItems, [slotKey]: itemId },
        })
      },

      unequipItem: (slot) => {
        const { inventory, equippedItems } = get()
        const itemId = equippedItems[slot]
        if (!itemId) return

        const existing = inventory.find(i => i.itemId === itemId)
        const newInventory = existing
          ? inventory.map(i => i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i)
          : [...inventory, { itemId, quantity: 1 }]

        set({
          inventory: newInventory,
          equippedItems: { ...equippedItems, [slot]: undefined },
        })
      },

      confirmEvolution: (type) => {
        const { character } = get()
        set({
          character: { ...character, evolutionType: type },
          pendingEvolution: false,
        })
      },

      dismissEvolution: () => set({ pendingEvolution: false }),

      clearItemDrop: () => set({ lastItemDrop: null }),

      changeUserName: (name) => set({ userName: name }),
      changeCharacterName: (name) => {
        const { character } = get()
        set({ character: { ...character, name } })
      },
      resetGame: () => {
        // Clear persisted store by changing name then reload
        try { localStorage.removeItem('taskling-store-v5') } catch {}
        window.location.reload()
      },
    }),
    {
      name: 'taskling-store-v5',
      skipHydration: true,
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<GameStore>
        const pc = p.character as Partial<typeof current.character> | undefined
        const today = new Date().toDateString()
        return {
          ...current,
          ...p,
          soundEnabled: p.soundEnabled ?? true,
          inviteCode: p.inviteCode ?? Math.random().toString(36).slice(2, 8).toUpperCase(),
          achievements: p.achievements ?? [],
          dailyMissions: p.lastMissionDate === today ? (p.dailyMissions ?? []) : generateDailyMissions(today),
          lastMissionDate: today,
          totalTapsToday: p.lastMissionDate === today ? (p.totalTapsToday ?? 0) : 0,
          totalFeedCount: p.lastMissionDate === today ? (p.totalFeedCount ?? 0) : 0,
          totalProgressSteps: p.lastMissionDate === today ? (p.totalProgressSteps ?? 0) : 0,
          chatHistory: p.chatHistory ?? [],
          characterVocabulary: p.characterVocabulary ?? [],
          lastBattleResult: p.lastBattleResult ?? null,
          lastBattleDate: p.lastBattleDate ?? '',
          lastWeeklyBossDate: p.lastWeeklyBossDate ?? '',
          inventory: p.inventory ?? [],
          equippedItems: p.equippedItems ?? {},
          pendingEvolution: p.pendingEvolution ?? false,
          lastItemDrop: null,
          character: {
            ...current.character,
            ...(pc ?? {}),
            bondLevel: pc?.bondLevel ?? 5,
            tapCountToday: pc?.tapCountToday ?? 0,
            characterSpecies: pc?.characterSpecies ?? 'lumie',
            streak: pc?.streak ?? 0,
            // Recalculate from level to fix old saves and formula changes
            xpToNext: getXpToNext(pc?.level ?? 1),
            xp: Math.min(pc?.xp ?? 0, Math.max(0, getXpToNext(pc?.level ?? 1) - 1)),
          },
        }
      },
    }
  )
)
