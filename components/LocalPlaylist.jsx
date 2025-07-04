/**
 * components/LocalPlaylist.jsx - プレイリスト管理コンポーネント
 * 
 * ユーザーのローカルプレイリストを管理するためのコンポーネント。
 * プレイリストの作成、編集、削除、楽曲追加・削除、公開設定の管理などの機能を提供します。
 * 
 * 特徴:
 * - プレイリストのCRUD操作（作成・読取・更新・削除）
 * - Spotify検索機能との統合
 * - プレイリストの公開/非公開設定
 * - 外部プレイリストのインポート
 * - レスポンシブなUI設計
 * 
 * @author CureCircle Team
 * @version 2.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Plus, Music, Trash2, Edit3, Play, MoreVertical, Upload, Search, RefreshCw, AlertCircle, X, ExternalLink, Eye, EyeOff, Globe, Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import UnifiedImportModal from './UnifiedImportModal'
import SpotifyTrackSearch from './SpotifyTrackSearch'

export default function LocalPlaylist({ session, profile, isViewMode = false, isSharePage = false }) {
  // 編集権限の判定：shareページまたはビューモードの場合は編集不可
  const canEdit = !isViewMode && !isSharePage
  
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTrackSearch, setShowTrackSearch] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState(null)
  const [showUnifiedImportModal, setShowUnifiedImportModal] = useState(false)
  const [currentPlaylist, setCurrentPlaylist] = useState(null)
  const [newPlaylist, setNewPlaylist] = useState({ 
    name: '', 
    description: '', 
    isPublic: false // デフォルトは非公開
  })

  useEffect(() => {
    if (session?.user?.id) {
      loadPlaylists()
    }
  }, [session])

  // プレイリスト一覧を取得
  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('local_playlists')
        .select('*')
        .eq('user_id', session.user.id)
        
      // 閲覧モードの場合は公開プレイリストのみ取得
      if (isViewMode) {
        query = query.eq('is_public', true)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      console.log('✅ Local playlists loaded:', data?.length || 0, isViewMode ? '(公開のみ)' : '')
      setPlaylists(data || [])
    } catch (error) {
      console.error('❌ Load playlists error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // プレイリスト作成
  const createPlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      alert('プレイリスト名を入力してください')
      return
    }

    try {
      setLoading(true)
      setError('')

      const playlistData = {
        user_id: session.user.id,
        name: newPlaylist.name.trim(),
        description: newPlaylist.description.trim(),
        is_public: newPlaylist.isPublic,
        tracks: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('local_playlists')
        .insert([playlistData])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Local playlist created:', data)
      
      // プレイリストリストに追加
      setPlaylists(prev => [data, ...prev])
      
      // モーダルを閉じてフォームをリセット
      setShowCreateModal(false)
      setNewPlaylist({ name: '', description: '', isPublic: false })
      
      alert('プレイリストを作成しました！✨')
      
    } catch (error) {
      console.error('❌ Create playlist error:', error)
      setError(error.message)
      alert('プレイリストの作成に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // プレイリスト編集
  const updatePlaylist = async () => {
    if (!editingPlaylist) return

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('local_playlists')
        .update({
          name: editingPlaylist.name.trim(),
          description: editingPlaylist.description.trim(),
          is_public: editingPlaylist.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPlaylist.id)
        .eq('user_id', session.user.id)

      if (error) throw error

      // 状態を更新
      setPlaylists(prev => prev.map(p => 
        p.id === editingPlaylist.id ? { ...p, ...editingPlaylist, updated_at: new Date().toISOString() } : p
      ))
      
      if (selectedPlaylist?.id === editingPlaylist.id) {
        setSelectedPlaylist({ ...selectedPlaylist, ...editingPlaylist })
      }
      
      setShowEditModal(false)
      setEditingPlaylist(null)
      alert('プレイリストを更新しました！')
      
    } catch (error) {
      console.error('❌ Update playlist error:', error)
      alert('プレイリストの更新に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // プレイリスト削除
  const deletePlaylist = async (playlistId) => {
    if (!confirm('このプレイリストを削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase
        .from('local_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', session.user.id)

      if (error) throw error

      setPlaylists(prev => prev.filter(p => p.id !== playlistId))
      
      if (selectedPlaylist?.id === playlistId) {
        setSelectedPlaylist(null)
        setShowPlaylistModal(false)
      }
      
      if (currentPlaylist?.id === playlistId) {
        setCurrentPlaylist(null)
      }
      
      alert('プレイリストを削除しました')
    } catch (error) {
      console.error('❌ Delete playlist error:', error)
      alert('プレイリストの削除に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 楽曲削除
  const removeTrackFromPlaylist = async (trackId) => {
    if (!selectedPlaylist) return

    try {
      setLoading(true)
      
      const updatedTracks = selectedPlaylist.tracks.filter(track => track.id !== trackId)
      
      const { error } = await supabase
        .from('local_playlists')
        .update({ 
          tracks: updatedTracks,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPlaylist.id)

      if (error) throw error

      const updatedPlaylist = { ...selectedPlaylist, tracks: updatedTracks }
      setSelectedPlaylist(updatedPlaylist)
      setPlaylists(prev => prev.map(p => 
        p.id === selectedPlaylist.id ? updatedPlaylist : p
      ))
      
      alert('楽曲を削除しました')
    } catch (error) {
      console.error('❌ Remove track error:', error)
      alert('楽曲の削除に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // 時間フォーマット
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 総再生時間計算
  const getTotalDuration = (tracks) => {
    const totalMs = tracks?.reduce((sum, track) => sum + (track.duration_ms || 0), 0) || 0
    const hours = Math.floor(totalMs / 3600000)
    const minutes = Math.floor((totalMs % 3600000) / 60000)
    return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`
  }
  // Spotifyから取得した楽曲をプレイリストに追加
  const handleTracksAdded = async (tracks) => {
    if (!selectedPlaylist || !tracks?.length) return
    
    try {
      setLoading(true)
      
      // 既存のトラックと新規トラックを結合
      const updatedTracks = [...selectedPlaylist.tracks, ...tracks]
      
      // プレイリストを更新
      const { error } = await supabase
        .from('local_playlists')
        .update({ 
          tracks: updatedTracks,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPlaylist.id)
      
      if (error) throw error
      
      // UIを更新
      const updatedPlaylist = { ...selectedPlaylist, tracks: updatedTracks }
      setSelectedPlaylist(updatedPlaylist)
      
      // プレイリスト一覧も更新
      setPlaylists(prev => prev.map(p => 
        p.id === selectedPlaylist.id ? updatedPlaylist : p
      ))
      
      console.log('✅ Added tracks to playlist:', tracks.length)
      
    } catch (error) {
      console.error('❌ Failed to add tracks:', error)
      alert('楽曲の追加に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
      setShowTrackSearch(false) // モーダルを閉じる
    }
  }

  // インポートからプレイリスト作成
  const handleCreateFromImport = async (importData) => {
    try {
      setLoading(true)
      
      const playlistData = {
        user_id: session.user.id,
        name: importData.name,
        description: importData.description,
        is_public: importData.is_public || false,
        tracks: importData.tracks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('local_playlists')
        .insert([playlistData])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Playlist created from import:', data)
      setPlaylists(prev => [data, ...prev])
      
      alert(`プレイリスト「${data.name}」を作成しました！\n${data.tracks.length}曲をインポートしました。✨`)
      
    } catch (error) {
      console.error('❌ Create from import error:', error)
      alert('プレイリスト作成に失敗しました: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold mb-2">🎵 プリキュアプレイリスト</h2>
            <p className="text-white/80 text-sm">
              {canEdit 
                ? 'お気に入りのプリキュア楽曲でオリジナルプレイリストを作成・管理'
                : 'お気に入りのプリキュア楽曲プレイリスト集' 
              }
            </p>
          </div>
          {canEdit && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>新規作成</span>
              </button>
              
              {/* 統合インポートボタン */}
              <button
                onClick={() => setShowUnifiedImportModal(true)}
                className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-colors flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>インポート</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} className="text-red-500" />
            <div>
              <h3 className="text-sm font-medium text-red-800">エラーが発生しました</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-400 hover:text-red-600 ml-auto"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* プレイリスト一覧 */}
      <div className="space-y-6">
        {loading && playlists.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-500" size={32} />
            <p className="text-gray-600">プレイリストを読み込み中...</p>
          </div>
        ) : playlists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* プレイリストカバー */}
                <div className="h-48 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 relative">
                  {/* 楽曲アルバムアートのモザイク表示 */}
                  {playlist.tracks && playlist.tracks.length > 0 ? (
                    <div className="grid grid-cols-2 gap-1 h-full p-2">
                      {playlist.tracks.slice(0, 4).map((track, index) => (
                        <div key={index} className="bg-white/10 rounded-lg overflow-hidden">
                          {track.album?.images?.[0] ? (
                            <img 
                              src={track.album.images[0].url} 
                              alt={track.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/20 flex items-center justify-center">
                              <Music size={20} className="text-white/60" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Music size={48} className="text-white/30" />
                    </div>
                  )}

                  {/* 公開設定表示 */}
                  <div className="absolute top-3 right-3">
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      playlist.is_public 
                        ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                        : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                    }`}>
                      {playlist.is_public ? <Globe size={12} /> : <Lock size={12} />}
                      <span>{playlist.is_public ? '公開' : '非公開'}</span>
                    </div>
                  </div>

                  {/* プレイボタン */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                    <button
                      onClick={() => {
                        setSelectedPlaylist(playlist)
                        setShowPlaylistModal(true)
                      }}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-3 backdrop-blur-sm transition-colors"
                    >
                      <Play size={24} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* プレイリスト情報 */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 truncate">{playlist.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {playlist.description || 'プリキュア楽曲のプレイリスト'}
                      </p>
                    </div>
                    
                    {/* アクションメニュー */}
                    {canEdit && (
                      <div className="relative">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingPlaylist(playlist)
                              setShowEditModal(true)
                            }}
                            className="text-gray-400 hover:text-blue-500 transition-colors"
                            title="編集"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deletePlaylist(playlist.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{playlist.tracks?.length || 0} 曲</span>
                    <span>{getTotalDuration(playlist.tracks)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">プレイリストがありません</h3>
            <p className="text-gray-600 mb-6">最初のプリキュアプレイリストを作成しましょう！</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
            >
              プレイリストを作成
            </button>
          </div>
        )}
      </div>

      {/* プレイリスト作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-t-2xl flex-shrink-0">
              <h3 className="text-lg font-bold">新しいプレイリスト</h3>
              <p className="text-white/80 text-sm mt-1">プリキュア楽曲のプレイリストを作成</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレイリスト名 *
                </label>
                <input
                  type="text"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="例: お気に入りのプリキュア楽曲"
                  maxLength="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="プレイリストの説明（任意）"
                  rows="2"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公開設定
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!newPlaylist.isPublic}
                      onChange={() => setNewPlaylist(prev => ({ ...prev, isPublic: false }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <Lock size={14} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">非公開</div>
                      <div className="text-xs text-gray-600">自分だけが閲覧可能</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      checked={newPlaylist.isPublic}
                      onChange={() => setNewPlaylist(prev => ({ ...prev, isPublic: true }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <Globe size={14} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">公開</div>
                      <div className="text-xs text-gray-600">他のユーザーも閲覧可能</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewPlaylist({ name: '', description: '', isPublic: false })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={createPlaylist}
                disabled={!newPlaylist.name.trim() || loading}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? '作成中...' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プレイリスト編集モーダル */}
      {showEditModal && editingPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-t-2xl flex-shrink-0">
              <h3 className="text-lg font-bold">プレイリスト編集</h3>
              <p className="text-white/80 text-sm mt-1">プレイリスト情報を編集</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレイリスト名 *
                </label>
                <input
                  type="text"
                  value={editingPlaylist.name}
                  onChange={(e) => setEditingPlaylist(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="プレイリスト名"
                  maxLength="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  説明
                </label>
                <textarea
                  value={editingPlaylist.description}
                  onChange={(e) => setEditingPlaylist(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="プレイリストの説明（任意）"
                  rows="2"
                  maxLength="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公開設定
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      checked={!editingPlaylist.is_public}
                      onChange={() => setEditingPlaylist(prev => ({ ...prev, is_public: false }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <Lock size={14} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">非公開</div>
                      <div className="text-xs text-gray-600">自分だけが閲覧可能</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="privacy"
                      checked={editingPlaylist.is_public}
                      onChange={() => setEditingPlaylist(prev => ({ ...prev, is_public: true }))}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <Globe size={14} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">公開</div>
                      <div className="text-xs text-gray-600">他のユーザーも閲覧可能</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingPlaylist(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={updatePlaylist}
                disabled={!editingPlaylist.name.trim() || loading}
                className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プレイリスト詳細モーダル */}
      {showPlaylistModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold">{selectedPlaylist.name}</h3>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPlaylist.is_public 
                        ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                        : 'bg-gray-500/20 text-gray-100 border border-gray-400/30'
                    }`}>
                      {selectedPlaylist.is_public ? <Globe size={12} /> : <Lock size={12} />}
                      <span>{selectedPlaylist.is_public ? '公開' : '非公開'}</span>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">
                    {selectedPlaylist.description || 'プリキュア楽曲のプレイリスト'}
                  </p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-white/80">
                    <span>{selectedPlaylist.tracks?.length || 0} 曲</span>
                    <span>{getTotalDuration(selectedPlaylist.tracks)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowPlaylistModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>            {/* 楽曲リスト */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* 楽曲を追加ボタン */}
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-800">楽曲一覧</h3>
                {canEdit && (
                  <button
                    onClick={() => setShowTrackSearch(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>楽曲を追加</span>
                  </button>
                )}
              </div>

              {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
                <div className="space-y-3">
                  {selectedPlaylist.tracks.map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-500 w-8 text-center">
                        {index + 1}
                      </div>
                      
                      {track.album?.images?.[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{track.name}</h4>
                        <p className="text-sm text-gray-600 truncate">
                          {track.artists?.map(artist => artist.name).join(', ')}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {track.album?.name}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDuration(track.duration_ms)}
                        </span>
                        
                        {track.external_urls?.spotify && (
                          <a
                            href={track.external_urls.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-500 hover:text-green-600 transition-colors"
                            title="Spotifyで開く"
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        
                        {canEdit && (
                          <button
                            onClick={() => removeTrackFromPlaylist(track.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="削除"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>              ) : (
                <div className="text-center py-12">
                  <Music size={48} className="mx-auto text-gray-300 mb-4" />
                  <h4 className="text-lg font-medium text-gray-600 mb-2">楽曲がありません</h4>
                  {canEdit ? (
                    <>
                      <p className="text-gray-500 mb-4">「楽曲を追加」ボタンを押してプリキュアの楽曲を検索してみましょう</p>
                      <button
                        onClick={() => setShowTrackSearch(true)}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full transition-colors inline-flex items-center space-x-2"
                      >
                        <Search size={16} />
                        <span>プリキュア楽曲を検索</span>
                      </button>
                    </>
                  ) : (
                    <p className="text-gray-500 mb-4">このプレイリストにはまだ楽曲が追加されていません</p>
                  )}
                </div>
              )}
            </div>

            {/* フッター */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  作成日: {new Date(selectedPlaylist.created_at).toLocaleDateString('ja-JP')}
                </div>
                {canEdit && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingPlaylist(selectedPlaylist)
                        setShowEditModal(true)
                        setShowPlaylistModal(false)
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Edit3 size={16} />
                      <span>編集</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowPlaylistModal(false)
                        deletePlaylist(selectedPlaylist.id)
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Trash2 size={16} />
                      <span>削除</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}      {/* Spotify楽曲検索モーダル */}
      <SpotifyTrackSearch
        isOpen={showTrackSearch}
        onClose={() => setShowTrackSearch(false)}
        playlistId={selectedPlaylist?.id}
        onTracksAdded={handleTracksAdded}
        session={session}
        isLocalPlaylist={true} // LocalPlaylist用フラグをtrueに設定
      />

      {/* 統合インポートモーダル */}
      {showUnifiedImportModal && (
        <UnifiedImportModal
          isOpen={showUnifiedImportModal}
          onClose={() => setShowUnifiedImportModal(false)}
          onCreatePlaylist={handleCreateFromImport}
        />
      )}
    </div>
  )
}