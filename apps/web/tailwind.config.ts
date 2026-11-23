import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ea580c',
        secondary: '#64748b',
        success: '#22c55e',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
} satisfies Config