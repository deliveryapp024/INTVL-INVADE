# INVADE - Authentication & FCM Setup Guide

## 📋 OVERVIEW

This guide provides step-by-step instructions to configure:
1. **Supabase OAuth** (Google & Apple Sign-In)
2. **Firebase Cloud Messaging (FCM)** for push notifications
3. **App Configuration** for deep links and OAuth callbacks

---

## 🔧 STEP 1: SUPABASE OAUTH CONFIGURATION

### 1.1 Enable Google OAuth

1. **Go to Supabase Dashboard**:
   - Navigate to: https://app.supabase.com
   - Select your project

2. **Enable Google Provider**:
   - Go to **Authentication** → **Providers**
   - Find **Google** and toggle it **ON**
   - Click **"Set up Google"**

3. **Create Google OAuth Credentials**:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your Firebase project (intvl-invade)
   - Click **"Create Credentials"** → **"OAuth client ID"**
   
4. **Configure OAuth Consent Screen** (if not done):
   - Go to **OAuth consent screen**
   - Select **"External"** (for public access)
   - Fill in app details:
     - App name: INVADE
     - User support email: your-email@domain.com
     - Developer contact: your-email@domain.com
   - Add scopes: email, profile, openid
   - Add test users (your email)

5. **Create OAuth Client IDs**:

   **For Android**:
   - Application type: **Android**
   - Package name: `com.intvlinvade.app`
   - SHA-1 certificate fingerprint: (Get from your keystore)
   - Click **Create**
   - Copy the **Client ID**

   **For iOS**:
   - Application type: **iOS**
   - Bundle ID: `com.intvlinvade.app`
   - Click **Create**
   - Copy the **Client ID**

6. **Add to Supabase**:
   - Paste Android Client ID in **Authorized Client IDs (Android)**
   - Paste iOS Client ID in **Authorized Client IDs (iOS)**
   - Save changes

### 1.2 Enable Apple OAuth (iOS Only)

1. **Apple Developer Account Required**:
   - Must have Apple Developer Program ($99/year)

2. **Configure in Apple Developer Portal**:
   - Go to: https://developer.apple.com/account/resources/identifiers/list
   - Create or select your App ID
   - Enable **"Sign in with Apple"** capability

3. **Create Service ID**:
   - Go to **Identifiers** → **Services IDs**
   - Click **+** to create new
   - Description: INVADE Auth
   - Identifier: `com.intvlinvade.app.auth`
   - Enable **"Sign in with Apple"**
   - Configure domains:
     - Primary App ID: Your app bundle ID
     - Website URLs: `https://your-supabase-project.supabase.co`
     - Return URLs: `https://your-supabase-project.supabase.co/auth/v1/callback`

4. **Create Private Key**:
   - Go to **Keys** → **All**
   - Click **+** to create new
   - Key name: INVADE Sign In
   - Enable **"Sign in with Apple"**
   - Select Primary App ID
   - Click **Save** then **Continue**
   - **Download the .p8 file** (you can only do this once!)
   - Note the **Key ID**

5. **Add to Supabase**:
   - Go to Supabase → Authentication → Providers → Apple
   - Enable Apple provider
   - Fill in:
     - Services ID: `com.intvlinvade.app.auth`
     - Key ID: (from step above)
     - Team ID: (from Apple Developer Membership)
     - Private Key: (contents of the .p8 file)
   - Save changes

---

## 🔥 STEP 2: FIREBASE CLOUD MESSAGING (FCM) SETUP

### 2.1 Verify Firebase Configuration Files

**Files have been copied to:**
- Android: `mobile/android/app/google-services.json` ✅
- iOS: `mobile/ios/GoogleService-Info.plist` ✅

### 2.2 Update app.json Configuration

