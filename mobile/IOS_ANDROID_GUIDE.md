# iOS and Android Setup Guide

## Configuration Fixed
✅ Added `android.package` property to [`mobile/app.json`](mobile/app.json:33)
✅ Metro configuration is working correctly
✅ Polyfills are implemented

## Running on iOS Simulator

### Step 1: Start Metro Server
```bash
cd mobile
npm start
```

### Step 2: Open on iOS Simulator
Once Metro is running, press `i` in the terminal.

### Step 3: App Opens Automatically
- The app will launch on iOS Simulator
- Code changes will hot-reload automatically
- Press `r` in Metro terminal to manually reload

## Running on Android Emulator

### Step 1: Start Metro Server
```bash
cd mobile
npm start
```

### Step 2: Open on Android Emulator
Once Metro is running, press `a` in the terminal.

### Step 3: App Opens Automatically
- The app will launch on Android Emulator
- Code changes will hot-reload automatically
- Press `r` in Metro terminal to manually reload

## Metro Server Commands

Once Metro is running, you can use these keyboard shortcuts:

### Platform Selection
- **Press `i`** - Open in iOS Simulator
- **Press `a`** - Open in Android Emulator
- **Press `w`** - Open in web browser

### App Controls
- **Press `r`** - Reload app
- **Press `d`** - Open developer menu
- **Press `Shift + d`** - Open React Native Debugger
- **Press `m`** - Toggle menu
- **Press `Shift + m`** - More tools

### Server Controls
- **Press `Ctrl + C`** - Stop Metro server
- **Press `?`** - Show all commands

## Development Workflow

### Daily Development
1. Start Metro: `npm start`
2. Press `i` for iOS or `a` for Android
3. Make code changes
4. Save files
5. Changes hot-reload automatically
6. Use `r` to manually reload if needed

### Testing on Both Platforms
1. Start Metro: `npm start`
2. Press `i` to test on iOS Simulator
3. Make changes, test on iOS
4. Press `a` to test on Android Emulator
5. Make changes, test on Android
6. Repeat as needed

### Switching Between Platforms
- Press `i` to switch to iOS Simulator
- Press `a` to switch to Android Emulator
- Press `w` to switch to web browser
- No need to restart Metro server

## Troubleshooting

### iOS Issues
**App won't open:**
1. Check iOS Simulator is running
2. Press `i` in Metro terminal
3. Check for errors in Metro terminal

**Hot reload not working:**
1. Check Metro server is running
2. Check you've saved your files
3. Press `r` in Metro terminal to reload
4. Check for errors in Metro terminal

### Android Issues
**App won't open:**
1. Check Android Emulator is running
2. Press `a` in Metro terminal
3. Check for errors in Metro terminal
4. Ensure `android.package` is set in app.json ✅

**Hot reload not working:**
1. Check Metro server is running
2. Check you've saved your files
3. Press `r` in Metro terminal to reload
4. Check for errors in Metro terminal

**Emulator not found:**
1. Check Android Emulator is running
2. Check emulator is accessible via ADB
3. Run: `adb devices` to see connected devices
4. Start emulator from Android Studio if needed

### General Issues
**Metro won't start:**
1. Stop any running Metro instances (Ctrl+C)
2. Clear cache: `npm start --clear`
3. Try again

**App crashes on startup:**
1. Check for errors in Metro terminal
2. Check for errors in simulator/emulator
3. Check [`mobile/polyfills.js`](mobile/polyfills.js:1-47) is loading correctly
4. Try creating a development build

**TextDecoder error persists:**
1. Create iOS development build: `npx expo run:ios --clean`
2. Create Android development build: `npx expo run:android --clean`
3. This includes polyfills in native initialization
4. Error should be resolved

## Creating Development Builds

### iOS Development Build
```bash
cd mobile
npx expo run:ios --clean
```
- Takes 10-15 minutes first time
- Includes polyfills in native initialization
- Fixes TextDecoder error
- Launches automatically on iOS Simulator

### Android Development Build
```bash
cd mobile
npx expo run:android --clean
```
- Takes 5-10 minutes first time
- Includes polyfills in native initialization
- Fixes TextDecoder error
- Launches automatically on Android Emulator

### Why Create Development Builds?
Development builds:
- Include your polyfills in native bundle initialization
- Allow native code to access `decoder` when it needs it
- Fix TextDecoder error that occurs during runtime initialization
- Provide better debugging capabilities
- Faster reload times
- Access to native modules

## Current Configuration

### [`mobile/app.json`](mobile/app.json:1-51)
- ✅ `ios` configuration with location permissions
- ✅ `android` configuration with package name: `com.invtl.mobile`
- ✅ `entryPoint`: `./polyfills.js`
- ✅ `jsEngine`: `jsc`
- ✅ `newArchEnabled`: `false`

### [`mobile/polyfills.js`](mobile/polyfills.js:1-47)
- ✅ TextDecoder polyfill
- ✅ TextEncoder polyfill
- ✅ Global `decoder` instance
- ✅ Global `encoder` instance
- ✅ Loads Expo Router entry point

### [`mobile/metro.config.js`](mobile/metro.config.js:1-8)
- ✅ Default Expo configuration
- ✅ Proper resolver configuration
- ✅ No custom polyfills (caused errors)

## Summary

1. **Start Metro:** `npm start`
2. **For iOS:** Press `i` in terminal
3. **For Android:** Press `a` in terminal
4. **For Web:** Press `w` in terminal
5. **Reload:** Press `r` in terminal
6. **Stop:** Press `Ctrl+C` in terminal

Both iOS and Android are now configured and ready to run!
