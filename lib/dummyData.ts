import type { TeamMember } from './types'

// チームダミーデータ（Taskのダミーはstore.tsのmakeDummyTasks()に移動）
export const dummyTeam: TeamMember[] = [
  {
    id: 't1',
    name: '田中 彩花',
    avatar: '🌸',
    level: 8,
    hp: 85,
    mood: 90,
    evolutionType: 'leader',
    lastActive: '1時間前',
  },
  {
    id: 't2',
    name: '鈴木 大輝',
    avatar: '⚡',
    level: 5,
    hp: 45,
    mood: 60,
    evolutionType: 'warrior',
    lastActive: '3時間前',
  },
  {
    id: 't3',
    name: '山本 葵',
    avatar: '🌿',
    level: 12,
    hp: 92,
    mood: 95,
    evolutionType: 'steady',
    lastActive: '30分前',
  },
  {
    id: 't4',
    name: '伊藤 蓮',
    avatar: '📚',
    level: 7,
    hp: 20,
    mood: 30,
    evolutionType: 'scholar',
    lastActive: '2日前',
  },
]
