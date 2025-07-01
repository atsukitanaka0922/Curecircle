// app/api/local/playlists/add-tracks/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { supabase } from '@/lib/supabase' // 絶対パスでSupabaseクライアントをインポート

export async function POST(request) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    // リクエストボディ取得
    const { playlistId, tracks } = await request.json()

    if (!playlistId) {
      return NextResponse.json({ error: 'プレイリストIDが必要です' }, { status: 400 })
    }

    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: '追加する楽曲データが必要です' }, { status: 400 })
    }

    // 共通のSupabaseクライアントを使用

    // 現在のプレイリストを取得
    const { data: playlist, error: getError } = await supabase
      .from('local_playlists')
      .select('*')
      .eq('id', playlistId)
      .eq('user_id', session.user.id)
      .single()
    
    if (getError) {
      console.error('❌ Get playlist error:', getError)
      return NextResponse.json(
        { error: 'プレイリストの取得に失敗しました', details: getError.message },
        { status: 404 }
      )
    }

    // 既存のトラックと新規トラックを結合
    const existingTracks = playlist.tracks || []
    // 重複を避けるため、既に存在するIDの楽曲は追加しない
    const newTracks = tracks.filter(
      newTrack => !existingTracks.some(existingTrack => existingTrack.id === newTrack.id)
    )
    const updatedTracks = [...existingTracks, ...newTracks]

    // プレイリストを更新
    const { error: updateError } = await supabase
      .from('local_playlists')
      .update({ 
        tracks: updatedTracks,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId)
      .eq('user_id', session.user.id)

    if (updateError) {
      console.error('❌ Update playlist error:', updateError)
      return NextResponse.json(
        { error: '楽曲の追加に失敗しました', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Added tracks to local playlist:', {
      playlistId,
      addedTracks: newTracks.length,
      totalTracks: updatedTracks.length
    })

    return NextResponse.json({
      success: true,
      addedTracks: newTracks.length,
      totalTracks: updatedTracks.length
    })

  } catch (error) {
    console.error('❌ Add tracks API error:', error)
    return NextResponse.json(
      { error: '楽曲追加中にエラーが発生しました', details: error.message },
      { status: 500 }
    )
  }
}
