import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#fbfbfd', // Apple off-white
                surface: '#FFFFFF',
                primary: '#0066eb', // Azure 600
                'primary-glow': 'rgba(0, 102, 235, 0.2)',
                secondary: '#0066eb',
                success: '#10B981',
                text: {
                    main: '#1d1d1f',
                    muted: '#6e6e73',
                },
                azure: {
                    50: '#f4f9ff',
                    100: '#eef6ff',
                    200: '#d9eaff',
                    300: '#b4d7ff',
                    400: '#8ebfff',
                    500: '#2b8aff',
                    600: '#0066eb',
                    700: '#0052bd',
                    800: '#004499',
                    900: '#06397a',
                }
            },
            fontFamily: {
                display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
                body: ['"SF Pro Text"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'sans-serif'],
                mono: ['"SF Mono"', 'ui-monospace', 'monospace'],
                sans: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            letterSpacing: {
                tighter: '-0.04em',
                tight: '-0.02em',
                normal: '0',
                wide: '0.02em',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'slide-up': 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'blob': 'blob 10s infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(40px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                blob: {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                }
            }
        },
    },
    plugins: [
        typography,
    ],
}

export default config
