const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const path = require("path");

const defaultConfig = getDefaultConfig(__dirname);

const customConfig = {
  resolver: {
    extraNodeModules: {
      assetExts: ["mp4", "png", "jpg", "jpeg", "svg"],
      "@": path.resolve(__dirname, "src"),
    },
  },
  watchFolders: [path.resolve(__dirname, "src")],
};

module.exports = mergeConfig(defaultConfig, customConfig);
