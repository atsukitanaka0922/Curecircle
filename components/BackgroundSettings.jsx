/**
 * BackgroundSettings.jsx - プロフィール背景設定コンポーネント
 * 
 * 各プリキュアシリーズをモチーフにしたグラデーションをプリセットとして提供し、
 * ユーザープロフィールの背景として適用できる機能を実装しています。
 * 
 * 特徴:
 * - 全プリキュアシリーズ（ふたりはプリキュア～わんだふるぷりきゅあ!）の
 *   イメージカラーを反映したグラデーションプリセット
 * - リアルタイムプレビュー機能
 * - グラデーション/単色切替
 * - データベース保存とローカルストレージキャッシュ
 * - 全画面に適用される高パフォーマンスレンダリング
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

'use client'

import { useState, useEffect } from 'react'
import { Palette, X, Save, RotateCcw, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

/**
 * プリキュア全シリーズのグラデーションプリセット
 * 各シリーズのイメージカラーに基づいたCSSグラデーション定義のコレクション
 * 
 * - id: 内部識別子
 * - name: 表示名
 * - gradient: CSSグラデーション定義（linear, radial, conicなど多様な表現を使用）
 */
export const gradientPresets = [
  {
    id: 'precure_classic',
    name: 'クラシックプリキュア',
    gradient: 'linear-gradient(135deg, #ff6b9d 0%, #c44cd9 50%, #6fa7ff 100%)'
  },
  {
    id: 'cure_black_white',
    name: 'ふたりはプリキュア',
    gradient: 'linear-gradient(135deg, #ff69b4 0%, #080411 25%, #FFFD72 50%, #EAFCFF 75%, #ff69b4 100%)'
  },
  {
    id: 'splash_star',
    name: 'Splash☆Star',
    gradient: 'linear-gradient(135deg, #FFA646 0%, #FDFFFB 33%, #F2F780 66%, #CBE8E5 100%)'
  },
  {
    id: 'yes_precure5',
    name: 'Yes!プリキュア5',
    gradient: 'linear-gradient(135deg, #0D8675 0%, #D7584F 20%, #FBA8D6 40%, #9D59C0 60%, #FCF277 80%, #2E6AA6 100%)'
  },
  {
    id: 'fresh',
    name: 'フレッシュプリキュア!',
    gradient: 'linear-gradient(135deg, #C0B0D5 0%, #C0B0D5 25%, #CF1336 35%, #EE8DB8 50%, #EE8DB8 65%, #EDC23F 75%, #EDC23F 100%)'
  },
  {
    id: 'heartcatch',
    name: 'ハートキャッチプリキュア!',
    gradient: 'linear-gradient(135deg, #D4A9DF 0%, #D4A9DF 20%, #50EBFF 25%, #50EBFF 45%, #FF4DBD 50%, #FF4DBD 70%, #FFE55A 75%, #FFE55A 100%)'
  },
  {
    id: 'suite',
    name: 'スイートプリキュア♪',
    gradient: 'linear-gradient(180deg, #738CF3 0%, #738CF3 25%, #DD3688 25%, #DD3688 50%, #F9CC33 50%, #F9CC33 75%, #FAFAFA 75%, #FAFAFA 100%)'
  },
  {
    id: 'smile',
    name: 'スマイルプリキュア!',
    gradient: 'conic-gradient(from 45deg, #76A1FD 0deg, #76A1FD 72deg, #FEE652 72deg, #FEE652 144deg, #EB4CB0 144deg, #EB4CB0 216deg, #F15000 216deg, #F15000 288deg, #4DDC4F 288deg, #4DDC4F 360deg)'
  },
  {
    id: 'dokidoki',
    name: 'ドキドキ!プリキュア',
    gradient: 'radial-gradient(circle at center, #F15BB2 0%, #F15BB2 20%, #F8CD28 20%, #F8CD28 40%, #F42956 40%, #F42956 60%, #D9AFF1 60%, #D9AFF1 80%, #78A5FA 80%, #78A5FA 100%)'
  },
  {
    id: 'happiness_charge',
    name: 'ハピネスチャージプリキュア!',
    gradient: 'linear-gradient(to right, #FEDD5A, #85BBF9, #E63BA1, #9E88F5)'
  },
  {
    id: 'go_princess',
    name: 'Go!プリンセスプリキュア',
    gradient: 'conic-gradient(at 70% 30%, #F7BA47, #DE1A5F, #E099C1, #7ABADD, #F7BA47)'
  },
  {
    id: 'mahou_tsukai',
    name: '魔法つかいプリキュア!',
    gradient: 'radial-gradient(circle at 75% 25%, #F273C2 0%, #F273C2 30%, #62E5AF 30%, #62E5AF 60%, #7150C1 60%, #7150C1 100%)'
  },
  {
    id: 'kirakira',
    name: 'キラキラ☆プリキュアアラモード',
    gradient: 'linear-gradient(to right, #E43C4D 0%, #9F71B1 20%, #E95E9F 40%, #82CDDD 60%, #F6AD14 80%, #4775B9 100%)'
  },
  {
    id: 'hugtto',
    name: 'HUGっと!プリキュア',
    gradient: 'conic-gradient(from 180deg at 40% 40%, #FC54A6, #E6015C, #99EAFD, #DDADF3, #FFEC6E, #FC54A6)'
  },
  {
    id: 'star_twinkle',
    name: 'スター☆トゥインクルプリキュア',
    gradient: 'linear-gradient(120deg, #E2CDF9 0%, #E2CDF9 15%, #FCDC72 15%, #FCDC72 35%, #FF7BA9 35%, #FF7BA9 55%, #3BE3E1 55%, #3BE3E1 75%, #24BCFC 75%, #24BCFC 100%)'
  },
  {
    id: 'healin_good',
    name: 'ヒーリングっど♥プリキュア',
    gradient: 'linear-gradient(135deg, #FAEE8C 0%, #66C7F2 25%, #F877B0 50%, #E0CCFF 75%, #FAEE8C 100%)'
  },
  {
    id: 'tropical_rouge',
    name: 'トロピカル〜ジュ!プリキュア',
    gradient: 'conic-gradient(from 180deg at 50% 65%, #E24383, #FBBD36, #A0E8FF, #F0FFF9, #CAA9FF, #E24383)'
  },
  {
    id: 'delicious_party',
    name: 'デリシャスパーティ♡プリキュア',
    gradient: 'repeating-conic-gradient(from 0deg at 50% 50%, #1BF2F5 0deg 90deg, #FED93E 90deg 180deg, #CC91F8 180deg 270deg, #FF8DAC 270deg 360deg)'
  },
  {
    id: 'hirogaru_sky',
    name: 'ひろがるスカイ!プリキュア',
    gradient: 'radial-gradient(circle at 50% 120%, #FFB957 0%, #FFB957 25%, #FFA6DF 25%, #FFA6DF 42%, #6CDFFF 42%, #6CDFFF 68%, #F8FDFE 68%, #F8FDFE 85%, #BD91FF 85%, #BD91FF 100%)'
  },
  {
    id: 'wonderful_precure',
    name: 'わんだふるぷりきゅあ!',
    gradient: 'conic-gradient(from -45deg at 65% 35%, #FE9EC4 0%, #FE9EC4 20%, #7E40FD 20%, #7E40FD 40%, #9DEAE4 40%, #9DEAE4 60%, #E9E9F1 60%, #E9E9F1 80%, #FE9EC4 80%, #FE9EC4 100%)'
  }
];

