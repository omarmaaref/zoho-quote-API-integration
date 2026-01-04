// const { composePlugins, withNx } = require('@nx/webpack');

// // Nx plugins for webpack.
// module.exports = composePlugins(
//   withNx({
//     target: 'node',
//   }),
//   (config) => {
//     // Update the webpack config as needed here.
//     // e.g. `config.plugins.push(new MyPlugin())`
//     return config;
//   }
// );

const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../../dist/projects/pdf-generator/service'),
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      // assets: ['./src/assets'],
      outputHashing: 'none',
      optimization: process.env['NODE_ENV'] !== 'development',
      sourceMap: process.env['NODE_ENV'] === 'development',
      generatePackageJson: true,
    }),
  ],
};
