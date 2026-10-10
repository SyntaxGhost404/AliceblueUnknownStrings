module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Must stay last: transforms Reanimated worklets.
  plugins: ['react-native-worklets/plugin'],
};
