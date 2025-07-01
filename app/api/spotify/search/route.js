// app/api/spotify/search/route.js - プリキュア楽曲検索
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    // セッションとアクセストークンのチェック
    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です。ログインしてください。' },
        { status: 401 }
      )
    }

    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        { error: 'Spotifyの認証が期限切れです。再ログインしてください。' },
        { status: 401 }
      )
    }

    if (!session.accessToken) {
      return NextResponse.json(
        { error: 'Spotifyアクセストークンが必要です。Spotifyでログインしてください。' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 50)
    const offset = parseInt(searchParams.get('offset')) || 0

    if (!query.trim()) {
      return NextResponse.json(
        { error: '検索クエリが必要です' },
        { status: 400 }
      )
    }

    // プリキュア関連キーワードを含む検索クエリを構築
    const precureKeywords = [
      'プリキュア', 'PreCure', 'Precure', 'Pretty Cure',
      'キュア', 'Cure', 'ハートキャッチ', 'フレッシュ',
      'スイート', 'スマイル', 'ドキドキ', 'ハピネスチャージ',
      'Go!プリンセス', '魔法つかい', 'キラキラ☆プリキュアアラモード',
      'HUGっと', 'スター☆トゥインクル', 'ヒーリングっど',
      'トロピカル〜ジュ', 'デリシャスパーティ', 'ひろがるスカイ',
      'わんだふるぷりきゅあ'
    ]

    // 検索クエリにプリキュア要素を含めるかチェック
    const isPrecureQuery = precureKeywords.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    )

    // プリキュア関連でない場合は、プリキュアキーワードを追加
    const searchQuery = isPrecureQuery ? query : `${query} プリキュア`

    console.log('🔍 Searching Spotify for:', searchQuery)

    // Spotifyアクセストークンの有効性を事前チェック
    const tokenCheckResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`
      }
    })

    if (!tokenCheckResponse.ok) {
      console.error('❌ Access token invalid:', tokenCheckResponse.status)
      return NextResponse.json(
        { error: 'Spotifyの認証が無効です。再ログインしてください。' },
        { status: 401 }
      )
    }

    // 実際の検索を実行
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=${limit}&offset=${offset}&market=JP`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
      console.error('❌ Spotify search error:', {
        status: response.status,
        statusText: response.statusText,
        error: error
      })
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Spotifyの認証が無効です。再ログインしてください。' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { 
          error: '楽曲検索に失敗しました', 
          details: error.error?.message || `HTTP ${response.status}: ${response.statusText}` 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Search results:', data.tracks.items.length, 'tracks found')

    // プリキュア関連楽曲をフィルタリング
    const filteredTracks = data.tracks.items.filter(track => {
      const trackName = track.name.toLowerCase()
      const artistNames = track.artists.map(artist => artist.name.toLowerCase()).join(' ')
      const albumName = track.album.name.toLowerCase()
      
      return precureKeywords.some(keyword => 
        trackName.includes(keyword.toLowerCase()) ||
        artistNames.includes(keyword.toLowerCase()) ||
        albumName.includes(keyword.toLowerCase())
      )
    })

    return NextResponse.json({
      tracks: filteredTracks,
      total: data.tracks.total,
      limit,
      offset,
      query: searchQuery,
      filtered: filteredTracks.length !== data.tracks.items.length
    })

  } catch (error) {
    console.error('❌ Search API error:', error)
    return NextResponse.json(
      { error: '検索中にエラーが発生しました', details: error.message },
      { status: 500 }
    )
  }
}
