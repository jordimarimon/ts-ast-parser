/** @type {import('tailwindcss').Config} */
module.exports = {

    content: [
        './docs/**/*.{njk,md,html}',
    ],

    theme: {
        screens: {
            xs: '30em', // 480px
            sm: '40em', // 640px
            md: '48em', // 768px
            lg: '64em', // 1024px
            xl: '80em', // 1280px
        },

        fontFamily: {
            'sans': ['-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'Segoe UI', 'Roboto', 'Arial', 'Noto Sans', 'sans-serif'],
            'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
            'mono': ['SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        },

        colors: {
            neutral: {
                0: 'var(--color-neutral-0)',
                100: 'var(--color-neutral-100)',
                200: 'var(--color-neutral-200)',
                300: 'var(--color-neutral-300)',
                400: 'var(--color-neutral-400)',
                500: 'var(--color-neutral-500)',
                600: 'var(--color-neutral-600)',
                700: 'var(--color-neutral-700)',
                800: 'var(--color-neutral-800)',
                DEFAULT: 'var(--color-neutral-900)',
                1000: 'var(--color-neutral-1000)',
            },

            success: {
                100: 'var(--color-success-100)',
                200: 'var(--color-success-200)',
                300: 'var(--color-success-300)',
                400: 'var(--color-success-400)',
                DEFAULT: 'var(--color-success-500)',
                600: 'var(--color-success-600)',
                700: 'var(--color-success-700)',
                800: 'var(--color-success-800)',
                900: 'var(--color-success-900)',
            },

            danger: {
                100: 'var(--color-danger-100)',
                200: 'var(--color-danger-200)',
                300: 'var(--color-danger-300)',
                400: 'var(--color-danger-400)',
                DEFAULT: 'var(--color-danger-500)',
                600: 'var(--color-danger-600)',
                700: 'var(--color-danger-700)',
                800: 'var(--color-danger-800)',
                900: 'var(--color-danger-900)',
            },
        },

        textColor: theme => ({
            ...theme('colors'),
            current: 'currentColor',
            accent: 'var(--color-accent)',
            title: 'var(--color-title)',
            DEFAULT: 'var(--color-text)',
        }),

        backgroundColor: theme => ({
            ...theme('colors'),
            transparent: 'transparent',
            DEFAULT: 'var(--color-background)',
        }),

        borderRadius: {
            DEFAULT: 'var(--border-radius)',
            '1/2': '50%',
            'pill': '100vmax',
        },

        extend: {
            width: {
                lg: '64rem',
            },
        },
    },

    plugins: [
        require('tailwindcss-logical'),
    ],

};
