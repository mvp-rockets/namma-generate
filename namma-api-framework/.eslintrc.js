module.exports = {
    env: {
        es6: true,
        node: true,
        mocha: true
    },
    extends: 'airbnb-base',
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2015,
        sourceType: 'module'
    },
    settings: {
        'import/resolver': {
            node: {
                paths: [
                    'src',
                    'test',
                    'config'
                ]
            }
        }
    },
    plugins: [
        'mocha',
        'chai-friendly'
    ],
    rules: {
        'no-unused-expressions': 0,
        'chai-friendly/no-unused-expressions': 2,
        'class-methods-use-this': 'off',
        'no-multi-str': 'off',
        'no-underscore-dangle': 'off',
        "import/no-unresolved": 'off',
        "no-plusplus": 'off',
        indent: [
            'error',
            4
        ],
        'comma-dangle': [
            'error',
            'never'
        ],
        'no-tabs': 0,
        'max-len': [
            2,
            150,
            4,
            {
                ignoreComments: true,
                ignoreUrls: true,
                ignorePattern: '^\\s*var\\s.+=\\s*require\\s*\\('
            }
        ],
        'no-shadow': 'off'
    }
};
