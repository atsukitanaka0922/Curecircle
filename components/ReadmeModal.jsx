/**
 * components/ReadmeModal.jsx - キュアサークルのREADMEモーダルコンポーネント
 * 
 * アプリケーションの使用方法、機能説明、更新履歴などを表示するモーダルコンポーネント。
 * ユーザーにキュアサークルのコンセプト、機能、使い方などを説明するためのヘルプ用インターフェースです。
 * 
 * 特徴:
 * - わかりやすいセクションに分かれた説明
 * - 主要機能の概要と使い方の提供
 * - ヒントとコツの表示
 * - 更新履歴と利用規約の表示
 * - お問い合わせフォームへのリンク
 * 
 * @author CureCircle Team
 * @version 1.2.0
 */

'use client'

import { useState } from 'react'
import { 
  X, Sparkles, Heart, Star, Image as ImageIcon, CreditCard, 
  Music, Settings, HelpCircle, Info, AlertTriangle, Clock, 
  RefreshCw, Award, ExternalLink, User
} from 'lucide-react'

export default function ReadmeModal({ isOpen, onClose }) {
  // モーダルが非表示の場合は何も表示しない
  if (!isOpen) return null
  
  // お問い合わせフォームのURL
  const contactUrl = "https://docs.google.com/forms/d/e/1FAIpQLSczpO6X4dWdPmfMR5nuhJLBzogjEqWmATNh2Ww477kji6lLGg/viewform?usp=sharing";
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 overflow-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* モーダルヘッダー */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <Sparkles size={24} />
              <span>キュアサークルについて</span>
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="閉じる"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* モーダルコンテンツ - スクロール可能 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose prose-pink max-w-none">
            <h1 className="text-center text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-6">
              キュアサークル
            </h1>

            <p className="lead text-lg text-center mb-8">
              プリキュア好きのためのプロフィール共有・交流サービスです。
            </p>

            {/* サービス概要セクション */}
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <Info size={20} className="text-pink-500" />
              サービス概要
            </h2>
            <p className="mb-4">
              キュアサークルは、プリキュアシリーズのファンがプロフィールを作成し、お気に入りの作品や
              キャラクターを共有できるコミュニティプラットフォームです。同じ趣味を持つファン同士でつながり、
              交流を深めることができます。
            </p>

            {/* 主な機能セクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <Star size={20} className="text-pink-500" />
              主な機能
            </h2>
            
            <div className="pl-4 mb-6">
              <div className="mb-3">
                <h3 className="font-medium mt-3 mb-1 flex items-center">
                  <User size={18} className="text-pink-500 mr-2" />
                  プロフィール作成
                </h3>
                <div className="pl-4 mb-3">
                  <p className="text-sm text-gray-700">
                    お気に入りの作品、キャラクター、妖精を登録して、あなたのプリキュア愛を表現できます。
                    視聴状況やお気に入りキャラの設定も簡単です。年齢、ファン歴、好きな作品・キャラクターなど
                    細かく設定できます。
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium mt-3 mb-1 flex items-center">
                  <ImageIcon size={18} className="text-pink-500 mr-2" />
                  画像ギャラリー
                </h3>
                <div className="pl-4 mb-3">
                  <p className="text-sm text-gray-700">
                    お気に入りの画像を投稿・整理できます。コレクションとして整理したり、
                    他のユーザーと共有したりすることができます。プロフィールページに表示される
                    お気に入り画像を管理できます。
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium mt-3 mb-1 flex items-center">
                  <CreditCard size={18} className="text-pink-500 mr-2" />
                  デジタル名刺
                </h3>
                <div className="pl-4 mb-3">
                  <p className="text-sm text-gray-700">
                    あなただけのオリジナルデジタル名刺を作成して共有できます。背景やフィルター、
                    装飾などを自由にカスタマイズしましょう。SNSへの共有や画像としてダウンロードも可能です。
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium mt-3 mb-1 flex items-center">
                  <Music size={18} className="text-pink-500 mr-2" />
                  プレイリスト
                </h3>
                <div className="pl-4 mb-3">
                  <p className="text-sm text-gray-700">
                    お気に入りの曲をプレイリストとして保存・共有できます。主題歌や挿入歌など、
                    思い出の曲をまとめておくことができます。Spotifyとの連携も可能です。（エクスポートは開発中です）
                  </p>
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="font-medium mt-3 mb-1 flex items-center">
                  <Settings size={18} className="text-pink-500 mr-2" />
                  カスタマイズ背景
                </h3>
                <div className="pl-4 mb-3">
                  <p className="text-sm text-gray-700">
                    プロフィールページの背景をカスタマイズできます。グラデーションや単色など、
                    お好みのデザインに変更できます。プリキュアシリーズをイメージした
                    カラーパレットも用意しています。
                  </p>
                </div>
              </div>
            </div>
            
            {/* 使い方セクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <HelpCircle size={20} className="text-pink-500" />
              使い方
            </h2>
            
            <div className="pl-4 mb-6">
              <ol className="list-decimal space-y-2 pl-5 text-gray-700">
                <li>
                  <strong>アカウント登録：</strong> メールアドレスとパスワードで登録、
                  またはGoogleアカウントでログインできます。
                </li>
                <li>
                  <strong>プロフィール設定：</strong> プロフィール情報を設定し、
                  あなたのプリキュア愛を表現しましょう。
                </li>
                <li>
                  <strong>デジタル名刺作成：</strong> デジタル名刺をカスタマイズして、
                  オリジナルの名刺を作りましょう。
                </li>
                <li>
                  <strong>ギャラリー充実：</strong> お気に入りの画像をアップロードし、
                  ギャラリーを充実させましょう。
                </li>
                <li>
                  <strong>プレイリスト作成：</strong> プレイリストを作成して、
                  お気に入りの音楽を追加しましょう。
                </li>
                <li>
                  <strong>シェアする：</strong> プロフィールURLを共有して、
                  友達と繋がりましょう。
                </li>
              </ol>
            </div>
            
            {/* ヒントとコツセクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <Sparkles size={20} className="text-pink-500" />
              ヒントとコツ
            </h2>
            
            <div className="pl-4 mb-6 space-y-2 text-sm text-gray-700">
              <p>
                <strong>・プロフィール充実：</strong> プロフィールはできるだけ詳細に設定すると、
                同じ趣味を持つファン同士で繋がりやすくなります。
              </p>
              <p>
                <strong>・画像投稿：</strong> 画像ギャラリーには、自分のお気に入りのプリキュアグッズや
                思い出の写真などを投稿しましょう。ただし、著作権に注意してください。
              </p>
              <p>
                <strong>・デジタル名刺シェア：</strong> デジタル名刺はSNSで共有したり、
                画像としてダウンロードして使用することができます。
              </p>
              <p>
                <strong>・背景カスタマイズ：</strong> 自分の好きなプリキュアシリーズをイメージした
                カラーやグラデーションを選ぶと、プロフィールがより個性的になります。
              </p>
              <p>
                <strong>・プレイリスト活用：</strong> プリキュアの主題歌や挿入歌をプレイリストに追加して、
                お気に入りの曲を共有しましょう。
              </p>
            </div>
            
            {/* 注意事項セクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-pink-500" />
              注意事項
            </h2>
            
            <div className="pl-4 mb-6 space-y-2 text-sm text-gray-700">
              <p>
                <strong>・コンテンツポリシー：</strong> 他人を中傷する内容やコンテンツの投稿は禁止しています。
                コミュニティガイドラインに沿った利用をお願いします。
              </p>
              <p>
                <strong>・著作権について：</strong> 著作権を侵害する画像や、違法なコンテンツの投稿は禁止しています。
                特に公式画像の無断転載にはご注意ください。
              </p>
              <p>
                <strong>・個人情報：</strong> プライバシーや個人情報の取り扱いには十分注意してください。
                不必要な個人情報の公開は避けましょう。
              </p>
              <p>
                <strong>・アカウント管理：</strong> アカウント情報は適切に管理し、
                パスワードは定期的に変更することをお勧めします。
              </p>
            </div>
            
            {/* トラブルシューティングセクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <RefreshCw size={20} className="text-pink-500" />
              トラブルシューティング
            </h2>
            
            <div className="pl-4 mb-6 space-y-2 text-sm text-gray-700">
              <p>
                <strong>・画像がアップロードできない：</strong> 画像のサイズや形式を確認してください。
                5MB以下のJPG、PNG、GIF形式の画像をお勧めします。
              </p>
              <p>
                <strong>・プロフィールが保存されない：</strong> ネットワーク接続を確認し、
                再度お試しください。問題が解決しない場合は、ブラウザのキャッシュをクリアしてみてください。
              </p>
              <p>
                <strong>・デジタル名刺が表示されない：</strong> ブラウザを最新バージョンに更新するか、
                別のブラウザで試してみてください。
              </p>
              <p>
                <strong>・ログインできない：</strong> パスワードをお忘れの場合は、
                「パスワードをお忘れですか？」リンクからリセットできます。
              </p>
            </div>
            
            {/* 更新履歴セクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-pink-500" />
              更新履歴
            </h2>

            <div className="pl-4 mb-6">
              <div className="space-y-2 text-sm text-gray-700">
                
                <div className="mt-2">
                  <p className="font-medium">v1.0.0（2024年4月）</p>
                  <ul className="list-disc pl-5">
                    <li>初回リリース</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* フィードバックについてセクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <Award size={20} className="text-pink-500" />
              フィードバックについて
            </h2>
            
            <div className="pl-4 mb-6">
              <p className="text-gray-700">
                キュアサークルは現在、ベータ版として運営しています。
                機能改善やバグ報告などのフィードバックを歓迎します。
                より良いサービスにするために、ぜひご意見をお聞かせください。
              </p>
              
              <div className="bg-blue-50 p-3 rounded-lg mt-4 mb-2 text-sm">
                <p className="font-medium text-blue-800 mb-1">🙋‍♀️ サポートが必要ですか？</p>
                <p className="text-blue-700">
                  質問やフィードバックがある場合は、
                  <a href={contactUrl} className="font-medium text-blue-600 hover:underline hover:text-blue-800 transition" target="_blank" rel="noopener noreferrer">
                    お問い合わせフォーム
                  </a>
                  、または @prcr_46のX（旧:Twitter）アカウント からご連絡ください。
                </p>
              </div>
            </div>
            
            {/* クレジットセクション */}
            <h2 className="text-xl font-bold mt-6 mb-3 flex items-center gap-2">
              <Heart size={20} className="text-pink-500" />
              クレジット
            </h2>
            
            <div className="pl-4 mb-6 space-y-2 text-sm text-gray-700">
              <p><strong>開発・デザイン:</strong> よんろく @prcr_46 </p>
              <p><strong>素材:</strong> 一部アイコンはLucide Icons、Pixivから借りています</p>
              <p><strong>技術スタック:</strong> Next.js, Supabase, Tailwind CSS</p>
              <p>
                <strong>アニメーション・コンテンツ:</strong> 
                プリキュア関連の名称、キャラクターについての権利は各権利者に帰属します
              </p>
            </div>

            {/* フッターと著作権表示 */}
            <div className="bg-pink-50 p-4 rounded-lg border border-pink-200 mt-8">
              <p className="text-pink-800 text-sm text-center">
                ©︎ 2025 キュアサークル 
                <br />
                本サービスは非公式のファンメイドサービスであり、東映アニメーション・ABC・朝日放送・バンダイ等とは一切関係ありません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
