// データベーステスト用の簡易スクリプト
// ブラウザのコンソールで実行可能

async function testSupabaseData() {
  console.log('🔗 Supabaseデータベーステスト開始...')
  
  // 動的にSupabaseクライアントをimport
  const { supabase } = await import('./lib/supabase.js')
  
  const results = {}
  
  try {
    // === 1. プリキュアシリーズデータ ===
    console.log('🎭 プリキュアシリーズデータを取得中...')
    const { data: seriesData, error: seriesError } = await supabase
      .from('precure_series')
      .select('*')
      .order('year_start', { ascending: true })

    if (seriesError) {
      console.error('❌ シリーズデータエラー:', seriesError)
      results.series = { error: seriesError.message }
    } else {
      console.log(`✅ シリーズデータ: ${seriesData?.length || 0}件`)
      results.series = {
        count: seriesData?.length || 0,
        data: seriesData || []
      }
      
      if (seriesData && seriesData.length > 0) {
        console.log('📋 シリーズサンプル:')
        seriesData.slice(0, 3).forEach((series, index) => {
          console.log(`  ${index + 1}. ${series.name} (${series.year_start}年〜)`)
        })
      }
    }

    // === 2. エピソードデータ ===
    console.log('\n✨ エピソードデータを取得中...')
    const episodeTableCandidates = ['precure_episodes', 'episode_types', 'episodes', 'precure_episode_data']
    
    for (const tableName of episodeTableCandidates) {
      try {
        console.log(`🔍 ${tableName}テーブルを確認中...`)
        const { data: episodeData, error: episodeError } = await supabase
          .from(tableName)
          .select('*')
          .order('id', { ascending: true })

        if (episodeError) {
          console.log(`⚠️  ${tableName}: ${episodeError.message}`)
        } else {
          console.log(`✅ ${tableName}: ${episodeData?.length || 0}件`)
          
          if (episodeData && episodeData.length > 0) {
            // キミとアイドルプリキュア♪関連を検索
            const kimitoIdolEpisodes = episodeData.filter(ep => {
              const name = ep.name || ep.title || ep.episode_name || ''
              const category = ep.category || ep.series_name || ep.series || ''
              return name.includes('キミとアイドルプリキュア') || category.includes('キミとアイドルプリキュア')
            })
            
            if (kimitoIdolEpisodes.length > 0) {
              console.log(`🎭 キミとアイドルプリキュア♪: ${kimitoIdolEpisodes.length}件`)
              kimitoIdolEpisodes.forEach((ep, index) => {
                const name = ep.name || ep.title || ep.episode_name || '不明'
                const episodeNum = ep.episode_number || ep.number || '?'
                console.log(`    ${index + 1}. 第${episodeNum}話 ${name}`)
              })
              
              results.kimitoIdolEpisodes = {
                tableName: tableName,
                count: kimitoIdolEpisodes.length,
                episodes: kimitoIdolEpisodes
              }
            }
            
            results.episodes = {
              tableName: tableName,
              count: episodeData.length,
              sample: episodeData.slice(0, 5)
            }
            
            break // 最初に成功したテーブルで終了
          }
        }
      } catch (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      }
    }

    console.log('\n🎉 テスト完了！結果:')
    console.log(results)
    return results
    
  } catch (error) {
    console.error('❌ テスト実行中にエラー:', error)
    return { error: error.message }
  }
}

// 実行
testSupabaseData()
