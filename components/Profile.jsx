/**
 * Profile.jsx - ユーザープロフィールコンポーネント
 * 
 * プリキュアファン向けの詳細なプロフィール情報を表示・編集するコンポーネント。
 * ユーザーの基本情報、好きなプリキュアシリーズ、キャラクター、映画などの
 * 詳細な嗜好情報を管理し、カスタマイズ可能なプロフィールページを提供します。
 * 
 * 特徴:
 * - シリーズ、キャラクター、映画などのプリキュア関連データの表示
 * - カスタマイズ可能な背景設定（プリキュアシリーズに合わせたグラデーション）
 * - ソーシャルリンク管理機能
 * - インタラクティブな編集モード
 * 
 * @author CureCircle Team
 * @version 2.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Heart, Star, Sparkles, User, Edit, Save, X, ExternalLink, Plus, Trash2, Globe, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SocialLinkManager from './SocialLinkManager'
import BackgroundSettings from './BackgroundSettings'
import { getRandomTransformationPhrase } from '../utils/precureLoadingMessages'

/**
 * プロフィールコンポーネント
 * ユーザーのプロフィール情報を表示・編集する
 * 
 * @param {Object} session - ユーザーセッション情報
 * @param {Object} profile - ユーザープロフィールデータ
 * @param {Function} onProfileUpdate - プロフィール更新時のコールバック関数
 * @param {Function} onAvatarChange - アバター変更時のコールバック関数
 * @param {Object} userBackground - ユーザー背景設定
 * @param {Function} onBackgroundUpdate - 背景更新時のコールバック関数
 * @returns {JSX.Element} プロフィールコンポーネント
 */
