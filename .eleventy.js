module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy('docs/assets');

    return {
        dir: {
            input: 'docs',
            output: '_site',
            includes: '_includes',
            layouts: '_layouts',
        },
        templateFormats: ['njk', 'md', 'html'],
        pathPrefix: process.env.NODE_ENV === 'production' ? '/ts-ast-parser/' : '/',
    };
};
