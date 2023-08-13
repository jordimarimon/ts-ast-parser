const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const esBuildPlugin = require('./scripts/docs/build-docs.cjs');
const postcssPresetEnv = require('postcss-preset-env');
const tailwindNesting = require('tailwindcss/nesting');
const autoprefixer = require('autoprefixer');
const atImport = require('postcss-import');
const tailwind = require('tailwindcss');
const { DateTime } = require('luxon');
const postcss = require('postcss');
const cssnano = require('cssnano');
const path = require('path');
const fs = require('fs');

let pendingPostCss = undefined;

const cssPath = path.join(process.cwd(), 'docs', 'assets', 'css');
const postcssProcessor = postcss([
    atImport({
        path: [cssPath],
    }),
    postcssPresetEnv(),
    tailwindNesting(),
    tailwind(),
    autoprefixer(),
    cssnano({
        // See: https://cssnano.co/docs/what-are-optimisations#what-optimisations-do-you-support
        // See: https://github.com/cssnano/cssnano/tree/master/packages/cssnano-preset-default
        preset: [
            'default',
            {
                discardComments: {
                    removeAll: true,
                },
                discardDuplicates: true,
                discardOverridden: true,
                discardEmpty: true,
            },
        ],
    }),
]);

module.exports = eleventyConfig => {
    // Don't ignore paths defined in .gitignore
    eleventyConfig.setUseGitIgnore(false);

    // Adds the following files in the bundle
    eleventyConfig.addPassthroughCopy('docs/favicon.ico');
    eleventyConfig.addPassthroughCopy({ 'docs/robots.txt': '/robots.txt' });
    eleventyConfig.addPassthroughCopy({
        'node_modules/jsoneditor/dist/img/jsoneditor-icons.svg': '/playground/img/jsoneditor-icons.svg',
    });
    eleventyConfig.addPassthroughCopy('docs/assets/previews');

    // Compile the CSS
    eleventyConfig.addNunjucksAsyncFilter('postcss', (fileName, done) => {
        if (!pendingPostCss) {
            pendingPostCss = new Promise((resolve, reject) => {
                const stylesheet = path.join(cssPath, fileName);
                const cssCode = fs.readFileSync(stylesheet, 'utf-8');

                pendingPostCss = postcssProcessor
                    .process(cssCode, { from: undefined })
                    .then(result => resolve(result.css))
                    .catch(error => reject(error));
            });
        }

        pendingPostCss
            .then(css => {
                pendingPostCss = undefined;
                done(null, css);
            })
            .catch(error => {
                pendingPostCss = undefined;
                done(error, null);
            });
    });

    eleventyConfig.addWatchTarget(path.join(cssPath, '*.css'));

    // Make sure the sidebar items are ordered correctly
    eleventyConfig.addCollection('page', collections => {
        return collections.getFilteredByTag('page').sort((a, b) => {
            return a.data.order - b.data.order;
        });
    });
    eleventyConfig.addCollection('module', collections => {
        return collections.getFilteredByTag('module').sort((a, b) => {
            return a.data.order - b.data.order;
        });
    });

    // Transform the name of a module into the name of a collection
    eleventyConfig.addFilter('makeCollectionName', value => {
        return String(value)
            .split(/\s|-/)
            .map((v, i) => {
                return (i === 0 ? v[0].toLowerCase() : v[0].toUpperCase()) + v.slice(1);
            })
            .join('');
    });

    // Get the module name from the url
    eleventyConfig.addFilter('getModuleName', url => {
        const normalizedUrl = eleventyConfig.getFilter('url')(url).replace('/ts-ast-parser', '');
        return normalizedUrl.split('/').filter(v => v)[0];
    });

    // Syntax highlighting: https://www.11ty.dev/docs/plugins/syntaxhighlight/
    eleventyConfig.addPlugin(syntaxHighlight);

    // For the sitemap
    eleventyConfig.addShortcode('currentDate', () => DateTime.now());

    // Bundles JS files
    eleventyConfig.addPlugin(esBuildPlugin);

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
