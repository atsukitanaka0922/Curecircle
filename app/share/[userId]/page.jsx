'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Heart, Star, Sparkles, User, Image as ImageIcon, 
  CreditCard, ExternalLink, Calendar, Mail, Link,
  ArrowLeft, Music, Play, Clock, Globe, Twitter,
  Youtube, Instagram, Twitch, Share2, QrCode, LogIn, Home
} from 'lucide-react'
import QRCodeComponent from 'react-qr-code'
import { supabase } from '../../../lib/supabase'
import { gradientPresets } from '../../../components/BackgroundSettings'
import { getRandomTransformationPhrase } from '../../../utils/precureLoadingMessages'
import { PrecureLoader } from '../../../components/PrecureLoader'
import ImageGallery from '../../../components/ImageGallery'
import LocalPlaylist from '../../../components/LocalPlaylist'

// グラデーションプリセットの検証
console.log('📋 利用可能なグラデーションプリセット:', gradientPresets?.length || 0, '個');

// 旧IDから新IDへのマッピング（DigitalCard.jsxからBackgroundSettings.jsxへの変換）
const gradientIdMapping = {
  'cure_dream': 'yes_precure5',      // キュアドリーム → Yes!プリキュア5
  'cure_black': 'cure_black_white',  // キュアブラック → ふたりはプリキュア
  'cure_white': 'cure_black_white',  // キュアホワイト → ふたりはプリキュア
  'cure_bloom': 'splash_star',       // キュアブルーム → Splash☆Star
  'cure_peach': 'fresh',             // キュアピーチ → フレッシュプリキュア!
  'cure_blossom': 'heartcatch',      // キュアブロッサム → ハートキャッチプリキュア!
  'cure_melody': 'suite',            // キュアメロディ → スイートプリキュア♪
  'cure_happy': 'smile',             // キュアハッピー → スマイルプリキュア!
  'cure_heart': 'dokidoki',          // キュアハート → ドキドキ!プリキュア
  'cure_lovely': 'happiness_charge', // キュアラブリー → ハピネスチャージプリキュア!
  'cure_flora': 'go_princess',       // キュアフローラ → Go!プリンセスプリキュア
  'cure_miracle': 'mahou_tsukai',    // キュアミラクル → 魔法つかいプリキュア!
  'cure_whip': 'kirakira',           // キュアホイップ → キラキラ☆プリキュアアラモード
  'cure_yell': 'hugtto',             // キュアエール → HUGっと!プリキュア
  'cure_star': 'star_twinkle',       // キュアスター → スター☆トゥインクルプリキュア
  'cure_grace': 'healin_good',       // キュアグレース → ヒーリングっど♥プリキュア
  'cure_summer': 'tropical_rouge',   // キュアサマー → トロピカル〜ジュ!プリキュア
  'cure_precious': 'delicious_party', // キュアプレシャス → デリシャスパーティ♡プリキュア
  'cure_sky': 'hirogaru_sky',         // キュアスカイ → ひろがるスカイ!プリキュア
  'cure_wonderful': 'wonderful_precure' // キュアワンダフル → わんだふるぷりきゅあ!
}

