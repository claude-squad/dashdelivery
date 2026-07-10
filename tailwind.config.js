/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f1117',
          1: '#161b26',
          2: '#1c2233',
          3: '#222840',
        },
        accent: {
          DEFAULT: '#7c6cf0',
          light: '#9d91f5',
          dim: '#2d2660',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.07)',
          bright: 'rgba(255,255,255,0.14)',
        },
        status: {
          idle: '#4b5563',
          working: '#7c6cf0',
          done: '#22c55e',
          error: '#ef4444',
          blocked: '#f59e0b',
          queued: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(124,108,240,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(124,108,240,0.8), 0 0 40px rgba(124,108,240,0.3)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
