/**
 * app/admin/layout.jsx - 管理者ページレイアウトコンポーネント
 * 
 * すべての管理者ページで共有されるレイアウトコンポーネント。
 * 認証や共通UIを提供します。
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

import { Suspense } from 'react'
import PrecureLoader from '@/components/PrecureLoader'
import AdminWrapper from './admin-wrapper'

// メタデータ
export const metadata = {
  title: '管理者パネル - キュアサークル',
  description: 'キュアサークル管理者パネルです',
}

// レイアウトコンポーネント
export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<PrecureLoader message="ページを読み込み中..." />}>
      <AdminWrapper>
        {children}
      </AdminWrapper>
    </Suspense>
  )
}
