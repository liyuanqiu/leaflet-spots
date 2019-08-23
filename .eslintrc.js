module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'import/prefer-default-export': 'off',
    indent: 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.js'],
      },
    },
  },
  env: {
    jest: true,
    browser: true,
  },
};
