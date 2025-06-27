/**
 * app/page.jsx - キュアサークルアプリケーションのメインページ
 * 
 * プリキュアファン向けのメインダッシュボードを提供するNextJSページコンポーネント。
 * ユーザー認証、プロフィール管理、画像ギャラリー、デジタルカード、
 * プレイリスト管理など様々な機能を統合したインターフェースを提供します。
 * 
 * 特徴:
 * - レスポンシブなダッシュボードUIデザイン
 * - ユーザー認証と権限管理
 * - プロフィール情報の表示と編集
 * - プリキュアテーマのカスタマイズ可能なデジタルカード
 * - 画像管理とギャラリー表示
 * - プレイリスト管理機能
 * 
 * @author CureCircle Team
 * @version 3.0.0
 */

'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Profile from '../components/Profile'
import ImageGallery from '../components/ImageGallery'
import ImageManager from '../components/ImageManager'
import DigitalCard from '../components/DigitalCard'
import LocalPlaylist from '../components/LocalPlaylist'
import EnhancedAuth from '../components/EnhancedAuth'
import ReadmeModal from '../components/ReadmeModal'
import { PrecureLoader } from '../components/PrecureLoader'
import { getRandomTransformationPhrase } from '../utils/precureLoadingMessages'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Heart, User, Image as ImageIcon, CreditCard, Music, Camera, ExternalLink, LogOut, Sparkles } from 'lucide-react'
import { gradientPresets } from '../components/BackgroundSettings' // グラデーションプリセットをインポート
import { supabase as sharedSupabase } from '../lib/supabase' // 統一されたSupabaseクライアントをインポート

/**
 * Supabaseクライアントの初期化
 * アプリケーション全体で使用するSupabaseクライアントインスタンス
 * @deprecated 個別のコンポーネントからは lib/supabase からインポートしてください
 */
// 元のコードとの互換性のために同じ変数名を維持
export const supabase = sharedSupabase

// プリキュア変身セリフローディングスピナーコンポーネント
function PrecureLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <PrecureLoader 
          size="large"
          showSpinner={true}
          showSparkles={true}
        />
      </div>
    </div>
  )
}  // メインアプリケーションコンポーネント
/**
 * アプリケーションのメインコンポーネント
 * キュアサークルアプリケーションのメイン画面を提供
 * 
 * @returns {JSX.Element} アプリケーションのメインコンポーネント
 */
