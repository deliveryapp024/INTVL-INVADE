// Polyfill TextDecoder/TextEncoder for React Native (Hermes doesn't have these)
import './src/shims/textdecoder-min';

// Export empty as this file is just for polyfills
export {};
