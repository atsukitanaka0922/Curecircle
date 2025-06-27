/**
 * components/MaintenancePage.jsx - メンテナンス中ページコンポーネント
 * 
 * サイトメンテナンス中に表示されるページコンポーネント。
 * パスワード入力によるバイパス機能を提供し、管理者や許可されたユーザーのみアクセスを許可します。
 * 
 * 特徴:
 * - プリキュアテーマに合わせたデザイン
 * - パスワード入力によるバイパス機能
 * - 管理者向けのメンテナンスモード解除機能
 * - レスポンシブデザイン
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { ShieldAlert, Key, Eye, EyeOff, CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MaintenancePage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // パスワードの検証
  const verifyPassword = () => {
    setLoading(true)
    setError('')

    // 環境変数からパスワードを取得（または固定値を使用）
    const maintenancePassword = process.env.NEXT_PUBLIC_MAINTENANCE_PASSWORD || 'precure_rainbow'
    
    setTimeout(() => {
      if (password === maintenancePassword) {
        setSuccess(true)
        
        // LocalStorageにバイパストークンを保存（24時間有効）
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000) // 24時間
        localStorage.setItem('maintenance_bypass', JSON.stringify({
          bypassed: true,
          expiry: expiryTime
        }))
        
        // 3秒後にリダイレクト
        setTimeout(() => {
          router.push('/')
          router.refresh()
        }, 3000)
      } else {
        setError('パスワードが正しくありません')
        setLoading(false)
      }
    }, 1500) // 検証の演出用ディレイ
  }

  // Enterキー押下でパスワード検証
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      verifyPassword()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <ShieldAlert className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            メンテナンス中
          </h1>
          <p className="mt-2 text-gray-600">
            現在、キュアサークルはメンテナンス中です。
            ご不便をおかけして申し訳ありません。
          </p>
        </div>

        {/* パスワード入力フォーム */}
        {!success ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-500 mb-4">
              <p>管理者またはアクセス権をお持ちの方は、パスワードを入力してください。</p>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`block w-full pl-10 pr-10 py-2 border ${
                  error ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                placeholder="メンテナンスパスワード"
                disabled={loading || success}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                tabIndex="-1"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            
            {error && (
              <p className="text-sm text-red-500 flex items-center">
                <XCircle className="w-4 h-4 mr-1" />
                {error}
              </p>
            )}
            
            <button
              onClick={verifyPassword}
              disabled={loading || !password || success}
              className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                loading || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
              } transition-colors duration-300`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin w-5 h-5 mr-2" />
                  確認中...
                </span>
              ) : (
                'アクセス'
              )}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                メンテナンスは通常数時間で完了します。<br />
                ご迷惑をおかけして申し訳ありません。
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-600 mb-2">アクセス許可されました</h2>
            <p className="text-gray-600">
              キュアサークルへリダイレクトしています...
            </p>
            <div className="mt-4">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-pink-500" />
            </div>
          </div>
        )}
        
        {/* フッター */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} キュアサークル - すべての権利を尊重します
          </p>
          <div className="flex items-center justify-center mt-2">
            <Sparkles className="h-3 w-3 text-pink-400 mr-1" />
            <span className="text-xs text-pink-400">プリキュアが大好きな人たちのために</span>
          </div>
        </div>
      </div>
    </div>
  )
}
