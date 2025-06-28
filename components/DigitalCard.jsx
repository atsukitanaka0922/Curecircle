/**
 * DigitalCard.jsx - デジタルカードコンポーネント
 * 
 * プリキュアファン向けの個性的なデジタルカードを作成・カスタマイズするコンポーネント。
 * ユーザーのプロフィール情報、画像、バックグラウンドスタイルなどを管理し、
 * QRコード生成、画像のエクスポート、ソーシャルリンクの表示などの機能を提供します。
 * 
 * 特徴:
 * - プリキュアシリーズをモチーフにしたカスタマイズ
 * - スナップショット機能によるPNG画像のエクスポート
 * - プロフィール情報の表示とQRコード生成
 * - レスポンシブレイアウト対応
 * - ダークモード対応
 * 
 * @author CureCircle Team
 * @version 2.1.0
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Heart, Star, Sparkles, User, Image as ImageIcon, 
  CreditCard,
  ExternalLink, Calendar, QrCode, X, 
  Palette, Type, Upload, Trash2, RotateCcw, 
  Save, RefreshCw, Settings, Copy, Check,
  Camera, Folder, Download, ZoomIn, ZoomOut,
  RotateLeft, RotateRight, Sliders, Plus
} from 'lucide-react'
import QRCodeComponent from 'react-qr-code'
import { supabase } from '../lib/supabase'
import { gradientPresets } from './BackgroundSettings'
import html2canvas from 'html2canvas'
/**
 * 画像フィルター効果のスタイル定義
 * ユーザー画像に適用できる様々なビジュアルエフェクト
 */
const filterStyles = {
  none: {
    background: 'transparent'
  },
  precure_rainbow: {
    background: 'linear-gradient(45deg, rgba(255, 105, 180, 0.8), rgba(147, 112, 219, 0.8), rgba(135, 206, 235, 0.8), rgba(255, 215, 0, 0.8))',
    mixBlendMode: 'overlay',
    opacity: 0.85
  },
  monochrome: {
    background: 'rgba(0,0,0,0.5)',
    mixBlendMode: 'saturation',
    opacity: 0.9
  },
  sepia: {
    background: 'rgba(112,66,20,0.5)',
    mixBlendMode: 'color',
    opacity: 0.7
  },
  vintage: {
    background: 'linear-gradient(45deg, rgba(112,66,20,0.4), rgba(50,30,10,0.5))',
    mixBlendMode: 'overlay',
    opacity: 0.7
  },
  dark: {
    background: 'rgba(0,0,0,0.6)',
    mixBlendMode: 'multiply',
    opacity: 0.8
  },
  light: {
    background: 'rgba(255,255,255,0.4)',
    mixBlendMode: 'overlay',
    opacity: 0.7
  },
  cool: {
    background: 'linear-gradient(45deg, rgba(0,100,255,0.4), rgba(100,0,255,0.4))',
    mixBlendMode: 'screen',
    opacity: 0.7
  },
  warm: {
    background: 'linear-gradient(45deg, rgba(255,100,0,0.4), rgba(255,200,0,0.4))',
    mixBlendMode: 'soft-light',
    opacity: 0.7
  },
  // 旧フィルターとの互換性維持のためのエイリアス
  pink_dream: {
    background: 'linear-gradient(135deg, rgba(255,182,193,0.7), rgba(255,105,180,0.7))',
    mixBlendMode: 'soft-light',
    opacity: 0.8
  },
  magical_purple: {
    background: 'linear-gradient(135deg, rgba(147,112,219,0.7), rgba(138,43,226,0.7))',
    mixBlendMode: 'overlay',
    opacity: 0.8
  },
  sky_blue: {
    background: 'linear-gradient(135deg, rgba(135,206,235,0.7), rgba(65,105,225,0.7))',
    mixBlendMode: 'soft-light',
    opacity: 0.7
  },
  sunshine_yellow: {
    background: 'linear-gradient(135deg, rgba(255,215,0,0.7), rgba(255,165,0,0.7))',
    mixBlendMode: 'overlay',
    opacity: 0.7
  },
  fresh_green: {
    background: 'linear-gradient(135deg, rgba(144,238,144,0.7), rgba(34,139,34,0.7))',
    mixBlendMode: 'soft-light',
    opacity: 0.7
  },
  crystal_clear: {
    background: 'rgba(255,255,255,0.3)',
    mixBlendMode: 'overlay',
    opacity: 0.5
  },
  vintage_sepia: {
    background: 'linear-gradient(135deg, rgba(160,82,45,0.6), rgba(210,180,140,0.6))',
    mixBlendMode: 'color',
    opacity: 0.7
  }
}

// フィルター選択肢用のマッピング（UI表示用）
const imageFilters = [
  { id: 'none', name: 'フィルターなし' },
  { id: 'precure_rainbow', name: 'プリキュアレインボー' },
  { id: 'pink_dream', name: 'ピンクドリーム' },
  { id: 'magical_purple', name: 'マジカルパープル' },
  { id: 'sky_blue', name: 'スカイブルー' },
  { id: 'sunshine_yellow', name: 'サンシャインイエロー' },
  { id: 'fresh_green', name: 'フレッシュグリーン' },
  { id: 'crystal_clear', name: 'クリスタルクリア' },
  { id: 'vintage_sepia', name: 'ビンテージセピア' },
  { id: 'monochrome', name: 'モノクローム' },
  { id: 'sepia', name: 'セピア' },
  { id: 'vintage', name: 'ヴィンテージ' },
  { id: 'dark', name: 'ダーク' },
  { id: 'light', name: 'ライト' },
  { id: 'cool', name: 'クール' },
  { id: 'warm', name: 'ウォーム' }
]

// プリキュアクレスト一覧
const precureCrests = [
  { id: 'futari_wa', name: 'ふたりはプリキュア', url: '/crests/futari_wa.png' },
  { id: 'max_heart', name: 'ふたりはプリキュア Max Heart', url: '/crests/max_heart.png' },
  { id: 'splash_star', name: 'ふたりはプリキュア Splash☆Star', url: '/crests/splash_star.png' },
  { id: 'yes_precure5', name: 'Yes!プリキュア5', url: '/crests/yes_precure5.png' },
  { id: 'yes_precure5_gogo', name: 'Yes!プリキュア5GoGo!', url: '/crests/yes_precure5_gogo.png' },
  { id: 'fresh', name: 'フレッシュプリキュア!', url: '/crests/fresh.png' },
  { id: 'heartcatch', name: 'ハートキャッチプリキュア!', url: '/crests/heartcatch.png' },
  { id: 'suite', name: 'スイートプリキュア♪', url: '/crests/suite.png' },
  { id: 'smile', name: 'スマイルプリキュア!', url: '/crests/smile.png' },
  { id: 'dokidoki', name: 'ドキドキ!プリキュア', url: '/crests/dokidoki.png' },
  { id: 'happiness_charge', name: 'ハピネスチャージプリキュア!', url: '/crests/happiness_charge.png' },
  { id: 'go_princess', name: 'Go!プリンセスプリキュア', url: '/crests/go_princess.png' },
  { id: 'mahou_tsukai', name: '魔法つかいプリキュア!', url: '/crests/mahou_tsukai.png' },
  { id: 'kirakira', name: 'キラキラ☆プリキュアアラモード', url: '/crests/kirakira.png' },
  { id: 'hugtto', name: 'HUGっと!プリキュア', url: '/crests/hugtto.png' },
  { id: 'star_twinkle', name: 'スター☆トゥインクルプリキュア', url: '/crests/star_twinkle.png' },
  { id: 'healin_good', name: 'ヒーリングっど♥プリキュア', url: '/crests/healin_good.png' },
  { id: 'tropical_rouge', name: 'トロピカル〜ジュ!プリキュア', url: '/crests/tropical_rouge.png' },
  { id: 'delicious_party', name: 'デリシャスパーティ♡プリキュア', url: '/crests/delicious_party.png' },
  { id: 'hirogaru_sky', name: 'ひろがるスカイ!プリキュア', url: '/crests/hirogaru_sky.png' },
  { id: 'wonderful_precure', name: 'わんだふるぷりきゅあ!', url: '/crests/wonderful_precure.png' }
]