// プリキュアクレスト（全作品分）
const precureCrests = [
  { id: 'futari_wa', name: 'ふたりはプリキュア', url: '/crests/futari_wa.png' },
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

// SVGアイコンマッピング（ソーシャルリンク用）
const socialIcons = {
  twitter: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/></svg>,
  youtube: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/></svg>,
  instagram: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/></svg>,
  pixiv: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 448 512"><path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm105.1 109.3c18.2-3.9 37.9-3.9 56.1 0c18.2 3.9 34.7 12.9 48.4 25.5c12.8 12.1 23.1 27.7 29.6 48.3c6.5 20.5 6.5 43.1 0 63.7c-6.5 20.5-16.7 36.1-29.6 48.3c-13.7 12.6-30.2 21.6-48.4 25.5c-18.2 3.9-37.9 3.9-56.1 0c-18.2-3.9-34.7-12.9-48.4-25.5c-12.8-12.1-23.1-27.7-29.6-48.3c-6.5-20.5-6.5-43.1 0-63.7c6.5-20.5 16.7-36.1 29.6-48.3c13.7-12.6 30.2-21.6 48.4-25.5zM296 209c-4.7-11.9-11.7-22.2-20.9-30.9l-8.1 14.1c-3.7 6.5-7.5 13-11.4 19.5c-3.9 6.5-7.9 13.1-11.9 19.6c-4 6.5-7.9 13-11.8 19.5c-4 6.5-7.8 12.8-11.8 19.1c4 .2 8.1 .4 12.1 .4l12 .1c8.9 0 17-.9 24.7-2.6c7.6-1.7 14.2-4.4 19.6-8c5.4-3.7 9.7-8.3 12.9-14c3-5.6 4.3-12.3 4.3-20.2c0-5.7-1.3-11.2-3.2-16.6zM144 418c23 16.9 46.2 25.3 69.3 25.3c23.1 0 44.7-8.4 64.8-25.2c5.6-4.7 10.7-9.8 15.4-15.4l-51-17.5L144 418zm5.3-72l58.4-97.7c4.4-7.4 8.9-14.7 13.5-21.9c4.6-7.2 9.1-13.8 13.5-19.8c4.9-6.1 9.5-11.3 13.8-15.6c4.3-4.3 8.8-7.4 13.5-9.1v-1c-4.7 0-9.2-.1-13.5-.1c-4.3 0-8.5-.1-12.5-.1c-4 0-7.8 0-11.4 .1c-3.6 0-7.2 .1-10.9 .1c-4.9 0-9.8 .1-14.3 .4c-4.5 .3-8.8 .9-12.7 2c-3.9 1.1-7.5 2.7-10.8 5c-3.3 2.3-6.1 5.5-8.4 9.6c-7 12.9-14 25.8-21.1 38.7c-7.1 12.9-14.2 25.8-21.5 38.7c-7.3 12.9-14.7 25.8-22.2 38.7c-7.6 12.9-15.4 25.8-23.5 38.7zM169.7 136c-23.1 0-44.6 8.4-64.8 25.2c-5.6 4.7-10.7 9.8-15.4 15.4l50.9 17.5l98.1-32.9c-23-16.9-45.9-25.3-68.9-25.3zm84.3 48C240.3 182 231 176 225.2 167.5l-17 28.7c-4 6.9-7.9 13.7-11.8 20.4l-11.5 19.6c-3.8 6.5-7.5 12.9-11 19.2c4.5 4.3 9.5 7.5 15.1 9.7c5.6 2.2 11.3 3.2 17.1 3.2c5.9 0 11.5-1.1 16.9-3.2c5.4-2.1 10.3-5.4 14.8-9.7c4.4-4.3 8-9.7 10.8-16.2c2.7-6.5 4.1-14.1 4.1-22.7c0-4.3-.6-8.5-2-12.7c-.7-2.2-1.7-4.3-2.8-6.4c-1.4-2.5-3-4.9-4.9-7.1c-1.1-1.3-2.2-2.5-3.4-3.7c-1.2-1.1-2.4-2.1-3.7-3.1z"/></svg>,
  discord: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.05.05 0 0 0-.018-.011 8.9 8.9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.05.05 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.085 8.3 8.3 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/></svg>,
  tiktok: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M9 0h1.98c.144.715.54 1.617 1.235 2.512C12.895 3.389 13.797 4 15 4v2c-1.753 0-3.07-.814-4-1.829V11a5 5 0 1 1-5-5v2a3 3 0 1 0 3 3z"/></svg>,
  twitch: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M3.857 0 1 2.857v10.286h3.429V16l2.857-2.857H9.57L14.714 8V0zm9.143 7.429-2.286 2.286H7.429l-2 2v-2H3.429V1.143h9.571z"/><path d="M11.857 3.143h-1.143V6.57h1.143zm-3.143 0H7.571V6.57h1.143z"/></svg>,
  niconico: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 512 512"><path d="M45.5 0C20.4 0 0 20.3 0 45.5v421C0 491.7 20.4 512 45.5 512h421c25.1 0 45.5-20.3 45.5-45.5v-421C512 20.3 491.7 0 466.5 0z M446.1 65.9c0 38.9-31.5 70.4-70.4 70.4-38.9 0-70.4-31.5-70.4-70.4 0-38.9 31.5-70.4 70.4-70.4C414.6-4.5 446.1 27 446.1 65.9z M65.9 65.9c0 38.9 31.5 70.4 70.4 70.4 38.9 0 70.4-31.5 70.4-70.4 0-38.9-31.5-70.4-70.4-70.4C97.4-4.5 65.9 27 65.9 65.9z M196.3 381.3c0-42.4 34.4-76.8 76.8-76.8 42.4 0 76.8 34.4 76.8 76.8 0 42.4-34.4 76.8-76.8 76.8-42.4 0-76.8-34.4-76.8-76.8z M301.6 186.9L301.6 186.9 301.6 186.9c-13.3-26.7-40.2-44.9-71.6-44.9-31.4 0-58.4 18.3-71.6 44.9 0 0 0 0 0 0 0 0 0 0 0 0-13.3 26.7-13.3 58.4 0 85.1 0 0 0 0 0 0 0 0 0 0 0 0 13.3 26.7 40.2 44.9 71.6 44.9 31.4 0 58.4-18.3 71.6-44.9 0 0 0 0 0 0 0 0 0 0 0 0C314.9 245.3 314.9 213.6 301.6 186.9z"/></svg>
}

// カラークラス（プロフィール項目用）
const favoriteColorClasses = {
  'series': 'bg-purple-100 text-purple-800',
  'fairy': 'bg-rose-100 text-rose-800',
  'movie': 'bg-orange-100 text-orange-800',
  'episode': 'bg-indigo-100 text-indigo-800',
  'watching': 'bg-cyan-100 text-cyan-800',
  'watched': 'bg-green-100 text-green-800',
  'character': 'bg-pink-100 text-pink-800',
  'number': 'bg-emerald-100 text-emerald-800'
}

// メインコンポーネント
export default function SharedProfile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);  
  const [digitalCard, setDigitalCard] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backgroundSettings, setBackgroundSettings] = useState(null);
  const [seriesData, setSeriesData] = useState([]); // シリーズデータを管理するstate追加
  const router = useRouter();
  const params = useParams();
  const { userId } = params;
  const { data: session, status } = useSession(); // セッション情報を取得
  
  // クライアントサイドでのみQRコードURL生成
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrCodeUrl(`${window.location.origin}/share/${userId}`);
    }
  }, [userId]);
  // プロフィールデータを取得
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      console.log('🔄 データ取得処理を開始します');
      
      try {
        if (!userId) {
          setError('ユーザーIDが指定されていません');
          setLoading(false);
          return;
        }
        
        console.log('🔍 ユーザープロフィールを取得中:', userId);
        
        // シリーズデータを取得
        fetchSeriesData();
        
        // Supabaseからプロフィール取得
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.error('❌ プロフィール取得エラー:', error);
          setError('プロフィールの取得に失敗しました');
          setLoading(false);
          return;
        }
        
        if (!data) {
          setError('プロフィールが見つかりませんでした');
          setLoading(false);
          return;
        }
          console.log('✅ プロフィール取得成功:', data);
          
        // デジタル名刺データを取得
        const { data: cardData, error: cardError } = await supabase
          .from('digital_cards')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (cardError) {
          console.error('❌ デジタル名刺取得エラー:', cardError);
        } else {
          console.log('🔎 デジタル名刺データ取得結果:', cardData);
            if (cardData && cardData.card_data) {
            // 文字列形式で保存されている場合はパース
            let parsedCardData = cardData.card_data;
            if (typeof cardData.card_data === 'string') {
              try {
                parsedCardData = JSON.parse(cardData.card_data);
                console.log('🔄 JSON形式の名刺データをパースしました');
              } catch (err) {
                console.error('❌ JSON解析エラー:', err);
                // 解析エラーの場合は元のデータをそのまま使用
                parsedCardData = cardData.card_data;
              }
            }
              console.log('🔎 解析後のデジタル名刺データ:', parsedCardData);
            
            // データの整合性確認（デバッグ用）
            if (parsedCardData?.backgroundType === 'gradient') {
              if (parsedCardData.gradientId && parsedCardData.customGradient) {
                console.log('⚠️ 注意: gradientIdとcustomGradientが両方存在します');
                console.log('  - gradientId:', parsedCardData.gradientId);
                console.log('  - customGradient:', parsedCardData.customGradient);
              }
            }
            // グラデーションID情報を確認と変換を適用
            if (parsedCardData?.backgroundType === 'gradient') {
              console.log('🎨 名刺のグラデーションID (元):', parsedCardData.gradientId);
              
              if (parsedCardData.gradientId && parsedCardData.gradientId !== 'custom') {
                // プリセットグラデーションの場合
                const mappedId = gradientIdMapping[parsedCardData.gradientId] || parsedCardData.gradientId;
                console.log('🎨 マッピング後のID:', mappedId);
                
                // 重要: 変換したIDをデジタルカードデータに適用
                const preset = gradientPresets.find(p => p.id === mappedId);
                if (preset) {                
                  console.log('✅ プリセット情報を適用:', preset.name, preset.gradient);
                  // グラデーションIDを新しいものに置き換え
                  parsedCardData.gradientId = mappedId;
                  // グラデーションデータ自体も設定しておく
                  parsedCardData.gradientData = preset.gradient;
                } else {
                  console.log('⚠️ プリセットが見つかりません:', mappedId);
                }
              } else if (parsedCardData.customGradient) {
                // カスタムグラデーションの場合
                console.log('🎨 カスタムグラデーション設定を使用:', parsedCardData.customGradient);
                // 明示的にgradientIdをcustomに設定
                parsedCardData.gradientId = 'custom';
              } else {
                console.log('ℹ️ グラデーション情報が不完全です');
              }
            } else {
              console.log('ℹ️ グラデーションタイプではありません:', parsedCardData.backgroundType);
            }
            
            // デジタルカード情報を詳細にログ出力
            console.log('🔄 デジタルカードの状態を更新します:', {
              backgroundType: parsedCardData.backgroundType,
              gradientId: parsedCardData.gradientId,
              gradientData: parsedCardData.gradientData ? parsedCardData.gradientData.substring(0, 50) + '...' : null
            });
            
            setDigitalCard(parsedCardData);
            
            // デジタル名刺が存在する場合、URLのハッシュが#cardならタブをデジタル名刺に設定
            if (typeof window !== 'undefined' && window.location.hash === '#card') {
              setActiveTab('card');
            }
          } else {
            console.log('⚠️ デジタル名刺データが見つかりませんでした');
          }
        }
        
        // ローカルプレイリストを取得（公開のもののみ）
        const { data: playlistData, error: playlistError } = await supabase
          .from('local_playlists')
          .select('*')
          .eq('user_id', userId)
          .eq('is_public', true)
          .order('created_at', { ascending: false });
          
        if (playlistError) {
          console.error('❌ プレイリスト取得エラー:', playlistError);
        } else {
          console.log('✅ 公開プレイリスト取得成功:', playlistData?.length || 0, '件');
          setPlaylists(playlistData || []);
        }
        
        // 背景設定を取得
        const { data: bgData, error: bgError } = await supabase
          .from('user_backgrounds')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (bgError) {
          // テーブルが存在しないエラーなど、一般的なエラー処理
          console.error('❌ 背景設定取得エラー:', bgError);
          console.log('ℹ️ デフォルトの背景を使用します');
          // エラーがあってもアプリが動くようにする（背景設定はnullのまま）
        } else if (bgData) {
          console.log('✅ 背景設定取得成功:', bgData);
          setBackgroundSettings(bgData);
        } else {
          console.log('ℹ️ 背景設定が見つかりません。デフォルト表示します。');
        }
        
        // シリーズデータを取得
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (seriesError) {
          console.error('❌ シリーズデータ取得エラー:', seriesError);
        } else {
          console.log('✅ シリーズデータ取得成功:', seriesData?.length || 0, '件');
          setSeriesData(seriesData || []);
        }
        
        // データ整形処理
        const processedProfile = {
          ...data,
          favorite_character: Array.isArray(data.favorite_character) ? data.favorite_character : 
                              data.favorite_character ? data.favorite_character.split(',').map(s => s.trim()) : [],
          favorite_series: Array.isArray(data.favorite_series) ? data.favorite_series : 
                          data.favorite_series ? data.favorite_series.split(',').map(s => s.trim()) : [],
          favorite_movie: Array.isArray(data.favorite_movie) ? data.favorite_movie : 
                         data.favorite_movie ? data.favorite_movie.split(',').map(s => s.trim()) : [],
          favorite_episode: Array.isArray(data.favorite_episode) ? data.favorite_episode : 
                           data.favorite_episode ? data.favorite_episode.split(',').map(s => s.trim()) : [],
          favorite_fairy: Array.isArray(data.favorite_fairy) ? data.favorite_fairy : 
                         data.favorite_fairy ? data.favorite_fairy.split(',').map(s => s.trim()) : [],
          watched_series: Array.isArray(data.watched_series) ? data.watched_series : 
                         data.watched_series ? data.watched_series.split(',').map(s => s.trim()) : [],
          watched_series_completed: Array.isArray(data.watched_series_completed) ? data.watched_series_completed : 
                                  data.watched_series_completed ? data.watched_series_completed.split(',').map(s => s.trim()) : [],
          watched_series_current: Array.isArray(data.watched_series_current) ? data.watched_series_current : 
                                data.watched_series_current ? data.watched_series_current.split(',').map(s => s.trim()) : [],
          social_links: Array.isArray(data.social_links) ? data.social_links : []
        };
        
        setProfile(processedProfile);
        
        // プロフィール取得後にシリーズデータと背景設定を取得
        fetchSeriesData();
        getUserBackground();
      } catch (error) {
        console.error('❌ 予期せぬエラー:', error);
        setError('プロフィールの読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);
  
  // ユーザー背景設定の取得
  const getUserBackground = async () => {
    try {
      console.log('🎨 ユーザー背景設定を取得中...');
      
      const { data, error } = await supabase
        .from('user_backgrounds')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ 背景設定取得エラー:', error);
        return;
      }
      
      console.log('✅ 背景設定取得成功:', data);
      setBackgroundSettings(data);
      
    } catch (error) {
      console.error('❌ 背景設定取得エラー:', error);
    }
  };

  // シリーズデータを取得する関数
  const fetchSeriesData = async () => {
    try {
      console.log('📺 シリーズデータ取得開始...');
      const { data, error } = await supabase
        .from('precure_series')
        .select('*')
        .order('year_start', { ascending: true })
        .order('year_start', { ascending: true });

      if (error) throw error;
      console.log('✅ シリーズデータ取得成功:', data?.length || 0, '件');
      setSeriesData(data || []);
    } catch (error) {
      console.error('❌ シリーズデータ取得エラー:', error);
      setSeriesData([]);
    }
  };
  
  // 全シリーズが視聴済みかどうかを判定する関数
  const isAllSeriesCompleted = () => {
    if (!profile || !profile.watched_series_completed || !seriesData || seriesData.length === 0) {
      return false;
    }
    
    const watchedSeries = Array.isArray(profile.watched_series_completed) 
      ? profile.watched_series_completed 
      : (typeof profile.watched_series_completed === 'string' 
          ? profile.watched_series_completed.split(',').map(s => s.trim()).filter(s => s.length > 0)
          : []);
    
    const allSeriesNames = seriesData.map(series => series.name);
    
    // 単なる数の比較ではなく、すべてのシリーズ名が視聴済みリストに含まれているかを確認
    const isAllWatched = allSeriesNames.length > 0 && 
                         allSeriesNames.every(seriesName => watchedSeries.includes(seriesName));
    
    console.log('🔍 全シリーズ視聴済み判定:', {
      watchedSeriesCount: watchedSeries.length,
      totalSeriesCount: allSeriesNames.length,
      allSeriesWatched: isAllWatched
    });
    
    return isAllWatched;
  };
  
  // 妖精データのレンダリング
  const renderFairyData = (fairyData) => {
    if (!fairyData) return '未設定';
    
    if (Array.isArray(fairyData)) {
      const validFairies = fairyData.filter(fairy => fairy && fairy.trim && fairy.trim() !== '');
      
      if (validFairies.length === 0) {
        return '未設定';
      }
      
      return (
        <div className="flex flex-wrap gap-2">
          {validFairies.map((fairy, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-rose-200 text-rose-800 rounded-full text-xs"
            >
              {fairy}
            </span>
          ))}
        </div>
      );
    }
    
    return '未設定';
  };
  
  // ソーシャルリンクのアイコンを取得
  const getSocialIcon = (url) => {
    if (!url) return <Link size={16} />;
    
    if (url.includes('twitter.com') || url.includes('x.com')) return socialIcons.twitter;
    if (url.includes('youtube.com')) return socialIcons.youtube;
    if (url.includes('instagram.com')) return socialIcons.instagram;
    if (url.includes('pixiv.net')) return socialIcons.pixiv;
    if (url.includes('discord.gg')) return socialIcons.discord;
    if (url.includes('tiktok.com')) return socialIcons.tiktok;
    if (url.includes('twitch.tv')) return socialIcons.twitch;
    if (url.includes('nicovideo.jp')) return socialIcons.niconico;
    
    return <Link size={16} />;
  };
  
  // ページタイトル更新
  useEffect(() => {
    if (profile?.display_name) {
      document.title = `${profile.display_name}のプリキュアプロフィール | キュアサークル`;
    } else {
      document.title = 'プリキュアプロフィール | キュアサークル';
    }
  }, [profile]);
  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8" style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="w-full max-w-md mx-auto p-8">
          <PrecureLoader 
            message="プロフィールデータをお呼び出し中..." 
            pinkText="プリキュア・メタモルフォーゼ！" 
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-6 text-pink-500">
            <div className="mx-auto w-16 h-16">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">エラーが発生しました</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center mx-auto"
          >
            <ArrowLeft size={18} className="mr-2" />
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  // 背景スタイルの生成
  const getBackgroundStyle = () => {
    if (!backgroundSettings) {
      return { 
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
      };
    }

    try {
      console.log('🎨 背景設定を適用します:', backgroundSettings.type);
      
      switch (backgroundSettings.type) {
        case 'gradient':
          if (backgroundSettings.gradient_id && backgroundSettings.gradient_id !== 'custom') {
            // プリセットグラデーション
            const preset = gradientPresets.find(p => p.id === backgroundSettings.gradient_id);
            if (preset) {
              console.log(`✅ プリセットグラデーション「${preset.name}」を適用`);
              return { backgroundImage: preset.gradient };
            }
          } else if (backgroundSettings.custom_gradient) {
            // カスタムグラデーション
            try {
              const customGradient = typeof backgroundSettings.custom_gradient === 'string'
                ? JSON.parse(backgroundSettings.custom_gradient)
                : backgroundSettings.custom_gradient;
                
              return { 
                backgroundImage: `linear-gradient(${customGradient.direction || 135}deg, ${customGradient.startColor || '#ff69b4'}, ${customGradient.endColor || '#9370db'})`
              };
            } catch (err) {
              console.error('❌ カスタムグラデーション解析エラー:', err);
            }
          }
          break;
          
        case 'image':
          if (backgroundSettings.image_url) {
            console.log('✅ 画像背景を適用:', backgroundSettings.image_url);
            return {
              backgroundImage: `url(${backgroundSettings.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed'
            };
          }
          break;
          
        case 'solid':
          if (backgroundSettings.solid_color) {
            console.log('✅ 単色背景を適用:', backgroundSettings.solid_color);
            return { backgroundColor: backgroundSettings.solid_color };
          }
          break;
      }
      
      // デフォルト
      console.log('ℹ️ 一致する背景設定がないためデフォルト背景を使用します');
      return { 
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
      };
    } catch (err) {
      console.error('❌ 背景スタイル生成エラー:', err);
      console.log('📊 背景設定データ:', backgroundSettings);
      return { 
        backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
      };
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-4" style={getBackgroundStyle()}>      {/* ヘッダー */}
      <header className="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-3 sm:p-4 mb-4 sm:mb-5 flex items-center justify-between">
        <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent flex items-center">
          <Heart className="text-pink-500 mr-1 sm:mr-2" size={18} />
          <span>キュアサークル</span>
        </h1>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {status === 'loading' ? (
            // 読み込み中
            <div className="text-gray-400 flex items-center text-xs sm:text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-2"></div>
              読み込み中...
            </div>
          ) : status === 'authenticated' ? (
            // ログイン済み
            <button 
              onClick={() => router.push('/')}
              className="bg-pink-500 hover:bg-pink-600 text-white transition-colors flex items-center text-xs sm:text-sm py-1.5 px-3 rounded-lg"
            >
              <Home size={14} className="mr-1" />
              マイページ
            </button>
          ) : (
            // 未ログイン
            <button 
              onClick={() => router.push('/')}
              className="bg-purple-500 hover:bg-purple-600 text-white transition-colors flex items-center text-xs sm:text-sm py-1.5 px-3 rounded-lg"
            >
              <LogIn size={14} className="mr-1" />
              ログイン / 登録
            </button>
          )}
        </div>
      </header>
      
      {/* タブナビゲーション */}
      <div className="max-w-6xl mx-auto mb-5">
        <div className="flex justify-center bg-white/70 backdrop-blur-sm rounded-xl shadow-sm p-1 space-x-2">
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            プロフィール
          </button>
          
          {playlists.length > 0 && (
            <button 
              onClick={() => setActiveTab('playlists')} 
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'playlists' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              プレイリスト
            </button>
          )}
            <button 
            onClick={() => setActiveTab('card')} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'card' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            デジタル名刺
          </button>
            <button 
            onClick={() => setActiveTab('gallery')} 
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'gallery' 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
          >
            ギャラリー
          </button>
        </div>
      </div>
        {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto">
        {activeTab === 'profile' && (
          /* プロフィールカード */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
            {/* カバー部分 */}
            <div className="h-32 bg-gradient-to-r from-pink-400 to-purple-500 relative">
              <div className="absolute -bottom-16 left-6">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={`${profile.display_name}のアバター`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-pink-100 flex items-center justify-center text-pink-500">
                    <User size={48} />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* プロフィール情報 */}
          <div className="pt-20 px-6 md:px-8 pb-6">
            <div className="mb-6">
              <div className="flex items-center">
                <h2 className="text-2xl font-bold text-gray-800 mr-3">{profile.display_name || 'プリキュアファン'}</h2>
                
                {/* ソーシャルリンク */}
                {Array.isArray(profile?.social_links) && profile.social_links.length > 0 && (
                  <div className="flex items-center space-x-2">
                    {profile.social_links.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-pink-500 transition-colors"
                        title={link.platform || link.url}
                      >
                        <span className="w-5 h-5 flex items-center justify-center">
                          {getSocialIcon(link.url)}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-2">
                {profile?.age && <span>🎂 {profile.age}歳</span>}
                {profile?.fan_years && <span>💖 ファン歴{profile.fan_years}年</span>}
                {profile?.gender && <span>👤 {profile.gender}</span>}
              </div>
              
              {/* 全シリーズ視聴済みバッジ - 年齢・性別の下に表示 */}
              {isAllSeriesCompleted() && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm">
                    <Sparkles size={14} className="mr-1" />
                    全シリーズ視聴済み！！
                  </span>
                </div>
              )}
            </div>

            {/* 趣味・活動 */}
            {profile?.hobbies && (
              <div className="bg-indigo-50 p-4 md:p-5 rounded-xl border border-indigo-100 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="text-indigo-500" size={20} />
                  <h3 className="font-semibold text-gray-800">趣味・主な活動</h3>
                </div>
                <p className="text-gray-700 text-sm">{profile.hobbies}</p>
              </div>
            )}
            
            {/* プリキュア愛 */}
            {profile?.what_i_love && (
              <div className="bg-pink-50 p-4 md:p-5 rounded-xl border border-pink-100 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Heart className="text-pink-500" size={20} />
                  <h3 className="font-semibold text-gray-800">プリキュア愛</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{profile.what_i_love}</p>
              </div>
            )}
            
            {/* お気に入り情報 */}
            <div className="bg-purple-50 p-4 md:p-5 rounded-xl border border-purple-100 mb-4">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="text-purple-500" size={20} />
                <h3 className="font-semibold text-gray-800">お気に入り</h3>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-5 md:gap-6">
                {/* お気に入りキャラクター */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">💖 プリキュア</h4>
                  <div className="text-sm text-gray-700">
                    {Array.isArray(profile?.favorite_character) && profile.favorite_character.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.favorite_character.map((character, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-pink-200 text-pink-800 rounded-full text-xs"
                          >
                            {character}
                          </span>
                        ))}
                      </div>
                    ) : '未設定'}
                  </div>
                </div>

                {/* お気に入りシリーズ */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📺 シリーズ</h4>
                  <div className="text-sm text-gray-700">
                    {Array.isArray(profile?.favorite_series) && profile.favorite_series.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.favorite_series.map((series, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs"
                          >
                            {series}
                          </span>
                        ))}
                      </div>
                    ) : '未設定'}
                  </div>
                </div>
                
                {/* 視聴状況 - フル幅で表示 */}
                <div className="md:col-span-2 bg-blue-50/40 p-4 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">👀 視聴状況</h4>
                    {Array.isArray(profile?.watched_series_completed) && profile.watched_series_completed.length > 0 && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {profile.watched_series_completed.length}シリーズ視聴済み
                      </span>
                    )}
                  </div>
                  
                  {/* 全シリーズ視聴済みバッジは年齢・性別の下に移動済み */}
                  
                  <div className="space-y-3">
                    {/* 視聴完了シリーズ */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                        <span className="inline-block w-4 h-4 mr-1 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-[10px]">✓</span>
                        視聴済み:
                      </h5>
                      {Array.isArray(profile?.watched_series_completed) && profile.watched_series_completed.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pb-1 pr-1 w-full">
                          {profile.watched_series_completed.map((series, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-green-200 text-green-800 rounded-full text-xs flex items-center whitespace-nowrap mb-1 mr-1"
                            >
                              <span className="mr-0.5">✓</span>
                              <span className="truncate max-w-[100px]">{series}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">未設定</span>
                      )}
                    </div>
                    
                    {/* 視聴中シリーズ */}
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                        <span className="inline-block w-4 h-4 mr-1 bg-cyan-200 rounded-full flex items-center justify-center text-cyan-800 text-[10px]">→</span>
                        視聴中:
                      </h5>
                      {Array.isArray(profile?.watched_series_current) && profile.watched_series_current.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pb-1 pr-1 w-full">
                          {profile.watched_series_current.map((series, index) => (
                            <span
                              key={index}
                              className="px-1.5 py-0.5 bg-cyan-200 text-cyan-800 rounded-full text-xs flex items-center whitespace-nowrap mb-1 mr-1"
                            >
                              <span className="mr-0.5">→</span>
                              <span className="truncate max-w-[100px]">{series}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">未設定</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* お気に入り映画 */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🎬 映画</h4>
                  <div className="text-sm text-gray-700">
                    {Array.isArray(profile?.favorite_movie) && profile.favorite_movie.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.favorite_movie.map((movie, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs"
                          >
                            {movie}
                          </span>
                        ))}
                      </div>
                    ) : '未設定'}
                  </div>
                </div>

                {/* お気に入り妖精 */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🧚 妖精</h4>
                  <div className="text-sm text-gray-700">
                    {renderFairyData(profile?.favorite_fairy)}
                  </div>
                </div>

                {/* お気に入りエピソード */}
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-800 mb-2">✨ エピソード</h4>
                  <div className="text-sm text-gray-700">
                    {Array.isArray(profile?.favorite_episode) && profile.favorite_episode.length > 0 ? (
                      <div className="space-y-1">
                        {profile.favorite_episode.map((episode, index) => (
                          <div key={index} className="block">
                            <span className="inline-block px-3 py-2 bg-indigo-100 text-indigo-800 rounded-lg text-xs leading-relaxed w-full">
                              {episode}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : '未設定'}
                  </div>
                </div>
              </div>
            </div>
            
            {/* フリーテキスト */}
            {profile?.free_text && (
              <div className="bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="text-gray-500" size={20} />
                  <h3 className="font-semibold text-gray-800">その他</h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{profile.free_text}</p>
              </div>
            )}          </div>
        </div>
        )}
        
        {/* プレイリストタブ */}
        {activeTab === 'playlists' && playlists.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 md:p-7 mb-8">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
              <Music className="text-pink-500 mr-2" size={20} />
              <span>プレイリストコレクション</span>
            </h2>
            
            <div className="space-y-4">
              {playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-pink-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <Music size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{playlist.name}</h3>
                        <p className="text-sm text-gray-500">
                          {playlist.tracks?.length || 0}曲
                        </p>
                      </div>
                    </div>
                    
                    {playlist.spotify_id && (
                      <a 
                        href={`https://open.spotify.com/playlist/${playlist.spotify_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}        {/* デジタル名刺タブ */}
        {activeTab === 'card' && (
          <>
            {digitalCard ? (
              <div className="max-w-6xl mx-auto mb-8">
                <h2 className="text-xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
                  <CreditCard className="text-pink-500 mr-2" size={20} />
                  <span>デジタル名刺</span>
                </h2>

                {/* プレビュー - シンプルレイアウト（中央表示のみ） */}
                <div className="flex justify-center items-center w-full">
                  <div 
                    className="relative overflow-hidden aspect-[0.65/1] rounded-xl shadow-lg dark:shadow-xl max-w-md mx-auto w-full transform hover:scale-[1.02] transition-transform duration-300"
                    style={{
                      boxShadow: 'var(--card-shadow-light)',
                      position: 'relative',
                      ...(digitalCard.backgroundType !== 'image' 
                      ? (digitalCard.backgroundType === 'gradient'
                        ? {
                            background: digitalCard.gradientData || 'linear-gradient(135deg, #ff69b4, #9370db)'
                          }
                        : {
                            backgroundColor: digitalCard.solidColor || 'white'
                          })
                      : {})
                    }}
                  >
                    {/* 背景画像専用ラッパー - 画像の場合のみ表示 */}
                    {digitalCard.backgroundType === 'image' && (
                      <div 
                        className="absolute inset-0 z-0"
                        style={{
                          backgroundImage: `url(${digitalCard.backgroundImageUrl || digitalCard.backgroundImage})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: `${digitalCard.imageSettings?.scale * 100 || 100}%`,
                          backgroundPosition: `${digitalCard.imageSettings?.positionX || 50}% ${digitalCard.imageSettings?.positionY || 50}%`,
                          transform: `rotate(${digitalCard.imageSettings?.rotation || 0}deg)`,
                          transformOrigin: 'center center',
                          opacity: 1,
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    )}
                    
                    {/* 開発環境でのみデバッグ情報を表示 */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white p-1 text-[8px] z-50 pointer-events-none overflow-hidden max-w-[150px]">
                        Type: {digitalCard.backgroundType}<br/>
                        Filter: {digitalCard.imageSettings?.filter || 'none'}<br/>
                        FilterName: {digitalCard.filterName || 'none'}
                      </div>
                    )}
                    
                    {/* 背景フィルター */}
                    {digitalCard.backgroundType === 'image' && (
                      <div 
                        className="absolute inset-0 pointer-events-none z-10 card-filter-overlay"
                        style={(() => {
                          // 最も優先度の高いフィルター名を決定
                          const effectiveFilter = 
                            (digitalCard.imageSettings?.filter) ? digitalCard.imageSettings.filter :
                            (digitalCard.filterName) ? digitalCard.filterName :
                            'precure_rainbow'; // デフォルト
                          
                          // デバッグ用（開発環境のみ）
                          if (process.env.NODE_ENV === 'development') {
                            console.log('🖼️ シェアページのフィルター:', {
                              effectiveFilter,
                              imageSettingsFilter: digitalCard.imageSettings?.filter,
                              filterName: digitalCard.filterName,
                              filter: digitalCard.filter
                            });
                          }
                          
                          // すべてのフィルタースタイルをDigitalCard.jsxと完全に同期
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
                          };
                          
                          // noneの場合は透明なスタイルを返す
                          if (effectiveFilter === 'none') {
                            if (process.env.NODE_ENV === 'development') {
                              console.log('🔍 フィルターなしを適用');
                            }
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
                          
                          if (process.env.NODE_ENV === 'development') {
                            console.log(`✅ フィルター "${effectiveFilter}" を適用:`, filterStyle);
                          }
                          
                          return {
                            ...filterStyle,
                            // !important相当の設定でスタイルを強制適用
                            mixBlendMode: filterStyle.mixBlendMode || 'overlay',
                            opacity: filterStyle.opacity || 0.85,
                            pointerEvents: 'none'
                          };
                        })()}
                      ></div>
                    )}

                    {/* カードコンテンツ */}
                    <div className="flex flex-col justify-between w-full h-full p-3 sm:p-4 relative z-20">
                      <div className="flex flex-col">
                        {/* ユーザー名と肩書き */}
                        <div className="mb-3 text-center">
                          <h2 
                            className="font-bold drop-shadow-lg"
                            style={{ 
                              color: digitalCard.textColor,
                              fontSize: 'max(24px, min(7vw, 32px))',
                              lineHeight: '1.2',
                              textShadow: 'var(--card-text-shadow-light)'
                            }}
                          >
                            {digitalCard.name}
                          </h2>
                          {digitalCard.title && (
                            <p 
                              className="text-xs sm:text-sm opacity-90 drop-shadow-lg"
                              style={{ 
                                color: digitalCard.textColor,
                                textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                              }}
                            >
                              {digitalCard.title}
                            </p>
                          )}
                        </div>

                        {/* お気に入りキャラ/シリーズ */}
                        <div className="text-center">
                          {digitalCard.favoriteCharacter && (
                            <p 
                              className="text-xs sm:text-sm opacity-90 drop-shadow-lg mb-1"
                              style={{ 
                                color: digitalCard.textColor,
                                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                            >
                              <span style={{ 
                                color: digitalCard.accentColor || '#ffd700',
                                fontWeight: '500',
                                textShadow: '0 1px 3px rgba(0,0,0,0.35)'
                              }}>最推し: </span>
                              <span style={{
                                backgroundColor: `${digitalCard.accentColor || '#ffd700'}30`,
                                backdropFilter: 'blur(3px)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              }}>{digitalCard.favoriteCharacter}</span>
                            </p>
                          )}
                          
                          {digitalCard.favoriteSeries && (
                            <div 
                              className="flex items-center justify-center text-xs sm:text-sm mb-2 opacity-90 drop-shadow-lg"
                              style={{ 
                                color: digitalCard.textColor,
                                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                              }}
                            >
                              <Star 
                                className="w-3 h-3 mr-1" 
                                style={{ color: digitalCard.accentColor || '#ffd700' }}
                              />
                              <span>{digitalCard.favoriteSeries}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* フッター部分 */}
                      <div className="mt-auto flex flex-col items-center space-y-3">
                        {digitalCard.showQR && (
                          <div className="bg-white/35 dark:bg-black/30 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                            <QRCodeComponent 
                              value={qrCodeUrl || `https://curecircle.app/share/${userId}`}
                              size={80}
                              bgColor="rgba(255, 255, 255, 0.95)"
                              fgColor="rgba(0, 0, 0, 0.9)"
                              level="L"
                              className="rounded"
                            />
                          </div>
                        )}
                        
                        <p 
                          className="text-xs font-medium opacity-90 drop-shadow-lg text-center"
                          style={{ 
                            color: digitalCard.textColor,
                            backgroundColor: `${digitalCard.accentColor || '#ffd700'}20`,
                            backdropFilter: 'blur(4px)',
                            borderRadius: '4px',
                            padding: '3px 6px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                            marginBottom: '2px'
                          }}
                        >
                          <span className="opacity-90">キュア</span>
                          <span style={{ 
                            color: digitalCard.accentColor || '#ffd700', 
                            fontWeight: '600',
                            textShadow: `0 1px 2px rgba(0,0,0,0.3)`
                          }}>サークル</span>
                        </p>
                      </div>
                    </div>

                    {/* プリキュアクレスト - 新しいフォーマット対応 */}
                    {digitalCard.precureCrests && digitalCard.precureCrests.length > 0 ? (
                      digitalCard.precureCrests.map((crest, index) => (
                        <div 
                          key={crest.id || index}
                          className="absolute drop-shadow-md"
                          style={{
                            top: `${crest.y || 0}%`,
                            left: `${crest.x || 0}%`,
                            transform: `translate(-50%, -50%) rotate(${crest.rotation || 0}deg)`,
                            opacity: crest.opacity || 0.6,
                            width: `${crest.size || 100}px`,
                            height: `${crest.size || 100}px`,
                            zIndex: 20,
                            filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
                          }}
                        >
                          <img 
                            src={precureCrests.find(c => c.id === crest.crestId)?.url} 
                            alt="プリキュアクレスト"
                            className="object-contain w-full h-full"
                          />
                        </div>
                      ))
                    ) : (
                      digitalCard.crestId && (
                        <div 
                          className="absolute top-0 right-0 w-12 h-12 p-1 overflow-hidden opacity-70"
                          style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))' }}
                        >
                          <img 
                            src={precureCrests.find(crest => crest.id === digitalCard.crestId)?.url} 
                            alt="プリキュアクレスト"
                            className="object-contain w-full h-full"
                          />
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto mb-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center mx-auto max-w-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                    <CreditCard className="text-pink-500 mr-2" size={20} />
                    <span>デジタル名刺</span>
                  </h2>
                  <p className="text-gray-600">
                    このユーザーはまだデジタル名刺を設定していません。
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* プレイリストタブ */}
        {activeTab === 'playlists' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 md:p-7 mb-8">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
              <Music className="text-pink-500 mr-2" size={20} />
              <span>プレイリスト</span>
            </h2>
            
            {playlists.length > 0 ? (
              <LocalPlaylist session={{user: {id: userId}}} profile={profile} isViewMode={true} />
            ) : (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-600">公開されているプレイリストがありません。</p>
              </div>
            )}
          </div>
        )}
        
        {/* ギャラリータブ */}
        {activeTab === 'gallery' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-5 md:p-7 mb-8">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center">
              <ImageIcon className="text-pink-500 mr-2" size={20} />
              <span>ギャラリー</span>
            </h2>
            
            <ImageGallery session={{user: {id: userId}}} profile={profile} isEditMode={false} />
          </div>
        )}
        
        <footer className="text-center text-gray-500 text-sm py-8">
          <div className="flex items-center justify-center mb-2">
            <Heart className="text-pink-400 mr-2" size={16} />
            <span>キュアサークルでプリキュアファン同士でつながろう</span>
          </div>
          <p>© 2025 キュアサークル - プリキュアファンのためのプロフィール共有サービス</p>
        </footer>
      </main>
    </div>
  );
}
