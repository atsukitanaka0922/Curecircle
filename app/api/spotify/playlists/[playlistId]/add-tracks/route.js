// app/api/spotify/playlists/[playlistId]/add-tracks/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../auth/[...nextauth]/route'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Spotifyアクセストークンが必要です' },
        { status: 401 }
      )
    }

    const { playlistId } = params
    const { trackIds, position } = await request.json()

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return NextResponse.json(
        { error: '追加する楽曲IDが必要です' },
        { status: 400 }
      )
    }

    // Spotify URIに変換
    const trackUris = trackIds.map(id => `spotify:track:${id}`)

    console.log('🎵 Adding tracks to playlist:', {
      playlistId,
      trackCount: trackUris.length,
      position
    })

    // Spotifyプレイリストに楽曲を追加
    const addUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`
    const body = { uris: trackUris }
    if (typeof position === 'number') {
      body.position = position
    }

    const response = await fetch(addUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Add tracks error:', error)
      return NextResponse.json(
        { error: '楽曲の追加に失敗しました', details: error.error?.message },
        { status: response.status }
      )
    }

    const result = await response.json()
    console.log('✅ Tracks added successfully:', result)

    return NextResponse.json({
      success: true,
      snapshot_id: result.snapshot_id,
      added_count: trackUris.length
    })

  } catch (error) {
    console.error('❌ Add tracks API error:', error)
    return NextResponse.json(
      { error: '楽曲追加中にエラーが発生しました', details: error.message },
      { status: 500 }
    )
  }
}
