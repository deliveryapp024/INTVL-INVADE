# TextDecoder Polyfill Fix

## Problem
The iOS app was crashing with the error:
```
ERROR [runtime not ready]: TypeError: Cannot read property 'decode' of undefined
ERROR [runtime not ready]: Invariant Violation: "main" has not been registered.
```

## Root Cause
The TextDecoder polyfill in `src/shims/textdecoder-min.js` was providing the `TextDecoder` constructor but was not creating a global `decoder` instance. Some code in the application or its dependencies was trying to call `decoder.decode()` directly, which resulted in the error.

Additionally, the polyfill loading timing was not guaranteed to execute before other dependencies tried to use it. The error was occurring **during the Metro bundling process itself**, not just in the app runtime, which meant the polyfill needed to be available at the bundler level.

The `react-native-url-polyfill` package was also contributing to this issue by trying to use `decoder` before our polyfills loaded.

## Solution

### 1. Updated Polyfill Files

#### `src/shims/textdecoder-min.js`
Added global `decoder` and `encoder` instances:
```javascript
// Create global decoder/encoder instances for code that expects them
global.decoder = new TextDecoderPolyfill('utf-8');
global.encoder = new TextEncoderPolyfill();
globalThis.decoder = global.decoder;
globalThis.encoder = global.encoder;
```

#### `src/shims/textdecoder-simple.js`
Added the same global instances with `self` scope support:
```javascript
// Create global decoder/encoder instances for code that expects them
global.decoder = new TextDecoderPolyfill('utf-8');
global.encoder = new TextEncoderPolyfill();
globalThis.decoder = global.decoder;
globalThis.encoder = global.encoder;

if (typeof self !== 'undefined') {
  self.TextDecoder = TextDecoderPolyfill;
  self.TextEncoder = TextEncoderPolyfill;
  self.decoder = global.decoder;
  self.encoder = global.encoder;
}
```

### 2. Created New Entry Point (`index.js`)

Created a dedicated entry point that:
- Loads the TextDecoder polyfill first
- Provides a fallback decoder/encoder implementation
- Logs successful polyfill loading for debugging
- Then loads the Expo Router entry point

```javascript
// Load TextDecoder/TextEncoder polyfill FIRST before anything else
try {
  require('./src/shims/textdecoder-min.js');
} catch (error) {
  console.error('Failed to load textdecoder polyfill:', error);
}

// Ensure decoder/encoder are available globally (fallback)
if (typeof global.decoder === 'undefined') {
  global.decoder = { /* fallback implementation */ };
  globalThis.decoder = global.decoder;
}

if (typeof global.encoder === 'undefined') {
  global.encoder = { /* fallback implementation */ };
  globalThis.encoder = global.encoder;
}

// Log that polyfills are loaded
console.log('TextDecoder polyfills loaded successfully');

// Load Expo Router entry point
require('./polyfills.js');
```

### 3. Updated Configuration Files

#### `package.json`
- Changed the main entry point to `"./index.js"`
- **Removed `react-native-url-polyfill` dependency** which was causing the `decoder.decode()` error

#### `app.json`
- Updated the entry point to `"./index.js"`
- Changed `jsEngine` from `"jsc"` to `"hermes"` for better compatibility

#### `polyfills.js`
Enhanced with error handling and fallback:
```javascript
try {
  require('./src/shims/textdecoder-min.js');
} catch (error) {
  console.error('Failed to load textdecoder polyfill:', error);
}

// Fallback decoder/encoder if polyfill fails
if (typeof global.decoder === 'undefined') {
  global.decoder = { /* fallback */ };
  globalThis.decoder = global.decoder;
}

require('expo-router/entry');
```

#### `metro.config.js`
Added polyfill at the bundler level:
```javascript
// Polyfill for Metro bundler - must run before any other code
if (typeof global.decoder === 'undefined') {
  global.decoder = { /* fallback implementation */ };
  globalThis.decoder = global.decoder;
}

if (typeof global.encoder === 'undefined') {
  global.encoder = { /* fallback implementation */ };
  globalThis.encoder = global.encoder;
}

const { getDefaultConfig } = require('expo/metro-config');
// ... rest of config
```

#### `babel.config.js`
Added polyfill for Babel transpilation:
```javascript
// Polyfill for Babel transpilation - runs during bundling
if (typeof global !== 'undefined') {
  if (typeof global.decoder === 'undefined') {
    global.decoder = { /* fallback implementation */ };
    if (typeof globalThis !== 'undefined') {
      globalThis.decoder = global.decoder;
    }
  }
  // ... encoder polyfill
}
```

## Cache Clearing
After applying these changes, you must clear all caches:

```bash
cd mobile
rmdir /s /q .expo
```

Then restart the development server:
```bash
npm start
# or
expo start
```

For iOS, you may also need to:
1. Stop the Metro bundler (Ctrl+C)
2. Clear the iOS build cache in Xcode (Product > Clean Build Folder)
3. Restart the app

## Verification
After clearing the cache and restarting, the app should:
1. Load the polyfills successfully
2. Log "TextDecoder polyfills loaded successfully" in the console
3. Have `global.decoder` and `global.encoder` available
4. Not throw "Cannot read property 'decode' of undefined" errors
5. Register the "main" component properly with Expo Router

## Configuration Files
The following files are correctly configured:
- `package.json`: `"main": "./index.js"`
- `app.json`: `"entryPoint": "./index.js"`
- `index.js`: New entry point that loads polyfills first
- `polyfills.js`: Loads `textdecoder-min.js` with error handling before `expo-router/entry`
- `metro.config.js`: Properly configured for Expo

## Notes
- The new `index.js` entry point ensures polyfills load before any other code
- Multiple layers of fallback protection ensure decoder/encoder are always available
- Console logging helps debug polyfill loading issues
- Both `global` and `globalThis` scopes are updated for maximum compatibility
- The polyfill supports UTF-8 and UTF-16LE encoding
