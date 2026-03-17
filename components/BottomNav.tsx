'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'ホーム', icon: '🏠' },
  { href: '/tasks', label: 'タスク', icon: '✅' },
  { href: '/battle', label: 'バトル', icon: '⚔️' },
  { href: '/character', label: 'キャラ', icon: '🥚' },
  { href: '/inventory', label: '持ち物', icon: '🎒' },
  { href: '/team', label: 'チーム', icon: '👥' },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#1a1a2e] border-t border-white/10 flex z-50">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] transition-colors ${
              active ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="leading-tight">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
