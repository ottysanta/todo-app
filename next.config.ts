import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Turbopack 使用時はwebpackメモリ問題を回避できるが念のため設定
  experimental: {
    // ファイルトレース対象を最小化
  },
}
export default nextConfig
