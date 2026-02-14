# Development Build Guide for iOS

## Understanding Expo Go vs Development Build

### Expo Go (What you're currently using)
- **Pre-built app** from App Store
- Loads your JavaScript bundle from Metro server
- Cannot include custom native code or polyfills in initialization
- Limited debugging capabilities
- Quick to get started

### Development Build (What you need)
- **Custom-built app** with your specific configuration
- Includes your polyfills in native bundle initialization
- Better debugging capabilities
- Requires building from source (takes 10-15 minutes first time)
- Loads your JavaScript bundle from Metro server

## Option 1: Create Development Build (Recommended)

This will create a custom iOS app that includes your polyfills in the initialization sequence, which should fix the TextDecoder error.

### Step 1: Stop Metro Bundler
If Metro is currently running, stop it by pressing `Ctrl+C` in the terminal.

### Step 2: Create Development Build
Run this command in the mobile directory:

```bash
cd mobile
npx expo run:ios --clean
```

**What this does:**
- Cleans previous iOS build
- Builds a custom iOS app with your dependencies
- Includes your polyfills in the native bundle
- Installs the app on iOS Simulator
- Starts Metro server automatically

**Expected time:** 10-15 minutes for first build, 2-5 minutes for subsequent builds

### Step 3: Wait for Build to Complete
You'll see output like:
```
› Building app...
› Compiling React Native code...
› Building iOS bundle...
› Installing on iOS Simulator...
```

When complete, the app will automatically launch on iOS Simulator.

### Step 4: Access Your App
Once the build is complete:
- The app will automatically open on iOS Simulator
- Metro server will be running in your terminal
- Any code changes you make will hot-reload automatically
- You can access the app through the iOS Simulator

### Step 5: Making Code Changes
After the build is complete:
1. Make changes to your code
2. Save files
3. Changes will automatically reload in the app (hot reload)
4. Metro server will show bundling progress

## Option 2: Continue Using Expo Go (Limited)

If you want to continue using Expo Go, you can try these steps:

### Step 1: Stop Metro Bundler
Press `Ctrl+C` in the terminal to stop Metro.

### Step 2: Clear All Caches
```bash
cd mobile
rmdir /s /q .expo
rmdir /s /q node_modules\.cache
```

### Step 3: Reinstall Dependencies
```bash
cd mobile
rmdir /s /q node_modules
npm install --legacy-peer-deps
```

### Step 4: Start Metro with Cache Clear
```bash
cd mobile
npm start --clear
```

### Step 5: Reload Expo Go
1. Close Expo Go app completely on your device/simulator
2. Reopen Expo Go
3. Scan the QR code from Metro terminal
4. Try to load your app

**Note:** This may not fix the TextDecoder error because Expo Go cannot include your polyfills in its native initialization sequence.

## How to Access App Through Expo Server

### With Development Build
1. Run: `npx expo run:ios`
2. Wait for build to complete
3. App automatically launches on iOS Simulator
4. Metro server runs in terminal
5. Code changes hot-reload automatically

### With Expo Go
1. Run: `npm start`
2. Scan QR code with Expo Go app
3. App loads from Metro server
4. Code changes hot-reload automatically

## Metro Server Commands

Once Metro is running, you can use these keyboard shortcuts:

- **Press `i`** - Open in iOS Simulator
- **Press `a`** - Open in Android Emulator
- **Press `w`** - Open in web browser
- **Press `r`** - Reload the app
- **Press `d`** - Open developer menu
- **Press `Shift + d`** - Open React Native Debugger
- **Press `Ctrl + C`** - Stop Metro server

## Recommended Workflow

### For Development (Daily Work)
1. Create development build once: `npx expo run:ios --clean`
2. Make code changes
3. Save files
4. Changes hot-reload automatically
5. Use `r` to manually reload if needed

### For Testing Changes
1. Make code changes
2. Save files
3. Changes hot-reload automatically
4. Use `d` to open developer menu for debugging

### For Major Changes
1. Stop Metro (Ctrl+C)
2. Run: `npx expo run:ios --clean`
3. Wait for rebuild (2-5 minutes)
4. Continue development

## Troubleshooting

### Build Fails
1. Check Xcode is installed
2. Check iOS Simulator is running
3. Try: `npx expo run:ios --clean` again
4. Check for error messages in terminal

### App Won't Load
1. Check Metro server is running
2. Check iOS Simulator is running
3. Try pressing `r` in Metro terminal to reload
4. Check for errors in Metro terminal

### Hot Reload Not Working
1. Check Metro server is running
2. Check you've saved your files
3. Try pressing `r` in Metro terminal
4. Check for errors in Metro terminal

### TextDecoder Error Persists
If you create a development build and still see the error:
1. The issue may be with a specific dependency
2. Try removing `fast-text-encoding` from package.json
3. Try using a simpler polyfill approach
4. Report issue to Expo/React Native GitHub

## Summary

**Best approach for your situation:**
1. Create a development build: `npx expo run:ios --clean`
2. Wait 10-15 minutes for build to complete
3. App will launch on iOS Simulator
4. Your polyfills will be included in native initialization
5. TextDecoder error should be resolved
6. Continue development with hot reload

This approach gives you the best of both worlds:
- Your polyfills in native initialization (fixes the error)
- Hot reload for fast development
- Better debugging capabilities
- Access to native modules
