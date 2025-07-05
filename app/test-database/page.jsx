'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function DatabaseTestPage() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const testDatabase = async () => {
    setLoading(true)
    setResults(null)
    
    try {
      console.log('🔗 Supabaseデータベーステスト開始...')
      
      const testResults = {
        timestamp: new Date().toISOString(),
        tables: {}
      }

      // === 1. プリキュアシリーズデータ ===
      try {
        console.log('🎭 プリキュアシリーズデータを取得中...')
        const { data: seriesData, error: seriesError } = await supabase
          .from('precure_series')
          .select('*')
          .order('year_start', { ascending: true })

        if (seriesError) {
          console.error('❌ シリーズデータエラー:', seriesError)
          testResults.tables.series = { error: seriesError.message }
        } else {
          console.log(`✅ シリーズデータ: ${seriesData?.length || 0}件`)
          testResults.tables.series = {
            count: seriesData?.length || 0,
            sample: seriesData?.slice(0, 3) || []
          }
        }
      } catch (error) {
        testResults.tables.series = { error: error.message }
      }

      // === 2. プリキュアキャラクターデータ ===
      try {
        console.log('👥 プリキュアキャラクターデータを取得中...')
        const { data: charactersData, error: charactersError } = await supabase
          .from('precure_characters')
          .select('*')
          .order('id', { ascending: true })

        if (charactersError) {
          console.error('❌ キャラクターデータエラー:', charactersError)
          testResults.tables.characters = { error: charactersError.message }
        } else {
          console.log(`✅ キャラクターデータ: ${charactersData?.length || 0}件`)
          testResults.tables.characters = {
            count: charactersData?.length || 0,
            sample: charactersData?.slice(0, 3) || []
          }
        }
      } catch (error) {
        testResults.tables.characters = { error: error.message }
      }

      // === 3. エピソードデータ（複数テーブル候補） ===
      console.log('✨ エピソードデータを取得中...')
      const episodeTableCandidates = ['precure_episodes', 'episode_types', 'episodes', 'precure_episode_data']
      testResults.tables.episodes = { attempts: {} }
      
      for (const tableName of episodeTableCandidates) {
        try {
          console.log(`🔍 ${tableName}テーブルを確認中...`)
          const { data: episodeData, error: episodeError } = await supabase
            .from(tableName)
            .select('*')
            .order('id', { ascending: true })

          if (episodeError) {
            console.log(`⚠️  ${tableName}: ${episodeError.message}`)
            testResults.tables.episodes.attempts[tableName] = { error: episodeError.message }
          } else {
            console.log(`✅ ${tableName}: ${episodeData?.length || 0}件`)
            
            // キミとアイドルプリキュア♪関連を検索
            const kimitoIdolEpisodes = episodeData?.filter(ep => {
              const name = ep.name || ep.title || ep.episode_name || ''
              const category = ep.category || ep.series_name || ep.series || ''
              return name.includes('キミとアイドルプリキュア') || category.includes('キミとアイドルプリキュア')
            }) || []

            if (kimitoIdolEpisodes.length > 0) {
              console.log(`🎭 キミとアイドルプリキュア♪: ${kimitoIdolEpisodes.length}件`)
              kimitoIdolEpisodes.forEach((ep, index) => {
                const name = ep.name || ep.title || ep.episode_name || '不明'
                const episodeNum = ep.episode_number || ep.number || '?'
                console.log(`    ${index + 1}. 第${episodeNum}話 ${name}`)
              })
            }

            testResults.tables.episodes.attempts[tableName] = {
              count: episodeData?.length || 0,
              sample: episodeData?.slice(0, 3) || [],
              kimitoIdolCount: kimitoIdolEpisodes.length,
              kimitoIdolEpisodes: kimitoIdolEpisodes
            }
            
            // 最初に成功したテーブルをメインとして設定
            if (!testResults.tables.episodes.main) {
              testResults.tables.episodes.main = tableName
              testResults.tables.episodes.mainData = {
                count: episodeData?.length || 0,
                kimitoIdolCount: kimitoIdolEpisodes.length,
                kimitoIdolEpisodes: kimitoIdolEpisodes
              }
            }
            
            break // 最初に成功したテーブルで終了
          }
        } catch (error) {
          console.log(`❌ ${tableName}: ${error.message}`)
          testResults.tables.episodes.attempts[tableName] = { error: error.message }
        }
      }

      console.log('🎉 テスト完了！結果:')
      console.log(testResults)
      setResults(testResults)
      
    } catch (error) {
      console.error('❌ テスト実行中にエラー:', error)
      setResults({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // ページ読み込み時に自動実行
    testDatabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔍 Supabaseデータベーステスト</h1>
        
        <button
          onClick={testDatabase}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg mb-6 disabled:opacity-50"
        >
          {loading ? '🔄 テスト実行中...' : '🚀 データベーステスト実行'}
        </button>

        {results && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
            
            {results.error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong>エラー:</strong> {results.error}
              </div>
            ) : (
              <div className="space-y-6">
                {/* シリーズデータ */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg">🎭 プリキュアシリーズ</h3>
                  {results.tables.series?.error ? (
                    <p className="text-red-600">エラー: {results.tables.series.error}</p>
                  ) : (
                    <p className="text-green-600">✅ {results.tables.series?.count || 0}件のデータ</p>
                  )}
                </div>

                {/* キャラクターデータ */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h3 className="font-semibold text-lg">👥 プリキュアキャラクター</h3>
                  {results.tables.characters?.error ? (
                    <p className="text-red-600">エラー: {results.tables.characters.error}</p>
                  ) : (
                    <p className="text-green-600">✅ {results.tables.characters?.count || 0}件のデータ</p>
                  )}
                </div>

                {/* エピソードデータ */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="font-semibold text-lg">✨ エピソードデータ</h3>
                  {results.tables.episodes?.main ? (
                    <div>
                      <p className="text-green-600">✅ メインテーブル: {results.tables.episodes.main}</p>
                      <p className="text-gray-600">総エピソード数: {results.tables.episodes.mainData?.count || 0}件</p>
                      <p className="text-blue-600 font-semibold">
                        🎭 キミとアイドルプリキュア♪: {results.tables.episodes.mainData?.kimitoIdolCount || 0}件
                      </p>
                      
                      {results.tables.episodes.mainData?.kimitoIdolEpisodes?.length > 0 && (
                        <div className="mt-2 bg-blue-50 p-3 rounded">
                          <h4 className="font-medium text-blue-800 mb-2">キミとアイドルプリキュア♪ エピソード一覧:</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            {results.tables.episodes.mainData.kimitoIdolEpisodes.map((ep, index) => {
                              const name = ep.name || ep.title || ep.episode_name || '不明'
                              const episodeNum = ep.episode_number || ep.number || '?'
                              return (
                                <li key={index}>第{episodeNum}話: {name}</li>
                              )
                            })}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-600">❌ エピソードテーブルにアクセスできませんでした</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold mb-2">📊 詳細ログ（開発者コンソールを確認）</h3>
              <p className="text-sm text-gray-600">
                ブラウザの開発者ツール（F12）のコンソールタブで詳細なログを確認できます。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
