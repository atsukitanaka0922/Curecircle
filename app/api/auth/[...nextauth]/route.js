// app/api/auth/[...nextauth]/route.js - Google・X対応版
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'
import SpotifyProvider from 'next-auth/providers/spotify'

export const authOptions = {
  providers: [
    // Spotify認証（既存）
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        params: {
          scope: [
            'user-read-email',
            'user-read-private',
            'playlist-read-private',
            'playlist-read-collaborative',
            'playlist-modify-public', 
            'playlist-modify-private',
            'user-library-read',
            'user-library-modify'
          ].join(' ')
        }
      }
    })
    
    // 注: Google・Twitter認証は環境変数の設定が必要です
    // 必要に応じて有効化してください
    /*
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    }),
    
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
      authorization: {
        params: {
          scope: 'users.read tweet.read'
        }
      }
    }),
    */
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      console.log('🔑 JWT Callback:', {
        provider: account?.provider,
        hasAccount: !!account,
        tokenType: account?.token_type,
        userId: user?.id
      })
      
      // 初回ログイン時
      if (account && user) {
        try {
          token.provider = account.provider
          token.providerId = user.id
          
          // プロバイダー別のデータ処理
          switch (account.provider) {
            case 'spotify':
              // Spotify用のトークン管理（既存機能）
              token.accessToken = account.access_token
              token.refreshToken = account.refresh_token
              token.accessTokenExpires = account.expires_at * 1000
              token.spotifyUserId = user.id
              token.displayName = user.name || 'プリキュアファン'
              token.avatarUrl = user.image || ''
              break
              
            case 'google':
              token.googleId = user.id
              token.displayName = user.name || 'プリキュアファン'
              token.avatarUrl = user.image || ''
              token.email = user.email
              break
              
            case 'twitter':
              token.twitterId = user.id
              token.displayName = user.name || 'プリキュアファン'
              token.avatarUrl = user.image || ''
              token.username = profile?.username || user.username || ''
              break
          }
          
          console.log('✅ Provider data stored:', {
            provider: token.provider,
            displayName: token.displayName,
            email: token.email || 'なし'
          })
        } catch (error) {
          console.error('❌ JWT token processing error:', error)
        }
      }

      // Spotifyトークンの更新処理（既存）
      if (token.provider === 'spotify' && token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token
      }

      if (token.provider === 'spotify' && token.refreshToken) {
        try {
          return await refreshSpotifyToken(token)
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError)
          // エラーでも元のトークンを返す
          return {
            ...token,
            error: 'RefreshError'
          }
        }
      }

      return token
    },
    
    async session({ session, token }) {
      // セッションにプロバイダー情報を追加
      session.provider = token.provider
      session.providerId = token.providerId
      session.displayName = token.displayName
      session.avatarUrl = token.avatarUrl
      
      // プロバイダー別の情報
      if (token.provider === 'google') {
        session.googleId = token.googleId
      } else if (token.provider === 'twitter') {
        session.twitterId = token.twitterId
        session.username = token.username
      } else if (token.provider === 'spotify') {
        // Spotify用の情報（既存）
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.error = token.error
        session.spotifyUserId = token.spotifyUserId
      }
      
      console.log('📋 Session created:', {
        provider: session.provider,
        email: session.user?.email,
        displayName: session.displayName
      })
      
      return session
    },
    
    async signIn({ user, account, profile }) {
      console.log('🚪 Sign in attempt:', {
        provider: account?.provider,
        email: user?.email,
        name: user?.name
      })
      
      // すべてのプロバイダーを許可
      return true
    }
  },
  
  events: {
    async signIn({ user, account, profile }) {
      console.log('📝 Sign in event:', {
        provider: account?.provider,
        userId: user?.id,
        email: user?.email
      })
      
      // Supabaseプロフィール作成・更新
      try {
        await createOrUpdateSupabaseProfile(user, account, profile)
      } catch (error) {
        console.error('❌ Profile creation error:', error)
        // エラーでもログインは継続（ログインの失敗を防ぐ）
      }
    },
    
    async signOut(message) {
      console.log('👋 Sign out event:', message)
    },
    
    async session(message) {
      // セッション作成時のデバッグログ
      if (message?.session) {
        console.log('📋 Session created for:', message.session.user?.email)
      }
    },
    
    async error(message) {
      console.error('❌ NextAuth error event:', message)
    }
  },
  
  // カスタムのサインインページの設定をコメントアウト
  // 代わりにNextAuthのデフォルトページを使用
  /*
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  */
  
  debug: process.env.NODE_ENV === 'development',
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24 * 30, // 30日
  },
  
  // セキュリティ設定
  secret: process.env.NEXTAUTH_SECRET,
}

