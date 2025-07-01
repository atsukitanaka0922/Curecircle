// app/page.jsx - 背景設定・ImageManager修正版 (修正)
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import Profile from '../components/Profile'
import ImageGallery from '../components/ImageGallery'
import ImageManager from '../components/ImageManager'
import DigitalCard from '../components/DigitalCard'
import LocalPlaylist from '../components/LocalPlaylist'
import EnhancedAuth from '../components/EnhancedAuth'
import { getRandomTransformationPhrase } from '../utils/precureLoadingMessages'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Heart, User, Image as ImageIcon, CreditCard, Music, Camera, ExternalLink, LogOut, Sparkles } from 'lucide-react'
import { gradientPresets } from '../components/BackgroundSettings' // グラデーションプリセットをインポート

// Supabaseクライアントの初期化
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// プリキュア変身セリフローディングスピナーコンポーネント
function PrecureLoadingSpinner() {
  // 初期値は空文字でサーバー・クライアント一致を保証
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // マウント後にランダム値をセット
    setCurrentMessage(getRandomTransformationPhrase());
    const interval = setInterval(() => {
      setCurrentMessage(getRandomTransformationPhrase());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        {/* プリキュア風スピナー */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
          {/* キラキラエフェクト */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 text-pink-400 animate-pulse">✨</div>
          </div>
        </div>
        {/* 変身セリフ */}
        <div className="space-y-3">
          <p className="text-xl font-bold text-pink-600 animate-pulse">
            {currentMessage || 'ロード中...'}
          </p>
          <p className="text-sm text-gray-600">
            ロード中・・・
          </p>
        </div>
        {/* キラキラエフェクト */}
        <div className="flex justify-center space-x-2 mt-4 animate-bounce">
          <span className="text-pink-400">💖</span>
          <span className="text-purple-400">✨</span>
          <span className="text-blue-400">⭐</span>
          <span className="text-yellow-400">🌟</span>
          <span className="text-green-400">💫</span>
        </div>
      </div>
    </div>
  );
}

// メインアプリケーションコンポーネント
export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  // authMessageの初期値を空文字に
  const [authMessage, setAuthMessage] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [currentView, setCurrentView] = useState('profile');
  const [userBackground, setUserBackground] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const sessionRef = useRef(null);
  const profileRef = useRef(null);
  const initialFetchRef = useRef(false);
  const authInitializedRef = useRef(false); // 認証初期化済みフラグ
  const router = useRouter();

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
  }, []);

  // 認証状態の監視（一箇所に統合）
  useEffect(() => {
    // すでに初期化済みならスキップ
    if (authInitializedRef.current) return;
    
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
      return { background: gradientPresets[0]?.gradient || 'linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)' };
    }

    console.log('背景スタイル生成:', userBackground);

    // 背景タイプを判断
    let bgType = 'gradient'; // デフォルト
    let presetIndex = 0; // デフォルトは最初のプリセット
    
    console.log('🔍 背景データ詳細:', JSON.stringify(userBackground, null, 2));
    
    // 1. 画像URLがある場合は画像背景
    if (userBackground.image_url) {
      bgType = 'image';
      console.log('📷 画像背景を使用:', userBackground.image_url);
    }
    // 2. solid_colorが "#g" で始まる場合はグラデーション背景
    else if (userBackground.solid_color && userBackground.solid_color.startsWith('#g')) {
      bgType = 'gradient';
      
      // グラデーションコードからプリセットインデックスを抽出
      const index = parseInt(userBackground.solid_color.slice(2), 10);
      if (!isNaN(index) && index >= 0 && index < gradientPresets.length) {
        presetIndex = index;
      }
      
      console.log('🌈 グラデーション背景を使用:', gradientPresets[presetIndex].id, 'コード:', userBackground.solid_color);
    }
    // 3. solid_colorが通常の色の場合は単色背景
    else if (userBackground.solid_color) {
      bgType = 'solid';
      console.log('🎨 単色背景を使用:', userBackground.solid_color);
    }
    else {
      console.log('⚠️ デフォルト背景を使用');
    }
    
    switch (bgType) {
      case 'gradient': {
        // 指定されたインデックスのグラデーション、またはデフォルト
        return { 
          background: gradientPresets[presetIndex]?.gradient || gradientPresets[0].gradient 
        };
      }
      case 'image': {
        if (userBackground.image_url) {
          return {
            backgroundImage: `url('${userBackground.image_url}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            background: 'transparent'
          };
        }
        return { background: gradientPresets[0].gradient };
      }
      case 'solid': {
        // グラデーションプレフィックスのチェック（念のため）
        const color = userBackground.solid_color || '#ff69b4';
        const actualColor = color.startsWith('gradient:') ? '#ff69b4' : color;
        // backgroundColorとbackground: 'transparent'を両方指定
        return { backgroundColor: actualColor, background: 'transparent' };
      }
      default:
        return { background: gradientPresets[0].gradient };
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
    return (
      <div className="min-h-screen" style={{ background: gradientPresets[0].gradient }}>
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
                <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600">プロフィールを読み込み中...</p>
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
    </div>
  );
}
