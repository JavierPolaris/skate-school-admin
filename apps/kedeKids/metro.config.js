const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');

const projectRoot   = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..', '..');

const config = getDefaultConfig(projectRoot);

// 1) Vigila todo el monorepo
config.watchFolders = [workspaceRoot];

// 2) Resuelve módulos node “path” al polyfill de browser
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  path: require.resolve('path-browserify'),
};

// (Opcional) Asegúrate de que Metro use node_modules del root también
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot,   'node_modules'),
];

module.exports = config;
