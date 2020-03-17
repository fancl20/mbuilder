module.exports = {
  env: {
    node: true,
    browser: false,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
  },
};
