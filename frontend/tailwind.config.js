/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'Lora', 'Georgia', 'serif'],
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      colors: {
        'c-bg': 'var(--color-bg)',
        'c-card': 'var(--color-card)',
        'c-border': 'var(--color-card-border)',
        'c-text-primary': 'var(--color-text-primary)',
        'c-text-secondary': 'var(--color-text-secondary)',
        'c-sidebar-bg': 'var(--color-sidebar-bg)',
        'c-sidebar-border': 'var(--color-sidebar-border)',
        'c-sidebar-text': 'var(--color-sidebar-text)',
        'c-sidebar-text-active': 'var(--color-sidebar-text-active)',
        'c-sidebar-active': 'var(--color-sidebar-active)',
        'c-accent': 'var(--color-accent)',
        'c-accent-hover': 'var(--color-accent-hover)',
        'c-accent-text': 'var(--color-accent-text)',
        'c-success-bg': 'var(--color-success-bg)',
        'c-success-text': 'var(--color-success-text)',
        'c-warning-bg': 'var(--color-warning-bg)',
        'c-warning-text': 'var(--color-warning-text)',
        'c-danger-bg': 'var(--color-danger-bg)',
        'c-danger-text': 'var(--color-danger-text)',
        'c-danger': 'var(--color-danger)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'pulse-subtle': 'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        }
      }
    },
  },
  plugins: [],
}
