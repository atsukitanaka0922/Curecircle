/**
 * app/layout.jsx - アプリケーションのルートレイアウト
 * 
 * キュアサークルアプリケーションの共通レイアウトを定義するコンポーネント。
 * 認証プロバイダーとグローバルスタイルを設定し、すべてのページに適用します。
 * メンテナンスモード機能を統合しています。
 * 
 * 特徴:
 * - Next.js App Routerレイアウトシステムの活用
 * - NextAuth SessionProviderの統合
 * - グローバルスタイルの適用
 * - カスタムバックグラウンドオーバーライドの実装
 * - メンテナンスモード管理
 * 
 * @author CureCircle Team
 * @version 1.0.1
 */

'use client'

import { useState, useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'
import './globals.css'
import MaintenancePage from '../components/MaintenancePage'
import GoogleAnalytics from '../components/GoogleAnalytics'
import StructuredData from '../components/StructuredData'
import { isMaintenanceMode } from '../lib/maintenance'

/**
 * アプリケーションのルートレイアウトコンポーネント
 * すべてのページに適用される共通レイアウトを提供
 * 
 * @param {Object} props - コンポーネントのプロパティ
 * @param {React.ReactNode} props.children - 子コンポーネント（ページコンテンツ）
 * @returns {JSX.Element} ルートレイアウトコンポーネント
 */
export default function RootLayout({ children }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // クライアントサイドでのみメンテナンスモードを確認
  useEffect(() => {
    setIsClient(true)
    setMaintenanceMode(isMaintenanceMode())
  }, [])

  return (
    <html lang="ja">
      <head>
        <title>キュアサークル - プリキュアファン向けプロフィール管理アプリ</title>
        <meta name="description" content="プリキュアファンのためのプロフィール管理・音楽共有アプリ。好きなプリキュア作品やSpotifyプレイリストを共有して、同じ趣味の仲間とつながろう！" />
        <meta name="keywords" content="プリキュア,PreCure,ファン,プロフィール,音楽,Spotify,プレイリスト,アニメ,コミュニティ" />
        <meta name="author" content="CureCircle Team" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://curecircle.net/" />
        <meta property="og:title" content="キュアサークル - プリキュアファン向けプロフィール管理アプリ" />
        <meta property="og:description" content="プリキュアファンのためのプロフィール管理・音楽共有アプリ。好きなプリキュア作品やSpotifyプレイリストを共有して、同じ趣味の仲間とつながろう！" />
        <meta property="og:image" content="https://curecircle.net/og-image.png" />
        <meta property="og:locale" content="ja_JP" />
        <meta property="og:site_name" content="キュアサークル" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://curecircle.net/" />
        <meta property="twitter:title" content="キュアサークル - プリキュアファン向けプロフィール管理アプリ" />
        <meta property="twitter:description" content="プリキュアファンのためのプロフィール管理・音楽共有アプリ。好きなプリキュア作品やSpotifyプレイリストを共有して、同じ趣味の仲間とつながろう！" />
        <meta property="twitter:image" content="https://curecircle.net/og-image.png" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://curecircle.net/" />
        
        {/* Google Analytics */}
        <GoogleAnalytics />
        
        {/* 構造化データ */}
        <StructuredData />
        
        {/* カスタム背景スタイルを優先するためのスタイル */}
        <style id="background-override">
          {`
            body, html {
              transition: background 0.3s ease;
            }
            #curetter-background-styles {
              /* 最高の優先度を持つことを保証 */
              position: sticky !important;
              z-index: 9999 !important;
            }
            /* 保存された背景設定を確実に反映 */
            body {
              background: var(--page-background-gradient, linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)) !important;
              background-color: var(--page-background-color, transparent) !important;
              background-attachment: fixed !important;
            }
          `}
        </style>
      </head>
      <body>
        {isClient && maintenanceMode ? (
          <MaintenancePage />
        ) : (
          <SessionProvider>
            {children}
          </SessionProvider>
        )}
      </body>
    </html>
  )
}