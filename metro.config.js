const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // dotLottie animations ship as binary assets.
    assetExts: [...defaultConfig.resolver.assetExts, 'lottie'],
    // Keep the reference build and tooling out of the module graph.
    blockList: [/An Elmwood Trail.*\.apks$/, /\/tools\/.*/],
  },
};

module.exports = mergeConfig(defaultConfig, config);
