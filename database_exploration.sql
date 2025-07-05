-- CureCircle データベース探索用SQLファイル
-- VS Code Supabase拡張機能で実行してください

-- ===============================================
-- 🎯 現在実装されているクエリ（アプリケーション実装済み）
-- ===============================================

-- === 1. プリキュアシリーズデータ取得 ===
-- Profile.jsx で使用されているクエリ
SELECT * FROM precure_series 
ORDER BY year_start;

-- === 2. プリキュアキャラクターデータ取得 ===
-- Profile.jsx で使用されているクエリ
SELECT * FROM precure_characters 
ORDER BY id;

-- === 3. エピソードデータ取得（複数テーブル対応） ===
-- Profile.jsx で使用されているクエリ（テーブル名候補順に確認）
SELECT * FROM precure_episodes ORDER BY id;
-- SELECT * FROM episode_types ORDER BY id;
-- SELECT * FROM episodes ORDER BY id;
-- SELECT * FROM precure_episode_data ORDER BY id;

-- === 4. 妖精データ取得（複数テーブル対応） ===
-- Profile.jsx で使用されているクエリ（テーブル名候補順に確認）
-- SELECT * FROM precure_fairies ORDER BY id;
-- SELECT * FROM fairies ORDER BY id;
-- SELECT * FROM fairy_data ORDER BY id;
-- SELECT * FROM precure_fairy_data ORDER BY id;

-- === 5. 映画データ取得（複数テーブル対応） ===
-- Profile.jsx で使用されているクエリ（テーブル名候補順に確認）
-- SELECT * FROM precure_movies ORDER BY id;
-- SELECT * FROM movies ORDER BY id;
-- SELECT * FROM precure_movie_data ORDER BY id;

-- === 6. ユーザープロフィール管理 ===
-- Profile.jsx で使用されているクエリ

-- プロフィール取得（shareページでも使用）
SELECT * FROM profiles WHERE id = 'user-id-here';

-- プロフィール更新・作成（UPSERT）
-- INSERT INTO profiles (id, display_name, age, fan_years, gender, ...) 
-- VALUES ('user-id', 'display-name', 25, 10, 'gender', ...)
-- ON CONFLICT (id) DO UPDATE SET ...;

-- === 7. ユーザー背景設定 ===
-- BackgroundSettings.jsx で使用されているクエリ

-- 背景データ取得
SELECT * FROM user_backgrounds WHERE user_id = 'user-id-here';

-- 背景データ更新・作成（UPSERT）
-- INSERT INTO user_backgrounds (user_id, gradient_id, custom_gradient, ...)
-- VALUES ('user-id', 'gradient-id', 'custom-gradient', ...)
-- ON CONFLICT (user_id) DO UPDATE SET ...;

-- === 8. デジタル名刺管理 ===
-- DigitalCard.jsx で使用されているクエリ

-- デジタル名刺取得
SELECT * FROM digital_cards WHERE user_id = 'user-id-here';

-- デジタル名刺更新
-- UPDATE digital_cards SET 
--   title = 'title', 
--   description = 'description',
--   background_type = 'gradient',
--   background_value = 'gradient-value',
--   updated_at = NOW()
-- WHERE user_id = 'user-id-here';

-- デジタル名刺作成
-- INSERT INTO digital_cards (user_id, title, description, background_type, background_value)
-- VALUES ('user-id', 'title', 'description', 'gradient', 'gradient-value');

-- === 9. ローカルプレイリスト管理 ===
-- LocalPlaylist.jsx で使用されているクエリ

-- プレイリスト一覧取得
SELECT * FROM local_playlists WHERE user_id = 'user-id-here' ORDER BY created_at DESC;

-- プレイリスト作成
-- INSERT INTO local_playlists (user_id, name, description, tracks, is_public)
-- VALUES ('user-id', 'playlist-name', 'description', '[]', false);

-- プレイリスト更新
-- UPDATE local_playlists SET 
--   name = 'new-name',
--   description = 'new-description',
--   tracks = 'tracks-json',
--   updated_at = NOW()
-- WHERE id = 'playlist-id' AND user_id = 'user-id';

