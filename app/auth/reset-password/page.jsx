'use client'

import { useState } from 'react'
import { Mail, Loader2, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { gradientPresets } from '../../../components/BackgroundSettings'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error'

  // メールアドレスのバリデーション
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // パスワードリセットメール送信
  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    // バリデーション
    if (!email) {
      setMessage('メールアドレスを入力してください')
      setMessageType('error')
      return
    }
    
    if (!validateEmail(email)) {
      setMessage('有効なメールアドレスを入力してください')
      setMessageType('error')
      return
    }
      setLoading(true)
    setMessage('')
    setMessageType('')
    
    try {      console.log('🔄 パスワードリセットメール送信中:', email)
      
      // Supabase v2 APIを使用
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      })
      
      if (error) throw error
      
      console.log('✅ パスワードリセットメール送信成功')
      setMessage(`「${email}」宛にパスワードリセットリンクを送信しました。メールをご確認ください。迷惑メールフォルダも確認してください。リンクをクリックして新しいパスワードを設定してください。`)
      setMessageType('success')
      setEmail('')
      
    } catch (error) {
      console.error('❌ パスワードリセットエラー:', error)
      
      let errorMessage = 'パスワードリセットメールの送信に失敗しました'
      if (error.message?.includes('rate limit')) {
        errorMessage = '送信回数の制限に達しました。しばらく待ってから再度お試しください。'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }
  // ランダムなグラデーションを選択（Yes!プリキュア5のグラデーション）
  const randomGradient = gradientPresets[3].gradient 
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: randomGradient }}>
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center border-4 border-pink-200">
                <Mail className="text-pink-500" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              パスワードリセット
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              登録したメールアドレスにパスワードリセットリンクを送信します
            </p>
          </div>          {/* フォーム */}
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>送信中...</span>
                </div>
              ) : (
                <span>パスワードリセットリンクを送信</span>
              )}
            </button>
          </form>          {/* メッセージ表示 */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-start space-x-2">
                {messageType === 'success' ? (
                  <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                )}
                <div className="whitespace-pre-line">{message}</div>
              </div>
            </div>
          )}

          {/* 戻るリンク */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              ログイン画面に戻る
            </Link>
          </div>

          {/* フッター */}
          <div className="text-center mt-6 text-xs text-gray-500">
            <p>✨ パスワードを再設定して、プリキュア愛を共有しよう！ ✨</p>
          </div>
        </div>
      </div>
    </div>
  )
}
