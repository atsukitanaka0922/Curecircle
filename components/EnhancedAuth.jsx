/**
 * components/EnhancedAuth.jsx - キュアサークルの認証コンポーネント
 * 
 * ユーザー認証機能を提供するコンポーネント。サインイン、サインアップ、パスワードリセット機能を統合しています。
 * Supabase認証を利用し、メール/パスワード認証とソーシャル認証（Google）に対応しています。
 * 
 * 特徴:
 * - パスワード認証の完全サポート
 * - パスワードリセット機能
 * - Googleアカウントでのソーシャルログイン
 * - 入力バリデーションとエラーハンドリング
 * - モバイルフレンドリーなレスポンシブデザイン
 * 
 * @author CureCircle Team
 * @version 2.0.0
 */

'use client'

import { useState } from 'react'
import { Heart, Star, Sparkles, Mail, Loader2, Lock, Eye, EyeOff, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EnhancedAuth() {
  const [authMode, setAuthMode] = useState('signin') // 'signin', 'signup', 'magic'
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error', 'info'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // フォームデータの更新
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // エラーメッセージをクリア
    if (message && messageType === 'error') {
      setMessage('')
      setMessageType('')
    }
  }

  // バリデーション
  const validateForm = () => {
    // メールアドレスチェック
    if (!formData.email) {
      setMessage('メールアドレスを入力してください')
      setMessageType('error')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setMessage('有効なメールアドレスを入力してください')
      setMessageType('error')
      return false
    }

    // マジックリンク以外ではパスワードチェック
    if (authMode !== 'magic') {
      if (!formData.password) {
        setMessage('パスワードを入力してください')
        setMessageType('error')
        return false
      }

      if (formData.password.length < 6) {
        setMessage('パスワードは6文字以上で入力してください')
        setMessageType('error')
        return false
      }

      // 新規登録時のパスワード確認
      if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
        setMessage('パスワードが一致しません')
        setMessageType('error')
        return false
      }
    }

    return true
  }

  // マジックリンクログイン
  const handleMagicLinkLogin = async (e) => {
    e.preventDefault()
    
    if (!formData.email) {
      setMessage('メールアドレスを入力してください')
      setMessageType('error')
      return
    }

    try {
      setLoading(true)
      setMessage('')
      
      console.log('🔗 Sending magic link to:', formData.email)
      
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        console.error('❌ Magic link error:', error)
        throw error
      }

      console.log('✅ Magic link sent successfully')
      setMessage('メールをチェックしてマジックリンクをクリックしてください！✨ メールが届かない場合は、迷惑メールフォルダもご確認ください。')
      setMessageType('success')
      setFormData({ email: '', password: '', confirmPassword: '' })
      
    } catch (error) {
      console.error('❌ Magic link error:', error)
      
      let errorMessage = 'マジックリンクの送信に失敗しました'
      if (error.message?.includes('rate limit')) {
        errorMessage = '送信回数の制限に達しました。しばらく待ってから再度お試しください。'
      } else if (error.message?.includes('invalid email')) {
        errorMessage = '無効なメールアドレスです'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // パスワードログイン
  const handlePasswordLogin = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setMessage('')
      
      console.log('🔐 Attempting password login for:', formData.email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error('❌ Login error:', error)
        throw error
      }

      console.log('✅ Login successful:', data.user?.email)
      setMessage('ログインしました！キュアサークルへようこそ！✨')
      setMessageType('success')
      
      // フォームをクリア
      setFormData({ email: '', password: '', confirmPassword: '' })
      
      // 成功時は少し待ってからリダイレクト（メッセージを見せるため）
      setTimeout(() => {
        window.location.reload()
      }, 1500)
      
    } catch (error) {
      console.error('❌ Login error:', error)
      
      let errorMessage = 'ログインに失敗しました'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'メールアドレスまたはパスワードが間違っています。正しい情報を入力してください。'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'メールアドレスの確認が完了していません。確認メールのリンクをクリックしてからログインしてください。'
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'ログイン試行回数が上限に達しました。しばらく待ってから再度お試しください。'
      } else if (error.message?.includes('User not found')) {
        errorMessage = 'このメールアドレスは登録されていません。新規登録を行ってください。'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // 新規登録
  const handleSignUp = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      setMessage('')
      
      console.log('👤 Creating new account for:', formData.email)
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      })

      if (error) {
        console.error('❌ Signup error:', error)
        throw error
      }

      console.log('✅ Signup successful:', data.user?.email)
      
      // 確認メールが必要かどうかで分岐
      if (data.user && !data.user.email_confirmed_at) {
        setMessage('確認メールを送信しました！📧\n\nメールボックスをチェックして、確認リンクをクリックしてアカウントを有効化してください。\n\n※メールが届かない場合は迷惑メールフォルダもご確認ください。')
        setMessageType('info')
      } else {
        setMessage('アカウントを作成しました！ログインしてキュアサークルを始めましょう！✨')
        setMessageType('success')
        // 自動的にサインインモードに切り替え
        setTimeout(() => {
          setAuthMode('signin')
        }, 2000)
      }
      
      setFormData({ email: '', password: '', confirmPassword: '' })
      
    } catch (error) {
      console.error('❌ Signup error:', error)
      
      let errorMessage = 'アカウント作成に失敗しました'
      
      if (error.message?.includes('User already registered')) {
        errorMessage = 'このメールアドレスは既に登録されています。ログインを試すか、パスワードをお忘れの場合はマジックリンクをご利用ください。'
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'パスワードは6文字以上で設定してください'
      } else if (error.message?.includes('Signup is disabled')) {
        errorMessage = '現在新規登録を停止しています。しばらくしてから再度お試しください。'
      } else if (error.message?.includes('rate limit')) {
        errorMessage = '登録試行回数の制限に達しました。しばらく待ってから再度お試しください。'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // フォーム送信ハンドラー
  const handleSubmit = (e) => {
    switch (authMode) {
      case 'magic':
        return handleMagicLinkLogin(e)
      case 'signin':
        return handlePasswordLogin(e)
      case 'signup':
        return handleSignUp(e)
      default:
        e.preventDefault()
    }
  }

  // モード切り替え時の処理
  const switchMode = (newMode) => {
    setAuthMode(newMode)
    setMessage('')
    setMessageType('')
    setFormData({ email: '', password: '', confirmPassword: '' })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Heart className="text-pink-500" size={32} />
              <Sparkles className="text-purple-500" size={28} />
              <Star className="text-blue-500" size={30} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              キュアサークル
            </h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              へようこそ！
            </h2>
          </div>

          {/* 認証モード選択 */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => switchMode('signin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                authMode === 'signin'
                  ? 'bg-white shadow-md text-pink-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <LogIn size={16} />
              <span>ログイン</span>
            </button>
            <button
              onClick={() => switchMode('signup')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                authMode === 'signup'
                  ? 'bg-white shadow-md text-purple-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <UserPlus size={16} />
              <span>新規登録</span>
            </button>
            <button
              onClick={() => switchMode('magic')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg transition-all duration-200 text-sm ${
                authMode === 'magic'
                  ? 'bg-white shadow-md text-blue-600 font-semibold'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Sparkles size={16} />
              <span>マジック</span>
            </button>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* メールアドレス */}
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
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  disabled={loading}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* パスワード（マジックリンク以外） */}
            {authMode !== 'magic' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="6文字以上のパスワード"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    disabled={loading}
                    required
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* パスワード確認（新規登録時のみ） */}
            {authMode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="パスワードを再入力"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                    disabled={loading}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>
                    {authMode === 'magic' && '送信中...'}
                    {authMode === 'signin' && 'ログイン中...'}
                    {authMode === 'signup' && '登録中...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  {authMode === 'magic' && (
                    <>
                      <Sparkles size={20} />
                      <span>マジックリンクを送信</span>
                    </>
                  )}
                  {authMode === 'signin' && (
                    <>
                      <LogIn size={20} />
                      <span>ログイン</span>
                    </>
                  )}
                  {authMode === 'signup' && (
                    <>
                      <UserPlus size={20} />
                      <span>アカウント作成</span>
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          {/* メッセージ表示 */}
          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : messageType === 'info'
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-start space-x-2">
                {messageType === 'success' && <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />}
                {messageType === 'info' && <Mail size={20} className="flex-shrink-0 mt-0.5" />}
                {messageType === 'error' && <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />}
                <div className="whitespace-pre-line">{message}</div>
              </div>
            </div>
          )}

          {/* 説明文 */}
          <div className="mt-8 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              {authMode === 'magic' && (
                <div>
                  <p className="font-medium">📧 パスワード不要でログイン</p>
                  <p>メールアドレスに送られるリンクからログインできます</p>
                </div>
              )}
              {authMode === 'signin' && (
                <div>
                  <p className="font-medium">🔐 パスワードでログイン</p>
                  <p>既存のアカウントでログインしてください</p>
                </div>
              )}
              {authMode === 'signup' && (
                <div>
                  <p className="font-medium">✨ 新規アカウント作成</p>
                  <p>確認メールが送信される場合があります</p>
                </div>
              )}
            </div>

            {/* モード切り替えの提案 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              {authMode === 'signin' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">
                    アカウントをお持ちでない方は{' '}
                    <button
                      onClick={() => switchMode('signup')}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      新規登録
                    </button>
                  </p>
                  <p className="text-sm text-gray-600 my-2">
                    パスワードを忘れた方は{' '}
                    <a
                      href="/auth/reset-password"
                      className="text-pink-600 hover:text-pink-800 font-medium underline"
                      style={{textDecoration: "underline"}}
                    >
                      パスワードをリセット
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    または{' '}
                    <button
                      onClick={() => switchMode('magic')}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      マジックリンク
                    </button>
                    {' '}でログイン
                  </p>
                </div>
              )}
              {authMode === 'signup' && (
                <p className="text-xs text-gray-500">
                  既にアカウントをお持ちの方は{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-pink-600 hover:text-pink-800 font-medium"
                  >
                    ログイン
                  </button>
                </p>
              )}
              {authMode === 'magic' && (
                <p className="text-xs text-gray-500">
                  パスワードでログインする場合は{' '}
                  <button
                    onClick={() => switchMode('signin')}
                    className="text-pink-600 hover:text-pink-800 font-medium"
                  >
                    こちら
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>プリキュアは東映アニメーション株式会社の登録商標です。</p>
          <p>当サイトは個人ファンサイトであり、株式会社東映アニメーション</p>
          <p>および関連会社とは一切関係ありません。</p>
          <p>下記はサイト独自の内容に関する著作権を示すものです。</p>
          <p>© キュアサークル / よんろく@prcr_46</p>
        </div>
        
      </div>
    </div>
  )
}