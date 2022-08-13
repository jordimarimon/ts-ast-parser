module.exports = function (eleventyConfig) {

    eleventyConfig.addPassthroughCopy('docs/favicon.ico');

    eleventyConfig.addCollection('page', (collections) => {
        return collections.getFilteredByTag('page').sort((a, b) => {
            return a.data.order - b.data.order;
        });
    });

    return {

        dir: {
            input: 'docs',
            output: '_site',
            data: '_data',
            includes: '_includes',
            layouts: '_layouts',
        },

        templateFormats: ['njk', 'md', 'html'],

        // The public documentation URL is: https://<user>.github.io/<repository-name>/
        pathPrefix: process.env.NODE_ENV === 'production' ? '/ts-ast-parser/' : '/',

    };

};
