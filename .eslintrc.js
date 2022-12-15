module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {},
  rules: {
    'no-restricted-exports': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'error',
    '@typescript-eslint/member-ordering': 'error',
    '@typescript-eslint/no-non-null-assertion': 'off',
    'require-await': 'error',
    'prefer-promise-reject-errors': 'error',
    'import/no-cycle': 'off',
    'no-continue': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
        ts: 'always',
      },
    ],
    'import/prefer-default-export': 'off',
    'no-await-in-loop': 'off',
    'no-shadow': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
  },
  settings: {
    'import/extensions': ['.js', '.ts'],
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },

    'import/resolver': {
      node: {
        paths: 'src',
        extensions: ['.js', '.ts'],
      },
    },
  },
  reportUnusedDisableDirectives: true,
};
