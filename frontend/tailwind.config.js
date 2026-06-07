/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        peach: {
          50: '#FFF9F6',
          100: '#FFF0EB',
          200: '#FFE4DC',
        },
        blush: {
          50: '#FFF5F8',
          100: '#FFE8F0',
          200: '#FFD6E5',
          300: '#FFB8D0',
        },
        coral: {
          DEFAULT: '#FF8B6A',
          light: '#FFB088',
          dark: '#FF6F4A',
        },
        candy: {
          DEFAULT: '#FF6B9D',
          light: '#FF8FB8',
          dark: '#FF4D85',
        },
        warm: {
          text: '#6B4F4F',
          muted: '#A88888',
          light: '#C9A8A8',
        },
      },
      borderRadius: {
        bubble: '28rpx',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 8rpx 32rpx rgba(255, 107, 157, 0.12)',
        card: '0 4rpx 20rpx rgba(255, 139, 106, 0.15)',
        float: '0 12rpx 40rpx rgba(255, 107, 157, 0.2)',
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