// 画像存在確認関数
const checkImageExists = async (imageUrl) => {
  if (!imageUrl) return false
  
  try {
    // Supabase Storage URLの場合
    if (imageUrl.includes('supabase') && imageUrl.includes('storage')) {
      const response = await fetch(imageUrl, { method: 'HEAD' })
      return response.ok
    }
    
    // Base64データURLの場合
    if (imageUrl.startsWith('data:image/')) {
      return true
    }
    
    // その他のURLの場合
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(true)
      img.onerror = () => resolve(false)
      img.src = imageUrl
    })
  } catch (error) {
    console.warn('画像存在確認エラー:', error)
    return false
  }
}

// デフォルト名刺データ生成関数
const getDefaultCardData = (profile) => ({
  name: profile?.display_name || 'プリキュアファン',
  favoriteCharacter: profile?.favorite_character?.[0] || 'キュアドリーム',
  backgroundType: 'gradient',
  gradientId: 'cure_dream',
  customGradient: {
    startColor: '#ff69b4',
    endColor: '#9370db',
    direction: 135
  },
  solidColor: '#ff69b4',
  backgroundImage: null,
  imageSettings: {
    scale: 1,
    positionX: 50,
    positionY: 50,
    rotation: 0,
    opacity: 0.8,
    filter: 'precure_rainbow' // デフォルトでプリキュアレインボーを選択
  },
  filterName: 'precure_rainbow', // filterNameプロパティを追加（シェアページとの互換性のため）
  textColor: '#ffffff',
  accentColor: '#ffd700',
  precureMarks: [
    { 
      id: 'heart1', 
      type: 'heart', 
      x: 80, 
      y: 20, 
      size: 20, 
      color: '#ffffff', 
      rotation: 0 
    }
  ],
  precureCrests: [
    {
      id: 'crest1',
      crestId: 'smile',
      x: 20,
      y: 80,
      size: 60,
      opacity: 0.9,
      rotation: 0
    }
  ],
  showQR: true
})

