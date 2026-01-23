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
                background: '#050505',
                surface: '#0A0A0A',
                primary: '#7C3AED', // Violet
                'primary-glow': 'rgba(124, 58, 237, 0.5)',
                secondary: '#06B6D4', // Cyan
                success: '#10B981',
                text: {
                    main: '#FFFFFF',
                    muted: '#A1A1AA',
                }
            },
            fontFamily: {
                display: ['"Inter Tight"', 'sans-serif'],
                body: ['"Inter"', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            backgroundImage: {
                // 'noise': "url('/noise.svg')", // Using direct file in component
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [
        typography,
    ],
}

export default config
