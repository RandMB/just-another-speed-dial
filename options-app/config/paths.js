'use strict';

const path = require('path');

const appDirectory = __dirname + '/..';
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appBuild: resolveApp('../extension/options-app'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index.js'),
  appPackageJson: resolveApp('../package.json'),
  appSrc: resolveApp('src'),
  yarnLockFile: resolveApp('../yarn.lock'),
  testsSetup: resolveApp('src/setupTests.js'),
  appNodeModules: resolveApp('../node_modules'),
  publicUrl: './',
  servedPath: './',
};
