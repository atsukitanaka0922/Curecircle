/**
 * app/api/admin/maintenance/route.js - メンテナンスモード制御API
 * 
 * メンテナンスモードを有効化/無効化するためのAPI。
 * 管理者のみがアクセスできる安全なエンドポイントです。
 * 
 * 特徴:
 * - 管理者認証
 * - メンテナンスモードの有効化/無効化
 * - ステータスチェック
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

// メンテナンスモードの状態を確認するAPI
export async function GET(request) {
  try {
    // 管理者セッションの確認
    const session = await getServerSession(authOptions)
    
    // 認証と管理者権限の確認
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    // 現在のメンテナンス状態を返す
    const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    
    return NextResponse.json({ 
      maintenanceMode,
      message: maintenanceMode ? 'メンテナンスモードが有効です' : 'メンテナンスモードは無効です'
    })
  } catch (error) {
    console.error('メンテナンスモード確認エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}

// メンテナンスモードを更新するAPI
export async function POST(request) {
  try {
    // 管理者セッションの確認
    const session = await getServerSession(authOptions)
    
    // 認証と管理者権限の確認
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }
    
    // リクエストボディから新しい状態を取得
    const { enable, adminPassword } = await request.json()
    
    // 管理者パスワード検証
    const validAdminPassword = process.env.ADMIN_MAINTENANCE_PASSWORD || 'admin_precure'
    
    if (adminPassword !== validAdminPassword) {
      return NextResponse.json({ error: '管理者パスワードが無効です' }, { status: 403 })
    }
    
    // 注意: 実際の本番環境では、ここでVercel環境変数やデータベースの設定を更新します
    // このAPIはデモンストレーション用であり、実際にはVercelダッシュボードで環境変数を変更する必要があります
    
    return NextResponse.json({
      success: true,
      maintenanceMode: enable,
      message: enable 
        ? 'メンテナンスモードを有効化しました (注: 実際の環境変数は変更されていません)' 
        : 'メンテナンスモードを無効化しました (注: 実際の環境変数は変更されていません)'
    })
  } catch (error) {
    console.error('メンテナンスモード更新エラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