export default function BackgroundSettings({ session, currentBackground, onBackgroundUpdate }) {  const [isOpen, setIsOpen] = useState(false)
  const [backgroundType, setBackgroundType] = useState('gradient')
  const [selectedGradient, setSelectedGradient] = useState('precure_classic')
  const [solidColor, setSolidColor] = useState('#ff69b4')
  const [saving, setSaving] = useState(false)  // 現在の背景設定を読み込み
  useEffect(() => {
    if (currentBackground) {
      // 現在の背景設定を反映
      setBackgroundType(currentBackground.type || 'gradient')
      setSelectedGradient(currentBackground.gradient_id || 'precure_classic')
      setSolidColor(currentBackground.solid_color || '#ff69b4')
      
      // 背景設定を読み込み後、すぐに適用する
      if (currentBackground.type) {
        applyBackgroundToPage(currentBackground);
      }
    }
  }, [currentBackground])
  
  // プレビュー画面での実時間変更適用 
  useEffect(() => {
    // モーダルが開いているときのみプレビューモードでの変更を検出
    if (isOpen) {
      // 実行回数を減らすためディバウンス処理
      const timer = setTimeout(() => {
        // 現在の選択に基づいてプレビュー用の背景データを作成
        const previewData = {
          type: backgroundType,
          gradient_id: backgroundType === 'gradient' ? selectedGradient : null,
          solid_color: backgroundType === 'solid' ? solidColor : null
        };
        
        // プレビュー用に一時的に背景を適用（保存せず）
        if (backgroundType !== 'image') {
          applyBackgroundToPage(previewData);
        }
      }, 100); // 100ms待機
      
      return () => clearTimeout(timer);
    }
  }, [backgroundType, selectedGradient, solidColor, isOpen])  // 背景設定保存（再修正版）
  /**
   * 背景設定をデータベースとローカルストレージに保存する
   */
  const saveBackgroundSettings = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    try {
      // 保存するデータを作成
      const backgroundData = {
        user_id: session.user.id,
        type: backgroundType,
        gradient_id: backgroundType === 'gradient' ? selectedGradient : null,
        solid_color: backgroundType === 'solid' ? solidColor : null,
        image_url: null,
        image_settings: null,
        updated_at: new Date().toISOString()
      }

      // DBに保存
      const { data, error } = await supabase
        .from('user_backgrounds')
        .upsert(backgroundData, { onConflict: 'user_id' })

      if (error) throw error
      
      // ローカルストレージにもキャッシュ
      try {
        localStorage.setItem('userBackground', JSON.stringify(backgroundData));
      } catch (e) {
        // サイレントフェイル - LocalStorageが利用できない場合でも処理を続行
      }

      // 確実に背景を再適用（保存直後）
      applyBackgroundToPage(backgroundData);
      
      // 確実にモーダルを閉じる前に処理を完了させる
      setTimeout(() => {
        // 親コンポーネントに通知（最後に実行）
        onBackgroundUpdate(backgroundData);
        
        // モーダルを閉じる
        setIsOpen(false);
        
        // 保存ステータスをリセット
        setSaving(false);
        
        // 成功メッセージ
        alert('背景設定を保存しました！✨');
      }, 100);
      
    } catch (error) {
      console.error('背景設定保存エラー:', error);
      alert('背景設定の保存に失敗しました');
      setSaving(false);
    } finally {
      // エラー発生時やタイムアウト時のためのフォールバックとして、少し遅延して保存状態をリセット
      setTimeout(() => {
        setSaving(false);
      }, 1500);
    }
  }  /**
   * ページ全体に背景を適用する関数
   * @param {Object} backgroundData - 背景設定データ
   */
  const applyBackgroundToPage = (backgroundData) => {
    if (typeof window === 'undefined') return

    try {
      // 既存のスタイル要素を削除し新規作成（重複適用を防ぐ）
      const existingStyle = document.getElementById('curetter-background-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      // 新しいスタイル要素を作成
      const styleEl = document.createElement('style');
      styleEl.id = 'curetter-background-styles';
      styleEl.setAttribute('data-priority', 'highest'); // 優先度を最高に設定
      document.head.appendChild(styleEl);
      
      // 背景タイプに応じてスタイルを生成
      let cssText = '';
      
      switch (backgroundData.type) {
        case 'solid':
          const color = backgroundData.solid_color || '#ff69b4';
          cssText = `
            body, html {
              background: ${color} !important;
              background-color: ${color} !important;
              background-image: none !important;
            }
            /* ルート要素にも適用 - 最も確実な方法 */
            :root {
              --page-background-color: ${color} !important;
              --page-background-gradient: none !important;
            }
          `;
          break;
          
        case 'gradient':
          // グラデーションIDの処理
          const gradientId = backgroundData.gradient_id;
          
          if (!gradientId) {
            const defaultGradient = gradientPresets[0].gradient;
            cssText = `
              body, html {
                background: ${defaultGradient} !important;
                background-image: ${defaultGradient} !important;
                background-attachment: fixed !important;
              }
              /* ルート要素にも適用 */
              :root {
                --page-background-gradient: ${defaultGradient} !important;
              }
            `;
            break;
          }
          
          // グラデーションを探す
          const foundGradient = gradientPresets.find(g => g.id === gradientId);
          
          if (!foundGradient) {
            const defaultGradient = gradientPresets[0].gradient;
            cssText = `
              body, html {
                background: ${defaultGradient} !important;
                background-image: ${defaultGradient} !important;
                background-attachment: fixed !important;
              }
              /* ルート要素にも適用 */
              :root {
                --page-background-gradient: ${defaultGradient} !important;
              }
            `;
            break;
          }
          
          // 見つかったグラデーションを使用
          const gradient = foundGradient.gradient;
          cssText = `
            body, html {
              background: ${gradient} !important;
              background-image: ${gradient} !important;
              background-attachment: fixed !important;
            }
            /* ルート要素にも適用 */
            :root {
              --page-background-gradient: ${gradient} !important;
            }
          `;
          break;
          
        default:
          // デフォルト
          const defaultGradient = gradientPresets[0].gradient;
          cssText = `
            body, html {
              background: ${defaultGradient} !important;
              background-image: ${defaultGradient} !important;
              background-attachment: fixed !important;
            }
            /* ルート要素にも適用 */
            :root {
              --page-background-gradient: ${defaultGradient} !important;
            }
          `;
          break;
      }
      
      // スタイルを適用
      styleEl.textContent = cssText;
      
      // 既存のインラインスタイルをクリア
      if (document.body) {
        document.body.style.removeProperty('background');
        document.body.style.removeProperty('background-color');
        document.body.style.removeProperty('background-image');
      }
      
      if (document.documentElement) {
        document.documentElement.style.removeProperty('background');
        document.documentElement.style.removeProperty('background-color');
        document.documentElement.style.removeProperty('background-image');
      }
      
      // ルートに更新イベントを発行して、CSSカスタムプロパティの変更を通知
      document.documentElement.dispatchEvent(new CustomEvent('style-updated'));
    } catch (error) {
      console.error('背景適用エラー:', error);
    }
  }  /**
   * グローバル初期化とデータ変更時の背景適用
   */
  useEffect(() => {
    // ブラウザ環境でのみ実行
    if (typeof window === 'undefined') return;
    
    // コンポーネントのマウント時に一度だけ実行
    const initBackground = () => {
      // ローカルストレージから背景設定を回復（ページ更新時のために）
      try {
        const savedBackground = localStorage.getItem('userBackground');
        if (savedBackground) {
          const parsed = JSON.parse(savedBackground);
          
          // 現在の背景設定がない場合、保存された設定を適用
          if (!currentBackground || !currentBackground.type) {
            applyBackgroundToPage(parsed);
          }
        }
      } catch (e) {
        // LocalStorage が使用できない場合は無視
      }
    };
    
    // 初期化（コンポーネントマウント時に一度だけ）
    initBackground();
    
    // 現在の背景設定が変更されたときに適用
    if (currentBackground && currentBackground.type) {
      // 確実に適用するために少し遅延
      const timer = setTimeout(() => {
        applyBackgroundToPage(currentBackground);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [currentBackground]); // currentBackgroundの変更を監視
  /**
   * 設定をデフォルト値にリセット
   */
  const resetSettings = () => {
    setBackgroundType('gradient')
    setSelectedGradient('precure_classic')
    setSolidColor('#ff69b4')
    setSaving(false) // リセット時に保存状態もリセット
  }
  
  /**
   * プレビュー用のスタイルを生成
   */
  const getPreviewStyle = () => {
    try {
      switch (backgroundType) {
        case 'gradient':
          // グラデーションを探す
          const foundGradient = gradientPresets.find(g => g.id === selectedGradient);
          // 見つかったグラデーションまたはデフォルトを使用
          const gradientValue = foundGradient ? foundGradient.gradient : gradientPresets[0].gradient;
          return { 
            background: gradientValue,
            backgroundAttachment: 'fixed'
          };
        
        case 'solid':
          return { 
            backgroundColor: solidColor,
            background: solidColor
          };
        
        default:
          // デフォルトのグラデーション
          return { 
            background: gradientPresets[0].gradient,
            backgroundAttachment: 'fixed'
          };
      }
    } catch (error) {
      // エラー発生時はデフォルトスタイルを返す
      return { 
        background: gradientPresets[0].gradient,
        backgroundAttachment: 'fixed'
      };
    }
  }
  /**
   * モーダルを閉じて元の背景設定を再適用
   */
  const handleCloseModal = () => {
    if (currentBackground) {
      // 閉じる前に元の背景を再適用（変更をキャンセルした場合）
      applyBackgroundToPage(currentBackground);
    }
    setIsOpen(false);
    setSaving(false); // モーダルを閉じる時に保存状態をリセット
  };

  return (
    <>      {/* 設定ボタン */}
      <button
        onClick={() => {
          setIsOpen(true);
          setSaving(false); // モーダルを開く時に保存状態をリセット
        }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 shadow-lg"
      >
        <Palette size={16} />
        <span>背景設定</span>
      </button>

      {/* 設定モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-auto max-h-[90vh] flex flex-col shadow-2xl">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center space-x-2">
                  <Sparkles size={24} />
                  <span>プロフィール背景設定</span>
                </h2>                <button
                  onClick={handleCloseModal}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* メインコンテンツ - スクロール可能領域 */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* 設定パネル */}
              <div className="w-full md:w-1/2 overflow-y-auto p-6 border-r border-gray-200">
                <div className="space-y-6">
                  {/* 背景タイプ選択 */}
                  <div>                    <h3 className="text-lg font-semibold text-gray-800 mb-3">背景タイプ</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'gradient', label: 'グラデーション', icon: Sparkles },
                        { id: 'solid', label: '単色', icon: Palette }
                      ].map(({ id, label, icon: Icon }) => (
                        <button
                          key={id}
                          onClick={() => setBackgroundType(id)}
                          className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center space-y-2 ${
                            backgroundType === id
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-sm font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* グラデーション設定 */}
                  {backgroundType === 'gradient' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">プリキュアグラデーション</h3>
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                        {gradientPresets.map((gradient) => (
                          <button
                            key={gradient.id}
                            onClick={() => setSelectedGradient(gradient.id)}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              selectedGradient === gradient.id
                                ? 'border-purple-500 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div
                              className="w-full h-12 rounded-lg mb-2"
                              style={{ background: gradient.gradient }}
                            />
                            <p className="text-xs font-medium text-center text-gray-700">
                              {gradient.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 単色設定 */}
                  {backgroundType === 'solid' && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">背景色</h3>
                      <div className="space-y-3">
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-full h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          placeholder="#ff69b4"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* プレビューパネル */}
              <div className="w-full md:w-1/2 p-6 flex flex-col">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">プレビュー</h3>
                <div
                  className="w-full h-64 md:h-80 rounded-xl shadow-lg relative overflow-hidden"
                  style={getPreviewStyle()}
                >
                  {/* プレビューコンテンツ */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 text-white">
                      <h4 className="text-xl font-bold mb-2">プリキュアファン</h4>
                      <p className="text-sm opacity-90">これはプレビューです</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                      <p>背景設定のプレビューが表示されます</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* フッター - 常に表示されるボタンエリア */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={resetSettings}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>リセット</span>
                </button>
                <button
                  onClick={saveBackgroundSettings}
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>保存中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>保存</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}