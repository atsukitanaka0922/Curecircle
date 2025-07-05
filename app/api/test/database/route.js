import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET() {
  try {
    console.log('🔗 Supabaseデータベーステスト開始...')
    
    const results = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // === 1. プリキュアシリーズデータ ===
    try {
      const { data: seriesData, error: seriesError } = await supabase
        .from('precure_series')
        .select('*')
        .order('year_start', { ascending: true })

      if (seriesError) {
        results.tables.series = { error: seriesError.message }
      } else {
        results.tables.series = {
          count: seriesData?.length || 0,
          sample: seriesData?.slice(0, 3) || []
        }
      }
    } catch (error) {
      results.tables.series = { error: error.message }
    }

    // === 2. プリキュアキャラクターデータ ===
    try {
      const { data: charactersData, error: charactersError } = await supabase
        .from('precure_characters')
        .select('*')
        .order('id', { ascending: true })

      if (charactersError) {
        results.tables.characters = { error: charactersError.message }
      } else {
        results.tables.characters = {
          count: charactersData?.length || 0,
          sample: charactersData?.slice(0, 3) || []
        }
      }
    } catch (error) {
      results.tables.characters = { error: error.message }
    }

    // === 3. エピソードデータ（複数テーブル候補） ===
    const episodeTableCandidates = ['precure_episodes', 'episode_types', 'episodes', 'precure_episode_data']
    results.tables.episodes = { attempts: {} }
    
    for (const tableName of episodeTableCandidates) {
      try {
        const { data: episodeData, error: episodeError } = await supabase
          .from(tableName)
          .select('*')
          .order('id', { ascending: true })

        if (episodeError) {
          results.tables.episodes.attempts[tableName] = { error: episodeError.message }
        } else {
          // キミとアイドルプリキュア♪関連を検索
          const kimitoIdolEpisodes = episodeData?.filter(ep => {
            const name = ep.name || ep.title || ep.episode_name || ''
            const category = ep.category || ep.series_name || ep.series || ''
            return name.includes('キミとアイドルプリキュア') || category.includes('キミとアイドルプリキュア')
          }) || []

          results.tables.episodes.attempts[tableName] = {
            count: episodeData?.length || 0,
            sample: episodeData?.slice(0, 3) || [],
            kimitoIdolCount: kimitoIdolEpisodes.length,
            kimitoIdolEpisodes: kimitoIdolEpisodes
          }
          
          // 最初に成功したテーブルをメインとして設定
          if (!results.tables.episodes.main) {
            results.tables.episodes.main = tableName
            results.tables.episodes.data = {
              count: episodeData?.length || 0,
              kimitoIdolCount: kimitoIdolEpisodes.length,
              kimitoIdolEpisodes: kimitoIdolEpisodes
            }
          }
        }
      } catch (error) {
        results.tables.episodes.attempts[tableName] = { error: error.message }
      }
    }

    // === 4. その他のテーブル確認 ===
    const otherTables = ['precure_movies', 'precure_fairies', 'profiles', 'user_backgrounds', 'digital_cards', 'local_playlists']
    
    for (const tableName of otherTables) {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (error) {
          results.tables[tableName] = { error: error.message }
        } else {
          results.tables[tableName] = { count: count || 0 }
        }
      } catch (error) {
        results.tables[tableName] = { error: error.message }
      }
    }

    console.log('📊 データベーステスト結果:', JSON.stringify(results, null, 2))
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('❌ データベーステストエラー:', error)
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
