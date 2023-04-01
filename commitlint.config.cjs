module.exports = {
    extends: [
        '@commitlint/config-conventional',
    ],
    rules: {
        'header-max-length': [2, 'always', 100],
        'body-leading-blank': [2, 'always'],
        'body-max-line-length': [2, 'always', 100],
        'body-max-length': [0, 'always'],
        'footer-leading-blank': [2, 'always'],
        'footer-max-line-length': [2, 'always', 100],
        'scope-empty': [0, 'never'],
        'scope-enum': [2, 'always', [
            'core',
            'deps',
        ]],
    },
};
