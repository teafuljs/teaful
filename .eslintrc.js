module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'google',
  ],
  'parserOptions': {
    'ecmaFeatures': {
      'jsx': true,
    },
    'ecmaVersion': 13,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
  ],
  'rules': {
    'require-jsdoc': 0,
    'max-len': [
      'error',
      { 'code': 95 },
    ],
  },
};
