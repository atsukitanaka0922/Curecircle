/**
 * app/admin/layout.jsx - 管理者ページレイアウトコンポーネント
 * 
 * すべての管理者ページで共有されるレイアウトコンポーネント。
 * 認証や共通UIを提供します。
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

'use client'

import { Suspense } from 'react'
import { SessionProvider } from 'next-auth/react'
import PrecureLoader from '@/components/PrecureLoader'
import AdminWrapper from './admin-wrapper'

// レイアウトコンポーネント - 'use client'ディレクティブを使用
export default function AdminLayout({ children }) {
  return (
    // 独自のSessionProviderを設定してルートレイアウトとの分離を確保
    <SessionProvider>
      <Suspense fallback={<PrecureLoader message="ページを読み込み中..." />}>
        <AdminWrapper>
          {children}
        </AdminWrapper>
      </Suspense>
    </SessionProvider>
  )
}

// メタデータはクライアントコンポーネントでは直接サポートされません
// Next.js 13以降では別のファイル（metadata.js）に分離するか、サーバーコンポーネントに戻す必要があります
