/* eslint-disable @cspell/spellchecker */
/**
 * Builds the DLL for development electron renderer process
 */

import path from 'path';

import webpack from 'webpack';
import { merge } from 'webpack-merge';

import { dependencies } from '../../package.json';
import checkNodeEnv from '../scripts/check-node-env';

import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';

checkNodeEnv('development');

const dist = webpackPaths.dllPath;

const configuration: webpack.Configuration = {
  context: webpackPaths.rootPath,

  devtool: 'eval',

  mode: 'development',

  target: 'electron-renderer',

  externals: [
    'fsevents',
    'crypto-browserify',
    '@aptabase/electron',
    '@nestjs/microservices',
    '@nestjs/microservices/microservices-module',
    'class-validator',
    'class-transformer',
    '@nestjs/websockets/socket-module',
  ],

  /**
   * Use `module` from `webpack.config.renderer.dev.js`
   */
  module: require('./webpack.config.renderer.dev').default.module,

  entry: {
    renderer: Object.keys(dependencies || {}),
  },

  output: {
    path: dist,
    filename: '[name].dev.dll.js',
    library: {
      name: 'renderer',
      type: 'var',
    },
  },

  plugins: [
    new webpack.DllPlugin({
      path: path.join(dist, '[name].json'),
      name: '[name]',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: webpackPaths.srcPath,
        output: {
          path: webpackPaths.dllPath,
        },
      },
    }),
  ],
};

export default merge(baseConfig, configuration);
