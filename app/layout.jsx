// app/layout.js
'use client'

import { SessionProvider } from 'next-auth/react'
import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <title>キュアサークル</title>
        <meta name="description" content="キュアサークル" />
        <link rel="icon" href="/favicon.ico" />
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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}