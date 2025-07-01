'use client'

import { useState, useEffect } from 'react'
import { Lock, Eye, EyeOff, Loader2, Check, AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { gradientPresets } from '../../../components/BackgroundSettings'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success', 'error'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0) // 0-4 の強度
  const [isValidToken, setIsValidToken] = useState(false)
  const [isCheckingToken, setIsCheckingToken] = useState(true)

  const router = useRouter()
  
  // トークンの検証
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsCheckingToken(true)
        
        console.log('🔍 セッションチェック開始...');
        
        // パスワードリセットモードかどうかを確認（URLパラメータから）
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('URLパラメータ確認:', 
          accessToken ? 'アクセストークンあり' : 'アクセストークンなし', 
          type ? `タイプ: ${type}` : 'タイプなし');
        
        if (accessToken && type === 'recovery') {
          console.log('✅ 有効なリカバリートークンを検出');
          // URLからのトークンでセットアップを試みる
          try {
            // Supabase v2 APIを使用
            const { data, error: setupError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (setupError) {
              console.error('リカバリートークン設定エラー:', setupError);
              setMessage('パスワードリセットリンクが無効または期限切れです。もう一度リセットメールを送信してください。');
              setMessageType('error');
              setIsValidToken(false);
            } else {
              console.log('✅ リカバリーモード - トークン有効');
              setIsValidToken(true);
            }
          } catch (tokenError) {
            console.error('トークン設定エラー:', tokenError);
            setMessage('認証処理中にエラーが発生しました');
            setMessageType('error');
            setIsValidToken(false);
          }
        } else {
          // 現在のユーザー情報を確認
          try {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
              console.log('✅ 既存ユーザーセッションあり');
              setIsValidToken(true);
            } else {
              console.log('❌ 有効なユーザーセッションがありません');
              setMessage('パスワードリセットリンクが無効です。もう一度リセットメールを送信してください。');
              setMessageType('error');
              setIsValidToken(false);
            }
          } catch (userError) {
            console.error('ユーザーセッション確認エラー:', userError);
            setMessage('認証処理中にエラーが発生しました');
            setMessageType('error');
            setIsValidToken(false);
          }
        }
      } catch (error) {
        console.error('セッションチェックエラー:', error);
        setMessage('認証処理中にエラーが発生しました');
        setMessageType('error');
        setIsValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    }
    
    checkSession()
  }, [])

  // パスワード強度の評価
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }
    
    let strength = 0
    
    // 長さチェック (8文字以上)
    if (password.length >= 8) strength += 1
    
    // 文字種チェック
    if (/[A-Z]/.test(password)) strength += 1 // 大文字
    if (/[0-9]/.test(password)) strength += 1 // 数字
    if (/[^A-Za-z0-9]/.test(password)) strength += 1 // 特殊文字
    
    setPasswordStrength(strength)
  }, [password])

  // パスワード強度のテキストとカラー
  const getStrengthInfo = () => {
    switch (passwordStrength) {
      case 0: return { text: '弱すぎます', color: 'text-red-500', bg: 'bg-red-500', width: 'w-1/4' }
      case 1: return { text: '弱いです', color: 'text-orange-500', bg: 'bg-orange-500', width: 'w-2/4' }
      case 2: return { text: '普通です', color: 'text-yellow-500', bg: 'bg-yellow-500', width: 'w-3/4' }
      case 3: return { text: '強いです', color: 'text-lime-500', bg: 'bg-lime-500', width: 'w-full' }
      case 4: return { text: '非常に強いです', color: 'text-green-500', bg: 'bg-green-500', width: 'w-full' }
      default: return { text: '', color: '', bg: '', width: 'w-0' }
    }
  }

  const strengthInfo = getStrengthInfo()

  // フォームバリデーション
  const validateForm = () => {
    if (!password) {
      setMessage('新しいパスワードを入力してください')
      setMessageType('error')
      return false
    }
    
    if (password.length < 8) {
      setMessage('パスワードは8文字以上で入力してください')
      setMessageType('error')
      return false
    }
    
    if (passwordStrength < 2) {
      setMessage('パスワードが弱すぎます。大文字、数字、記号を含めてください')
      setMessageType('error')
      return false
    }
    
    if (password !== confirmPassword) {
      setMessage('パスワードが一致しません')
      setMessageType('error')
      return false
    }
    
    return true
  }

  // パスワード更新処理
  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setMessage('')
    setMessageType('')
    
    try {
      console.log('🔐 パスワード更新処理中...')
      
      // Supabase v2 APIを直接使用
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      console.log('✅ パスワード更新成功')
      setMessage('パスワードが正常に更新されました！')
      setMessageType('success')
      
      // 成功時は少し待ってからリダイレクト
      setTimeout(() => {
        router.push('/')
      }, 2000)
      
    } catch (error) {
      console.error('❌ パスワード更新エラー:', error)
      
      let errorMessage = 'パスワードの更新に失敗しました'
      if (error.message) {
        errorMessage = error.message
      }
      
      setMessage(errorMessage)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  // ランダムなグラデーションを選択（トロピカル〜ジュ!プリキュア）
  const randomGradient = gradientPresets[16].gradient

  // トークンチェック中の表示
  if (isCheckingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: randomGradient }}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 w-full max-w-md">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto text-pink-500 mb-4" size={40} />
            <h1 className="text-xl font-bold text-gray-800">リンクを確認中...</h1>
            <p className="text-gray-600 mt-2">少々お待ちください</p>
          </div>
        </div>
      </div>
    )
  }

  // 無効なトークンの表示
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: randomGradient }}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-500" size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-800">リンクが無効です</h1>
            <div className="mt-4 p-4 rounded-lg bg-red-50 text-red-700 text-sm">
              {message}
            </div>
          </div>
          <div className="mt-6">
            <Link href="/auth/reset-password">
              <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300">
                パスワードリセットに戻る
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // メインフォーム
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: randomGradient }}>
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
                <Shield className="text-purple-500" size={32} />
              </div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              新しいパスワードを設定
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              セキュリティのため、強力なパスワードを設定してください
            </p>
          </div>

          {/* フォーム */}
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            {/* 新しいパスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                新しいパスワード
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="8文字以上の強力なパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70"
                  disabled={loading}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* パスワード強度インジケーター */}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${strengthInfo.bg} ${strengthInfo.width} transition-all duration-300`}></div>
                  </div>
                  <p className={`text-xs font-medium ${strengthInfo.color}`}>
                    パスワード強度: {strengthInfo.text}
                  </p>
                  <ul className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <li className="flex items-center">
                      <span className={password.length >= 8 ? "text-green-500" : "text-gray-400"}>
                        {password.length >= 8 ? <Check size={12} /> : "•"}
                      </span>
                      <span className="ml-1">8文字以上</span>
                    </li>
                    <li className="flex items-center">
                      <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-gray-400"}>
                        {/[A-Z]/.test(password) ? <Check size={12} /> : "•"}
                      </span>
                      <span className="ml-1">大文字を含む</span>
                    </li>
                    <li className="flex items-center">
                      <span className={/[0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                        {/[0-9]/.test(password) ? <Check size={12} /> : "•"}
                      </span>
                      <span className="ml-1">数字を含む</span>
                    </li>
                    <li className="flex items-center">
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-500" : "text-gray-400"}>
                        {/[^A-Za-z0-9]/.test(password) ? <Check size={12} /> : "•"}
                      </span>
                      <span className="ml-1">記号を含む</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* パスワード確認 */}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white/70 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-300 bg-red-50'
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
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
                
                {/* 一致表示 */}
                {confirmPassword && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    {password === confirmPassword ? (
                      <Check className="text-green-500" size={16} />
                    ) : (
                      <AlertCircle className="text-red-500" size={16} />
                    )}
                  </div>
                )}
              </div>
              
              {/* パスワード不一致メッセージ */}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  パスワードが一致しません
                </p>
              )}
            </div>

            {/* 更新ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span>更新中...</span>
                </div>
              ) : (
                <span>パスワードを更新</span>
              )}
            </button>
          </form>

          {/* メッセージ表示 */}
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
            <p>✨ 新しいパスワードでプリキュア愛を安全に共有しよう！ ✨</p>
          </div>
        </div>
      </div>
    </div>
  )
}
