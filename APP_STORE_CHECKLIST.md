# App Store Submission Checklist

## ✅ Current Status

### Configuration
- ✅ App ID: `app.tenant.rental`
- ✅ App Name: `Tenant`
- ✅ Bundle Identifier configured
- ✅ Privacy Policy page exists (`/privacy-policy`)
- ✅ Terms of Service page exists (`/terms`)
- ✅ Push Notifications configured

### Issues Found

#### 🔴 CRITICAL - Must Fix Before Submission

1. **Missing Privacy Permission Descriptions**
   - ❌ No `NSPhotoLibraryUsageDescription` - Required if app accesses photo library
   - ❌ No `NSCameraUsageDescription` - Required if app takes photos
   - ❌ No `NSLocationWhenInUseUsageDescription` - Required if app uses location
   - ❌ No `NSUserTrackingUsageDescription` - Required for App Tracking Transparency (if using ads/analytics)

2. **Production Build Configuration**
   - ⚠️ Server URL still points to development IP (`http://192.168.1.21:5000`)
   - ⚠️ Need to configure production server URL
   - ⚠️ Need to ensure `cleartext: true` is removed in production

3. **App Icons**
   - ⚠️ Only one app icon found (1024x1024)
   - ⚠️ Need all required icon sizes for iOS (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt)

4. **Version Numbers**
   - ⚠️ Need to verify version and build numbers are set in Xcode project

5. **Database Connection**
   - ⚠️ Database URL has incorrect hostname (will cause issues in production)
   - ⚠️ Need to fix `DATABASE_URL` in production environment

#### 🟡 RECOMMENDED - Should Fix

1. **App Store Metadata**
   - Need App Store description
   - Need screenshots (6.5", 5.5", 12.9" iPad)
   - Need app preview videos (optional but recommended)
   - Need keywords for App Store search
   - Need support URL
   - Need marketing URL

2. **Code Signing**
   - Need Apple Developer account
   - Need to configure signing certificates
   - Need to set up App Store Connect app record

3. **Testing**
   - Need to test on physical devices
   - Need to test all features work in production mode
   - Need to test push notifications in production

4. **Legal**
   - Privacy Policy URL needs to be publicly accessible
   - Terms of Service URL needs to be publicly accessible
   - May need age rating information

## 📋 Action Items

### Before Submission:

1. **Add Privacy Descriptions to Info.plist**
   ```xml
   <key>NSPhotoLibraryUsageDescription</key>
   <string>We need access to your photos to upload profile pictures and property images.</string>
   <key>NSCameraUsageDescription</key>
   <string>We need access to your camera to take photos for your profile and listings.</string>
   ```

2. **Fix Production Configuration**
   - Update `capacitor.config.ts` to use production server URL
   - Remove `cleartext: true` for production
   - Set up production environment variables

3. **Generate All App Icons**
   - Create icons in all required sizes
   - Use Asset Catalog in Xcode

4. **Set Version Numbers**
   - Set Marketing Version (e.g., "1.0.0")
   - Set Build Number (e.g., "1")

5. **Fix Database Connection**
   - Update `DATABASE_URL` with correct Supabase connection string
   - Test database connectivity

6. **Build for Production**
   ```bash
   npm run build
   npx cap sync ios
   ```

7. **Archive in Xcode**
   - Open project in Xcode
   - Select "Any iOS Device" as target
   - Product → Archive
   - Upload to App Store Connect

## 🔍 Next Steps

1. Review and fix all critical issues above
2. Test the app thoroughly in production mode
3. Prepare App Store Connect listing
4. Submit for review




