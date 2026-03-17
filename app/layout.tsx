import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import StoreProvider from '@/components/StoreProvider'
import ItemDropToast from '@/components/ItemDropToast'

export const metadata: Metadata = {
  title: 'Taskling',
  description: 'タスクをこなしてキャラクターを育てよう',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Taskling',
  },
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-[#0f0f1a] min-h-screen">
        <StoreProvider>
          <div className="max-w-[430px] mx-auto relative min-h-screen">
            <main className="pb-20">{children}</main>
            <BottomNav />
            <ItemDropToast />
          </div>
        </StoreProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
          }}
        />
      </body>
    </html>
  )
}
