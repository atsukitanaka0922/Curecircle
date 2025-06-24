import { createClient } from '@supabase/supabase-js'

// Supabaseのシングルトンクライアントを初期化
let supabaseInstance;

// クライアントの遅延初期化を行う関数
function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 環境変数から設定を取得
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 環境変数のチェック
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase環境変数が設定されていません。.env.localファイルを確認してください。');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || '未設定');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
  }

  try {
    // Supabaseクライアントの初期化
    supabaseInstance = createClient(
      supabaseUrl || '', 
      supabaseAnonKey || '', 
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true 
        }
      }
    );
    
    console.log('✅ Supabaseクライアント初期化成功');
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Supabaseクライアント初期化エラー:', error);
    // エラー発生時でも空のクライアントを返す（アプリのクラッシュ防止）
    return createClient('https://example.com', 'fallback-key', {
      auth: { persistSession: false }
    });
  }
}

// 直接クライアントをエクスポート - getSessionなどすべてのメソッドがアクセス可能
export const supabase = createSupabaseClient();