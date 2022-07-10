module.exports = function (/* eleventyConfig */) {
    return {
        dir: {
            input: 'docs',
            output: '_site',
            includes: '_includes',
            layouts: '_layouts',
            templateFormats: ['njk', 'md', 'html'],
        },
    };
};
