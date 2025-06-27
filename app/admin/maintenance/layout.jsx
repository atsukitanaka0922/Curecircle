/**
 * app/admin/maintenance/layout.jsx - メンテナンス管理ページレイアウト
 * 
 * メンテナンス関連の管理ページで共有されるレイアウトコンポーネント。
 * 
 * @author CureCircle Team
 * @version 1.0.0
 */

export const metadata = {
  title: 'メンテナンス管理 - キュアサークル',
  description: 'キュアサークルのメンテナンスモードを管理します',
}

// シンプルなレイアウト - 親レイアウトを継承
export default function MaintenanceLayout({ children }) {
  return <>{children}</>
}
