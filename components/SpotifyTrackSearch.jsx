/**
 * components/SpotifyTrackSearch.jsx - Spotify楽曲検索コンポーネント
 * 
 * プリキュア関連の楽曲をSpotify APIを使用して検索し、
 * プレイリストに追加するためのモーダルコンポーネント。
 * 
 * 特徴:
 * - Spotify APIを利用した楽曲検索
 * - プリキュア楽曲の推奨検索ワード提供
 * - 楽曲プレビュー再生機能
 * - 複数楽曲の選択と一括追加
 * - ローカルプレイリスト/Spotifyプレイリスト両対応
 * 
 * @author CureCircle Team
 * @version 1.4.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Play, Pause, Volume2, Check, X, Music, Loader } from 'lucide-react'

export default function SpotifyTrackSearch({ 
  isOpen, 
  onClose, 
  playlistId, 
  onTracksAdded, 
  session,
  isLocalPlaylist = true // LocalPlaylist用のフラグを追加
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedTracks, setSelectedTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [playingPreview, setPlayingPreview] = useState(null)
  const [audio, setAudio] = useState(null)
  const [error, setError] = useState('')

  // プリキュア関連の推奨検索ワード
  const suggestedSearches = [
    'プリキュア オープニング',
    'プリキュア エンディング',
    'プリキュア 変身',
    'プリキュア 挿入歌',
    'プリキュア 映画',
    'キミとアイドルプリキュア'
  ]

  // 楽曲検索
  const searchTracks = async (query) => {
    if (!query.trim()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(query)}&limit=20`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        
        if (response.status === 401) {
          setError('Spotifyの認証が無効です。ページを更新して再ログインしてください。')
        } else {
          setError(errorData.error || `検索に失敗しました (${response.status})`)
        }
        return
      }

      const data = await response.json()
      setSearchResults(data.tracks || [])
      
      if (!data.tracks || data.tracks.length === 0) {
        setError('該当する楽曲が見つかりませんでした。別のキーワードで試してください。')
      }

    } catch (error) {
      console.error('検索エラー:', error)
      setError('ネットワークエラーが発生しました。接続を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  // エンターキーでの検索
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchTracks(searchQuery)
    }
  }

  // 楽曲選択の切り替え
  const toggleTrackSelection = (track) => {
    setSelectedTracks(prev => {
      const isSelected = prev.some(t => t.id === track.id)
      if (isSelected) {
        return prev.filter(t => t.id !== track.id)
      } else {
        return [...prev, track]
      }
    })
  }

  // プレビュー再生/停止
  const togglePreview = (track) => {
    if (!track.preview_url) return

    if (playingPreview === track.id) {
      // 停止
      if (audio) {
        audio.pause()
        setAudio(null)
      }
      setPlayingPreview(null)
    } else {
      // 再生
      if (audio) {
        audio.pause()
      }
      
      const newAudio = new Audio(track.preview_url)
      newAudio.play()
      newAudio.onended = () => setPlayingPreview(null)
      
      setAudio(newAudio)
      setPlayingPreview(track.id)
    }
  }  // 選択した楽曲をプレイリストに追加
  const addSelectedTracks = async () => {
    if (selectedTracks.length === 0) return

    setAdding(true)
    setError('')

    try {
      // LocalPlaylist用の場合は、楽曲データをそのままコールバックで返す
      if (isLocalPlaylist) {
        console.log('✅ 選択した楽曲データをLocalPlaylistに返します:', selectedTracks.length, '曲');
        
        // 成功通知
        if (onTracksAdded) {
          // 楽曲データをコールバック経由で直接LocalPlaylistコンポーネントに返す
          onTracksAdded(selectedTracks);
        }
      } else {
        // Spotify用 - track IDのみ送信
        const trackIds = selectedTracks.map(track => track.id);
        
        const response = await fetch(`/api/spotify/playlists/${playlistId}/add-tracks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ trackIds })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ 追加エラー:', errorData);
          throw new Error(`楽曲の追加に失敗しました: ${errorData.error || ''}`);
        }
        
        // Spotify用の成功通知
        if (onTracksAdded) {
          onTracksAdded(selectedTracks)
        }
      }

      // リセット
      setSelectedTracks([])
      setSearchResults([])
      setSearchQuery('')
      
      alert(`${selectedTracks.length}曲をプレイリストに追加しました！✨`)

    } catch (error) {
      console.error('追加エラー:', error)
      setError('楽曲の追加中にエラーが発生しました')
    } finally {
      setAdding(false)
    }
  }

  // コンポーネント終了時の音声停止
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
      }
    }
  }, [audio])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <Search size={24} />
                <span>プリキュア楽曲を検索</span>
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Spotifyからプリキュア関連楽曲を検索してプレイリストに追加
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* 検索エリア */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="楽曲名、アーティスト名、シリーズ名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => searchTracks(searchQuery)}
              disabled={loading || !searchQuery.trim()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Search size={20} />}
              <span>検索</span>
            </button>
          </div>

          {/* 推奨検索ワード */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">推奨検索ワード:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedSearches.slice(0, 6).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(suggestion)
                    searchTracks(suggestion)
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
            <p>{error}</p>
          </div>
        )}

        {/* 検索結果 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="animate-spin mx-auto mb-4 text-green-500" size={32} />
              <p className="text-gray-600">プリキュア楽曲を検索中...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((track) => (
                <div key={track.id} className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* アルバムアート */}
                    <div className="flex-shrink-0">
                      {track.album.images[0] ? (
                        <img
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Music size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 楽曲情報 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{track.name}</h3>
                      <p className="text-sm text-gray-600 truncate">
                        {track.artists.map(artist => artist.name).join(', ')}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{track.album.name}</p>
                    </div>

                    {/* 操作ボタン */}
                    <div className="flex items-center space-x-2">
                      {/* プレビュー再生 */}
                      {track.preview_url && (
                        <button
                          onClick={() => togglePreview(track)}
                          className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                          title="30秒プレビュー"
                        >
                          {playingPreview === track.id ? <Pause size={20} /> : <Play size={20} />}
                        </button>
                      )}

                      {/* 選択チェックボックス */}
                      <button
                        onClick={() => toggleTrackSelection(track)}
                        className={`p-2 rounded-lg transition-colors ${
                          selectedTracks.some(t => t.id === track.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        {selectedTracks.some(t => t.id === track.id) ? <Check size={20} /> : <Plus size={20} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery && !loading ? (
            <div className="text-center py-12">
              <Music size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">検索結果がありません</p>
              <p className="text-sm text-gray-500 mt-2">別のキーワードで検索してみてください</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">上の検索ボックスでプリキュア楽曲を検索</p>
              <p className="text-sm text-gray-500 mt-2">推奨検索ワードも参考にしてください</p>
            </div>
          )}
        </div>

        {/* フッター */}
        {selectedTracks.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedTracks.length}曲選択中
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTracks([])}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  選択をクリア
                </button>
                <button
                  onClick={addSelectedTracks}
                  disabled={adding}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {adding ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                  <span>プレイリストに追加</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
