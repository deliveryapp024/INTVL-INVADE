# Quick Start Guide - Fixed Metro Config

## Issue Fixed
The Metro configuration error has been resolved. The `metro.config.js` file has been reverted to the default configuration.

## Next Steps

### Step 1: Stop Metro Bundler
If Metro is currently running, stop it by pressing `Ctrl+C` in the terminal.

### Step 2: Start Metro Server
```bash
cd mobile
npm start
```

### Step 3: Open on iOS Simulator
Once Metro is running, you'll see options like:
```
› Press a │ open Android
› Press i │ open iOS
› Press w │ open web
```

**Press `i`** to open on iOS Simulator (not Android).

### Step 4: Access Your App
- The app will open on iOS Simulator
- Scan the QR code with Expo Go app on your iOS device
- Or use the development build if you've created one

## Important Notes

### For iOS Development
- Press `i` in Metro terminal to open on iOS Simulator
- Press `r` to reload the app
- Press `d` to open developer menu

### For Expo Go on iOS Device
1. Open Expo Go app on your iPhone/iPad
2. Tap "Scan QR code"
3. Scan the QR code shown in Metro terminal
4. App will load from Metro server

### For Development Build
If you want to create a development build (includes your polyfills in native initialization):

```bash
cd mobile
npx expo run:ios --clean
```

This will:
- Build a custom iOS app (10-15 minutes first time)
- Include your polyfills in native initialization
- Fix the TextDecoder error
- Launch automatically on iOS Simulator

## Current Status

✅ **Fixed:** Metro configuration error resolved
✅ **Ready:** Polyfills are correctly implemented
✅ **Configured:** Entry point is `polyfills.js`
✅ **Removed:** `react-native-url-polyfill` dependency

⚠️ **Note:** TextDecoder error may persist with Expo Go because it cannot include your polyfills in native initialization. A development build is recommended.

## Metro Server Commands

Once Metro is running:
- `i` - Open in iOS Simulator
- `a` - Open in Android Emulator
- `w` - Open in web browser
- `r` - Reload app
- `d` - Open developer menu
- `Shift + d` - Open React Native Debugger
- `m` - Toggle menu
- `Ctrl + C` - Stop Metro server

## Troubleshooting

### If Metro Won't Start
1. Stop any running Metro instances (Ctrl+C)
2. Clear cache: `npm start --clear`
3. Try again

### If App Won't Load
1. Check Metro server is running
2. Check iOS Simulator is running
3. Press `r` in Metro terminal to reload
4. Check for errors in Metro terminal

### If TextDecoder Error Persists
1. Create a development build: `npx expo run:ios --clean`
2. Wait for build to complete (10-15 minutes)
3. App will launch automatically on iOS Simulator
4. Error should be resolved

## Summary

1. Stop Metro (Ctrl+C)
2. Start Metro: `npm start`
3. Press `i` to open on iOS Simulator
4. Or scan QR code with Expo Go on iOS device
5. For TextDecoder fix: Create development build with `npx expo run:ios --clean`