export default function Profile({ session, profile, onProfileUpdate, onAvatarChange, userBackground, onBackgroundUpdate }) {
  // === State管理 ===
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState(getRandomTransformationPhrase())
  const [seriesData, setSeriesData] = useState([])
  const [charactersData, setCharactersData] = useState([])
  const [moviesData, setMoviesData] = useState([])
  const [episodeTypesData, setEpisodeTypesData] = useState([])
  const [fairiesData, setFairiesData] = useState([]) // 妖精データ追加

  // フォームデータ
  const [formData, setFormData] = useState({
    display_name: '',
    age: '',
    fan_years: '',
    gender: '',
    watched_series: [],
    watched_series_completed: [], // 視聴済みシリーズ
    watched_series_current: [], // 視聴中シリーズ
    what_i_love: '',
    favorite_character: [],
    favorite_series: [],
    favorite_movie: [],
    favorite_episode: [],
    favorite_fairy: [], // 好きな妖精を追加
    hobbies: '',
    free_text: '',
    avatar_url: '',
    social_links: []
  })

  // ダイアログ管理
  const [dialogs, setDialogs] = useState({
    character: false,
    series: false,
    movie: false,
    episode: false,
    fairy: false, // 妖精ダイアログを追加
    watchedSeries: false,
    viewingStatus: false // 視聴状況設定ダイアログ
  })

  const [tempSelectedValues, setTempSelectedValues] = useState([])
  const [openCategories, setOpenCategories] = useState({})
  
  // 視聴状況の一時的な状態管理
  const [tempViewingStatus, setTempViewingStatus] = useState({
    completed: [],
    current: []
  })

  // === Effect Hook ===
  useEffect(() => {
    if (session?.user?.id) {
      getSeriesData()
      getCharactersData()
      getMoviesData()
      getEpisodeTypesData()
      getFairiesData()
      getUserBackground()
    }
  }, [session])

  useEffect(() => {
    if (profile) {
      console.log('🔄 プロフィールデータ処理開始:', profile)
      console.log('🔍 視聴状況データ確認:', {
        watched_series_completed: profile.watched_series_completed,
        watched_series_current: profile.watched_series_current
      })
      
      // プロフィールデータの配列処理を改善
      const processArrayData = (data) => {
        console.log('📝 配列データ処理:', { data, type: typeof data })
        
        if (Array.isArray(data)) {
          return data.filter(item => item && item.trim && item.trim() !== '')
        } else if (typeof data === 'string' && data.trim()) {
          return data.split(',').map(s => s.trim()).filter(s => s.length > 0)
        }
        return []
      }

      // エピソードデータの処理 - 元の表記を保持
      const processEpisodeData = (episodes) => {
        console.log('📺 エピソードデータ処理:', episodes)
        const processedEpisodes = processArrayData(episodes)
        const uniqueEpisodes = []
        const seenEpisodes = new Set()
        
        processedEpisodes.forEach(episode => {
          // 元のエピソード表記を保持（【シリーズ名】第X話 エピソード名）
          const originalEpisode = episode.trim()
          // 重複チェックのため、エピソード名部分のみを抽出
          const episodeName = originalEpisode.replace(/^【[^】]*】第\d+話\s*/, '')
          
          if (!seenEpisodes.has(episodeName)) {
            seenEpisodes.add(episodeName)
            uniqueEpisodes.push(originalEpisode) // 元の表記を保持
          }
        })
        
        return uniqueEpisodes.slice(0, 3)
      }

      // ソーシャルリンクの処理
      const processSocialLinks = (links) => {
        if (Array.isArray(links)) {
          return links
        } else if (typeof links === 'string' && links.trim()) {
          try {
            return JSON.parse(links)
          } catch {
            return []
          }
        }
        return []
      }

      // 妖精データの処理（特別対応）
      const processFairyData = (fairyData) => {
        console.log('🧚 妖精データ詳細処理:', { fairyData, type: typeof fairyData })
        
        if (Array.isArray(fairyData)) {
          const result = fairyData.filter(item => item && item.trim && item.trim() !== '')
          console.log('🧚 妖精データ配列処理結果:', result)
          return result
        } else if (typeof fairyData === 'string' && fairyData.trim()) {
          const result = fairyData.split(',').map(s => s.trim()).filter(s => s.length > 0)
          console.log('🧚 妖精データ文字列処理結果:', result)
          return result
        }
        
        console.log('🧚 妖精データが空または無効:', fairyData)
        return []
      }

      // プロフィールデータの処理
      const processedWatchedSeriesCompleted = processArrayData(profile.watched_series_completed);
      
      // 全シリーズが視聴済みかどうかをチェック（視聴済みリストと全シリーズを比較）
      const allSeriesNames = seriesData.map(series => series.name);
      const isAllSeriesWatched = allSeriesNames.length > 0 && 
        allSeriesNames.every(name => processedWatchedSeriesCompleted.includes(name));
      
      console.log('🔍 全シリーズ視聴済み状態を計算:', { 
        seriesCount: allSeriesNames.length,
        watchedCount: processedWatchedSeriesCompleted.length,
        isAllSeriesWatched
      });
      
      const processedData = {
        ...profile,
        favorite_character: processArrayData(profile.favorite_character),
        favorite_series: processArrayData(profile.favorite_series),
        favorite_movie: processArrayData(profile.favorite_movie),
        favorite_episode: processEpisodeData(profile.favorite_episode),
        favorite_fairy: processFairyData(profile.favorite_fairy), // 特別処理
        watched_series: processArrayData(profile.watched_series),
        watched_series_completed: processedWatchedSeriesCompleted,
        watched_series_current: processArrayData(profile.watched_series_current),
        social_links: processSocialLinks(profile.social_links)
      }

      console.log('✅ プロフィールデータ処理完了:', {
        favorite_fairy: processedData.favorite_fairy,
        favorite_fairy_length: processedData.favorite_fairy?.length
      })

      setFormData(processedData)
    }
  }, [profile])

  // episodeTypesDataの変更を監視
  useEffect(() => {
    console.log('📺 エピソードデータState更新:', episodeTypesData.length, '件')
    if (episodeTypesData.length > 0) {
      console.log('📋 エピソードデータState詳細:', {
        総件数: episodeTypesData.length,
        サンプル: episodeTypesData.slice(0, 2),
        カラム: Object.keys(episodeTypesData[0] || {})
      })
    }
  }, [episodeTypesData])

  // formDataのfavorite_episodeの変更を監視
  useEffect(() => {
    console.log('📝 formData.favorite_episode更新:', {
      episodes: formData.favorite_episode,
      isArray: Array.isArray(formData.favorite_episode),
      length: formData.favorite_episode?.length
    })
  }, [formData.favorite_episode])

  // === データ取得関数群（修正版） ===

  // シリーズデータ取得関数
  /**
   * プリキュアシリーズデータを取得
   */
  const getSeriesData = async () => {
    try {
      console.log('📺 シリーズデータ取得開始...')
      const { data, error } = await supabase
        .from('precure_series')
        .select('*')
        .order('year_start', { ascending: true })

      if (error) throw error
      console.log('✅ シリーズデータ取得成功:', data?.length || 0, '件')
      setSeriesData(data || [])
      
    } catch (error) {
      console.error('❌ シリーズデータ取得エラー:', error)
      setSeriesData([])
    }
  }

  // キャラクターデータ取得関数
  /**
   * プリキュアキャラクターデータを取得
   */
  const getCharactersData = async () => {
    try {
      console.log('👥 キャラクターデータ取得開始...')
      const { data, error } = await supabase
        .from('precure_characters')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      console.log('✅ キャラクターデータ取得成功:', data?.length || 0, '件')
      setCharactersData(data || [])
      
    } catch (error) {
      console.error('❌ キャラクターデータ取得エラー:', error)
      setCharactersData([])
    }
  }

  // 映画データ取得関数（修正版）
  /**
   * プリキュア映画データを取得
   */
  const getMoviesData = async () => {
    try {
      console.log('🎬 映画データ取得開始...')
      
      // まず、正しいテーブル名を確認
      const tableNameOptions = ['precure_movies', 'movies', 'precure_movie_data']
      let movieData = null
      let successfulTable = null

      for (const tableName of tableNameOptions) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('id', { ascending: true })

          if (!error && data) {
            movieData = data
            successfulTable = tableName
            break
          }
        } catch (tableError) {
          console.warn(`⚠️ テーブル ${tableName} にアクセスできませんでした:`, tableError)
          continue
        }
      }

      if (!movieData) {
        throw new Error('映画データテーブルが見つかりません')
      }

      console.log(`✅ 映画データ取得成功 (${successfulTable}テーブル):`, movieData.length, '件')
      setMoviesData(movieData)
      
      // デバッグ用：取得したデータの構造を確認
      if (movieData.length > 0) {
        console.log('🎬 映画データサンプル:', movieData[0])
      }
      
    } catch (error) {
      console.error('❌ 映画データ取得エラー:', error)
      setMoviesData([])
      
      // 開発者向けの詳細エラー情報
      if (error.code === '42P01') {
        console.warn('⚠️ 映画データテーブルが存在しません。データベースの設定を確認してください。')
      }
    }
  }

  // エピソードデータ取得関数（修正版）
  const getEpisodeTypesData = async () => {
    try {
      console.log('✨ エピソードデータ取得開始...')
      
      // テーブル名の候補を複数試す（episode_typesを最優先に）
      const tableNameOptions = ['episode_types', 'precure_episodes', 'episodes', 'precure_episode_data']
      let episodeData = []
      let successfulTable = null

      for (const tableName of tableNameOptions) {
        try {
          console.log(`🔍 ${tableName}テーブルをチェック中...`)
          
          // まずテーブルの総レコード数を確認
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true })
          
          if (!countError) {
            console.log(`📊 ${tableName}テーブル総レコード数: ${count}件`)
            
            // 全データを取得（制限なし）
            let allData = []
            let from = 0
            const batchSize = 1000 // バッチサイズ
            
            while (true) {
              const { data: batchData, error } = await supabase
                .from(tableName)
                .select('*')
                .order('id', { ascending: true })
                .range(from, from + batchSize - 1)

              if (error) {
                console.error(`❌ バッチ取得エラー (${from}-${from + batchSize - 1}):`, error)
                break
              }

              if (!batchData || batchData.length === 0) {
                console.log(`📊 データ取得完了: ${from}件で終了`)
                break
              }

              allData = [...allData, ...batchData]
              console.log(`📊 バッチ取得: ${from + 1}-${from + batchData.length}件 (累計: ${allData.length}件)`)
              
              // 次のバッチへ
              from += batchSize
              
              // バッチサイズより少ない場合は最後のバッチ
              if (batchData.length < batchSize) {
                console.log(`📊 最終バッチ取得完了: 総計${allData.length}件`)
                break
              }
            }

            if (allData.length > 0) {
              episodeData = allData
              successfulTable = tableName
              console.log(`✅ ${tableName}テーブルからエピソードデータ取得成功: ${allData.length}/${count}件`)
              
              // データが不完全でないかチェック
              if (allData.length < count) {
                console.warn(`⚠️ 取得データが不完全: ${allData.length}/${count}件`)
                console.warn(`⚠️ 不足データ数: ${count - allData.length}件`)
              }
              
              // データの詳細分析
              console.log('📋 データ範囲:', {
                最小ID: Math.min(...allData.map(d => d.id || 0)),
                最大ID: Math.max(...allData.map(d => d.id || 0)),
                実際のレコード数: allData.length,
                期待値: count
              })
              
              // デバッグ：データ構造とサンプルを確認
              console.log('📋 エピソードデータサンプル（最初の3件）:', allData.slice(0, 3))
              console.log('📋 利用可能なカラム:', Object.keys(allData[0] || {}))
              
              // カテゴリ分布を確認
              const categoryCount = {}
              allData.forEach(ep => {
                const cat = ep.category || ep.series_name || ep.series || 'その他'
                categoryCount[cat] = (categoryCount[cat] || 0) + 1
              })
              console.log('📊 カテゴリ分布:', categoryCount)
              console.log(`📊 総カテゴリ数: ${Object.keys(categoryCount).length}種類`)
              
              break
            }
          }
        } catch (tableError) {
          console.warn(`⚠️ テーブル ${tableName} にアクセスできませんでした:`, tableError)
          continue
        }
      }

      // フォールバック用のエピソードデータ（DB接続失敗時やデータ不足時）
      const additionalEpisodes = []
      
      // データベースから取得したデータと追加エピソードをマージ
      const existingNames = episodeData.map(ep => ep.name || ep.title || ep.episode_name || '').filter(Boolean)
      console.log(`📋 既存のエピソード名: ${existingNames.length}件`)
      
      // 重複チェック付きでマージ
      const newEpisodes = additionalEpisodes.filter(ep => {
        const exists = existingNames.includes(ep.name)
        if (exists) {
          console.log(`🔄 重複スキップ: ${ep.name}`)
        }
        return !exists
      })
      
      const mergedEpisodes = [...episodeData, ...newEpisodes]
      console.log(`📺 最終エピソードデータ: ${mergedEpisodes.length}件 (DB: ${episodeData.length}件, 追加: ${newEpisodes.length}件)`)
      
      setEpisodeTypesData(mergedEpisodes)
      
      // デバッグ用：取得したデータの構造を確認
      if (episodeData.length > 0) {
        console.log('📊 エピソードデータサンプル:', episodeData[0])
      }
      
    } catch (error) {
      console.error('❌ エピソードデータ取得エラー:', error)
      
      // フォールバック：手動で基本エピソードデータを設定
      const fallbackEpisodes = []
      
      console.log('📺 フォールバックエピソードデータを使用:', fallbackEpisodes.length, '件')
      setEpisodeTypesData(fallbackEpisodes)
      
      // 開発者向けの詳細エラー情報
      if (error.code === '42P01') {
        console.warn('⚠️ エピソードデータテーブルが存在しません。データベースの設定を確認してください。')
      }
    }
  }

  // 妖精データ取得関数（修正版）
  const getFairiesData = async () => {
    try {
      console.log('🧚 妖精データ取得開始...')
      
      // テーブル名の候補を複数試す
      const tableNameOptions = ['precure_fairies', 'fairies', 'fairy_data', 'precure_fairy_data']
      let fairyData = null
      let successfulTable = null

      for (const tableName of tableNameOptions) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .order('id', { ascending: true })

          if (!error && data) {
            fairyData = data
            successfulTable = tableName
            break
          }
        } catch (tableError) {
          console.warn(`⚠️ テーブル ${tableName} にアクセスできませんでした:`, tableError)
          continue
        }
      }

      if (!fairyData) {
        console.warn('⚠️ 妖精データテーブルが見つかりません')
        setFairiesData([])
        return
      }

      console.log(`✅ 妖精データ取得成功 (${successfulTable}テーブル):`, fairyData.length, '件')
      setFairiesData(fairyData)
      
      // デバッグ用：取得したデータの構造を確認
      if (fairyData.length > 0) {
        console.log('🧚 妖精データサンプル:', fairyData[0])
      }
      
    } catch (error) {
      console.error('❌ 妖精データ取得エラー:', error)
      setFairiesData([])
      
      // 開発者向けの詳細エラー情報
      if (error.code === '42P01') {
        console.warn('⚠️ 妖精データテーブルが存在しません。データベースの設定を確認してください。')
      }
    }
  }

  // ユーザー背景データ取得関数
  const getUserBackground = async () => {
    if (!session?.user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_backgrounds')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (!error && data) {
        // setUserBackground(data) の代わりに
        onBackgroundUpdate(data)
      }
    } catch (error) {
      console.error('背景データ取得エラー:', error)
    }
  }

  // === プロフィール更新関数（修正版） ===
  /**
   * プロフィール情報を更新
   * 編集されたプロフィール情報をデータベースに保存
   */
  const updateProfile = async () => {
    if (!session?.user?.id) {
      alert('ログインが必要です')
      return
    }

    if (!formData.display_name || formData.display_name.trim() === '') {
      alert('名前は必須です')
      return
    }

    setLoading(true)
    setSaveMessage(getRandomTransformationPhrase())
    
    // 保存中にメッセージを変更
    const messageInterval = setInterval(() => {
      setSaveMessage(getRandomTransformationPhrase())
    }, 2500)

    try {
      console.log('🔄 プロフィール更新開始:', {
        userId: session.user.id,
        favoriteEpisode: formData.favorite_episode,
        favoriteEpisodeLength: formData.favorite_episode?.length,
        favoriteEpisodeType: typeof formData.favorite_episode,
        socialLinks: formData.social_links,
        socialLinksType: typeof formData.social_links,
        fairies: formData.favorite_fairy
      })

      // ソーシャルリンクの安全な処理
      let processedSocialLinks
      try {
        if (Array.isArray(formData.social_links)) {
          processedSocialLinks = formData.social_links
        } else if (typeof formData.social_links === 'string') {
          processedSocialLinks = JSON.parse(formData.social_links)
        } else {
          processedSocialLinks = []
        }
      } catch (error) {
        console.warn('⚠️ ソーシャルリンクのパース失敗、空配列を使用:', error)
        processedSocialLinks = []
      }

      // エピソードデータの処理 - 元の表記を保持
      const processEpisodeDataForSave = (episodes) => {
        console.log('🔄 エピソード保存前処理:', {
          input: episodes,
          isArray: Array.isArray(episodes),
          length: episodes?.length
        })
        
        if (Array.isArray(episodes)) {
          const uniqueEpisodes = []
          const seenEpisodes = new Set()
          
          episodes.forEach(episode => {
            const originalEpisode = episode.trim()
            const episodeName = originalEpisode.replace(/^【[^】]*】第\d+話\s*/, '')
            
            if (!seenEpisodes.has(episodeName)) {
              seenEpisodes.add(episodeName)
              uniqueEpisodes.push(originalEpisode) // 元の表記を保持
            }
          })
          
          const result = uniqueEpisodes.slice(0, 3)
          console.log('🔄 エピソード保存前処理完了:', {
            output: result,
            outputLength: result.length
          })
          return result
        }
        console.log('🔄 エピソード保存前処理: 空配列を返します')
        return []
      }

      // 更新データの準備
      const updates = {
        id: session.user.id,
        display_name: formData.display_name.trim(),
        age: formData.age ? parseInt(formData.age) : null,
        fan_years: formData.fan_years ? parseInt(formData.fan_years) : null,
        gender: formData.gender || null,
        all_series_watched: formData.all_series_watched || false,
        what_i_love: formData.what_i_love || '',
        hobbies: formData.hobbies || '',
        free_text: formData.free_text || '',
        avatar_url: formData.avatar_url || null,
        all_series_watched: formData.all_series_watched || false,
        
        // 配列データを文字列として保存
        favorite_character: Array.isArray(formData.favorite_character) 
          ? formData.favorite_character.join(', ') 
          : formData.favorite_character || '',
        favorite_series: Array.isArray(formData.favorite_series) 
          ? formData.favorite_series.join(', ') 
          : formData.favorite_series || '',
        favorite_movie: Array.isArray(formData.favorite_movie) 
          ? formData.favorite_movie.join(', ') 
          : formData.favorite_movie || '',
        favorite_episode: Array.isArray(formData.favorite_episode) 
          ? processEpisodeDataForSave(formData.favorite_episode).join(', ') 
          : formData.favorite_episode || '',
        favorite_fairy: Array.isArray(formData.favorite_fairy) 
          ? formData.favorite_fairy.join(', ') 
          : formData.favorite_fairy || '', // 妖精データの保存処理を追加
        watched_series: Array.isArray(formData.watched_series) 
          ? formData.watched_series.join(', ') 
          : formData.watched_series || '',
        watched_series_completed: Array.isArray(formData.watched_series_completed) 
          ? formData.watched_series_completed.join(', ') 
          : formData.watched_series_completed || '',
        watched_series_current: Array.isArray(formData.watched_series_current) 
          ? formData.watched_series_current.join(', ') 
          : formData.watched_series_current || '',
        
        // ソーシャルリンクをJSONBとして保存
        social_links: processedSocialLinks,
        
        updated_at: new Date().toISOString()
      }

      console.log('📝 更新データ:', updates)

      // データベース更新の実行
      const { data, error } = await supabase
        .from('profiles')
        .upsert(updates, {
          onConflict: 'id'
        })
        .select()

      if (error) {
        console.error('❌ データベース更新エラー:', error)
        
        if (error.code) {
          console.error('エラーコード:', error.code)
        }
        if (error.details) {
          console.error('エラー詳細:', error.details)
        }
        if (error.hint) {
          console.error('エラーヒント:', error.hint)
        }
        
        throw new Error(`データベース更新失敗: ${error.message}`)
      }

      console.log('✅ プロフィール更新成功:', data)

      // UIの状態更新
      const updatedProfile = {
        ...updates,
        favorite_character: formData.favorite_character,
        favorite_series: formData.favorite_series,
        favorite_movie: formData.favorite_movie,
        favorite_episode: processEpisodeDataForSave(formData.favorite_episode),
        favorite_fairy: formData.favorite_fairy, // 妖精データをUIに反映
        watched_series: formData.watched_series,
        watched_series_completed: formData.watched_series_completed, // 視聴済みシリーズ
        watched_series_current: formData.watched_series_current, // 視聴中シリーズ
        social_links: processedSocialLinks
      }

      onProfileUpdate(updatedProfile)
      setEditing(false)
      alert('保存しました！✨')

    } catch (error) {
      console.error('❌ プロフィール更新エラー:', error)
      
      let errorMessage = 'プロフィールの更新に失敗しました'
      
      if (error.message.includes('social_links')) {
        errorMessage += '\n\nソーシャルリンクの保存に問題があります。データベースの設定を確認してください。'
      } else if (error.message.includes('favorite_fairy')) {
        errorMessage += '\n\n妖精データの保存に問題があります。データベースの設定を確認してください。'
      } else if (error.message.includes('column')) {
        errorMessage += '\n\nデータベースの構造に問題があります。管理者にお問い合わせください。'
      }
      
      alert(errorMessage)
    } finally {
      clearInterval(messageInterval)
      setLoading(false)
    }
  }

  // ソーシャルリンク更新ハンドラー
  const handleSocialLinksUpdate = (newLinks) => {
    setFormData(prev => ({
      ...prev,
      social_links: newLinks
    }))
  }

  // ユーザー背景更新ハンドラーを追加
  const handleBackgroundUpdate = (newBackground) => {
    if (onBackgroundUpdate) onBackgroundUpdate(newBackground)
  }

  // === カテゴリ整理関数 ===
  
  // データベースからキャラクターをカテゴリ別に整理
  const getCharacterCategories = () => {
    if (charactersData.length === 0) {
      return {}
    }

    const seriesWithYears = {}
    seriesData.forEach(series => {
      seriesWithYears[series.name] = series.year_start || 9999
    })

    const categories = {}
    const sortedCharacters = [...charactersData].sort((a, b) => a.id - b.id)
    
    sortedCharacters.forEach(char => {
      const seriesName = char.series_name
      if (!categories[seriesName]) {
        categories[seriesName] = []
      }
      categories[seriesName].push({
        name: char.precure_name || char.name,
        id: char.id,
        originalChar: char
      })
    })

    Object.keys(categories).forEach(seriesName => {
      categories[seriesName] = categories[seriesName].map(char => char.name)
    })

    const sortedCategories = {}
    Object.keys(categories)
      .sort((a, b) => (seriesWithYears[a] || 9999) - (seriesWithYears[b] || 9999))
      .forEach(key => {
        sortedCategories[key] = categories[key]
      })

    return sortedCategories
  }

  // エピソードデータをカテゴリ別に整理（修正版）
  const getEpisodeCategories = () => {
    if (episodeTypesData.length === 0) {
      console.warn('⚠️ エピソードデータが空です')
      return {}
    }

    console.log('📋 エピソードカテゴリ整理開始:', episodeTypesData.length, '件')
    
    // デバッグ：最初の数件のデータ構造を確認
    if (episodeTypesData.length > 0) {
      console.log('📋 カテゴリ整理用データサンプル:', episodeTypesData.slice(0, 3))
    }

    // カテゴリマッピング：映画や特別エピソードを適切なシリーズに分類
    const categoryMapping = {
      // 必要に応じて映画やOVAのマッピングを追加
    }

    const categories = {}
    let processedCount = 0
    let skippedCount = 0
    
    episodeTypesData.forEach((episode, index) => {
      try {
        // データ構造の柔軟性を高める
        let category = episode.category || episode.series_name || episode.series || 'その他'
        const episodeName = episode.name || episode.title || episode.episode_name || '不明なエピソード'
        const episodeNumber = episode.episode_number || episode.number || '?'
        
        // カテゴリマッピングを適用
        if (categoryMapping[category]) {
          category = categoryMapping[category]
        }
        
        if (!categories[category]) {
          categories[category] = []
        }
        
        // フォーマット：エピソード名のみ（シリーズ名は重複するため削除）
        let formattedEpisode
        if (episodeNumber === '?' || episodeNumber === 'NULL' || !episodeNumber) {
          formattedEpisode = episodeName
        } else {
          formattedEpisode = `第${episodeNumber}話 ${episodeName}`
        }
        
        categories[category].push(formattedEpisode)
        processedCount++
        
        // 処理の進捗を定期的に出力（100件ごと）
        if ((index + 1) % 100 === 0) {
          console.log(`📊 処理進捗: ${index + 1}/${episodeTypesData.length}件`)
        }
        
      } catch (error) {
        console.error(`❌ エピソード処理エラー (${index}件目):`, episode, error)
        skippedCount++
      }
    })

    console.log('✅ エピソードカテゴリ整理完了:', Object.keys(categories).length, 'カテゴリ')
    console.log(`📊 処理統計: 成功 ${processedCount}件, スキップ ${skippedCount}件`)
    console.log('📋 カテゴリ一覧:', Object.keys(categories))
    
    // 各カテゴリのエピソード数も表示
    let totalEpisodes = 0
    Object.entries(categories).forEach(([cat, eps]) => {
      console.log(`📁 ${cat}: ${eps.length}件`)
      totalEpisodes += eps.length
    })
    console.log(`📊 総エピソード数: ${totalEpisodes}件`)
    
    // データの整合性チェック
    if (totalEpisodes !== episodeTypesData.length) {
      console.warn(`⚠️ データ不整合: 入力${episodeTypesData.length}件 vs 出力${totalEpisodes}件`)
    }
    
    return categories
  }

  // 妖精データをカテゴリ別に整理
  const getFairyCategories = () => {
    if (fairiesData.length === 0) {
      console.warn('⚠️ 妖精データが空です')
      return {}
    }

    console.log('🧚 妖精カテゴリ整理開始:', fairiesData.length, '件')

    const categories = {}
    fairiesData.forEach(fairy => {
      // データ構造の柔軟性を高める
      const category = fairy.series_name || fairy.series || fairy.category || 'その他'
      const fairyName = fairy.name || fairy.fairy_name || '不明な妖精'
      
      if (!categories[category]) {
        categories[category] = []
      }
      
      // 重複チェック
      if (!categories[category].includes(fairyName)) {
        categories[category].push(fairyName)
      }
    })

    // カテゴリをソート（シリーズの年代順など）
    const sortedCategories = {}
    const categoryOrder = [
      'ふたりはプリキュア',
      'ふたりはプリキュア Max Heart',
      'ふたりはプリキュア Splash☆Star',
      'Yes！プリキュア5',
      'Yes！プリキュア5GoGo！',
      'フレッシュプリキュア！',
      'ハートキャッチプリキュア！',
      'スイートプリキュア♪',
      'スマイルプリキュア！',
      'ドキドキ！プリキュア',
      'ハピネスチャージプリキュア！',
      'Go！プリンセスプリキュア',
      '魔法つかいプリキュア！',
      'キラキラ☆プリキュアアラモード',
      'HUGっと！プリキュア',
      'スター☆トゥインクルプリキュア',
      'ヒーリングっど♥プリキュア',
      'トロピカル〜ジュ！プリキュア',
      'デリシャスパーティ♡プリキュア',
      'ひろがるスカイ！プリキュア',
      'わんだふるぷりきゅあ！',
      'その他'
    ]

    categoryOrder.forEach(categoryName => {
      if (categories[categoryName]) {
        sortedCategories[categoryName] = categories[categoryName].sort()
      }
    })

    // categoryOrderにない項目も追加
    Object.keys(categories).forEach(categoryName => {
      if (!sortedCategories[categoryName]) {
        sortedCategories[categoryName] = categories[categoryName].sort()
      }
    })

    console.log('✅ 妖精カテゴリ整理完了:', Object.keys(sortedCategories).length, 'カテゴリ')
    return sortedCategories
  }

  // === ダイアログ関連の関数 ===
  
  const openDialog = (type, selectedValues) => {
    console.log(`🔍 ダイアログ開始: ${type}`, {
      selectedValues,
      episodeTypesDataLength: episodeTypesData.length
    })
    
    setTempSelectedValues([...selectedValues])
    setDialogs(prev => ({ ...prev, [type]: true }))
    
    if (type === 'character') {
      const categories = getCharacterCategories()
      const initialOpenState = {}
      Object.keys(categories).forEach(categoryName => {
        initialOpenState[categoryName] = false
      })
      setOpenCategories(initialOpenState)
    } else if (type === 'episode') {
      console.log('🔍 エピソードダイアログ初期化開始')
      const categories = getEpisodeCategories()
      console.log('🔍 エピソードカテゴリ取得結果:', {
        categoriesCount: Object.keys(categories).length,
        categoryNames: Object.keys(categories)
      })
      const initialOpenState = {}
      Object.keys(categories).forEach(categoryName => {
        initialOpenState[categoryName] = false
      })
      setOpenCategories(initialOpenState)
    } else if (type === 'fairy') {
      // 妖精ダイアログの初期化
      const categories = getFairyCategories()
      const initialOpenState = {}
      Object.keys(categories).forEach(categoryName => {
        initialOpenState[categoryName] = false
      })
      setOpenCategories(initialOpenState)
    }
  }

  const closeDialog = (type) => {
    setDialogs(prev => ({ ...prev, [type]: false }))
    setTempSelectedValues([])
    setOpenCategories({})
  }

  const saveDialogSelection = (type, values) => {
    console.log(`💾 ダイアログ保存開始: ${type}`, {
      values,
      valuesLength: values.length,
      currentFormData: formData[`favorite_${type}`]
    })
    
    if (type === 'episode') {
      const processedValues = values.slice(0, 3)
      console.log(`📺 エピソード保存処理:`, {
        original: values,
        processed: processedValues,
        fieldName: `favorite_${type}`
      })
      setFormData(prev => {
        const newData = { ...prev, [`favorite_${type}`]: processedValues }
        console.log(`📺 新しいformData (episode):`, newData.favorite_episode)
        return newData
      })
    } else {
      setFormData(prev => ({ ...prev, [`favorite_${type}`]: values }))
    }
    closeDialog(type)
  }

  const saveWatchedSeriesSelection = (values) => {
    setFormData(prev => ({ ...prev, watched_series: values }))
    closeDialog('watchedSeries')
  }

  // === 視聴状況ダイアログ関連の関数 ===
  const openViewingStatusDialog = () => {
    // 全シリーズが視聴済みかどうかをチェック
    const allSeriesNames = seriesData.map(series => series.name);
    const isAllWatched = allSeriesNames.length > 0 && 
      allSeriesNames.every(name => formData.watched_series_completed.includes(name));
    
    console.log('🔍 視聴状況ダイアログを開きます', {
      completed: formData.watched_series_completed.length,
      allSeriesCount: seriesData.length,
      isAllWatched: isAllWatched
    });
    
    // 既存データから一時状態を初期化
    setTempViewingStatus({
      completed: [...formData.watched_series_completed],
      current: [...formData.watched_series_current]
    });
    
    setDialogs(prev => ({ ...prev, viewingStatus: true }));
  };
  
  const closeViewingStatusDialog = () => {
    setDialogs(prev => ({ ...prev, viewingStatus: false }));
  };
  
  // シリーズの視聴状況を更新
  const updateSeriesStatus = (seriesName, status) => {
    setTempViewingStatus(prev => {
      // 新しい状態オブジェクトを作成
      const newState = {
        completed: [...prev.completed],
        current: [...prev.current],
        allWatched: prev.allWatched
      };
      
      // まず、両方のリストから削除
      newState.completed = newState.completed.filter(name => name !== seriesName);
      newState.current = newState.current.filter(name => name !== seriesName);
      
      // 指定されたステータスリストに追加
      if (status === 'completed') {
        newState.completed.push(seriesName);
      } else if (status === 'current') {
        newState.current.push(seriesName);
      }
      
      // 全てのシリーズが視聴済みかどうかを確認
      const allSeriesNames = seriesData.map(series => series.name);
      const isAllWatched = allSeriesNames.every(name => 
        newState.completed.includes(name) || name === seriesName && status === 'completed'
      );
      
      // 全シリーズ視聴済み状態を更新
      newState.allWatched = isAllWatched;
      
      return newState;
    });
  };
  
  // シリーズが特定の状況にあるかチェック
  const isSeriesInStatus = (seriesName, status) => {
    if (status === 'completed') {
      return tempViewingStatus.completed.includes(seriesName);
    } else if (status === 'current') {
      return tempViewingStatus.current.includes(seriesName);
    }
    return false;
  };
  

  
  // 視聴状況をクリア
  const clearAllViewingStatus = () => {
    setTempViewingStatus({
      completed: [],
      current: []
    });
    
    console.log('✅ 視聴状況をクリアしました');
  };
  
  // 全シリーズに視聴済みチェックを入れる
  const checkAllSeries = () => {
    if (!seriesData || seriesData.length === 0) return;
    
    const allSeriesNames = seriesData.map(series => series.name);
    
    // 現在の状態を確認
    const isAllChecked = seriesData.length > 0 && 
                         allSeriesNames.length === tempViewingStatus.completed.length && 
                         allSeriesNames.every(name => tempViewingStatus.completed.includes(name));
    
    if (isAllChecked) {
      // すべてチェック済みの場合は全て解除
      setTempViewingStatus(prev => ({
        ...prev,
        completed: []
      }));
      console.log('✅ 全シリーズの視聴済みチェックを解除しました');
    } else {
      // そうでない場合は全てチェック
      setTempViewingStatus(prev => ({
        ...prev,
        completed: allSeriesNames
      }));
      console.log('✅ 全シリーズを視聴済みに設定しました:', allSeriesNames.length, '件');
    }
  };
  
  // 視聴状況を適用
  const applyViewingStatus = () => {
    setFormData(prev => ({
      ...prev,
      watched_series_completed: tempViewingStatus.completed,
      watched_series_current: tempViewingStatus.current
    }));
    closeViewingStatusDialog();
  };

  // === SelectionDialog コンポーネント ===
  const SelectionDialog = ({ 
    isOpen, 
    onClose, 
    title, 
    dataType, 
    selectedValues, 
    onSave 
  }) => {
    if (!isOpen) return null

    const toggleSelection = (value) => {
      console.log(`🔄 選択切り替え (${dataType}):`, value)
      setTempSelectedValues(prev => {
        let newValues
        if (prev.includes(value)) {
          newValues = prev.filter(item => item !== value)
          console.log(`➖ 選択解除: ${value}`)
        } else {
          const maxCount = dataType === "episode" ? 3 : Infinity
          if (prev.length >= maxCount) {
            alert(`${dataType === "episode" ? "エピソードは最大3個" : "これ以上選択できません"}まで選択できます`)
            return prev
          }
          newValues = [...prev, value]
          console.log(`➕ 選択追加: ${value}`)
        }
        console.log(`📝 一時選択値更新 (${dataType}):`, newValues)
        return newValues
      })
    }

    const toggleCategory = (categoryName) => {
      setOpenCategories(prev => ({
        ...prev,
        [categoryName]: !prev[categoryName]
      }))
    }

    const handleSave = () => {
      console.log(`💾 ダイアログ内保存ボタンクリック (${dataType}):`, {
        tempSelectedValues,
        length: tempSelectedValues.length,
        dataType
      })
      onSave(tempSelectedValues)
    }

    const handleCancel = () => {
      setTempSelectedValues([])
      onClose()
    }

    // データタイプに応じてカテゴリを取得
    const getDataCategories = () => {
      switch(dataType) {
        case 'character':
          return getCharacterCategories()
        case 'series':
          const seriesCategories = { 'プリキュアシリーズ': seriesData.map(series => series.name) }
          return seriesCategories
        case 'movie':
          const movieCategories = { 'プリキュア映画': moviesData.map(movie => movie.name || movie.title) }
          return movieCategories
        case 'episode':
          console.log('🔍 エピソードダイアログ - データ確認:', {
            episodeTypesDataLength: episodeTypesData.length,
            hasEpisodeData: episodeTypesData.length > 0,
            sampleData: episodeTypesData.slice(0, 2)
          })
          const episodeCategories = getEpisodeCategories()
          console.log('🔍 エピソードダイアログ - カテゴリ確認:', {
            categoriesCount: Object.keys(episodeCategories).length,
            categories: Object.keys(episodeCategories)
          })
          return episodeCategories
        case 'fairy':
          return getFairyCategories()
        case 'watchedSeries':
          const watchedCategories = { '視聴可能シリーズ': seriesData.map(series => series.name) }
          return watchedCategories
        default:
          return {}
      }
    }

    const categories = getDataCategories()

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-6 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={handleCancel} className="text-white hover:bg-white/20 p-2 rounded">
                <X size={20} />
              </button>
            </div>
            {dataType === "episode" && (
              <p className="text-sm mt-2 opacity-90">魂の3話を選んでください</p>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {Object.keys(categories).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {dataType === 'episode' ? 'エピソードデータが読み込まれていません' : 'データが読み込まれていません'}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  {dataType === 'episode' 
                    ? `現在${episodeTypesData.length}件のエピソードデータが利用可能です。ページをリロードしてお試しください。`
                    : dataType === 'fairy' ? '妖精データ' : 
                      dataType === 'episode' ? 'エピソードデータ' : 
                      dataType === 'movie' ? '映画データ' : 'データ'
                  }
                </p>
                {dataType === 'episode' && episodeTypesData.length === 0 && (
                  <button
                    onClick={() => {
                      console.log('🔄 エピソードデータ再取得ボタンクリック')
                      onClose()
                      // 少し待ってからページリロードを提案
                      setTimeout(() => {
                        if (confirm('エピソードデータを再読み込みしますか？')) {
                          window.location.reload()
                        }
                      }, 100)
                    }}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    データを再読み込み
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(categories).map(([categoryName, items]) => (
                  <div key={categoryName} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left font-medium text-gray-800"
                    >
                      <span className="flex items-center space-x-2">
                        <span>{categoryName}</span>
                        <span className="text-xs text-gray-500">({items.length}件)</span>
                      </span>
                      {openCategories[categoryName] ? 
                        <ChevronUp size={16} /> : 
                        <ChevronDown size={16} />
                      }
                    </button>
                    
                    {openCategories[categoryName] && (
                      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2 bg-white">
                        {items.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => toggleSelection(item)}
                            className={`p-2 text-sm rounded-lg text-left transition-colors ${
                              tempSelectedValues.includes(item)
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              選択中: {tempSelectedValues.length}
              {dataType === "episode" && "/3"}
              件
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  console.log('🖱️ 選択を保存ボタンクリック:', {
                    dataType,
                    tempSelectedValues,
                    tempSelectedValuesLength: tempSelectedValues.length
                  })
                  handleSave()
                }}
                className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
              >
                選択を保存
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // プロフィール表示時の妖精データ処理を強化
  const renderFairyData = (fairyData) => {
    console.log('🧚 妖精データ表示処理:', fairyData)
    
    // データが存在しない場合
    if (!fairyData) {
      console.log('🧚 妖精データが null/undefined')
      return '未設定'
    }
    
    // 配列の場合
    if (Array.isArray(fairyData)) {
      const validFairies = fairyData.filter(fairy => fairy && fairy.trim && fairy.trim() !== '')
      console.log('🧚 配列データ処理結果:', validFairies)
      
      if (validFairies.length === 0) {
        return '未設定'
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
      )
    }
    
    // 文字列の場合
    if (typeof fairyData === 'string' && fairyData.trim()) {
      const fairyArray = fairyData.split(',').map(s => s.trim()).filter(s => s.length > 0)
      console.log('🧚 文字列データ処理結果:', fairyArray)
      
      if (fairyArray.length === 0) {
        return '未設定'
      }
      
      return (
        <div className="flex flex-wrap gap-2">
          {fairyArray.map((fairy, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-xs"
            >
              {fairy}
            </span>
          ))}
        </div>
      )
    }
    
    console.log('🧚 妖精データが不正な形式:', fairyData, typeof fairyData)
    return '未設定'
  }

  // === デバッグ機能 ===

  /**
   * プロフィールデータのデバッグ情報
   * 本番環境では削除または無効化することを推奨
   * @private
   */
  const debugProfileData = () => {
    // 本番環境では以下をコメントアウトまたは削除
    /*
    console.log('プロフィールデータデバッグ情報:')
    console.log('シリーズデータ:', seriesData.length, '件')
    console.log('キャラクターデータ:', charactersData.length, '件')
    console.log('映画データ:', moviesData.length, '件')
    console.log('エピソードデータ:', episodeTypesData.length, '件')
    console.log('妖精データ:', fairiesData.length, '件')
    console.log('プロフィール:', profile)
    console.log('フォームデータ:', formData)
    console.log('妖精データ詳細:', {
      profile_favorite_fairy: profile?.favorite_fairy,
      formData_favorite_fairy: formData.favorite_fairy,
      fairiesData_sample: fairiesData.slice(0, 3)
    })
    */
  }

  /**
   * 妖精データの状態を確認
   * データ整合性検証用の関数
   * @private
   */
  const checkFairyDataStatus = () => {
    console.log('🧚 妖精データ状態確認:')
    console.log('1. データベースから取得した妖精データ:', fairiesData.length, '件')
    console.log('2. プロフィールの妖精データ:', profile?.favorite_fairy)
    console.log('3. フォームの妖精データ:', formData.favorite_fairy)
    console.log('4. 妖精カテゴリ:', getFairyCategories())
    
    // データベース確認クエリ
    if (fairiesData.length > 0) {
      console.log('5. データベース妖精データサンプル:', fairiesData.slice(0, 5))
    } else {
      console.warn('⚠️ データベースに妖精データがありません')
    }
  }

  // グラデーションIDごとのCSS
  /**
   * 各プリキュアシリーズのグラデーション定義
   * BackgroundSettings.jsxのgradientPresetsと同期して保持
   */
  const gradientMap = {
    precure_classic: 'linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)',
    cure_black_white: 'linear-gradient(135deg, #ff69b4 0%, #080411 25%, #FFFD72 50%, #EAFCFF 75%, #ff69b4 100%)',
    splash_star: 'linear-gradient(135deg, #FFA646 0%, #FDFFFB 33%, #F2F780 66%, #CBE8E5 100%)',
    yes_precure5: 'linear-gradient(135deg, #0D8675 0%, #D7584F 20%, #FBA8D6 40%, #9D59C0 60%, #FCF277 80%, #2E6AA6 100%)',
    fresh: 'linear-gradient(135deg, #C0B0D5 0%, #C0B0D5 15%, #CF1336 25%, #CF1336 40%, #EE8DB8 50%, #EE8DB8 65%, #EDC23F 75%, #EDC23F 100%)',
    heartcatch: 'linear-gradient(135deg, #D4A9DF 0%, #D4A9DF 20%, #50EBFF 25%, #50EBFF 45%, #FF4DBD 50%, #FF4DBD 70%, #FFE55A 75%, #FFE55A 100%)',
    suite: 'linear-gradient(180deg, #738CF3 0%, #738CF3 25%, #DD3688 25%, #DD3688 50%, #F9CC33 50%, #F9CC33 75%, #FAFAFA 75%, #FAFAFA 100%)',
    smile: 'conic-gradient(from 45deg, #76A1FD 0deg, #76A1FD 72deg, #FEE652 72deg, #FEE652 144deg, #EB4CB0 144deg, #EB4CB0 216deg, #F15000 216deg, #F15000 288deg, #4DDC4F 288deg, #4DDC4F 360deg)',
    dokidoki: 'radial-gradient(circle at center, #F15BB2 0%, #F15BB2 20%, #F8CD28 20%, #F8CD28 40%, #F42956 40%, #F42956 60%, #D9AFF1 60%, #D9AFF1 80%, #78A5FA 80%, #78A5FA 100%)',
    happiness_charge: 'linear-gradient(to right, #FEDD5A, #85BBF9, #E63BA1, #9E88F5)',
    go_princess: 'conic-gradient(at 70% 30%, #F7BA47, #DE1A5F, #E099C1, #7ABADD, #F7BA47)',
    mahou_tsukai: 'radial-gradient(circle at 75% 25%, #F273C2 0%, #F273C2 30%, #62E5AF 30%, #62E5AF 60%, #7150C1 60%, #7150C1 100%)',
    kirakira: 'linear-gradient(to right, #E43C4D 0%, #9F71B1 20%, #E95E9F 40%, #82CDDD 60%, #F6AD14 80%, #4775B9 100%)',
    hugtto: 'conic-gradient(from 180deg at 40% 40%, #FC54A6, #E6015C, #99EAFD, #DDADF3, #FFEC6E, #FC54A6)',
    star_twinkle: 'linear-gradient(120deg, #E2CDF9 0%, #E2CDF9 15%, #FCDC72 15%, #FCDC72 35%, #FF7BA9 35%, #FF7BA9 55%, #3BE3E1 55%, #3BE3E1 75%, #24BCFC 75%, #24BCFC 100%)',
    healin_good: 'linear-gradient(135deg, #ff69b4 0%, #4caf50 50%, #2196f3 100%)',
    tropical_rouge: 'conic-gradient(from 180deg at 50% 65%, #E24383, #FBBD36, #A0E8FF, #F0FFF9, #CAA9FF, #E24383)',
    delicious_party: 'repeating-conic-gradient(from 0deg at 50% 50%, #1BF2F5 0deg 90deg, #FED93E 90deg 180deg, #CC91F8 180deg 270deg, #FF8DAC 270deg 360deg)',
    hirogaru_sky: 'radial-gradient(circle at 50% 120%, #FFB957 0%, #FFB957 25%, #FFA6DF 25%, #FFA6DF 42%, #6CDFFF 42%, #6CDFFF 68%, #F8FDFE 68%, #F8FDFE 85%, #BD91FF 85%, #BD91FF 100%)',
    wonderful_precure: 'conic-gradient(from -45deg at 65% 35%, #FE9EC4 0%, #FE9EC4 20%, #7E40FD 20%, #7E40FD 40%, #9DEAE4 40%, #9DEAE4 60%, #E9E9F1 60%, #E9E9F1 80%, #FE9EC4 80%, #FE9EC4 100%)'
  }

  // === メインレンダー部分 ===
  return (
    <div className="space-y-6 min-h-screen">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 p-3 sm:p-6 text-white">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h1 className="text-xl sm:text-3xl font-bold flex items-center space-x-2">
              <Heart size={24} className="sm:w-8 sm:h-8" />
              <span>プロフィール詳細</span>
            </h1>
            <div className="flex items-center justify-end space-x-2 sm:space-x-3">
              <div className="order-2 sm:order-1">
                <BackgroundSettings 
                  session={session}
                  currentBackground={userBackground}
                  onBackgroundUpdate={handleBackgroundUpdate}
                />
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="order-1 sm:order-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                  <Edit size={14} className="sm:w-4 sm:h-4" />
                  <span>編集</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {!editing ? (
            /* プロフィール表示モード */
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="アバター"
                      className="w-24 h-24 rounded-full object-cover border-4 border-pink-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 border-4 border-pink-200 flex items-center justify-center">
                      <User size={40} className="text-pink-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {profile?.display_name || 'プリキュアファン'}
                    </h2>
                    
                    {/* ソーシャルリンクのアイコン表示 */}
                    {Array.isArray(profile?.social_links) && profile.social_links.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {profile.social_links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.display_name || link.platform}
                            className="inline-block p-1.5 rounded-full bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                          >
                            {/* プラットフォーム別のアイコン表示 */}
                            {link.platform === 'X (Twitter)' && (
                              <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            )}
                            {link.platform === 'YouTube' && (
                              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            )}
                            {link.platform === 'Instagram' && (
                              <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                              </svg>
                            )}
                            {link.platform === 'pixiv' && (
                              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.935 0A4.924 4.924 0 0 0 0 4.935v14.13A4.924 4.924 0 0 0 4.935 24h14.13A4.924 4.924 0 0 0 24 19.065V4.935A4.924 4.924 0 0 0 19.065 0zm8.5 5.5c2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5h-3v3h-2V5.5zm0 7c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5h-3v5z"/>
                              </svg>
                            )}
                            {link.platform === 'Discord' && (
                              <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"/>
                              </svg>
                            )}
                            {link.platform === 'TikTok' && (
                              <svg className="w-4 h-4 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                              </svg>
                            )}
                            {link.platform === 'Twitch' && (
                              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                              </svg>
                            )}
                            {link.platform === 'ニコニコ動画' && (
                              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                                <circle cx="8" cy="12" r="3"/>
                                <circle cx="16" cy="12" r="3"/>
                              </svg>
                            )}
                            {!['X (Twitter)', 'YouTube', 'Instagram', 'pixiv', 'Discord', 'TikTok', 'Twitch', 'ニコニコ動画'].includes(link.platform) && (
                              <svg className="w-4 h-4 text-gray-700" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                              </svg>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {profile?.age && <span>🎂 {profile.age}歳</span>}
                    {profile?.fan_years && <span>💖 ファン歴{profile.fan_years}年</span>}
                    {profile?.gender && <span>👤 {profile.gender}</span>}
                  </div>
                  
                  {/* 全シリーズ視聴済みバッジ - 年齢・性別の下に表示 */}
                  {seriesData.length > 0 && 
                   Array.isArray(profile?.watched_series_completed) && 
                   profile.watched_series_completed.length > 0 && 
                   seriesData.map(s => s.name).every(name => profile.watched_series_completed.includes(name)) && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-sm">
                        <Sparkles size={14} className="mr-1" />
                        全シリーズ視聴済み！！
                      </span>
                    </div>
                  )}

                </div>
              </div>

              {/* 趣味・活動 */}
              {profile?.hobbies && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="text-indigo-500" size={20} />
                    <h3 className="font-semibold text-gray-800">趣味・主な活動</h3>
                  </div>
                  <p className="text-gray-700 text-sm">{profile.hobbies}</p>
                </div>
              )}

              {/* プリキュア愛コメント */}
              {profile?.what_i_love && (
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="text-pink-500" size={20} />
                    <h3 className="font-semibold text-gray-800">プリキュア愛</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.what_i_love}</p>
                </div>
              )}

              {/* お気に入り情報 */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="text-purple-500" size={20} />
                  <h3 className="font-semibold text-gray-800">お気に入り</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
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
                  <div className="md:col-span-2 bg-blue-50/40 p-3 rounded-lg border border-blue-100 mb-4">{/* mb-4を追加 */}
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-800">👀 視聴状況</h4>
                      {Array.isArray(profile?.watched_series_completed) && profile.watched_series_completed.length > 0 && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {profile.watched_series_completed.length}シリーズ視聴済み
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* 視聴完了シリーズ */}
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                          <span className="inline-block w-4 h-4 mr-1 bg-green-200 rounded-full flex items-center justify-center text-green-800 text-[10px]">✓</span>
                          視聴済み:
                        </h5>
                        {Array.isArray(profile?.watched_series_completed) && profile.watched_series_completed.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pb-1 pr-1 w-full">
                            {console.log('🔍 視聴済みシリーズを表示:', profile.watched_series_completed)}
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
                          <span className="inline-block w-4 h-4 mr-1 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 text-[10px]">→</span>
                          視聴中:
                        </h5>
                        {Array.isArray(profile?.watched_series_current) && profile.watched_series_current.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pb-1 pr-1 w-full">
                            {console.log('🔍 視聴中シリーズを表示:', profile.watched_series_current)}
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
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="text-gray-500" size={20} />
                    <h3 className="font-semibold text-gray-800">その他</h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.free_text}</p>
                </div>
              )}

              {/* ソーシャルリンクはプロフィール名の横にアイコンとして表示されるようになりました */}
            </div>
          ) : (

          /* プロフィール編集モード */
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 pb-3 sm:pb-4 border-b border-gray-200">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">プロフィール編集</h2>
                <button
                  onClick={() => setEditing(false)}
                  className="self-end sm:self-auto text-gray-500 hover:text-gray-700 p-1"
                >
                  <X size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* 基本情報 */}
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <User className="mr-2" size={18} />
                    基本情報
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.display_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        placeholder="あなたの名前"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">年齢</label>
                      <input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        placeholder="例: 25"
                        min="1"
                        max="150"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ファン歴</label>
                      <input
                        type="number"
                        value={formData.fan_years}
                        onChange={(e) => setFormData(prev => ({ ...prev, fan_years: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        placeholder="例: 10"
                        min="0"
                        max="50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                      >
                        <option value="">選択してください</option>
                        <option value="男性">男性</option>
                        <option value="女性">女性</option>
                        <option value="その他">その他</option>
                        <option value="回答しない">回答しない</option>
                      </select>
                    </div>
                  </div>
                </div>


                {/* 趣味・活動 */}
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <Heart className="mr-2" size={18} />
                    趣味・活動
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        趣味・主な活動
                      </label>
                      <textarea
                        value={formData.hobbies}
                        onChange={(e) => setFormData(prev => ({ ...prev, hobbies: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        rows="2"
                        placeholder="プリキュア以外の趣味や活動があれば教えてください"
                      />
                    </div>

                    {/* ソーシャルリンク管理 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ソーシャルリンク
                      </label>
                      <SocialLinkManager
                        links={formData.social_links}
                        onLinksChange={handleSocialLinksUpdate}
                      />
                    </div>

                    {/* 視聴状況管理ボタン */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        視聴状況
                      </label>
                      <button
                        type="button"
                        onClick={openViewingStatusDialog}
                        className="w-full px-4 py-3 sm:py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2 text-base"
                      >
                        <span className="text-lg">👀</span>
                        <span>視聴状況を管理</span>
                      </button>
                      <div className="mt-2 text-xs sm:text-sm text-gray-500">
                        {(formData.watched_series_completed.length > 0 || formData.watched_series_current.length > 0) ? 
                          `視聴済み: ${formData.watched_series_completed.length}シリーズ / 視聴中: ${formData.watched_series_current.length}シリーズ` :
                          '視聴中/視聴済みのシリーズを設定できます'
                        }
                      </div>
                    </div>

                    {/* プリキュア愛 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        プリキュアの好きなところ
                      </label>
                      <textarea
                        value={formData.what_i_love}
                        onChange={(e) => setFormData(prev => ({ ...prev, what_i_love: e.target.value }))}
                        className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                        rows="3"
                        placeholder="プリキュアの魅力や好きなところを教えてください"
                      />
                    </div>
                  </div>
                </div>

                {/* お気に入り選択 */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-xl">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                    <Sparkles className="mr-2" size={18} />
                    お気に入り
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* お気に入りキャラクター */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お気に入りプリキュア
                      </label>
                      <button
                        type="button"
                        onClick={() => openDialog('character', formData.favorite_character)}
                        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                      >
                        {Array.isArray(formData.favorite_character) && formData.favorite_character.length > 0
                          ? `${formData.favorite_character.length}人のキャラクターを選択中`
                          : 'キャラクターを選択してください'
                        }
                      </button>
                      {Array.isArray(formData.favorite_character) && formData.favorite_character.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.favorite_character.map((character, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-pink-200 text-pink-800 rounded-full text-xs"
                            >
                              {character}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* お気に入りシリーズ */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お気に入りシリーズ
                      </label>
                      <button
                        type="button"
                        onClick={() => openDialog('series', formData.favorite_series)}
                        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                      >
                        {Array.isArray(formData.favorite_series) && formData.favorite_series.length > 0
                          ? `${formData.favorite_series.length}個のシリーズを選択中`
                          : 'シリーズを選択してください'
                        }
                      </button>
                      {Array.isArray(formData.favorite_series) && formData.favorite_series.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.favorite_series.map((series, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                            >
                              {series}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* お気に入り映画 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お気に入り映画
                      </label>
                      <button
                        type="button"
                        onClick={() => openDialog('movie', formData.favorite_movie)}
                        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                      >
                        {Array.isArray(formData.favorite_movie) && formData.favorite_movie.length > 0
                          ? `${formData.favorite_movie.length}本の映画を選択中`
                          : '映画を選択してください'
                        }
                      </button>
                      {Array.isArray(formData.favorite_movie) && formData.favorite_movie.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.favorite_movie.map((movie, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs"
                            >
                              {movie}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* お気に入り妖精 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お気に入り妖精
                      </label>
                      <button
                        type="button"
                        onClick={() => openDialog('fairy', formData.favorite_fairy)}
                        className="w-full px-4 py-3 sm:py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                      >
                        {Array.isArray(formData.favorite_fairy) && formData.favorite_fairy.length > 0
                          ? `${formData.favorite_fairy.length}体の妖精を選択中`
                          : '妖精を選択してください'
                        }
                      </button>
                      {Array.isArray(formData.favorite_fairy) && formData.favorite_fairy.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formData.favorite_fairy.map((fairy, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs"
                            >
                              {fairy}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* お気に入りエピソード */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お気に入りエピソード <span className="text-orange-600 text-xs">(最大3個)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        console.log('🔍 エピソードボタンクリック:', {
                          episodeTypesDataLength: episodeTypesData.length,
                          currentEpisodes: formData.favorite_episode
                        })
                        if (episodeTypesData.length === 0) {
                          console.warn('⚠️ エピソードデータがまだ読み込まれていません')
                          alert('エピソードデータを読み込み中です。少しお待ちください。')
                          return
                        }
                        openDialog('episode', formData.favorite_episode)
                      }}
                      disabled={episodeTypesData.length === 0}
                      className={`w-full px-4 py-3 sm:py-2 border rounded-lg text-left focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base ${
                        episodeTypesData.length === 0 
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {(() => {
                      const episodes = formData.favorite_episode
                      const hasEpisodes = Array.isArray(episodes) && episodes.length > 0
                      const episodeCount = episodes?.length || 0
                      const isDataLoaded = episodeTypesData.length > 0
                      
                      console.log('🎭 エピソードボタンテキスト決定:', {
                        hasEpisodes,
                        episodeCount,
                        isDataLoaded,
                        episodes
                      })
                      
                      if (hasEpisodes) {
                        return `${episodeCount}個のエピソードを選択中`
                      } else if (!isDataLoaded) {
                        return 'エピソードデータを読み込み中...'
                      } else {
                        return 'エピソードを選択してください'
                      }
                    })()}
                  </button>
                  {Array.isArray(formData.favorite_episode) && formData.favorite_episode.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(() => {
                        console.log('🎭 エピソード表示レンダリング:', {
                          formDataEpisode: formData.favorite_episode,
                          isArray: Array.isArray(formData.favorite_episode),
                          length: formData.favorite_episode?.length
                        })
                        return formData.favorite_episode.map((episode, index) => {
                          console.log(`🎭 エピソード${index + 1}:`, episode)
                          return (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs"
                            >
                              {episode}
                            </span>
                          )
                        })
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* その他のテキスト */}
              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
                  <Star className="mr-2" size={18} />
                  その他
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    その他・自由記入欄
                  </label>
                  <textarea
                    value={formData.free_text}
                    onChange={(e) => setFormData(prev => ({ ...prev, free_text: e.target.value }))}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base"
                    rows="3"
                    placeholder="自由にメッセージをどうぞ"
                  />
                </div>
              </div>

              {/* 保存ボタン（プリキュア変身セリフ版） */}
              <div className="sticky bottom-0 pt-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 -mx-3 sm:-mx-6 px-3 sm:px-6 pb-3 sm:pb-6">
                <button
                  onClick={updateProfile}
                  disabled={loading}
                  className={`w-full py-3 sm:py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-base ${
                      loading 
                        ? 'bg-pink-300 cursor-not-allowed' 
                        : 'bg-pink-500 hover:bg-pink-600 text-white'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="animate-pulse">{saveMessage}</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} className="sm:w-5 sm:h-5" />
                        <span>プロフィールを保存</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 選択ダイアログ */}
      <SelectionDialog
        isOpen={dialogs.character}
        onClose={() => closeDialog('character')}
        title="お気に入りキャラクターを選択"
        dataType="character"
        selectedValues={formData.favorite_character}
        onSave={(values) => saveDialogSelection('character', values)}
      />

      <SelectionDialog
        isOpen={dialogs.series}
        onClose={() => closeDialog('series')}
        title="お気に入りシリーズを選択"
        dataType="series"
        selectedValues={formData.favorite_series}
        onSave={(values) => saveDialogSelection('series', values)}
      />

      <SelectionDialog
        isOpen={dialogs.movie}
        onClose={() => closeDialog('movie')}
        title="お気に入り映画を選択"
        dataType="movie"
        selectedValues={formData.favorite_movie}
        onSave={(values) => saveDialogSelection('movie', values)}
      />

      <SelectionDialog
        isOpen={dialogs.episode}
        onClose={() => closeDialog('episode')}
        title="お気に入りエピソードを選択（最大3個）"
        dataType="episode"
        selectedValues={formData.favorite_episode}
        onSave={(values) => saveDialogSelection('episode', values)}
      />

      {/* 妖精ダイアログ */}
      <SelectionDialog
        isOpen={dialogs.fairy}
        onClose={() => closeDialog('fairy')}
        title="お気に入り妖精を選択"
        dataType="fairy"
        selectedValues={formData.favorite_fairy}
        onSave={(values) => saveDialogSelection('fairy', values)}
      />

      <SelectionDialog
        isOpen={dialogs.watchedSeries}
        onClose={() => closeDialog('watchedSeries')}
        title="視聴済みシリーズを選択"
        dataType="watchedSeries"
        selectedValues={formData.watched_series}
        onSave={saveWatchedSeriesSelection}
      />

      {/* 視聴状況ダイアログ */}
      {dialogs.viewingStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* ヘッダー部分 - 固定 */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">視聴状況の設定</h3>
              <button onClick={closeViewingStatusDialog} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* スクロール可能なコンテンツエリア */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 視聴状況選択フォーム */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between items-center">
                    <span>完了したシリーズ</span>
                    <button 
                      onClick={checkAllSeries}
                      className={`text-xs ${
                        seriesData.length > 0 && 
                        seriesData.map(s => s.name).length === tempViewingStatus.completed.length &&
                        seriesData.map(s => s.name).every(name => tempViewingStatus.completed.includes(name))
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white px-2 py-1 rounded transition-colors flex items-center`}
                    >
                      {seriesData.length > 0 && 
                        seriesData.map(s => s.name).length === tempViewingStatus.completed.length &&
                        seriesData.map(s => s.name).every(name => tempViewingStatus.completed.includes(name))
                        ? <X size={12} className="mr-1" />
                        : <Check size={12} className="mr-1" />
                      }
                      {seriesData.length > 0 && 
                        seriesData.map(s => s.name).length === tempViewingStatus.completed.length &&
                        seriesData.map(s => s.name).every(name => tempViewingStatus.completed.includes(name))
                        ? 'チェックを全て解除'
                        : '全シリーズに視聴済みチェック'
                      }
                    </button>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                    {seriesData.map(series => (
                      <button
                        key={series.id}
                        onClick={() => updateSeriesStatus(series.name, isSeriesInStatus(series.name, 'completed') ? null : 'completed')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1 mb-1 ${
                          isSeriesInStatus(series.name, 'completed')
                            ? 'bg-green-500 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        <span>{series.name}</span>
                        {isSeriesInStatus(series.name, 'completed') && (
                          <span className="text-white bg-green-600 rounded-full w-4 h-4 flex items-center justify-center text-xs ml-1">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在視聴中のシリーズ
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-gray-100 rounded-lg">
                    {seriesData.map(series => (
                      <button
                        key={series.id}
                        onClick={() => updateSeriesStatus(series.name, isSeriesInStatus(series.name, 'current') ? null : 'current')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center space-x-1 mb-1 ${
                          isSeriesInStatus(series.name, 'current')
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        <span>{series.name}</span>
                        {isSeriesInStatus(series.name, 'current') && (
                          <span className="text-white bg-blue-600 rounded-full w-4 h-4 flex items-center justify-center text-xs ml-1">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>


              </div>
            </div>

            {/* フッター部分（ボタン） - 固定 */}
            <div className="p-6 border-t bg-gray-50 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={clearAllViewingStatus}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                リセット
              </button>
              <button
                onClick={applyViewingStatus}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* デバッグ機能（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">🔧 開発者向けデバッグ</h4>
          <div className="flex flex-wrap space-x-2 space-y-2">
            <button
              onClick={debugProfileData}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              プロフィールデータ確認
            </button>
            <button
              onClick={() => console.log('妖精データ:', fairiesData)}
              className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
            >
              妖精データ確認
            </button>
            <button
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              フォームデータ確認
            </button>
            <button
              onClick={() => console.log('プロフィール:', profile)}
              className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
            >
              プロフィール確認
            </button>
            <button
              onClick={() => {
                console.log('妖精カテゴリ:', getFairyCategories())
                console.log('妖精データ詳細:', fairiesData.slice(0, 3))
                checkFairyDataStatus()
              }}
              className="px-3 py-1 bg-pink-500 text-white rounded text-sm hover:bg-pink-600"
            >
              妖精カテゴリ確認
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            <p>データ件数: シリーズ{seriesData.length}件 | キャラクター{charactersData.length}件 | 映画{moviesData.length}件 | エピソード{episodeTypesData.length}件 | 妖精{fairiesData.length}件</p>
            {userBackground && (
              <p>背景設定: {userBackground.type} ({userBackground.gradient_id || userBackground.solid_color || 'カスタム画像'})</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// === 開発時のヘルパー関数 ===
// グローバルスコープでデバッグ関数を利用可能にする（開発時のみ）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.debugProfile = {
    checkProfileData: () => {
      console.log('🔍 プロフィールデータの状態確認')
    },
    checkFairyData: () => {
      console.log('🧚 妖精データの状態確認')
    },
    checkDatabase: async () => {
      console.log('🔍 データベース接続確認')
      try {
        // precure_fairies テーブルの確認
        const { data: fairyData, error: fairyError } = await supabase
          .from('precure_fairies')
          .select('count(*)')
          .single()
        
        if (fairyError) {
          console.error('❌ 妖精テーブルエラー:', fairyError)
        } else {
          console.log('✅ 妖精テーブル接続OK, 妖精数:', fairyData.count)
        }

        // その他のテーブルも確認
        const { data: episodeData, error: episodeError } = await supabase
          .from('precure_episodes')
          .select('count(*)')
          .single()
        
        if (episodeError) {
          console.error('❌ エピソードテーブルエラー:', episodeError)
        } else {
          console.log('✅ エピソードテーブル接続OK, エピソード数:', episodeData.count)
        }
        
      } catch (error) {
        console.error('❌ 接続テストエラー:', error)
      }
    },
    testFairyCategories: () => {
      console.log('🧚 妖精カテゴリテスト')
    }
  }
}