export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  // authMessageの初期値を空文字に
  const [authMessage, setAuthMessage] = useState('');
  const [isClient, setIsClient] = useState(false)
  const [currentView, setCurrentView] = useState('profile')
  const [userBackground, setUserBackground] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [isReadmeOpen, setIsReadmeOpen] = useState(false) // READMEモーダルの表示状態
  const [showReadme, setShowReadme] = useState(false)
  const sessionRef = useRef(null)
  const profileRef = useRef(null)
  const initialFetchRef = useRef(false)
  const authInitializedRef = useRef(false) // 認証初期化済みフラグ
  const router = useRouter()

  // クライアントサイドで実行されていることを確認
  useEffect(() => {
    setIsClient(true);
    
    // ページ更新後もLocalStorageから背景設定を復元
    try {
      const savedBackground = localStorage.getItem('userBackground');
      if (savedBackground) {
        const parsed = JSON.parse(savedBackground);
        console.log('🔄 LocalStorageから背景設定を復元:', parsed);
        setUserBackground(parsed);
      }
    } catch (e) {
      console.error('LocalStorage復元エラー:', e);
    }
  }, [])

  // 認証状態の監視（一箇所に統合）
  useEffect(() => {
    // すでに初期化済みならスキップ
    if (authInitializedRef.current) return;
    
    /**
     * 認証を初期化する
     * セッション情報を取得し、認証状態を設定
     */
    const initAuth = async () => {
      setLoading(true);
      try {
        // 現在のセッション取得
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          sessionRef.current = currentSession;
          setSession(currentSession);
        }
        
        // 認証状態の変更を監視（一度だけ設定）
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
          const sessionChanged = newSession?.user?.id !== sessionRef.current?.user?.id;
          
          if (sessionChanged) {
            console.log('認証状態が変更されました', newSession ? '認証済み' : '未認証');
            sessionRef.current = newSession;
            setSession(newSession);
            
            // 再認証時はデータをリフレッシュ
            if (newSession) {
              profileRef.current = null;
              initialFetchRef.current = false;
            } else {
              setProfile(null);
              setUserBackground(null);
            }
          }
        });
        
        // クリーンアップ関数
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('認証初期化エラー:', error);
      } finally {
        setLoading(false);
        authInitializedRef.current = true; // 初期化済みフラグをセット
      }
    };
    
    initAuth();
  }, []); // 空の依存配列 - 初回のみ実行

  // 認証状態のローディング中にメッセージを変更
  useEffect(() => {
    if (!loading) return;
    setAuthMessage(getRandomTransformationPhrase());
    const interval = setInterval(() => {
      setAuthMessage(getRandomTransformationPhrase());
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // プロフィールデータ取得関数
  const fetchProfileData = useCallback(async () => {
    // セッションがない、またはすでに取得済みならスキップ
    if (!session?.user?.id || profileRef.current) return;
    
    console.log('プロフィールデータを取得します...');
    setProfileLoading(true);
    
    try {
      // プロフィールデータ取得
      const profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileResponse.data) {
        console.log('プロフィールデータ取得成功');
        // データ整形処理
        const processedData = {
          ...profileResponse.data,
          favorite_character: Array.isArray(profileResponse.data.favorite_character) ? profileResponse.data.favorite_character : 
                            profileResponse.data.favorite_character ? profileResponse.data.favorite_character.split(',').map(s => s.trim()) : [],
          favorite_series: Array.isArray(profileResponse.data.favorite_series) ? profileResponse.data.favorite_series : 
                          profileResponse.data.favorite_series ? profileResponse.data.favorite_series.split(',').map(s => s.trim()) : [],
          favorite_movie: Array.isArray(profileResponse.data.favorite_movie) ? profileResponse.data.favorite_movie : 
                         profileResponse.data.favorite_movie ? profileResponse.data.favorite_movie.split(',').map(s => s.trim()) : [],
          favorite_episode: Array.isArray(profileResponse.data.favorite_episode) ? profileResponse.data.favorite_episode : 
                           profileResponse.data.favorite_episode ? profileResponse.data.favorite_episode.split(',').map(s => s.trim()) : [],
          favorite_fairy: Array.isArray(profileResponse.data.favorite_fairy) ? profileResponse.data.favorite_fairy : 
                         profileResponse.data.favorite_fairy ? profileResponse.data.favorite_fairy.split(',').map(s => s.trim()) : [],
          watched_series: Array.isArray(profileResponse.data.watched_series) ? profileResponse.data.watched_series : 
                         profileResponse.data.watched_series ? profileResponse.data.watched_series.split(',').map(s => s.trim()) : [],
          watched_series_completed: Array.isArray(profileResponse.data.watched_series_completed) ? profileResponse.data.watched_series_completed : 
                                  profileResponse.data.watched_series_completed ? profileResponse.data.watched_series_completed.split(',').map(s => s.trim()) : [],
          watched_series_current: Array.isArray(profileResponse.data.watched_series_current) ? profileResponse.data.watched_series_current : 
                                profileResponse.data.watched_series_current ? profileResponse.data.watched_series_current.split(',').map(s => s.trim()) : [],
          all_series_watched: profileResponse.data.all_series_watched || false,
          social_links: Array.isArray(profileResponse.data.social_links) ? profileResponse.data.social_links : []
        };
        
        profileRef.current = processedData;
        setProfile(processedData);
      }
      
      // 背景データ取得
      const bgResponse = await supabase
        .from('user_backgrounds')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      if (bgResponse.data) {
        console.log('背景データ取得成功:', bgResponse.data);
        setUserBackground(bgResponse.data);
      }
      
    } catch (error) {
      console.error('❌ データ取得エラー:', error);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user?.id]); // sessionのIDのみに依存

  // 認証済み状態でプロフィールデータを取得
  useEffect(() => {
    // セッションあり、かつ初回フェッチ未完了の場合のみ実行
    if (session?.user?.id && !initialFetchRef.current && !profileRef.current) {
      console.log('初回プロフィール取得を開始します');
      fetchProfileData();
      initialFetchRef.current = true; // 一度だけ実行するようフラグをセット
    }
  }, [session?.user?.id, fetchProfileData]);

  // プロフィール更新ハンドラー
  const handleProfileUpdate = useCallback((updatedProfile) => {
    console.log('プロフィール更新:', updatedProfile);
    console.log('視聴状況データ更新確認:', {
      watched_series_completed: updatedProfile.watched_series_completed,
      watched_series_current: updatedProfile.watched_series_current,
      all_series_watched: updatedProfile.all_series_watched
    });
    setProfile(updatedProfile);
    profileRef.current = updatedProfile;
  }, []);

  // アバター更新ハンドラー
  const handleAvatarChange = useCallback((newAvatarUrl) => {
    console.log('アバター更新:', newAvatarUrl);
    setProfile(prev => {
      const updated = { ...prev, avatar_url: newAvatarUrl };
      profileRef.current = updated;
      return updated;
    });
  }, []);
  
  // 背景設定更新ハンドラー - より堅牢に
  const handleBackgroundUpdate = useCallback((newBackground) => {
    console.log('🔄 背景更新受信:', newBackground);
    
    if (!newBackground || !newBackground.user_id) {
      console.warn('⚠️ 不完全な背景データ:', newBackground);
      return;
    }
    
    // セッションのユーザーIDと背景データのユーザーIDが一致することを確認
    if (sessionRef.current?.user?.id && newBackground.user_id !== sessionRef.current.user.id) {
      console.error('❌ ユーザーID不一致: 背景を更新できません');
      return;
    }
    
    // 有効な背景データのみを使用
    setUserBackground(prev => {
      // 新しいデータと古いデータをマージして、null値を上書きしない
      const merged = { ...prev, ...newBackground };
      console.log('✅ 背景更新完了:', merged);
      
      // localStorageにキャッシュしてリロード時にも保持できるようにする
      try {
        localStorage.setItem('userBackground', JSON.stringify(merged));
      } catch (e) {
        console.error('localStorage保存エラー:', e);
      }
      
      // 背景を即時に適用する（BackgroundSettings.jsxのapplyBackgroundToPageと同じロジック）
      if (typeof window !== 'undefined') {
        try {
          // 既存のスタイル要素を削除
          const existingStyle = document.getElementById('curetter-background-styles');
          if (existingStyle) {
            existingStyle.remove();
          }
          
          // 新しいスタイル要素を作成
          const styleEl = document.createElement('style');
          styleEl.id = 'curetter-background-styles';
          document.head.appendChild(styleEl);
          
          // 背景タイプに応じてスタイルを生成
          let cssText = '';
          
          if (merged.type === 'solid') {
            const color = merged.solid_color || '#ff69b4';
            cssText = `
              body, html {
                background: ${color} !important;
                background-color: ${color} !important;
                background-image: none !important;
              }
            `;
          } else if (merged.type === 'gradient') {
            // グラデーションIDから適切なスタイルを検索
            const gradientId = merged.gradient_id || 'precure_classic';
            const foundGradient = gradientPresets.find(g => g.id === gradientId);
            const gradient = foundGradient ? foundGradient.gradient : gradientPresets[0].gradient;
            
            cssText = `
              body, html {
                background: ${gradient} !important;
                background-image: ${gradient} !important;
                background-attachment: fixed !important;
              }
            `;
            console.log('✅ page.jsxからグラデーション適用:', gradientId, gradient);
          }
          
          // スタイルを適用
          styleEl.textContent = cssText;
          
          console.log('✅ page.jsxから背景適用完了');
        } catch (error) {
          console.error('❌ page.jsxからの背景適用エラー:', error);
        }
      }
      
      return merged;
    });
  }, []);
  
  // ログアウト処理
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      console.log('ログアウト成功');
      
      // 状態リセット
      sessionRef.current = null;
      profileRef.current = null;
      initialFetchRef.current = false;
      setProfile(null);
      setUserBackground(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  }, []);
  
  // 背景スタイル生成
  const getUserBackgroundStyle = useCallback(() => {
    if (!userBackground) {
      // デフォルトのグラデーション (最初のプリセット)
      const defaultGradient = 'linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)';
      return { background: gradientPresets?.[0]?.gradient || defaultGradient };
    }

    console.log('背景スタイル生成:', userBackground);
    
    // タイプに基づいて背景スタイルを生成（修正版）
    switch (userBackground.type) {
      case 'gradient': {
        // gradient_idを使用してグラデーションを検索
        const gradientId = userBackground.gradient_id || 'precure_classic';
        console.log('🌈 グラデーション背景を使用:', gradientId);
        
        const foundGradient = gradientPresets.find(g => g.id === gradientId);
        if (!foundGradient) {
          console.warn(`⚠️ グラデーション "${gradientId}" が見つかりません。デフォルトを使用します。`);
          return { 
            background: gradientPresets[0].gradient,
            backgroundAttachment: 'fixed'
          };
        }
        
        return { 
          background: foundGradient.gradient,
          backgroundAttachment: 'fixed'
        };
      }
      
      case 'solid': {
        const color = userBackground.solid_color || '#ff69b4';
        console.log('🎨 単色背景を使用:', color);
        return { 
          backgroundColor: color,
          background: color
        };
      }
      
      default:
        console.log('⚠️ デフォルト背景を使用');
        const defaultGradient = gradientPresets[0].gradient;
        return { 
          background: defaultGradient,
          backgroundAttachment: 'fixed'
        };
    }
  }, [userBackground]);
  
  // ローディング中の表示
  if (loading) {
    return <PrecureLoadingSpinner />;
  }

  // 未認証の場合
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <EnhancedAuth />
      </div>
    );
  }

  // SSR時は必ず同じ背景にする
  if (!isClient) {
    const defaultGradient = 'linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)';
    return (
      <div className="min-h-screen" style={{ background: gradientPresets?.[0]?.gradient || defaultGradient }}>
        <PrecureLoadingSpinner />
      </div>
    );
  }

  // メインアプリケーション表示
  return (
    <div className="min-h-screen relative" style={getUserBackgroundStyle()}>
      {/* コンテナ */}
      <div className="relative z-10">
        {/* ヘッダーナビゲーション */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg sticky top-0 z-50">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
                  <Heart className="text-pink-500" size={28} />
                  <span>キュアサークル</span>
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsReadmeOpen(true)}
                  className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                >
                  <Sparkles size={16} />
                  <span>README</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>ログアウト</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 sticky top-[73px] z-40">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex space-x-1 overflow-x-auto py-2">
              {[
                { id: 'profile', label: 'プロフィール', icon: User },
                { id: 'gallery', label: 'ギャラリー', icon: ImageIcon },
                { id: 'card', label: 'デジタル名刺', icon: CreditCard },
                { id: 'playlist', label: 'プレイリスト', icon: Music },
                { id: 'manage', label: '画像管理', icon: Camera }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    currentView === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="container mx-auto max-w-6xl px-4 py-8">
          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <PrecureLoader size="small" customMessage="プロフィールを読み込み中..." />
              </div>
            </div>
          ) : (
            <div className="tab-container">
              <div className={currentView === 'profile' ? 'block' : 'hidden'}>
                <Profile
                  session={session}
                  profile={profile}
                  onProfileUpdate={handleProfileUpdate}
                  onAvatarChange={handleAvatarChange}
                  userBackground={userBackground}
                  onBackgroundUpdate={handleBackgroundUpdate}
                />
              </div>
              
              {/* 他のタブコンポーネント */}
              <div className={currentView === 'gallery' ? 'block' : 'hidden'}>
                <ImageGallery session={session} profile={profile} />
              </div>
              
              <div className={currentView === 'card' ? 'block' : 'hidden'}>
                <DigitalCard session={session} profile={profile} />
              </div>
              
              <div className={currentView === 'playlist' ? 'block' : 'hidden'}>
                <LocalPlaylist session={session} />
              </div>
              
              <div className={currentView === 'manage' ? 'block' : 'hidden'}>
                <ImageManager 
                  session={session} 
                  currentAvatar={profile?.avatar_url}
                  onAvatarChange={handleAvatarChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* READMEモーダル */}
      <ReadmeModal isOpen={isReadmeOpen} onClose={() => setIsReadmeOpen(false)} />
    </div>
  )
}