-- プレイリスト削除
-- DELETE FROM local_playlists WHERE id = 'playlist-id' AND user_id = 'user-id';

-- === 10. 画像ギャラリー管理 ===
-- ImageGallery.jsx で使用されているクエリ

-- 画像投稿一覧取得
SELECT * FROM image_posts WHERE user_id = 'user-id-here' ORDER BY created_at DESC;

-- 画像投稿作成・更新
-- INSERT INTO image_posts (user_id, image_url, caption, tags)
-- VALUES ('user-id', 'image-url', 'caption', 'tags')
-- ON CONFLICT (id) DO UPDATE SET ...;

-- 画像投稿削除
-- DELETE FROM image_posts WHERE id = 'post-id' AND user_id = 'user-id';

-- ===============================================
-- 🔍 データベース構造確認クエリ
-- ===============================================

-- === テーブル一覧の確認 ===
-- 現在のデータベースにあるすべてのテーブルを表示
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- === プリキュアシリーズテーブルの確認 ===
-- プリキュアシリーズのデータ構造と内容を確認
SELECT * FROM precure_series 
ORDER BY year_start 
LIMIT 10;

-- === プリキュアキャラクターテーブルの確認 ===
-- キャラクターデータの構造と内容を確認
SELECT * FROM precure_characters 
ORDER BY id 
LIMIT 10;

-- === エピソードテーブルの確認 ===
-- 各エピソードテーブルの候補を順番に確認
-- (存在するテーブル名に応じてコメントアウトを調整してください)

-- Option 1: precure_episodes
SELECT * FROM precure_episodes 
ORDER BY id 
LIMIT 10;

-- Option 2: episode_types
-- SELECT * FROM episode_types 
-- ORDER BY id 
-- LIMIT 10;

-- Option 3: episodes
-- SELECT * FROM episodes 
-- ORDER BY id 
-- LIMIT 10;

-- Option 4: precure_episode_data
-- SELECT * FROM precure_episode_data 
-- ORDER BY id 
-- LIMIT 10;

-- === キミとアイドルプリキュア♪関連エピソードの検索 ===
-- 「キミとアイドルプリキュア」を含むエピソードを検索
SELECT 
    id,
    name,
    title,
    episode_name,
    category,
    series_name,
    series,
    episode_number
FROM precure_episodes 
WHERE 
    name ILIKE '%キミとアイドルプリキュア%' 
    OR title ILIKE '%キミとアイドルプリキュア%'
    OR episode_name ILIKE '%キミとアイドルプリキュア%'
    OR category ILIKE '%キミとアイドルプリキュア%'
    OR series_name ILIKE '%キミとアイドルプリキュア%'
    OR series ILIKE '%キミとアイドルプリキュア%'
ORDER BY episode_number;

-- === 映画テーブルの確認 ===
-- 映画データの構造と内容を確認
-- SELECT * FROM precure_movies 
-- ORDER BY id 
-- LIMIT 10;

-- === 妖精テーブルの確認 ===
-- 妖精データの構造と内容を確認
-- SELECT * FROM precure_fairies 
-- ORDER BY id 
-- LIMIT 10;

-- === ユーザープロフィールテーブルの確認 ===
-- プロフィールテーブルの構造を確認（データは表示しない）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- === データベース統計 ===
-- 各テーブルのレコード数を確認
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "総挿入数",
    n_tup_upd as "総更新数",
    n_tup_del as "総削除数",
    n_live_tup as "現在のレコード数"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_live_tup DESC;

-- ===============================================
-- 🔧 接続確認・デバッグ用クエリ
-- ===============================================

-- === データベース接続テスト ===
-- 基本的な接続確認
SELECT 
    current_database() as "データベース名",
    current_user as "現在のユーザー",
    version() as "PostgreSQLバージョン",
    now() as "現在時刻";

-- === 権限確認 ===
-- 現在のユーザーの権限を確認
SELECT 
    table_schema,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE grantee = current_user
ORDER BY table_schema, table_name;

-- === RLS (Row Level Security) 状態確認 ===
-- テーブルのセキュリティポリシー確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS有効",
    relowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
