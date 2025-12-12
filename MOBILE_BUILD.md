# Mobile App Build Instructions

This document explains how to build the Tenant app for iOS and Android using Capacitor.

## Prerequisites

### For iOS builds:
- macOS with Xcode 14+ installed
- Apple Developer account for App Store submission
- CocoaPods installed (`sudo gem install cocoapods`)

### For Android builds:
- Android Studio with SDK 33+
- Java 17+
- Google Play Console account for Play Store submission

## Initial Setup

1. **Build the web app:**
```bash
npm run build
```

2. **Add iOS platform (on macOS):**
```bash
npx cap add ios
```

3. **Add Android platform:**
```bash
npx cap add android
```

## Building for iOS

1. **Sync web assets to iOS:**
```bash
npx cap sync ios
```

2. **Open in Xcode:**
```bash
npx cap open ios
```

3. **In Xcode:**
   - Select your development team
   - Configure bundle identifier: `app.tenant.rental`
   - Set up push notification capabilities
   - Configure app icons and splash screens
   - Build and archive for App Store

## Building for Android

1. **Sync web assets to Android:**
```bash
npx cap sync android
```

2. **Open in Android Studio:**
```bash
npx cap open android
```

3. **In Android Studio:**
   - Configure signing keys
   - Set up Firebase for push notifications
   - Configure app icons and splash screens
   - Build signed APK/AAB for Play Store

## Push Notifications Setup

The app currently uses Web Push for browser notifications. For native iOS/Android push notifications, additional setup is required:

### iOS (APNs) - Required for iOS push
1. Create an APNs key in Apple Developer portal
2. Add Push Notification capability in Xcode
3. Set up a push notification service (e.g., Firebase Cloud Messaging, OneSignal, or direct APNs integration)
4. Update the backend to send notifications via APNs using the device tokens

### Android (FCM) - Required for Android push
1. Create a Firebase project at console.firebase.google.com
2. Download `google-services.json` and add to `android/app/`
3. Update the backend to send notifications via FCM using the registration tokens

### Current Implementation Status
- **Web Push**: Fully implemented with VAPID keys (works in browsers)
- **Native Push**: Capacitor plugin installed, but requires APNs/FCM backend integration
- **Device Token Storage**: Schema ready, but backend needs platform-specific send logic

### To Complete Native Push
You'll need to:
1. Set up APNs (for iOS) and/or FCM (for Android) 
2. Update `server/pushService.ts` to route notifications based on subscription type
3. Store platform type with push subscriptions to distinguish web vs native tokens

## App Icons

Place your app icons in the following locations:
- iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Android: `android/app/src/main/res/mipmap-*/`

Use a tool like [App Icon Generator](https://appicon.co/) to generate all required sizes.

## Splash Screen

The app uses `@capacitor/splash-screen` for native splash screens.
Configure in `capacitor.config.ts` and add images to native projects.

## Common Commands

```bash
# Sync all changes to native projects
npx cap sync

# Copy web assets only (no native plugin updates)
npx cap copy

# Update native plugins
npx cap update

# Open iOS project
npx cap open ios

# Open Android project
npx cap open android

# Build web app and sync
npm run build && npx cap sync
```

## Troubleshooting

### iOS Build Fails
- Run `pod install` in the `ios/App` directory
- Clean build folder in Xcode (Shift+Cmd+K)

### Android Build Fails
- Sync Gradle files in Android Studio
- Invalidate caches and restart

### Push Notifications Not Working
- Verify VAPID keys are correctly configured
- Check notification permissions in device settings
- Ensure service worker is registered correctly
