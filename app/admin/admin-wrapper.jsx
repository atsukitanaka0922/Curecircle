'use client'

import { useSession } from 'next-auth/react'
import { Shield, Settings } from 'lucide-react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Admin用のシンプルなラッパーコンポーネント
 * Auth機能を強化します
 */
export default function AdminWrapper({ children }) {
  const { status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    // 認証状態をチェック
    if (status === 'unauthenticated') {
      console.log('未認証状態でadminページにアクセスしました - リダイレクト')
      // ホームページに一度戻し、そこからログインさせる（より安全なフロー）
      window.location.href = '/' 
    }
  }, [status, router])
  
  // 認証中は読み込み表示
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">認証を確認中...</p>
        </div>
      </div>
    )
  }
  
  // 認証済みの場合のみコンテンツを表示
  return (
    <div className="admin-wrapper">
      <div className="py-2 bg-pink-500 text-white text-center text-sm">
        <Shield className="inline-block w-4 h-4 mr-1" />
        <span>管理者モード</span>
        <Settings className="inline-block w-4 h-4 ml-1" />
      </div>
      {children}
    </div>
  )
}
