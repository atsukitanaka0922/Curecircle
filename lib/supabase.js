import { createClient } from '@supabase/supabase-js'

// Supabaseのシングルトンクライアントを初期化
let supabaseInstance;

// 環境変数の検証
function validateEnvironment() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const isValid = !!supabaseUrl && !!supabaseAnonKey;
  
  if (!isValid) {
    console.error('⚠️ Supabase環境変数が正しく設定されていません');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || '未設定');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
    
    // 本番環境か開発環境かによってメッセージを変える
    if (process.env.NODE_ENV === 'production') {
      console.error('本番環境で環境変数が設定されていません。Vercelダッシュボードで環境変数を確認してください。');
    } else {
      console.error('開発環境で環境変数が設定されていません。.env.localファイルを確認してください。');
    }
  }
  
  return {
    isValid,
    supabaseUrl,
    supabaseAnonKey
  };
}

// クライアントの遅延初期化を行う関数
function createSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // 環境変数の検証
  const { isValid, supabaseUrl, supabaseAnonKey } = validateEnvironment();

  try {
    // Supabaseクライアントの初期化
    supabaseInstance = createClient(
      supabaseUrl || 'https://placeholder-url.supabase.co', 
      supabaseAnonKey || 'placeholder-key', 
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true 
        }
      }
    );
    
    if (isValid) {
      console.log('✅ Supabaseクライアント初期化成功');
    } else {
      console.warn('⚠️ Supabaseクライアントが仮の認証情報で初期化されました。実際のAPIコールは失敗します。');
    }
    
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Supabaseクライアント初期化エラー:', error);
    
    // エラー発生時でもダミークライアントを返す（アプリのクラッシュ防止）
    return createClient('https://placeholder-url.supabase.co', 'placeholder-key', {
      auth: { persistSession: false }
    });
  }
}

// 直接クライアントをエクスポート
export const supabase = createSupabaseClient();

// 環境変数の状態を確認する関数（デバッグ用）
export function checkSupabaseEnvironment() {
  const { isValid, supabaseUrl, supabaseAnonKey } = validateEnvironment();
  
  return {
    isValid,
    supabaseUrlSet: !!supabaseUrl,
    supabaseAnonKeySet: !!supabaseAnonKey,
    environment: process.env.NODE_ENV
  };
}