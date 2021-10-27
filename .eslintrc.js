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
    'ecmaVersion': 2020,
    'sourceType': 'module',
  },
  'plugins': [
    'react',
    'react-hooks',
    'testing-library',
    'jest',
  ],
  'rules': {
    'require-jsdoc': 0,
    'react/prop-types': 0,
    'prefer-const': 0,
    'max-len': [
      'error',
      {'code': 80, 'ignoreStrings': true},
    ],
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react',
            importNames: ['default'],
            message: 'React default is automatically imported by webpack.',
          },
        ],
      },
    ],
  },
};
