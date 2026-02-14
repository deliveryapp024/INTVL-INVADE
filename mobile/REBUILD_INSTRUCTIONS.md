# Rebuild Instructions for TextDecoder Fix

## Problem
The error "ERROR [runtime not ready]: TypeError: Cannot read property 'decode' of undefined" is occurring during React Native's native initialization, before our JavaScript code runs.

## Root Cause
After making configuration changes (removing `react-native-url-polyfill`, changing JS engine, disabling new architecture), the native app needs to be rebuilt to pick up these changes.

## Solution

### For iOS (Development Build)

1. **Stop Metro bundler** (Ctrl+C in terminal)

2. **Clean the iOS build:**
   ```bash
   cd mobile
   npx expo run:ios --clean
   ```

   Or if using Xcode directly:
   - Open Xcode: `open ios/yourproject.xcworkspace` (or use Expo's iOS folder)
   - Product > Clean Build Folder (Shift+Cmd+K)
   - Delete the `ios/Pods` folder
   - Run: `cd ios && pod install`
   - Build and run from Xcode

3. **Start Metro bundler:**
   ```bash
   cd mobile
   npm start
   ```

4. **Run the app:**
   - Press 'i' in the Metro terminal to run on iOS simulator
   - Or use: `npx expo run:ios`

### For iOS (Expo Go)

If you're using Expo Go:
1. **Stop Metro bundler** (Ctrl+C)
2. **Clear Expo cache:**
   ```bash
   cd mobile
   rmdir /s /q .expo
   ```
3. **Restart Metro bundler:**
   ```bash
   npm start
   ```
4. **Reload Expo Go app** on your device:
   - Shake device or press Cmd+D (simulator)
   - Tap "Reload"
   - If that doesn't work, close and reopen Expo Go

### Alternative: Use Expo Development Build

If the above doesn't work, create a development build:

1. **Create development build:**
   ```bash
   npx expo run:ios
   ```

2. **This will:**
   - Build a custom version of the app with your dependencies
   - Include your polyfills in the native build
   - Give you a development build that loads from Metro

## What Changed

1. **Removed `react-native-url-polyfill`** - This was causing the `decoder.decode()` error
2. **Updated polyfills** - Added global `decoder` and `encoder` instances
3. **Changed JS engine** - Switched between Hermes and JSC for compatibility
4. **Disabled new architecture** - Set `newArchEnabled: false` for stability

## Verification

After rebuilding, the app should:
1. Load without "Cannot read property 'decode' of undefined" errors
2. Log "[TextDecoder Polyfill] Polyfills loaded successfully"
3. Register the "main" component properly with Expo Router
4. Display your app's UI

## Troubleshooting

If the error persists:

1. **Clear all caches:**
   ```bash
   cd mobile
   rmdir /s /q .expo
   rmdir /s /q node_modules\.cache
   ```

2. **Reinstall dependencies:**
   ```bash
   cd mobile
   rmdir /s /q node_modules
   npm install --legacy-peer-deps
   ```

3. **Reset iOS simulator:**
   - Simulator > Device > Erase All Content and Settings
   - Rebuild the app

4. **Check for native modules:**
   - Some native modules might be trying to use TextDecoder
   - Review your native code for any TextDecoder usage
