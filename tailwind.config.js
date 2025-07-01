/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: 'media', // OSの設定に基づいたダークモード
  theme: {
    extend: {
      // プリキュア風のカラーパレットを追加
      colors: {
        'precure-pink': '#ff6b9d',
        'precure-purple': '#c44cd9',
        'precure-secondary': '#9c27b0',
        'precure-secondary-dark': '#673ab7'
      },
      // グラデーション背景の設定
      backgroundImage: {
        'precure-gradient': 'linear-gradient(to right, #ff6b9d, #c44cd9)'
      },
      // レスポンシブ設定の強化
      screens: {
        'xs': '480px',
      },
      // ダークモード対応の影設定
      boxShadow: {
        'card-light': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'card-dark': '0 8px 30px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}