The following changes have been made to `mobile/app.json`:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.intvlinvade.app",
      "googleServicesFile": "./ios/GoogleService-Info.plist",
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLSchemes": [
              "com.googleusercontent.apps.914047828656-c34ea9435275cead097175"
            ]
          },
          {
            "CFBundleURLSchemes": [
              "com.intvlinvade.app"
            ]
          }
        ]
      }
    },
    "android": {
      "package": "com.intvlinvade.app",
      "googleServicesFile": "./android/app/google-services.json"
    }
  }
}
```

### 2.3 Configure FCM in Firebase Console

1. **Go to Firebase Console**:
   - https://console.firebase.google.com
   - Select project: **intvl-invade**

2. **Enable Cloud Messaging**:
   - Go to **Project Settings** → **Cloud Messaging**
   - Note the **Server key** and **Sender ID**
   - Enable **Cloud Messaging API (Legacy)** if not already enabled

3. **Add Server Key to Backend**:
   - Copy the **Server key**
   - Add to your backend `.env` file:
     ```
     FIREBASE_SERVER_KEY=your-server-key-here
     ```

4. **Download Updated Config Files** (if needed):
   - Go to **Project Settings** → **General**
   - Under **Your apps**, click the Android app
   - Click **Download google-services.json**
   - Replace the file in `mobile/android/app/`
   - Repeat for iOS app and `GoogleService-Info.plist`

---

## 🔗 STEP 3: DEEP LINK CONFIGURATION

### 3.1 iOS URL Scheme

**Already configured in app.json:**
```json
{
  "CFBundleURLTypes": [
    {
      "CFBundleURLSchemes": [
        "com.googleusercontent.apps.914047828656-c34ea9435275cead097175",
        "com.intvlinvade.app"
      ]
    }
  ]
}
```

### 3.2 Android Intent Filters

**Already configured in app.json:**
```json
{
  "intentFilters": [
    {
      "action": "VIEW",
      "data": [
        {
          "scheme": "com.intvlinvade.app",
          "host": "auth",
          "pathPrefix": "/callback"
        }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
}
```

### 3.3 Supabase Redirect URLs

**Add these URLs to Supabase**:
1. Go to Supabase → Authentication → URL Configuration
2. Add to **Redirect URLs**:
   ```
   com.intvlinvade.app://auth/callback
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
3. Set **Site URL**:
   ```
   com.intvlinvade.app://
   ```

---

## 🧪 STEP 4: TESTING

### 4.1 Test Email/Password Auth

1. **Start the app**:
   ```bash
   cd mobile
   npx expo start
   ```

2. **Navigate to Sign Up**:
   - You should see the auth landing screen
   - Tap "Get Started"
   - Complete all 4 steps of signup

3. **Verify in Supabase**:
   - Go to Supabase → Table Editor → users
   - Check that your user was created with all fields

### 4.2 Test Google Sign-In

1. **On Android**:
   - Tap "Continue with Google"
   - Select your Google account
   - Should redirect back to app and log you in

2. **On iOS**:
   - Same process as Android
   - May show Apple permission dialog first

### 4.3 Test Push Notifications

1. **Get FCM Token**:
   - Log in to the app
   - Check console logs for "FCM token obtained"

2. **Send Test Notification**:
   - Go to Firebase Console → Cloud Messaging
   - Click **"Send your first message"**
   - Enter notification title and body
   - Select target: **User segment** → **App** → **INVADE**
   - Click **Review** then **Publish**

3. **Verify Receipt**:
   - Notification should appear on your device
   - Check app logs for "Push notification received"

### 4.4 Test Admin Notifications

1. **Go to Admin Panel**:
   - https://your-admin-panel-url.com
   - Log in as admin

2. **Send Custom Notification**:
   - Navigate to **Notifications**
   - Click **"Send Notification"**
   - Fill in title and body
   - Select target users
   - Click **Send**

3. **Verify Delivery**:
   - Check notification appears on device
   - Check delivery status in admin panel

---

## 🚀 STEP 5: BUILD FOR PRODUCTION

### 5.1 Build for Android

```bash
cd mobile
eas build --platform android
```

### 5.2 Build for iOS

```bash
cd mobile
eas build --platform ios
```

### 5.3 Submit to Stores

**Google Play Store**:
- Upload AAB file to Google Play Console
- Add SHA-1 fingerprint from Play Console to Google OAuth

**Apple App Store**:
- Upload IPA file to App Store Connect
- Ensure "Sign in with Apple" capability is enabled in Xcode

---

## 📱 STEP 6: BACKEND NOTIFICATION IMPLEMENTATION

### 6.1 Welcome Notification

The backend should send a welcome notification when a user signs up.

**Add to your backend** (`backend/src/services/NotificationService.ts`):

```typescript
async sendWelcomeNotification(userId: string): Promise<void> {
  await this.sendToUser(userId, {
    title: "Welcome to INVADE! 🎉",
    body: "Your running adventure begins now. Capture your first zone!",
    data: {
      type: "welcome",
      screen: "/run"
    }
  });
}
```

### 6.2 Achievement Notification

```typescript
async sendAchievementNotification(userId: string, achievementName: string): Promise<void> {
  await this.sendToUser(userId, {
    title: `🏆 ${achievementName} Unlocked!`,
    body: "Congratulations on your achievement! Keep running!",
    data: {
      type: "achievement_unlocked",
      achievement: achievementName,
      screen: "/profile"
    }
  });
}
```

### 6.3 Friend Activity Notification

```typescript
async sendFriendActivityNotification(
  userId: string, 
  friendName: string, 
  activity: string
): Promise<void> {
  await this.sendToUser(userId, {
    title: "Friend Activity",
    body: `${friendName} ${activity}`,
    data: {
      type: "friend_activity",
      screen: "/friends"
    }
  });
}
```

---

## 🐛 TROUBLESHOOTING

### Issue: Google Sign-In fails

**Solution**:
1. Verify OAuth Client ID is correct in Supabase
2. Check package name matches exactly: `com.intvlinvade.app`
3. Add SHA-1 fingerprint from your signing keystore
4. Ensure OAuth consent screen is published (not in testing mode)

### Issue: Apple Sign-In fails

**Solution**:
1. Verify Service ID matches: `com.intvlinvade.app.auth`
2. Check Team ID is correct
3. Ensure private key is valid and not expired
4. Verify "Sign in with Apple" capability is enabled in Xcode

### Issue: Push notifications not received

**Solution**:
1. Check FCM token is registered in database
2. Verify Firebase Server Key is correct in backend
3. Check device notification permissions are granted
4. Test with Firebase Console directly first
5. Check app is not in "Do Not Disturb" mode

### Issue: Deep links not working

**Solution**:
1. Verify URL scheme in app.json matches: `com.intvlinvade.app`
2. Check Supabase redirect URLs include the app scheme
3. Test with: `npx uri-scheme open com.intvlinvade.app://auth/callback --ios`
4. Ensure associated domains are configured correctly

---

## ✅ CHECKLIST

Before launching, verify:

- [ ] Google OAuth configured in Supabase
- [ ] Apple OAuth configured (if iOS)
- [ ] Firebase config files in correct locations
- [ ] app.json updated with bundle IDs
- [ ] Deep links configured
- [ ] Push notification permissions requested
- [ ] Tested on physical device (not simulator)
- [ ] Backend has Firebase Server Key
- [ ] Welcome notification implemented
- [ ] Terms & Privacy pages accessible
- [ ] Signup flow tested end-to-end

---

## 📞 SUPPORT

If you encounter issues:

1. **Supabase Issues**: Check Supabase logs in Dashboard
2. **Firebase Issues**: Check Firebase Console → Crashlytics/Analytics
3. **OAuth Issues**: Verify credentials in Google/Apple developer consoles
4. **Push Issues**: Test with Firebase Console directly

**Contact**: support@intvl-invade.com

---

## 🎉 YOU'RE DONE!

Your app now has:
- ✅ Email/Password authentication
- ✅ Google Sign-In
- ✅ Apple Sign-In (iOS)
- ✅ Push notifications via FCM
- ✅ Custom admin notifications
- ✅ Automatic welcome notifications
- ✅ Terms & Privacy compliance

**Next Steps**:
1. Test thoroughly on physical devices
2. Submit to app stores
3. Monitor analytics and crash reports
4. Collect user feedback

Happy coding! 🚀
