const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Bundle optimization
config.transformer.minifierConfig = {
  compress: {
    // Remove console.log in production
    drop_console: true,
    // Remove debugger statements
    drop_debugger: true,
    // Optimize dead code elimination
    dead_code: true,
    // Remove unused variables
    unused: true,
  },
  mangle: {
    // More aggressive variable name mangling
    toplevel: true,
  },
};

// Tree shaking - remove unused exports
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Exclude test files and mocks from production bundle
config.resolver.blockList = [
  /\.test\.(js|jsx|ts|tsx)$/,
  /\.spec\.(js|jsx|ts|tsx)$/,
  /__tests__/,
  /__mocks__/,
];

// Asset optimization
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Enable tree shaking
config.transformer.enableBabelRCLookup = true;

module.exports = config;
