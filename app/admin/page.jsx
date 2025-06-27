/**
 * app/admin/page.jsx - 管理者メインページ
 * 
 * 管理者機能へのエントリーポイント。
 * 各管理機能へのリンクを提供します。
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Shield, Wrench, Settings, Users, Database, ArrowRight, LogOut, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  
  // 認証状態を確認
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    } else if (status === 'authenticated') {
      setLoading(false)
    }
  }, [status, router])
  
  // ローディング表示
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">管理者パネルを読み込み中...</p>
        </div>
      </div>
    )
  }
  
  // 未認証ユーザーをリダイレクト
  if (status === 'unauthenticated') {
    return null // useEffectでリダイレクト
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold text-gray-800">キュアサークル管理パネル</h1>
          </div>
          
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <LogOut className="h-4 w-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* パネルヘッダー */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              管理者機能
            </h2>
            <p className="text-white/80 mt-1">
              キュアサークルの管理機能にアクセスできます
            </p>
          </div>
          
          {/* パネル内容 */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* メンテナンスモード */}
              <Link href="/admin/maintenance" className="block group">
                <div className="border border-gray-200 rounded-lg p-4 transition-all hover:border-pink-300 hover:shadow-md">
                  <div className="flex items-start">
                    <div className="bg-pink-100 p-3 rounded-md">
                      <Wrench className="h-6 w-6 text-pink-500" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium text-gray-800 group-hover:text-pink-600 transition-colors">
                        メンテナンスモード管理
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        サイト全体のメンテナンスモードを有効/無効にします
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-pink-500 transition-colors" />
                  </div>
                </div>
              </Link>
              
              {/* 他の管理機能（将来的な拡張用） */}
              <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <Users className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">
                      ユーザー管理
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      準備中 - ユーザー情報の管理機能
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-start">
                  <div className="bg-gray-100 p-3 rounded-md">
                    <Database className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium text-gray-800">
                      データ管理
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      準備中 - サイトデータの管理機能
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* フッター */}
      <footer className="max-w-4xl mx-auto px-4 py-8 mt-8">
        <p className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} キュアサークル管理システム
        </p>
      </footer>
    </div>
  )
}
