# Complete Rebuild Instructions for TextDecoder Error

## Critical Issue
The error "ERROR [runtime not ready]: TypeError: Cannot read property 'decode' of undefined" is occurring during React Native's native initialization, before any JavaScript code runs. This is a fundamental initialization issue that requires a complete native rebuild.

## Root Cause Analysis
- Error occurs during "runtime not ready" phase
- Happens before our JavaScript polyfills can execute
- Indicates React Native's JavaScript runtime initialization is trying to access `decoder`
- JavaScript-level polyfills cannot fix this because they run too late

## Solution: Complete Native Rebuild

### Option 1: Expo Development Build (Recommended)

This creates a custom native build that includes all your dependencies:

```bash
cd mobile
npx expo run:ios --clean
```

This will:
1. Clean the iOS build completely
2. Rebuild native code with your configuration
3. Include your polyfills in the native initialization
4. Create a development build that loads from Metro

### Option 2: Clean Expo Go Setup

If you must use Expo Go:

1. **Stop Metro bundler** (Ctrl+C)

2. **Clear all caches:**
   ```bash
   cd mobile
   rmdir /s /q .expo
   rmdir /s /q node_modules\.cache
   ```

3. **Reinstall dependencies:**
   ```bash
   cd mobile
   rmdir /s /q node_modules
   npm install --legacy-peer-deps
   ```

4. **Restart Metro:**
   ```bash
   cd mobile
   npm start --clear
   ```

5. **Reload Expo Go:**
   - Close Expo Go app completely
   - Reopen Expo Go
   - Scan QR code again

### Option 3: Full iOS Simulator Reset

If above doesn't work:

1. **Reset iOS Simulator:**
   - iOS Simulator > Device > Erase All Content and Settings
   - This completely resets the simulator

2. **Rebuild:**
   ```bash
   cd mobile
   npx expo run:ios --clean
   ```

## What We've Tried (JavaScript-Level Fixes)

All of these have been implemented but cannot fix the issue because they run too late:

1. ✅ Added global `decoder` and `encoder` instances to polyfills
2. ✅ Created multiple polyfill files (min, simple, hard)
3. ✅ Added polyfills to `polyfills.js` entry point
4. ✅ Added polyfills to `metro.config.js`
5. ✅ Added polyfills to `babel.config.js`
6. ✅ Removed `react-native-url-polyfill` dependency
7. ✅ Changed JS engine (Hermes/JSC)
8. ✅ Disabled new architecture
9. ✅ Simplified app layout
10. ✅ Added extensive logging

## Why These Didn't Work

The error occurs during React Native's **native initialization phase**, before the JavaScript runtime is ready. Our polyfills are JavaScript code, so they cannot execute until after the JavaScript runtime has initialized. This is a chicken-and-egg problem.

## The Real Solution

You need to create a **development build** that includes your polyfills in the native initialization sequence:

```bash
cd mobile
npx expo run:ios --clean
```

This will:
- Build a custom iOS app with your configuration
- Include your polyfills in the native bundle
- Initialize React Native with your polyfills already in place
- Allow the JavaScript runtime to start with `decoder` already defined

## After Rebuild

Once you've created a development build, the app should:
1. Load without "Cannot read property 'decode' of undefined" errors
2. Log "[Polyfills] Loading polyfills..." in the console
3. Register the "main" component properly with Expo Router
4. Display your app's UI

## Alternative: Use Expo Development Build Client

Instead of Expo Go, use the Expo Development Build client:

1. **Build development client:**
   ```bash
   cd mobile
   npx expo run:ios
   ```

2. **This gives you:**
   - A custom iOS app with your dependencies
   - Better debugging capabilities
   - Access to native modules
   - Faster reload times

## Summary

The issue is not with your polyfills - they're correctly implemented. The issue is that React Native's native initialization is trying to access `decoder` before the JavaScript runtime is ready to execute your polyfills.

**You must create a development build to resolve this.** JavaScript-level fixes cannot solve this initialization timing issue.

## Next Steps

1. Run: `cd mobile && npx expo run:ios --clean`
2. Wait for the build to complete (may take 10-15 minutes)
3. The custom development build will launch on iOS simulator
4. The app should load without errors

If this still doesn't work, the issue may be with Expo or React Native itself, and you should:
1. Check Expo documentation for known issues
2. Consider downgrading Expo SDK version
3. Report the issue to Expo/React Native GitHub
