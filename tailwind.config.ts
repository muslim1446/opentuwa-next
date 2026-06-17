import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"',
          '"Helvetica Neue"', 'sans-serif',
        ],
        display: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"',
          '"Helvetica Neue"', 'sans-serif',
        ],
      },
      colors: {
        apple: {
          blue: '#007AFF',
          indigo: '#5856D6',
          red: '#FF3B30',
          green: '#34C759',
          orange: '#FF9500',
          yellow: '#FFCC00',
          bg: '#F2F2F7',
          surface: '#FFFFFF',
          'surface-secondary': '#F2F2F7',
          text: '#000000',
          'text-secondary': 'rgba(60, 60, 67, 0.6)',
          'text-tertiary': 'rgba(60, 60, 67, 0.3)',
          'dark-bg': '#1C1C1E',
          'dark-surface': '#2C2C2E',
          'dark-surface-secondary': '#3A3A3C',
          'dark-text': '#FFFFFF',
          'dark-text-secondary': 'rgba(235, 235, 245, 0.6)',
          'dark-text-tertiary': 'rgba(235, 235, 245, 0.3)',
          'dark-blue': '#0A84FF',
          'dark-indigo': '#5E5CE6',
          'dark-red': '#FF453A',
          'dark-green': '#30D158',
          'dark-orange': '#FF9F0A',
          'dark-yellow': '#FFD60A',
        },
        glass: {
          'bg-light': 'rgba(255, 255, 255, 0.7)',
          'border-light': 'rgba(0, 0, 0, 0.05)',
          'bg-dark': 'rgba(44, 44, 46, 0.65)',
          'border-dark': 'rgba(255, 255, 255, 0.1)',
        },
      },
      borderRadius: {
        'squircle': '24px',
      },
      boxShadow: {
        'soft': '0 4px 14px rgba(0, 0, 0, 0.04), 0 2px 5px rgba(0, 0, 0, 0.02)',
        'elevated': '0 12px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'floating': '0 24px 48px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.06)',
        'dark-soft': '0 4px 14px rgba(0, 0, 0, 0.2), 0 2px 5px rgba(0, 0, 0, 0.1)',
        'dark-elevated': '0 12px 32px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15)',
        'dark-floating': '0 24px 48px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'spin-slow': 'spin 1s cubic-bezier(0.5, 0, 0.5, 1) infinite',
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'island-shake': 'shake 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        'ai-think-fadein': 'aiThinkFadeIn 0.4s ease-out',
        'eye-fade': 'eyeFade 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        aiThinkFadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        eyeFade: {
          '0%': { opacity: '0', filter: 'blur(2px)', transform: 'translateY(-2px)' },
          '100%': { opacity: '0.7', filter: 'blur(0)', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
