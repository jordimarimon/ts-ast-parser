const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const {DateTime} = require('luxon');

module.exports = function (eleventyConfig) {

    // Adds the following files in the bundle
    eleventyConfig.addPassthroughCopy('docs/favicon.ico');
    eleventyConfig.addPassthroughCopy({'docs/robots.txt': '/robots.txt'});

    // Make sure the nav items are ordered correctly
    eleventyConfig.addCollection('page', (collections) => {
        return collections.getFilteredByTag('page').sort((a, b) => {
            return a.data.order - b.data.order;
        });
    });

    // Syntax highlighting: https://www.11ty.dev/docs/plugins/syntaxhighlight/
    eleventyConfig.addPlugin(syntaxHighlight);

    // For the sitemap
    eleventyConfig.addShortcode('currentDate', (date = DateTime.now()) => {
        return date;
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
