'use strict';

const path = require('path');

const appDirectory = __dirname;
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
module.exports = {
  appBuild: resolveApp('../extension/apps'),
  appBuildRoot: resolveApp('../extension'),  
  dialIndexJs: resolveApp('../src/dial.js'),
  optionsIndexJs: resolveApp('../src/options.js'),
  appPackageJson: resolveApp('../package.json'),
  appRoot: resolveApp('../'),
  appSrc: resolveApp('../src'),
  yarnLockFile: resolveApp('../yarn.lock'),
  testsSetup: resolveApp('../src/setupTests.js'),
  appNodeModules: resolveApp('../node_modules'),
  publicUrl: './',
  servedPath: './',
};
