const path = require('path');

module.exports = {
  watchFolders: [
    path.resolve(__dirname, 'packages'), // 👈 Esto permite acceder a /packages desde cualquier app
  ],
  resolver: {
    extraNodeModules: {
      '@shared': path.resolve(__dirname, 'packages/shared'), // 👈 Alias @shared para importar API/utils
    },
  },
};
