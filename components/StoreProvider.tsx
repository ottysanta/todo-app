'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/store'

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    // localStorageからリストア
    useGameStore.persist.rehydrate()
    // onRehydrateStorage は localStorage が空だと state=undefined になり
    // setHasHydrated が呼ばれないため、ここで必ず true にする
    useGameStore.setState({ _hasHydrated: true })
  }, [])

  return <>{children}</>
}
