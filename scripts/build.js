const {buildSync} = require('esbuild');
const fs = require('fs');

const PATH = './docs/assets/js/';

function build(entryPoints) {
    buildSync({
        entryPoints: entryPoints,
        minify: process.env.NODE_ENV === 'production',
        sourcemap: false,
        bundle: true,
        format: 'esm',
        target: 'es2020',
        outdir: '_site/assets/js',
        entryNames: '[name]',
        loader: {
            '.ttf': 'file'
        }
    });
}

module.exports = function esBuildPlugin(eleventyConfig) {
    const files = fs
        .readdirSync(PATH, {withFileTypes: true})
        .filter(dir => dir.isFile())
        .map(f => `${PATH}${f.name}`);

    if (!files.length) {
        return;
    }

    build(files);

    for (const file of files) {
        eleventyConfig.addWatchTarget(file);
    }

    eleventyConfig.on('eleventy.beforeWatch', (changedFiles) => {
        if (files.some(file => changedFiles.includes(file))) {
            build(files);
        }
    });
};
