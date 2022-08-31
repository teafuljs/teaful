module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        shippedProposals: true,
        targets: {
          node: 'current',
        },
      },
    ],
    ['@babel/preset-react', {runtime: 'automatic'}],
    '@babel/preset-typescript',
  ],
  plugins: [],
};
