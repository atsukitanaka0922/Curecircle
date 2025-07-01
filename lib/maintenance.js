/**
 * lib/maintenance.js - メンテナンスモード管理ユーティリティ
 * 
 * アプリケーションのメンテナンスモードを管理するためのユーティリティ関数を提供します。
 * 環境変数とローカルストレージを使用して、メンテナンスモードの制御とバイパス機能を実装します。
 * 
 * 特徴:
 * - 環境変数によるメンテナンスモード制御
 * - ローカルストレージを使用したメンテナンスバイパス機能
 * - バイパストークンの有効期限管理
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

// メンテナンスモードの状態を確認する
export function isMaintenanceMode() {
  // 環境変数からメンテナンスモードの状態を取得
  // この環境変数は.env.localや環境変数設定で制御可能
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
  
  if (!maintenanceMode) return false
  
  // クライアントサイドでのみローカルストレージをチェック
  if (typeof window !== 'undefined') {
    try {
      const bypassData = localStorage.getItem('maintenance_bypass')
      
      if (bypassData) {
        const { bypassed, expiry } = JSON.parse(bypassData)
        
        // バイパストークンが有効かつ有効期限内か確認
        if (bypassed && expiry > Date.now()) {
          return false // メンテナンスモードをバイパス
        } else if (expiry <= Date.now()) {
          // 期限切れなら削除
          localStorage.removeItem('maintenance_bypass')
        }
      }
    } catch (error) {
      console.error('メンテナンスバイパスチェックエラー:', error)
      // エラー時はメンテナンスモードを有効にする
    }
  }
  
  return true // メンテナンスモードを有効化
}

// メンテナンスモードを有効化する関数（管理者用）
export function enableMaintenanceMode() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('maintenance_bypass')
  }
  // 実際の環境変数設定はVercelダッシュボードやサーバー設定で行う
  return true
}

// メンテナンスバイパストークンをクリアする
export function clearMaintenanceBypass() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('maintenance_bypass')
  }
  return true
}
