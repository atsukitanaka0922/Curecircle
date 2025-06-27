/**
 * app/admin/maintenance/page.jsx - 管理者用メンテナンスモード管理ページ
 * 
 * キュアサークルのメンテナンスモードを制御するための管理者向けページ。
 * メンテナンスモードの有効化/無効化とステータス確認が可能です。
 * 
 * 特徴:
 * - メンテナンスモードの切り替え機能
 * - 管理者認証
 * - 現在のステータス表示
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Shield, ToggleLeft, ToggleRight, AlertTriangle, Key, Loader2, CheckCircle, XCircle, Eye, EyeOff, LogOut, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export default function MaintenanceAdmin() {
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()
  const { data: session, status } = useSession()
  
  // 初期ロード時にステータスを確認
  useEffect(() => {
    console.log('認証状態:', status);
    
    if (status === 'loading') {
      // 読み込み中は何もしない
      return;
    } else if (status === 'unauthenticated') {
      console.log('未認証ユーザー - ホームページへリダイレクト');
      window.location.href = '/';
    } else if (status === 'authenticated') {
      console.log('認証済みユーザー - メンテナンス状態確認');
      checkMaintenanceStatus();
    } else {
      // 不明な状態の場合はとりあえず状態確認
      console.log('不明な認証状態 - メンテナンス状態確認');
      checkMaintenanceStatus();
    }
  }, [status, router])
  
  // メンテナンスモードの状態を確認
  const checkMaintenanceStatus = async () => {
    setStatusLoading(true)
    setError('')
    
    try {
      // デバッグログを追加
      console.log('APIリクエスト開始: /api/admin/maintenance')
      
      // fetchのタイムアウトを回避するためのAbortControllerを設定
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒でタイムアウト
      
      const response = await fetch('/api/admin/maintenance', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      console.log('APIレスポンス受信:', response.status);
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '管理者APIへのアクセスに失敗しました')
      }
      
      setMaintenanceMode(data.maintenanceMode)
      console.log('メンテナンスステータス:', data)
    } catch (error) {
      console.error('ステータス確認エラー:', error)
      
      // 環境変数から直接取得（フォールバック）
      try {
        setMaintenanceMode(process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true')
        console.log('環境変数から取得したメンテナンスモード:', process.env.NEXT_PUBLIC_MAINTENANCE_MODE)
      } catch (envError) {
        console.error('環境変数取得エラー:', envError)
      }
      
      setError('ステータスの確認に失敗しました: ' + error.message)
    } finally {
      setStatusLoading(false)
      setLoading(false)
    }
  }
  
  // メンテナンスモードの切り替え
  const toggleMaintenanceMode = async () => {
    if (!adminPassword) {
      setError('管理者パスワードを入力してください')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enable: !maintenanceMode,
          adminPassword
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'メンテナンスモードの切り替えに失敗しました')
      }
      
      setMaintenanceMode(data.maintenanceMode)
      setSuccess(data.message)
      
      // 実際の環境では、Vercelの環境変数を更新する必要があります
      // ここでは環境変数の更新を模擬しています
      localStorage.setItem('demo_maintenance_mode', String(data.maintenanceMode))
      
      // Vercelデプロイに関する注意書きを表示
      if (data.maintenanceMode) {
        setSuccess(
          'メンテナンスモード有効化の指示を受け付けました。実際の環境変数を反映するには、Vercelダッシュボードで NEXT_PUBLIC_MAINTENANCE_MODE=true を設定してください。'
        )
      } else {
        setSuccess(
          'メンテナンスモード無効化の指示を受け付けました。実際の環境変数を反映するには、Vercelダッシュボードで NEXT_PUBLIC_MAINTENANCE_MODE=false を設定してください。'
        )
      }
    } catch (error) {
      console.error('メンテナンスモード切り替えエラー:', error)
      setError('メンテナンスモードの切り替えに失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  // 認証確認中
  if (status === 'loading' || (status === 'authenticated' && loading && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">管理者パネルを読み込み中...</p>
        </div>
      </div>
    )
  }
  
  // 未認証の場合
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 font-medium mb-2">管理者認証が必要です</p>
          <p className="text-gray-600 mb-4">このページにアクセスするにはログインしてください</p>
          <button
            onClick={() => router.push('/api/auth/signin')}
            className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-pink-500" />
            <h1 className="text-xl font-bold text-gray-800">管理者パネル</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center space-x-1">
              <ArrowLeft className="h-4 w-4" />
              <span>ホームへ戻る</span>
            </Link>
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* パネルヘッダー */}
          <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              メンテナンスモード管理
            </h2>
            <p className="text-white/80 mt-1">
              サイト全体のメンテナンスモードを制御します
            </p>
          </div>
          
          {/* パネル内容 */}
          <div className="p-6">
            {/* 現在のステータス */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-2">現在のステータス</h3>
              
              {statusLoading ? (
                <div className="flex items-center text-gray-600">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  ステータスを確認中...
                </div>
              ) : (
                <div className={`flex items-center ${maintenanceMode ? 'text-orange-600' : 'text-green-600'}`}>
                  {maintenanceMode ? (
                    <>
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      <span className="font-medium">メンテナンスモードが有効です</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">通常モード（メンテナンスモードは無効）</span>
                    </>
                  )}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mt-2">
                メンテナンスモードが有効な場合、ユーザーはパスワードを入力しないとサイトにアクセスできません。
              </p>
            </div>
            
            {/* 管理者パスワード入力 */}
            <div className="mb-6">
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-1">
                管理者パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="管理者パスワードを入力"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                メンテナンスモードを切り替えるには管理者パスワードが必要です
              </p>
            </div>
            
            {/* モード切り替えボタン */}
            <button
              onClick={toggleMaintenanceMode}
              disabled={loading || !adminPassword}
              className={`w-full flex items-center justify-center py-3 px-4 rounded-md text-white font-medium transition-colors ${
                loading || !adminPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : maintenanceMode
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  処理中...
                </>
              ) : maintenanceMode ? (
                <>
                  <ToggleLeft className="h-5 w-5 mr-2" />
                  メンテナンスモードを無効化
                </>
              ) : (
                <>
                  <ToggleRight className="h-5 w-5 mr-2" />
                  メンテナンスモードを有効化
                </>
              )}
            </button>
            
            {/* エラーメッセージ */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 flex items-start">
                  <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </p>
              </div>
            )}
            
            {/* 成功メッセージ */}
            {success && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </p>
              </div>
            )}
            
            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
              <h4 className="font-medium text-yellow-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                重要な注意事項
              </h4>
              <p className="mt-1 text-sm text-yellow-700">
                実際の運用環境では、メンテナンスモードの切り替えはVercelのダッシュボードで環境変数
                <code className="bg-yellow-100 px-1 py-0.5 rounded">NEXT_PUBLIC_MAINTENANCE_MODE</code> を
                <code className="bg-yellow-100 px-1 py-0.5 rounded">true</code> または 
                <code className="bg-yellow-100 px-1 py-0.5 rounded">false</code> に設定する必要があります。
                このインターフェースはデモンストレーション用です。
              </p>
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
