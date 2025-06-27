/**
 * app/admin/layout.jsx - 管理者ページレイアウトコンポーネント
 * 
 * すべての管理者ページで共有されるレイアウトコンポーネント。
 * 認証や共通UIを提供します。
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

import '../globals.css'
import { Inter } from 'next/font/google'
import { Suspense } from 'react'
import PrecureLoader from '@/components/PrecureLoader'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'

// フォントの設定
const inter = Inter({ subsets: ['latin'] })

// メタデータ
export const metadata = {
  title: '管理者パネル - キュアサークル',
  description: 'キュアサークル管理者パネルです',
}

// レイアウトコンポーネント
export default async function AdminLayout({ children }) {
  // 管理者セッションの確認
  const session = await getServerSession(authOptions)
  
  return (
    <html lang="ja">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <Suspense fallback={<PrecureLoader message="ページを読み込み中..." />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}
