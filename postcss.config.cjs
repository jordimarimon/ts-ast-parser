module.exports = {
    plugins: {
        'postcss-import': {},
        'postcss-preset-env': {},
        'tailwindcss/nesting': {},
        'tailwindcss': {},
        'autoprefixer': {},
        'cssnano': {
            // See: https://cssnano.co/docs/what-are-optimisations#what-optimisations-do-you-support
            // See: https://github.com/cssnano/cssnano/tree/master/packages/cssnano-preset-default
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
                discardDuplicates: true,
                discardOverridden: true,
                discardEmpty: true,
            }],
        },
    },
};
