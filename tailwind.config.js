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

        colors: {
            neutral: {
                0: 'hsl(var(--color-neutral-0))',
                100: 'hsl(var(--color-neutral-100))',
                200: 'hsl(var(--color-neutral-200))',
                300: 'hsl(var(--color-neutral-300))',
                400: 'hsl(var(--color-neutral-400))',
                500: 'hsl(var(--color-neutral-500))',
                600: 'hsl(var(--color-neutral-600))',
                700: 'hsl(var(--color-neutral-700))',
                800: 'hsl(var(--color-neutral-800))',
                DEFAULT: 'hsl(var(--color-neutral-900))',
                1000: 'hsl(var(--color-neutral-1000))',
            },
        },

        borderRadius: {
            DEFAULT: 'var(--border-radius)',
            '1/2': '50%',
            'pill': '100vmax',
        },

        extend: {},
    },

    plugins: [
        require('tailwindcss-logical'),
    ],

};
