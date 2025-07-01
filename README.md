# キュアサークル (Cure Circle)

プリキュアファン向けのプロフィール作成・共有サービス。ファン同士の交流を促進するためのプラットフォームです。

## 主な機能

- **プロフィール作成**: お気に入りのプリキュアシリーズ、キャラクター、妖精などを登録
- **デジタル名刺**: カスタマイズ可能な共有用デジタルカード
- **画像ギャラリー**: お気に入り画像の管理と表示
- **プレイリスト**: プリキュア楽曲のプレイリスト作成・共有（Spotify連携対応）
- **テーマ設定**: プリキュアシリーズに合わせた背景カスタマイズ

## 技術スタック

- **フロントエンド**: Next.js, React, TailwindCSS
- **認証**: NextAuth.js, Supabase Auth
- **データベース**: Supabase
- **ファイルストレージ**: Supabase Storage
- **API連携**: Spotify Web API

## 開発環境構築

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/curecircle.git
cd curecircle

# 依存関係のインストール
npm install

# 環境変数の設定
# .env.local ファイルを作成し、必要な環境変数を設定してください
# 必要な環境変数は .env.example を参照

# 開発サーバーの起動
npm run dev
```

## 環境変数

サービスを実行するには以下の環境変数が必要です:

```
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# NextAuth設定
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Spotify API (オプション)
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/auth
```

## デプロイ

このアプリケーションは Vercel にデプロイすることを推奨します:

```bash
npm run build
# Vercelへのデプロイ
vercel
```

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 謝辞

- すべてのプリキュアファンのみなさま
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.io)
- [TailwindCSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)
