module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // Usamos babel-preset-expo con la opción para transformar import.meta
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true
        }
      ]
    ],
    plugins: [
      // Si usas react-native-reanimated
      'react-native-reanimated/plugin',
      // Tu plugin de module-resolver si lo necesitas
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@shared': '../../packages/shared'
          }
        }
      ]
    ]
  };
};