// Spotifyトークンリフレッシュ（既存機能）
async function refreshSpotifyToken(token) {
  try {
    console.log('🔄 Refreshing Spotify token...')
    
    // 環境変数のチェック
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      console.error('❌ Spotify環境変数が設定されていません')
      return {
        ...token,
        error: 'MissingCredentials'
      }
    }
    
    if (!token.refreshToken) {
      console.error('❌ リフレッシュトークンがありません')
      return {
        ...token,
        error: 'NoRefreshToken'
      }
    }
    
    const url = 'https://accounts.spotify.com/api/token'
    
    // Basic認証ヘッダーを作成
    const basic = Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basic}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: token.refreshToken
        }),
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Spotify token refresh HTTP error:', response.status, errorText)
        return {
          ...token,
          error: `HTTPError:${response.status}`
        }
      }

      const refreshedTokens = await response.json()
      console.log('✅ Spotify token refreshed successfully')

      return {
        ...token,
        accessToken: refreshedTokens.access_token,
        accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
        refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        error: undefined
      }
    } catch (fetchError) {
      console.error('❌ Spotify fetch operation failed:', fetchError)
      return {
        ...token,
        error: 'FetchError'
      }
    }
  } catch (error) {
    console.error('❌ Spotify token refresh error:', error)
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    }
  }
}

// Supabaseプロフィール作成・更新
async function createOrUpdateSupabaseProfile(user, account, profile) {
  try {
    // 環境変数の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase環境変数が設定されていません')
      console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定')
      console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '設定済み' : '未設定')
      return // 環境変数がない場合は早期リターン
    }
  
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    
    console.log('👤 Creating/updating Supabase profile for:', user.email)
    
    // プロフィールデータの準備
    let displayName = user.name || 'プリキュアファン'
    let avatarUrl = user.image || ''
    
    // プロバイダー別の追加情報
    const additionalData = {}
    
    if (account && account.provider) {
      switch (account.provider) {
        case 'spotify':
          additionalData.spotify_id = user.id
          displayName = profile?.display_name || user.name || 'プリキュアファン'
          break
          
        case 'google':
          additionalData.google_id = user.id
          displayName = profile?.name || user.name || 'プリキュアファン'
          break
          
        case 'twitter':
          additionalData.twitter_id = user.id
          additionalData.twitter_username = profile?.username || ''
          displayName = profile?.name || user.name || 'プリキュアファン'
          break
      }
    }
    
    // ユーザーIDとしてはメールを使用（一意性を確保）
    // 注: 本番環境ではより安全なID生成方法を検討してください
    const userId = user.email
    
    if (!userId || !user.email) {
      console.error('❌ ユーザーIDまたはメールアドレスがありません')
      return
    }
    
    const profileData = {
      id: userId,
      email: user.email,
      display_name: displayName,
      avatar_url: avatarUrl,
      auth_provider: account?.provider || 'unknown',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...additionalData
    }
    
    console.log('📋 プロフィールデータ:', {
      id: userId,
      email: user.email,
      display_name: displayName,
      auth_provider: account?.provider || 'unknown'
    })
    
    // プロフィールの作成または更新
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'email'
        })
      
      if (error) {
        console.error('❌ Supabase profile upsert error:', error)
        // エラーを投げるのではなくログだけに留める
        return
      }
      
      console.log('✅ Supabase profile created/updated successfully')
    } catch (upsertError) {
      console.error('❌ Supabase upsert operation failed:', upsertError)
    }
    
  } catch (error) {
    console.error('❌ Supabase profile creation process failed:', error)
    // エラーをスローせずにログだけに留める
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }