# Create Development Builds for iOS and Android

## Why You Need Development Builds

Expo Go cannot include your polyfills in its native initialization sequence, which causes the "Cannot read property 'decode' of undefined" error. Development builds include your polyfills in the native bundle, which fixes this error.

## Option 1: Create iOS Development Build

### Step 1: Stop Metro Bundler
Press `Ctrl+C` in the terminal to stop Metro.

### Step 2: Create iOS Development Build
```bash
cd mobile
npx expo run:ios --clean
```

**What this does:**
- Cleans previous iOS build
- Builds a custom iOS app with your dependencies
- Includes your polyfills in native bundle initialization
- Installs app on iOS Simulator
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
Once build is complete:
- The app will automatically open on iOS Simulator
- Metro server will be running in your terminal
- Any code changes you make will hot-reload automatically
- You can access the app through the iOS Simulator

## Option 2: Create Android Development Build

### Step 1: Stop Metro Bundler
Press `Ctrl+C` in the terminal to stop Metro.

### Step 2: Create Android Development Build
```bash
cd mobile
npx expo run:android --clean
```

**What this does:**
- Cleans previous Android build
- Builds a custom Android app with your dependencies
- Includes your polyfills in native bundle initialization
- Installs app on Android Emulator
- Starts Metro server automatically

**Expected time:** 5-10 minutes for first build, 2-5 minutes for subsequent builds

### Step 3: Wait for Build to Complete
You'll see output like:
```
› Building app...
› Compiling React Native code...
› Building Android bundle...
› Installing on Android Emulator...
```

When complete, the app will automatically launch on Android Emulator.

### Step 4: Access Your App
Once build is complete:
- The app will automatically open on Android Emulator
- Metro server will be running in your terminal
- Any code changes you make will hot-reload automatically
- You can access the app through the Android Emulator

## Option 3: Create Both Builds (Recommended)

### Step 1: Stop Metro Bundler
Press `Ctrl+C` in the terminal to stop Metro.

### Step 2: Create iOS Build
```bash
cd mobile
npx expo run:ios --clean
```

Wait for iOS build to complete (10-15 minutes).

### Step 3: Create Android Build
```bash
cd mobile
npx expo run:android --clean
```

Wait for Android build to complete (5-10 minutes).

### Step 4: Start Metro Server
Once both builds are complete, you can start Metro and use either platform:
```bash
cd mobile
npm start
```

### Step 5: Run on Either Platform
- Press `i` to run on iOS Simulator
- Press `a` to run on Android Emulator
- Switch between platforms without restarting Metro

## After Creating Development Builds

### Benefits
✅ TextDecoder error is fixed (polyfills in native initialization)
✅ Better debugging capabilities
✅ Faster reload times
✅ Access to native modules
✅ Hot reload works reliably

### Daily Workflow
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

## Metro Server Commands

Once Metro is running:
- **Press `i`** - Open in iOS Simulator
- **Press `a`** - Open in Android Emulator
- **Press `w`** - Open in web browser
- **Press `r`** - Reload app
- **Press `d`** - Open developer menu
- **Press `Shift + d`** - Open React Native Debugger
- **Press `m`** - Toggle menu
- **Press `Shift + m`** - More tools
- **Press `Ctrl + C`** - Stop Metro server
- **Press `?`** - Show all commands

## Troubleshooting

### Build Fails
**iOS:**
1. Check Xcode is installed
2. Check iOS Simulator is running
3. Try: `npx expo run:ios --clean` again
4. Check for error messages in terminal

**Android:**
1. Check Android Studio is installed
2. Check Android Emulator is running
3. Check `adb devices` shows your emulator
4. Try: `npx expo run:android --clean` again
5. Check for error messages in terminal

### App Won't Load
1. Check Metro server is running
2. Check simulator/emulator is running
3. Try pressing `r` in Metro terminal to reload
4. Check for errors in Metro terminal

### Hot Reload Not Working
1. Check Metro server is running
2. Check you've saved your files
3. Try pressing `r` in Metro terminal
4. Check for errors in Metro terminal

### TextDecoder Error Persists
If you create development builds and still see the error:
1. Check [`mobile/polyfills.js`](mobile/polyfills.js:1-47) is loading correctly
2. Try removing `fast-text-encoding` from package.json
3. Try using a simpler polyfill approach
4. Report issue to Expo/React Native GitHub

## Summary

**Recommended approach:**
1. Create iOS development build: `npx expo run:ios --clean` (10-15 minutes)
2. Create Android development build: `npx expo run:android --clean` (5-10 minutes)
3. Start Metro: `npm start`
4. Press `i` for iOS or `a` for Android
5. Continue development with hot reload

This gives you:
- TextDecoder error fixed on both platforms
- Hot reload for fast development
- Better debugging capabilities
- Access to native modules
- Ability to test on both platforms easily

## Next Steps

1. Stop Metro (Ctrl+C)
2. Create iOS build: `npx expo run:ios --clean`
3. Wait for build to complete
4. Create Android build: `npx expo run:android --clean`
5. Wait for build to complete
6. Start Metro: `npm start`
7. Press `i` or `a` to run on your chosen platform