// 背景スタイル取得関数（画像検証付き）
const getBackgroundStyleSafe = async (cardData, setCardData = null) => {
  switch (cardData.backgroundType) {
    case 'gradient':
      if (cardData.gradientId === 'custom') {
        const { startColor, endColor, direction } = cardData.customGradient
        return {
          background: `linear-gradient(${direction}deg, ${startColor}, ${endColor})`
        }
      }
      const preset = gradientPresets.find(p => p.id === cardData.gradientId)
      return { background: preset?.gradient || gradientPresets[0].gradient }
      
    case 'solid':
      return { backgroundColor: cardData.solidColor }
      
    case 'image':
      if (!cardData.backgroundImage) {
        console.log('🖼️ 背景画像が設定されていません - グラデーションに変更')
        if (setCardData) {
          setCardData(prev => ({
            ...prev,
            backgroundType: 'gradient',
            gradientId: 'cure_dream'
          }))
        }
        return { background: gradientPresets[0].gradient }
      }
      
      // 画像の存在確認
      const imageExists = await checkImageExists(cardData.backgroundImage)
      if (!imageExists) {
        console.log('🖼️ 背景画像が削除されています - グラデーションに変更:', cardData.backgroundImage)
        
        if (setCardData) {
          setCardData(prev => ({
            ...prev,
            backgroundType: 'gradient',
            gradientId: 'cure_dream',
            backgroundImage: null
          }))
        }
        
        return { background: gradientPresets[0].gradient }
      }
      
      // 画像が存在する場合は通常の処理
      const baseStyle = {
        backgroundImage: `url(${cardData.backgroundImage})`,
        backgroundSize: `${cardData.imageSettings.scale * 100}%`,
        backgroundPosition: `${cardData.imageSettings.positionX}% ${cardData.imageSettings.positionY}%`,
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${cardData.imageSettings.rotation}deg)`,
        opacity: cardData.imageSettings.opacity
      }
      
      return baseStyle
      
    default:
      return { background: gradientPresets[0].gradient }
  }
}

// 同期版背景スタイル取得関数（プレビュー用）
const getBackgroundStyle = (cardData) => {
  switch (cardData.backgroundType) {
    case 'gradient':
      if (cardData.gradientId === 'custom') {
        const { startColor, endColor, direction } = cardData.customGradient
        return {
          background: `linear-gradient(${direction}deg, ${startColor}, ${endColor})`
        }
      }
      const preset = gradientPresets.find(p => p.id === cardData.gradientId)
      return { background: preset?.gradient || gradientPresets[0].gradient }
      
    case 'solid':
      return { backgroundColor: cardData.solidColor }
      
    case 'image':
      if (!cardData.backgroundImage) {
        return { background: gradientPresets[0].gradient }
      }
      
      const baseStyle = {
        backgroundImage: `url(${cardData.backgroundImage})`,
        backgroundSize: `${cardData.imageSettings.scale * 100}%`,
        backgroundPosition: `${cardData.imageSettings.positionX}% ${cardData.imageSettings.positionY}%`,
        backgroundRepeat: 'no-repeat',
        transform: `rotate(${cardData.imageSettings.rotation}deg)`,
        opacity: cardData.imageSettings.opacity
      }
      
      return baseStyle
      
    default:
      return { background: gradientPresets[0].gradient }
  }
}

// 保存済みデータ読み込み関数（画像検証付き）
const loadSavedCardData = async (session, setInitialLoading, setCardData, profile) => {
  if (!session?.user?.id) return

  try {
    setInitialLoading(true)
    console.log('📄 保存済み名刺データを読み込み中...', session.user.id)
    
    const { data, error } = await supabase
      .from('digital_cards')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) {
      console.error('❌ データ読み込みエラー:', error)
      return
    }

    if (data && data.card_data) {
      console.log('✅ 保存済みデータを復元:', data.card_data)
      
      let mergedData = {
        ...getDefaultCardData(profile),
        ...data.card_data,
        name: profile?.display_name || data.card_data.name || 'プリキュアファン',
        favoriteCharacter: profile?.favorite_character?.[0] || data.card_data.favoriteCharacter || 'キュアドリーム'
      }
      
      // 背景画像の検証
      if (mergedData.backgroundType === 'image' && mergedData.backgroundImage) {
        console.log('🔍 背景画像の存在確認中...', mergedData.backgroundImage)
        
        const imageExists = await checkImageExists(mergedData.backgroundImage)
        
        if (!imageExists) {
          console.log('❌ 背景画像が削除されています - デフォルト設定に変更')
          
          mergedData = {
            ...mergedData,
            backgroundType: 'gradient',
            gradientId: 'cure_dream',
            backgroundImage: null
          }
          
          // 自動修正の通知
          setTimeout(() => {
            alert('設定されていた背景画像が削除されているため、デフォルトのグラデーション背景に変更しました。')
          }, 1000)
          
          // データベースの更新（自動修正）
          try {
            await supabase
              .from('digital_cards')
              .update({
                card_data: mergedData,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', session.user.id)
            
            console.log('✅ 自動修正データを保存しました')
          } catch (updateError) {
            console.error('❌ 自動修正データの保存に失敗:', updateError)
          }
        } else {
          console.log('✅ 背景画像は正常に存在します')
        }
      }
      
      setCardData(mergedData)
    } else {
      console.log('📄 保存済みデータなし - 初期値を使用')
    }
  } catch (error) {
    console.error('❌ 名刺データ読み込みエラー:', error)
  } finally {
    setInitialLoading(false)
  }
}

// 画像検証カスタムフック
const useImageValidation = (cardData, setCardData) => {
  useEffect(() => {
    /**
     * 画像の有効性を検証
     * 画像URLが有効であるかをチェックし、無効な場合はデフォルト画像に置き換え
     */
    const validateImages = async () => {
      if (cardData.backgroundType === 'image' && cardData.backgroundImage) {
        const imageExists = await checkImageExists(cardData.backgroundImage)
        
        if (!imageExists) {
          console.log('🖼️ useEffect: 背景画像が削除されています - 自動修正')
          
          setCardData(prev => ({
            ...prev,
            backgroundType: 'gradient',
            gradientId: 'cure_dream',
            backgroundImage: null
          }))
          
          // ユーザーに通知
          setTimeout(() => {
            alert('背景画像が削除されているため、デフォルトのグラデーション背景に変更しました。')
          }, 500)
        }
      }
    }

    if (cardData.backgroundType === 'image') {
      validateImages()
    }
  }, [cardData.backgroundImage, cardData.backgroundType, setCardData])
}

// メインコンポーネント
/**
 * デジタルカードコンポーネント
 * ユーザー情報をもとにカスタマイズ可能なカードを表示
 * 
 * @param {Object} session - ユーザーセッション情報
 * @param {Object} profile - ユーザープロフィール情報
 * @returns {JSX.Element} デジタルカードコンポーネント
 */
export default function DigitalCard({ session, profile }) {
  // 基本状態
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const cardRef = useRef(null)
  
  // 名刺データの状態
  const [cardData, setCardData] = useState(() => getDefaultCardData(profile))

  // 編集モード状態
  const [activeTab, setActiveTab] = useState('background')
  const [selectedMark, setSelectedMark] = useState(null)
  const [selectedCrest, setSelectedCrest] = useState(null)
  const [dragging, setDragging] = useState(null)

  // 画像管理状態
  const [userImages, setUserImages] = useState([])
  const [showImagePicker, setShowImagePicker] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)

  // 画像検証フック
  useImageValidation(cardData, setCardData)

  // データ読み込み
  useEffect(() => {
    if (session?.user?.id) {
      loadSavedCardData(session, setInitialLoading, setCardData, profile)
    }
  }, [session, profile])

  // プロフィール更新時の名刺データ同期
  useEffect(() => {
    if (profile && !initialLoading) {
      setCardData(prev => ({
        ...prev,
        name: profile.display_name || prev.name,
        favoriteCharacter: profile.favorite_character?.[0] || prev.favoriteCharacter
      }))
    }
  }, [profile, initialLoading])

  // ユーザー画像一覧取得
  /**
   * ユーザー画像を読み込む
   * Supabaseからユーザープロフィールとカバー画像を取得
   */
  const loadUserImages = async () => {
    if (!profile?.id) return
    
    try {
      setLoadingImages(true)
      console.log('📂 ユーザー画像一覧を取得中...', `${profile.id}/`)
      
      const { data: files, error } = await supabase.storage
        .from('user-images')
        .list(`${profile.id}/`, {
          limit: 100,
          offset: 0,
        })

      if (error) {
        console.error('❌ ユーザー画像取得エラー:', error)
        return
      }

      if (files) {
        const imageFiles = files
          .filter(file => file.name !== '.emptyFolderPlaceholder')
          .map(file => ({
            name: file.name,
            url: supabase.storage
              .from('user-images')
              .getPublicUrl(`${profile.id}/${file.name}`).data.publicUrl,
            fullPath: `${profile.id}/${file.name}`
          }))
        
        setUserImages(imageFiles)
        console.log('🖼️ ユーザー画像:', imageFiles.length, '件')
      }
    } catch (error) {
      console.error('❌ 画像取得エラー:', error)
    } finally {
      setLoadingImages(false)
    }
  }

  // 画像選択時に一覧を読み込み
  useEffect(() => {
    if (profile?.id && showImagePicker) {
      loadUserImages()
    }
  }, [profile?.id, showImagePicker])

  // 名刺保存関数
  /**
   * カード設定を保存する
   * ユーザーのカード設定をデータベースに保存し、フィードバックを表示
   */
  const saveCard = async () => {
    if (!session?.user?.id) {
      alert('ログインが必要です')
      return
    }

    setSaving(true)
    try {
      console.log('💾 名刺データを保存中...', {
        userId: session.user.id,
        cardData: cardData
      })
      
      const saveData = {
        user_id: session.user.id,
        card_data: cardData,
        updated_at: new Date().toISOString()
      }

      // 既存データの確認
      const { data: existingData, error: checkError } = await supabase
        .from('digital_cards')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (checkError) {
        console.error('❌ 既存データ確認エラー:', checkError)
        throw checkError
      }

      let result
      if (existingData) {
        console.log('🔄 既存データを更新:', existingData.id)
        result = await supabase
          .from('digital_cards')
          .update(saveData)
          .eq('user_id', session.user.id)
          .select()
      } else {
        console.log('✨ 新規データを作成')
        saveData.created_at = new Date().toISOString()
        result = await supabase
          .from('digital_cards')
          .insert([saveData])
          .select()
      }

      if (result.error) {
        throw result.error
      }

      console.log('✅ 名刺データ保存成功:', result.data)
      alert('デジタル名刺を保存しました！✨')
      setEditing(false)
      
    } catch (error) {
      console.error('❌ 保存エラー:', error)
      
      let errorMessage = '保存に失敗しました'
      
      if (error.code === '42501') {
        errorMessage = `データベースへのアクセス権限がありません。

以下を確認してください：
1. Supabaseでログインしているか
2. digital_cardsテーブルのRLS設定
3. 適切な認証ポリシーが設定されているか

管理者にお問い合わせください。`
      } else if (error.code === '42703') {
        errorMessage = `データベースのカラムが見つかりません。

エラー: ${error.message}

Supabaseの管理画面でdigital_cardsテーブルの構造を確認してください。`
      } else if (error.code === '42P01') {
        errorMessage = 'digital_cardsテーブルが見つかりません。\nデータベースの設定を確認してください。'
      } else if (error.code === '23503') {
        errorMessage = 'ユーザー情報の関連付けに失敗しました。\n再ログインしてお試しください。'
      } else if (error.message) {
        errorMessage = `保存エラー: ${error.message}`
        if (error.code) {
          errorMessage += `\n\nエラーコード: ${error.code}`
        }
      }
      
      alert(errorMessage)
      
      console.error('詳細なエラー情報:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        sessionUserId: session?.user?.id
      })
    } finally {
      setSaving(false)
    }
  }

  // シェア機能
  /**
   * カードを共有する
   * カードの画像をキャプチャして共有オプションを表示
   */
  const shareCard = async () => {
    try {
      // ローディング表示
      const loadingToast = document.createElement('div')
      loadingToast.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-xl z-50 flex items-center space-x-3'
      loadingToast.innerHTML = `
        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>デジタル名刺を準備中...</span>
      `
      document.body.appendChild(loadingToast)

      // 1. カードのURLを生成（shareページのURL）
      let userId = session?.user?.id
      if (!userId) {
        throw new Error('ユーザーIDが取得できません')
      }
      const shareUrl = `${window.location.origin}/share/${userId}`

      // 2. カードの画像を生成
      const cardElement = cardRef.current
      if (!cardElement) {
        throw new Error('カード要素が見つかりません')
      }

      // カードのキャプチャとフィルター調整を行う関数
      /**
       * 調整済みフィルターでカードをキャプチャ
       * html2canvasを使用して現在のカードの状態を画像として取得
       */
      const captureCardWithAdjustedFilter = async () => {
        // 元のカード要素のクローンを作成（本来の表示に影響しないようにするため）
        const cardClone = cardElement.cloneNode(true)
        document.body.appendChild(cardClone)
        
        try {
          // クローンに同じスタイルを適用する処理
          cardClone.style.position = 'absolute'
          cardClone.style.left = '-9999px'
          cardClone.style.top = '-9999px'
          // 元のカードと同じサイズにする
          const originalRect = cardElement.getBoundingClientRect()
          cardClone.style.width = `${originalRect.width}px`
          cardClone.style.height = `${originalRect.height}px`            // フィルター要素の透明度を調整（シェア用に弱める）
          const filterElement = cardClone.querySelector('.card-filter-overlay')
          if (filterElement) {
            // フィルタースタイルから現在の設定を取得
            const currentFilterId = cardData.imageSettings?.filter || cardData.filterName || 'none'
            
            // noneの場合は完全に非表示に
            if (currentFilterId === 'none') {
              filterElement.style.opacity = '0'
              filterElement.style.display = 'none'
              console.log('🎨 シェア用にフィルターを非表示に設定しました')
            } else {
              const filterStyle = filterStyles[currentFilterId] || {}
              
              // 透明度を調整（シェア用に弱める：元の50%程度に、最大値を0.35に制限）
              const adjustedOpacity = filterStyle.opacity ? Math.min(filterStyle.opacity * 0.5, 0.35) : 0.35
              filterElement.style.opacity = adjustedOpacity.toString()
              
              console.log('🎨 シェア用にフィルター透明度調整:', {
                filter: currentFilterId,
                originalOpacity: filterStyle.opacity,
                adjustedOpacity
              })
            }
          }

          // html2canvasオプション
          const options = {
            scale: 2, // より高解像度に
            useCORS: true, // クロスオリジン画像を許可
            allowTaint: true,
            backgroundColor: null, // 透過を許可
            logging: false, // デバッグログを無効化
          }

          // クローンをキャンバスに変換
          return await html2canvas(cardClone, options)
        } finally {
          // クローンを削除
          if (cardClone.parentNode) {
            cardClone.parentNode.removeChild(cardClone)
          }
        }
      };
      
      // カードキャプチャを実行
      const canvas = await captureCardWithAdjustedFilter();
      
      // canvasをBlobに変換
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.95)
      })

      if (!blob) {
        throw new Error('画像の生成に失敗しました')
      }

      // Blobからファイルを生成
      const cardImage = new File([blob], "digital-card.png", { type: 'image/png' })

      // ローディング表示を削除
      document.body.removeChild(loadingToast)

      // シェア用テキスト
      const shareText = `キュアサークルでプロフィールを作りました！\n\n#キュアサークル\n#プリキュア好きな人と繋がりたい`

      // 3. Web Share APIをサポートしているか確認
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [cardImage] })) {
        await navigator.share({
          title: 'キュアサークル - デジタル名刺',
          text: shareText,
          url: shareUrl,
          files: [cardImage]
        })
        console.log('✅ シェア成功: Web Share API')
        return
      }

      // Web Share APIがサポートされていない場合、SNSシェアを表示
      const encodedText = encodeURIComponent(shareText)
      const encodedUrl = encodeURIComponent(shareUrl)

      // 画像のURLを一時的に生成
      const cardImageUrl = URL.createObjectURL(blob)

      // SNSシェアのURL（注: 実際のSNSでは画像の添付方法が異なります）
      const shareOptions = [
        {
          name: 'X (Twitter)',
          url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          icon: 'twitter'
        },
        {
          name: 'Facebook',
          url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          icon: 'facebook'
        },
        {
          name: 'LINE',
          url: `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`,
          icon: 'line'
        },
        {
          name: 'URLとテキストをコピー',
          action: async () => {
            const fullText = `${shareText}\n\n${shareUrl}`
            await navigator.clipboard.writeText(fullText)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          },
          icon: 'copy'
        },
        {
          name: '画像をダウンロード',
          action: async () => {
            const a = document.createElement('a')
            a.href = cardImageUrl
            a.download = 'digital-card.png'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          },
          icon: 'download'
        }
      ]

      // モーダルでシェアオプションを表示
      const shareWindow = document.createElement('div')
      shareWindow.className = 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'
      shareWindow.innerHTML = `
        <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-800">デジタル名刺をシェア</h3>
            <button id="close-share-modal" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="mb-4">
            <div class="mb-3 bg-gray-100 p-2 rounded-lg overflow-hidden flex justify-center">
              <img src="${cardImageUrl}" alt="デジタル名刺" class="max-w-full h-auto rounded-lg shadow-sm" style="max-height: 200px;" />
            </div>
            <p class="text-gray-700 whitespace-pre-line text-sm">${shareText}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            ${shareOptions.map(option => `
              <button id="${option.icon}-share-btn" class="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all hover:scale-105 shadow-md" style="background: ${getShareButtonColor(option.icon)}; color: white;">
                ${getShareIcon(option.icon)}
                <span class="font-medium">${option.name}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `
      document.body.appendChild(shareWindow)

      // 閉じるボタンイベント
      document.getElementById('close-share-modal').addEventListener('click', () => {
        document.body.removeChild(shareWindow)
        URL.revokeObjectURL(cardImageUrl) // 一時URL解放
      })

      // 背景クリックでも閉じる
      shareWindow.addEventListener('click', (e) => {
        if (e.target === shareWindow) {
          document.body.removeChild(shareWindow)
          URL.revokeObjectURL(cardImageUrl) // 一時URL解放
        }
      })

      // 各シェアボタンのイベント
      shareOptions.forEach(option => {
        const btn = document.getElementById(`${option.icon}-share-btn`)
        if (btn) {
          btn.addEventListener('click', () => {
            if (option.action) {
              option.action()
            } else {
              window.open(option.url, '_blank', 'noopener,noreferrer')
            }
            // 「URLコピー」以外なら閉じる
            if (option.icon !== 'copy') {
              document.body.removeChild(shareWindow)
              URL.revokeObjectURL(cardImageUrl) // 一時URL解放
            }
          })
        }
      })
    } catch (error) {
      console.error('❌ シェアエラー:', error)
      // フォールバック: URLのみコピー
      try {
        const userId = session?.user?.id
        const shareUrl = userId ? `${window.location.origin}/share/${userId}` : window.location.href
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        alert('シェアURLをコピーしました')
      } catch (clipboardError) {
        console.error('❌ クリップボードコピーエラー:', clipboardError)
        alert('シェアに失敗しました。お手数ですが、URLを手動でコピーしてください。')
      }
    }
  }

  // シェアボタンのアイコンを取得
  const getShareIcon = (type) => {
    switch (type) {
      case 'twitter':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>'
      case 'facebook':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" /></svg>'
      case 'line':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.365 9.89c.50 0 .907.41.907.91 0 .5-.41.91-.91.91H17.29v1.17h2.075c.5 0 .907.4.907.9 0 .51-.41.91-.91.91H16.39c-.5 0-.91-.4-.91-.9V9.89c0-.5.407-.91.907-.91h3.083l-.002.001zm-5.518 3.9c.5 0 .91-.4.91-.9V9.88c0-.5-.41-.91-.91-.91-.5 0-.9.4-.9.9v3.9c0 .5.4.91.9.91zM9.52 9.89c.5 0 .907.41.907.91v1.17h2.075c.5 0 .907.4.907.9 0 .51-.41.91-.91.91H8.62c-.5 0-.91-.4-.91-.9V9.89c0-.5.407-.91.907-.91H12.5l-2.98.001zM4.58 14.9l3.9-.01c.5 0 .9-.4.9-.9 0-.5-.4-.9-.9-.9H5.49v-1.17h2.99c.5 0 .9-.41.9-.91 0-.5-.4-.91-.9-.91H4.58c-.5 0-.91.41-.91.91v3.9c0 .5.41.9.91.9z"/></svg>'
      case 'copy':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
      case 'download':
        return '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
      default:
        return ''
    }
  }

  // シェアボタンの背景色を取得
  const getShareButtonColor = (type) => {
    switch (type) {
      case 'twitter':
        return '#1DA1F2'
      case 'facebook':
        return '#4267B2'
      case 'line':
        return '#06C755'
      case 'copy':
        return '#6B7280'
      case 'download':
        return '#0EA5E9'
      default:
        return '#888888'
    }
  }

  // 画像選択ダイアログを開く
  /**
   * 画像選択ダイアログを開く
   * プロフィール画像またはカバー画像を選択するためのファイル選択ダイアログを表示
   */
  const openImagePicker = () => {
    setShowImagePicker(true)
    loadUserImages()
  }

  // 管理フォルダから画像を選択
  const selectFromLibrary = (imageUrl) => {
    setCardData(prev => ({
      ...prev,
      backgroundType: 'image',
      backgroundImage: imageUrl
    }))
    setShowImagePicker(false)
  }

  // 画像アップロード処理
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCardData(prev => ({
          ...prev,
          backgroundType: 'image',
          backgroundImage: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('画像アップロードエラー:', error)
    }
  }

  // プリキュアマーク追加
  const addPrecureMark = (markType) => {
    const newMark = {
      id: `${markType}_${Date.now()}`,
      type: markType,
      x: 50 + Math.random() * 20 - 10,
      y: 50 + Math.random() * 20 - 10,
      size: 24,
      color: '#ffffff',
      rotation: 0
    }
    setCardData(prev => ({
      ...prev,
      precureMarks: [...prev.precureMarks, newMark]
    }))
  }

  // プリキュアクレスト追加
  const addPrecureCrest = (crestId) => {
    const newCrest = {
      id: `crest_${Date.now()}`,
      crestId: crestId,
      x: 50 + Math.random() * 20 - 10,
      y: 50 + Math.random() * 20 - 10,
      size: 60,
      opacity: 0.9,
      rotation: 0
    }
    setCardData(prev => ({
      ...prev,
      precureCrests: [...prev.precureCrests, newCrest]
    }))
  }

  // マーク削除
  const deleteMark = (markId) => {
    setCardData(prev => ({
      ...prev,
      precureMarks: prev.precureMarks.filter(mark => mark.id !== markId)
    }))
    setSelectedMark(null)
  }

  // クレスト削除
  const deleteCrest = (crestId) => {
    setCardData(prev => ({
      ...prev,
      precureCrests: prev.precureCrests.filter(crest => crest.id !== crestId)
    }))
    setSelectedCrest(null)
  }

  // ドラッグ操作
  const handleMarkMouseDown = (e, markId, type) => {
    if (!editing) return
    e.preventDefault()
    setDragging({ id: markId, type, startX: e.clientX, startY: e.clientY })
  }

  const handleMouseMove = (e) => {
    if (!dragging || !cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    setCardData(prev => {
      if (dragging.type === 'mark') {
        return {
          ...prev,
          precureMarks: prev.precureMarks.map(mark =>
            mark.id === dragging.id
              ? { ...mark, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
              : mark
          )
        }
      } else {
        return {
          ...prev,
          precureCrests: prev.precureCrests.map(crest =>
            crest.id === dragging.id
              ? { ...crest, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
              : crest
          )
        }
      }
    })
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging])

  // 初期読み込み中の表示
  if (initialLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold flex items-center space-x-2">
                <CreditCard size={32} />
                <span>デジタル名刺</span>
              </h1>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">デジタル名刺を読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-4 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center space-x-2">
              <CreditCard size={28} className="sm:w-8 sm:h-8" />
              <span>デジタル名刺</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <X size={16} />
                    <span>キャンセル</span>
                  </button>
                  <button
                    onClick={shareCard}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <ExternalLink size={16} />
                    <span>シェア</span>
                  </button>
                  <button
                    onClick={saveCard}
                    disabled={saving}
                    className="bg-white hover:bg-white/90 text-purple-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base disabled:opacity-50"
                  >
                    {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{saving ? '保存中...' : '保存'}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <Settings size={16} />
                    <span>編集</span>
                  </button>
                  <button
                    onClick={shareCard}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    {copied ? (
                      <Check size={16} />
                    ) : (
                      <ExternalLink size={16} />
                    )}
                    <span>{copied ? 'コピー済み' : 'シェア'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 名刺プレビュー - 中央配置 */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4 text-center">プレビュー</h2>
            
            <div className="flex justify-center w-full">
              <div 
                ref={cardRef}
                className="relative rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer mx-auto"
                style={{
                  width: 'min(100%, 400px)',
                  maxWidth: '100%',
                  aspectRatio: '91/55',
                  boxShadow: 'var(--card-shadow-light)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  ...getBackgroundStyle(cardData)
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* 背景画像のフィルター効果 */}
                {cardData.backgroundType === 'image' && cardData.backgroundImage && (
                  <>
                    {/* デバッグ情報 - 開発環境でのみ表示
                    {process.env.NODE_ENV === 'development' && (
                      <div className="absolute top-0 left-0 bg-black bg-opacity-75 text-white p-1 text-[8px] z-50 pointer-events-none overflow-hidden max-w-[150px]">
                        Filter: {cardData.imageSettings.filter || 'none'}<br/>
                        FilterName: {cardData.filterName || 'none'}
                      </div>
                    )} */}
                    
                    <div 
                      className="absolute inset-0 pointer-events-none z-20 card-filter-overlay"
                      style={(() => {
                        // 最も優先度の高いフィルター名を決定
                        const effectiveFilter = 
                          (cardData.imageSettings?.filter) ? cardData.imageSettings.filter :
                          (cardData.filterName) ? cardData.filterName :
                          (cardData.filter) ? cardData.filter :
                          'precure_rainbow'; // デフォルト
                        
                        console.log('🎨 適用フィルター:', effectiveFilter);
                        
                        // noneの場合は透明なスタイルを返す
                        if (effectiveFilter === 'none') {
                          console.log('🔍 フィルターなしを適用');
                          return {
                            background: 'transparent',
                            mixBlendMode: 'normal',
                            opacity: 0,
                            pointerEvents: 'none',
                            display: 'none' // 完全に非表示にする
                          };
                        }
                        
                        // フィルタースタイルを取得
                        const filterStyle = filterStyles[effectiveFilter] || filterStyles.precure_rainbow;
                        console.log('🔍 適用するフィルタースタイル:', filterStyle);
                        
                        return {
                          ...filterStyle,
                          // !important相当の設定でスタイルを強制適用
                          mixBlendMode: filterStyle.mixBlendMode || 'overlay',
                          opacity: filterStyle.opacity || 0.85,
                          pointerEvents: 'none'
                        };
                      })()}
                    />
                  </>
                )}

                {/* 名刺コンテンツ */}
                <div className="absolute inset-0 p-3 sm:p-6 flex flex-col justify-between pointer-events-none z-20">
                  <div>
                    <h3 
                      className="font-bold drop-shadow-lg"
                      style={{ 
                        color: cardData.textColor,
                        fontSize: 'max(16px, min(5vw, 22px))',
                        lineHeight: '1.2',
                        textShadow: `0 1px 2px rgba(0,0,0,0.35)`,
                        borderBottom: `2px solid ${cardData.accentColor}80`,
                        paddingBottom: '3px',
                        display: 'inline-block'
                      }}
                    >
                      {cardData.name}
                    </h3>
                    <p 
                      className="text-xs sm:text-sm drop-shadow-lg flex items-center gap-1.5 mt-2"
                      style={{ color: cardData.textColor }}
                    >
                      <span style={{ 
                        color: cardData.accentColor, 
                        fontWeight: '500',
                        textShadow: '0 1px 3px rgba(0,0,0,0.35)'
                      }}>最推し:</span> 
                      <span 
                        className="font-semibold relative px-1.5 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${cardData.accentColor}50`,
                          color: cardData.accentColor,
                          textShadow: `0 1px 3px rgba(0,0,0,0.4)`,
                          boxShadow: `0 1px 3px ${cardData.accentColor}30`
                        }}
                      >
                        {cardData.favoriteCharacter}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-end justify-between">
                    <p 
                      className="text-xs drop-shadow-lg"
                      style={{ 
                        color: cardData.textColor,
                        borderLeft: `2px solid ${cardData.accentColor}`,
                        paddingLeft: '6px',
                        backgroundColor: `${cardData.accentColor}15`,
                        backdropFilter: 'blur(4px)',
                        borderRadius: '0 4px 4px 0',
                        padding: '3px 6px 3px 6px'
                      }}
                    >
                      <span className="opacity-90" style={{ 
                        textShadow: `0 1px 1px rgba(0,0,0,0.2)`
                      }}>キュア</span>
                      <span style={{ 
                        color: cardData.accentColor, 
                        fontWeight: '600',
                        textShadow: `0 1px 2px rgba(0,0,0,0.3)`
                      }}>サークル</span>
                    </p>
                    
                    {cardData.showQR && (
                      <div className="bg-white/30 dark:bg-black/30 backdrop-blur-sm rounded p-1.5 shadow-lg">
                        <QRCodeComponent 
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${session?.user?.id}`}
                          size={40}
                          bgColor="rgba(255, 255, 255, 0.95)"
                          fgColor="rgba(0, 0, 0, 0.9)"
                          level="L"
                          className="rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* プリキュアマーク */}
                {cardData.precureMarks.map(mark => {
                  const MarkIcon = mark.type === 'heart' ? Heart : mark.type === 'star' ? Star : Sparkles
                  return (
                    <div
                      key={mark.id}
                      className={`absolute z-30 cursor-pointer transition-all duration-200 ${
                        editing && selectedMark === mark.id ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                      }`}
                      style={{
                        left: `${mark.x}%`,
                        top: `${mark.y}%`,
                        transform: `translate(-50%, -50%) rotate(${mark.rotation}deg)`,
                        pointerEvents: editing ? 'auto' : 'none'
                      }}
                      onMouseDown={(e) => editing && handleMarkMouseDown(e, mark.id, 'mark')}
                      onClick={() => editing && setSelectedMark(mark.id)}
                    >
                      <MarkIcon 
                        size={mark.size} 
                        style={{ color: mark.color }}
                        className="drop-shadow-lg"
                      />
                    </div>
                  )
                })}

                {/* プリキュアクレスト */}
                {cardData.precureCrests.map(crest => {
                  const crestData = precureCrests.find(c => c.id === crest.crestId)
                  return (
                    <div
                      key={crest.id}
                      className={`absolute z-30 cursor-pointer transition-all duration-200 ${
                        editing && selectedCrest === crest.id ? 'ring-2 ring-blue-400 ring-opacity-75' : ''
                      }`}
                      style={{
                        left: `${crest.x}%`,
                        top: `${crest.y}%`,
                        opacity: crest.opacity,
                        transform: `translate(-50%, -50%)`,
                        width: `${crest.size}px`,
                        height: `${crest.size}px`,
                        pointerEvents: editing ? 'auto' : 'none'
                      }}
                      onMouseDown={(e) => editing && handleMarkMouseDown(e, crest.id, 'crest')}
                      onClick={() => editing && setSelectedCrest(crest.id)}
                    >
                      {crestData ? (
                        <img 
                          src={crestData.url} 
                          alt={crestData.name}
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            objectFit: 'contain',
                            transform: `rotate(${crest.rotation}deg)`
                          }}
                          className="drop-shadow-lg"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            const fallbackIcon = e.target.nextElementSibling
                            if (fallbackIcon) {
                              fallbackIcon.style.display = 'flex'
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="hidden w-full h-full flex items-center justify-center"
                        style={{ transform: `rotate(${crest.rotation}deg)` }}
                      >
                        <Star 
                          size={Math.min(crest.size * 0.8, 48)} 
                          className="drop-shadow-lg text-yellow-400"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          
          {/* エディターを名刺の下に配置 */}
          {editing && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">エディター</h2>
              
              {/* タブナビゲーション */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                {[
                  { id: 'background', label: '背景', icon: Palette },
                  { id: 'text', label: 'テキスト', icon: Type },
                  { id: 'marks', label: 'マーク', icon: Star },
                  { id: 'crests', label: 'クレスト', icon: Sparkles }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-3 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <tab.icon size={16} />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* 背景設定 */}
              {activeTab === 'background' && (
                <div className="space-y-4">
                  {/* 背景タイプ選択 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">背景タイプ</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'gradient', label: 'グラデーション' },
                        { id: 'solid', label: 'ソリッド' },
                        { id: 'image', label: '画像' }
                      ].map(type => (
                        <button
                          key={type.id}
                          onClick={() => setCardData(prev => ({ ...prev, backgroundType: type.id }))}
                          className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                            cardData.backgroundType === type.id
                              ? 'bg-blue-500 dark:bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* グラデーション設定 */}
                  {cardData.backgroundType === 'gradient' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">プリセット</label>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pb-1">
                        {gradientPresets.map(preset => (
                          <button
                            key={preset.id}
                            onClick={() => setCardData(prev => ({ ...prev, gradientId: preset.id }))}
                            className={`p-2 sm:p-3 rounded-lg border-2 transition-all ${
                              cardData.gradientId === preset.id
                                ? 'border-purple-500 dark:border-purple-400 shadow-lg'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <div
                              className="w-full h-8 sm:h-12 rounded-lg mb-1 sm:mb-2"
                              style={{ background: preset.gradient }}
                            />
                            <p className="text-[10px] sm:text-xs font-medium text-center text-gray-700 dark:text-gray-300 truncate">
                              {preset.name}
                            </p>
                          </button>
                        ))}
                      </div>
                      
                      {/* カスタムグラデーション */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">カスタムグラデーション</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">開始色</label>
                            <input
                              type="color"
                              value={cardData.customGradient.startColor}
                              onChange={(e) => setCardData(prev => ({
                                ...prev,
                                gradientId: 'custom',
                                customGradient: { ...prev.customGradient, startColor: e.target.value }
                              }))}
                              className="w-full h-8 rounded border border-gray-300"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">終了色</label>
                            <input
                              type="color"
                              value={cardData.customGradient.endColor}
                              onChange={(e) => setCardData(prev => ({
                                ...prev,
                                gradientId: 'custom',
                                customGradient: { ...prev.customGradient, endColor: e.target.value }
                              }))}
                              className="w-full h-8 rounded border border-gray-300"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-gray-600 mb-1">方向: {cardData.customGradient.direction}°</label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={cardData.customGradient.direction}
                            onChange={(e) => setCardData(prev => ({
                              ...prev,
                              gradientId: 'custom',
                              customGradient: { ...prev.customGradient, direction: parseInt(e.target.value) }
                            }))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 単色設定 */}
                  {cardData.backgroundType === 'solid' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">背景色</label>
                      <div className="space-y-3">
                        <input
                          type="color"
                          value={cardData.solidColor}
                          onChange={(e) => setCardData(prev => ({ ...prev, solidColor: e.target.value }))}
                          className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={cardData.solidColor}
                          onChange={(e) => setCardData(prev => ({ ...prev, solidColor: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="#ff69b4"
                        />
                      </div>
                    </div>
                  )}

                  {/* 画像設定 */}
                  {cardData.backgroundType === 'image' && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">背景画像</h3>
                      
                      {/* 画像アップロード・選択 */}
                      <div className="space-y-3">
                        <button
                          onClick={openImagePicker}
                          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-purple-400 transition-colors"
                        >
                          <Folder size={24} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600">画像管理から選択</p>
                        </button>
                        
                        <div className="text-center text-gray-500 text-sm">または</div>
                        
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-400 transition-colors">
                            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">新しい画像をアップロード</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* 画像調整 */}
                      {cardData.backgroundImage && (
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">画像調整</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                サイズ: {Math.round(cardData.imageSettings.scale * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0.5"
                                max="2"
                                step="0.1"
                                value={cardData.imageSettings.scale}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, scale: parseFloat(e.target.value) }
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                回転: {cardData.imageSettings.rotation}°
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={cardData.imageSettings.rotation}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, rotation: parseInt(e.target.value) }
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                X位置: {cardData.imageSettings.positionX}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cardData.imageSettings.positionX}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, positionX: parseInt(e.target.value) }
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                                               Y位置: {cardData.imageSettings.positionY}%
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={cardData.imageSettings.positionY}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, positionY: parseInt(e.target.value) }
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                透明度: {Math.round(cardData.imageSettings.opacity * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={cardData.imageSettings.opacity}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  imageSettings: { ...prev.imageSettings, opacity: parseFloat(e.target.value) }
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">フィルター</label>
                              <select
                                value={cardData.imageSettings.filter || 'none'}
                                onChange={(e) => {
                                  const newFilter = e.target.value;
                                  console.log('🎨 フィルター変更:', newFilter);
                                  setCardData(prev => {
                                    // すべてのフィルター関連プロパティを一貫して更新
                                    return {
                                      ...prev,
                                      imageSettings: { 
                                        ...prev.imageSettings, 
                                        filter: newFilter 
                                      },
                                      filterName: newFilter, // シェアページとの互換性のため
                                      filter: newFilter // 追加の互換性保護
                                    };
                                  });
                                }}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                              >
                                {imageFilters.map(filter => (
                                  <option key={filter.id} value={filter.id}>
                                    {filter.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* テキスト設定 */}
              {activeTab === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">名前</label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">最推しキャラクター</label>
                    <input
                      type="text"
                      value={cardData.favoriteCharacter}
                      onChange={(e) => setCardData(prev => ({ ...prev, favoriteCharacter: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">テキスト色</label>
                      <input
                        type="color"
                        value={cardData.textColor}
                        onChange={(e) => setCardData(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">アクセント色</label>
                      <input
                        type="color"
                        value={cardData.accentColor}
                        onChange={(e) => setCardData(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-full h-10 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 mb-2">
                      <input
                        type="checkbox"
                        checked={cardData.showQR}
                        onChange={(e) => setCardData(prev => ({ ...prev, showQR: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">QRコードを表示</span>
                    </label>
                    {cardData.showQR && (
                      <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 pt-0.5">
                            <QRCodeComponent 
                              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${session?.user?.id}`}
                              size={60}
                              bgColor="white"
                              fgColor="#000000"
                              level="L"
                              className="rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-blue-700 font-medium">このQRコードを読み取ると、あなたのプロフィールページが表示されます</p>
                            <p className="text-xs text-blue-600 mt-1">{`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${session?.user?.id}`}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* マーク設定 */}
              {activeTab === 'marks' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">プリキュアマークを追加</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'heart', icon: Heart, label: 'ハート' },
                        { type: 'star', icon: Star, label: 'スター' },
                        { type: 'sparkles', icon: Sparkles, label: 'キラキラ' }
                      ].map(({ type, icon: Icon, label }) => (
                        <button
                          key={type}
                          onClick={() => addPrecureMark(type)}
                          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center space-y-1"
                        >
                          <Icon size={20} className="text-pink-500" />
                          <span className="text-xs text-gray-600">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 選択されたマークの設定 */}
                  {selectedMark && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">マーク設定</h4>
                      {(() => {
                        const mark = cardData.precureMarks.find(m => m.id === selectedMark)
                        if (!mark) return null
                        
                        return (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                サイズ: {mark.size}px
                              </label>
                              <input
                                type="range"
                                min="12"
                                max="48"
                                value={mark.size}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureMarks: prev.precureMarks.map(m =>
                                    m.id === selectedMark ? { ...m, size: parseInt(e.target.value) } : m
                                  )
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">色</label>
                              <input
                                type="color"
                                value={mark.color}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureMarks: prev.precureMarks.map(m =>
                                    m.id === selectedMark ? { ...m, color: e.target.value } : m
                                  )
                                }))}
                                className="w-full h-8 rounded border border-gray-300"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                回転: {mark.rotation}°
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={mark.rotation}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureMarks: prev.precureMarks.map(m =>
                                    m.id === selectedMark ? { ...m, rotation: parseInt(e.target.value) } : m
                                  )
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <button
                              onClick={() => deleteMark(selectedMark)}
                              className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                            >
                              <Trash2 size={14} />
                              <span>削除</span>
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* 現在のマーク一覧 */}
                  {cardData.precureMarks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">配置済みマーク</h4>
                      <div className="space-y-2">
                        {cardData.precureMarks.map(mark => {
                          const Icon = mark.type === 'heart' ? Heart : mark.type === 'star' ? Star : Sparkles
                          return (
                            <button
                              key={mark.id}
                              onClick={() => setSelectedMark(mark.id)}
                              className={`w-full p-2 text-left border rounded-lg transition-colors flex items-center space-x-2 ${
                                selectedMark === mark.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <Icon size={16} style={{ color: mark.color }} />
                              <span className="text-sm text-gray-700">
                                {mark.type} ({mark.size}px)
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* クレスト設定 */}
              {activeTab === 'crests' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">プリキュアクレストを追加</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                      {precureCrests.map(crest => (
                        <button
                          key={crest.id}
                          onClick={() => addPrecureCrest(crest.id)}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center space-y-1"
                        >
                          <img 
                            src={crest.url} 
                            alt={crest.name}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextElementSibling.style.display = 'flex'
                            }}
                          />
                          <Star size={16} className="text-yellow-400 hidden" />
                          <span className="text-xs text-gray-600 text-center leading-tight">
                            {crest.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 選択されたクレストの設定 */}
                  {selectedCrest && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">クレスト設定</h4>
                      {(() => {
                        const crest = cardData.precureCrests.find(c => c.id === selectedCrest)
                        if (!crest) return null
                        
                        const crestData = precureCrests.find(c => c.id === crest.crestId)
                        
                        return (
                          <div className="space-y-3">
                            <div className="text-center">
                              <img 
                                src={crestData?.url} 
                                alt={crestData?.name}
                                className="w-12 h-12 object-contain mx-auto mb-2"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextElementSibling.style.display = 'flex'
                                }}
                              />
                              <Star size={24} className="text-yellow-400 mx-auto mb-2 hidden" />
                              <p className="text-xs text-gray-600">{crestData?.name}</p>
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                サイズ: {crest.size}px
                              </label>
                              <input
                                type="range"
                                min="30"
                                max="120"
                                value={crest.size}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureCrests: prev.precureCrests.map(c =>
                                    c.id === selectedCrest ? { ...c, size: parseInt(e.target.value) } : c
                                  )
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                透明度: {Math.round(crest.opacity * 100)}%
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.1"
                                value={crest.opacity}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureCrests: prev.precureCrests.map(c =>
                                    c.id === selectedCrest ? { ...c, opacity: parseFloat(e.target.value) } : c
                                  )
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                回転: {crest.rotation}°
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={crest.rotation}
                                onChange={(e) => setCardData(prev => ({
                                  ...prev,
                                  precureCrests: prev.precureCrests.map(c =>
                                    c.id === selectedCrest ? { ...c, rotation: parseInt(e.target.value) } : c
                                  )
                                }))}
                                className="w-full"
                              />
                            </div>
                            
                            <button
                              onClick={() => deleteCrest(selectedCrest)}
                              className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2"
                            >
                              <Trash2 size={14} />
                              <span>削除</span>
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )}

                  {/* 現在のクレスト一覧 */}
                  {cardData.precureCrests.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">配置済みクレスト</h4>
                      <div className="space-y-2">
                        {cardData.precureCrests.map(crest => {
                          const crestData = precureCrests.find(c => c.id === crest.crestId)
                          return (
                            <button
                              key={crest.id}
                              onClick={() => setSelectedCrest(crest.id)}
                              className={`w-full p-2 text-left border rounded-lg transition-colors flex items-center space-x-2 ${
                                selectedCrest === crest.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <img 
                                src={crestData?.url} 
                                alt={crestData?.name}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextElementSibling.style.display = 'inline'
                                }}
                              />
                              <Star size={12} className="text-yellow-400 hidden" />
                              <span className="text-sm text-gray-700">
                                {crestData?.name} ({crest.size}px)
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 画像選択モーダル */}
      {showImagePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* モーダルヘッダー */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center space-x-2">
                  <Folder size={24} />
                  <span>背景画像を選択</span>
                </h3>
                <button
                  onClick={() => setShowImagePicker(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* モーダルコンテンツ */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loadingImages ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">画像を読み込み中...</p>
                </div>
              ) : userImages.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {userImages.map(image => (
                    <button
                      key={image.name}
                      onClick={() => selectFromLibrary(image.url)}
                      className="group relative rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors"
                    >
                      <div className="aspect-square bg-gray-100">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextElementSibling.style.display = 'flex'
                          }}
                        />
                        <div className="hidden w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon size={32} className="text-gray-400" />
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs text-gray-600 truncate" title={image.name}>
                          {image.name}
                        </p>
                      </div>
                      
                      {/* 選択オーバーレイ */}
                      <div className="absolute inset-0 bg-purple-500 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2">
                          <Check size={20} className="text-purple-500" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ImageIcon size={64} className="mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">画像がありません</h4>
                  <p className="text-gray-500 mb-4">
                    まず「画像管理」ページから画像をアップロードしてください
                  </p>
                  <button
                    onClick={() => {
                      setShowImagePicker(false)
                      console.log('画像管理ページに移動')
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    画像管理ページへ
                  </button>
                </div>
              )}
            </div>
            
            {/* モーダルフッター */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {userImages.length > 0 && `${userImages.length}枚の画像が利用可能`}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImagePicker(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  キャンセル
                </button>
                {cardData.backgroundImage && (
                  <button
                    onClick={() => setShowImagePicker(false)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    選択完了
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用方法ガイド */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Sparkles size={20} className="text-pink-500" />
          <span>デジタル名刺の使い方</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <p><strong>✨ 編集モード:</strong> 「編集」ボタンで名刺をカスタマイズ</p>
            <p><strong>🎨 背景設定:</strong> グラデーション、単色、画像から選択</p>
            <p><strong>📝 テキスト:</strong> 名前や最推しキャラクターを設定</p>
          </div>
          <div className="space-y-2">
            <p><strong>⭐ マーク:</strong> ハート、スター、キラキラを追加</p>
            <p><strong>🏆 クレスト:</strong> 各シリーズのエンブレムを配置</p>
            <p><strong>🔗 シェア:</strong> 完成した名刺をコピー&シェア</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// エラーバウンダリー付きのメインコンポーネント
const DigitalCardWithErrorBoundary = (props) => {
  try {
    return <DigitalCard {...props} />
  } catch (error) {
    console.error('❌ DigitalCard レンダリングエラー:', error)
    
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-red-300 via-pink-300 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard size={40} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">デジタル名刺の読み込みに失敗しました</h3>
        <p className="text-gray-600 mb-4">設定に問題がある可能性があります</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ページを再読み込み
        </button>
      </div>
    )
  }
}

// デバッグ用関数（開発環境のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugDigitalCard = {
    // 現在の状態を確認
    checkCurrentState: () => {
      console.log('🎯 現在の状態:', {
        session: window.currentSession || 'セッション情報なし',
        profile: window.currentProfile || 'プロフィール情報なし',
        cardData: window.currentCardData || 'カードデータなし'
      })
    },
    
    // テーブル構造をテスト
    testTableStructure: async () => {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.user?.id) {
          console.log('❌ セッションがありません')
          return
        }
        
        console.log('🧪 テストデータ作成中...')
        
        const testData = {
          user_id: session.user.id,
          card_data: { test: true, created_at: new Date().toISOString() },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('digital_cards')
          .insert([testData])
          .select()
        
        if (error) {
          console.error('❌ テスト失敗:', error)
        } else {
          console.log('✅ テスト成功:', data)
          
          // テストデータを削除
          if (data?.[0]?.id) {
            await supabase
              .from('digital_cards')
              .delete()
              .eq('id', data[0].id)
            console.log('🗑️ テストデータ削除完了')
          }
        }
        
      } catch (error) {
        console.error('❌ テーブル構造テストエラー:', error)
      }
    },

    // 画像検証テスト
    testImageValidation: async (imageUrl) => {
      const exists = await checkImageExists(imageUrl)
      console.log('🖼️ 画像存在確認:', imageUrl, exists ? '✅ 存在' : '❌ 削除済み')
      return exists
    },

    // 自動修復実行
    fixImageIssues: async () => {
      console.log('🔧 画像問題の自動修復を実行中...')
      
      // 現在のカードデータを取得して修復
      if (window.currentCardData?.backgroundType === 'image' && window.currentCardData?.backgroundImage) {
        const imageExists = await checkImageExists(window.currentCardData.backgroundImage)
        
        if (!imageExists) {
          console.log('🖼️ 削除された画像を検出 - 修復します')
          
          if (typeof window.setCurrentCardData === 'function') {
            window.setCurrentCardData(prev => ({
              ...prev,
              backgroundType: 'gradient',
              gradientId: 'cure_dream',
              backgroundImage: null
            }))
            console.log('✅ 自動修復完了')
          } else {
            console.log('⚠️ setCardData関数が見つかりません')
          }
        } else {
          console.log('✅ 画像は正常です')
        }
      } else {
        console.log('ℹ️ 背景画像は設定されていません')
      }
    }
  }
}