# App Store Connect Setup Guide

This guide explains how to set up automatic App Store submission using EAS Submit with App Store Connect API.

## Prerequisites

1. **Apple Developer Account** - Active paid membership ($99/year)
2. **App Store Connect Access** - Admin or App Manager role
3. **App Store Connect API Key** - For automated submission

## Step 1: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Tenant (or your app name)
   - **Primary Language**: Italian (or English)
   - **Bundle ID**: `com.mytenant.tenantapp` (from app.json)
   - **SKU**: A unique identifier (e.g., `tenant-ios-001`)
4. Click **Create**

## Step 2: Request App Store Connect API Access

1. In App Store Connect, go to **Users and Access**
2. Click the **"Integrations"** tab at the top (next to "People", "Sandbox", etc.)
3. Click **"App Store Connect API"** in the left sidebar
4. If you see: **"Permission is required to access the App Store Connect API"**:
   - Click the **"Request Access"** button
   - **Note**: Only the Account Holder can request access
   - Apple usually approves instantly or within a few hours
5. Once approved, you'll see the keys management interface

## Step 3: Generate App Store Connect API Key

1. After access is granted, you'll see a list of existing keys (or it will be empty)
2. Click the **+** button (usually in the top right) to create a new key
3. Name it: "EAS Submit Key"
4. Select **App Manager** or **Admin** role
5. Click **Generate**
6. **Download the .p8 key file** (you can only download it once - save it immediately!)
7. Note the:
   - **Key ID** (e.g., `ABC123XYZ`) - shown after generation
   - **Issuer ID** (e.g., `12345678-1234-1234-1234-123456789012`) - found at the top of the Keys page

## Step 3: Configure Environment Variables

Add these to your `.env` file or EAS secrets:

```bash
# Apple Developer Account
APPLE_ID=your@email.com
APPLE_TEAM_ID=YOUR_TEAM_ID

# App Store Connect API (for automatic submission)
ASC_APP_ID=1234567890  # Your app's App Store Connect ID (found in App Store Connect URL)
ASC_API_KEY_ID=ABC123XYZ  # The Key ID from Step 2
ASC_API_ISSUER_ID=12345678-1234-1234-1234-123456789012  # Issuer ID from Step 2
ASC_API_KEY_PATH=./path/to/AuthKey_ABC123XYZ.p8  # Path to downloaded .p8 file
```

### Finding Your App ID (ASC_APP_ID)

1. Go to your app in App Store Connect
2. Look at the URL: `https://appstoreconnect.apple.com/apps/1234567890/...`
3. The number after `/apps/` is your `ASC_APP_ID`

### Finding Your Team ID

1. Go to [Apple Developer](https://developer.apple.com/account)
2. Click **Membership** in the sidebar
3. Your **Team ID** is shown there (10 characters)

## Step 4: Set EAS Secrets (Recommended)

Instead of using `.env`, use EAS secrets for security:

```bash
# Set Apple credentials
eas secret:create --scope project --name APPLE_ID --value "your@email.com"
eas secret:create --scope project --name APPLE_TEAM_ID --value "YOUR_TEAM_ID"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name ASC_API_KEY_ID --value "ABC123XYZ"
eas secret:create --scope project --name ASC_API_ISSUER_ID --value "12345678-1234-1234-1234-123456789012"

# Upload the API key file
eas secret:create --scope project --name ASC_API_KEY_PATH --type file --value ./AuthKey_ABC123XYZ.p8
```

## Step 5: Upload API Key to EAS

The API key file needs to be accessible during submission:

```bash
# Option 1: Store in project (add to .gitignore!)
mkdir -p .secrets
mv AuthKey_ABC123XYZ.p8 .secrets/
# Add .secrets/ to .gitignore

# Option 2: Use EAS secret file storage (recommended)
eas secret:create --scope project --name ASC_API_KEY_PATH --type file --value ./AuthKey_ABC123XYZ.p8
```

## Step 6: Complete App Store Listing

Before automatic submission works, complete these in App Store Connect:

1. **App Information**:
   - Description (Italian and English)
   - Keywords
   - Support URL
   - Marketing URL (optional)
   - Privacy Policy URL

2. **Pricing and Availability**:
   - Set price (Free or Paid)
   - Select countries

3. **App Privacy**:
   - Complete Privacy Questionnaire
   - Declare data collection practices:
     - User Content (photos, documents)
     - Identifiers (User ID)
     - Usage Data (analytics)

4. **App Review Information**:
   - Contact information
   - Demo account credentials (if needed)
   - Notes for reviewer

5. **Version Information**:
   - Screenshots (required sizes)
   - App preview videos (optional)
   - Description
   - What's New

## Step 7: Build and Submit

Once configured, builds will automatically submit:

```bash
# Build and automatically submit to App Store
eas build -p ios --profile production --clear-cache

# Or build first, then submit separately
eas build -p ios --profile production
eas submit -p ios --profile production
```

## Apple Compliance Checklist

✅ **Privacy Permissions** (configured in app.json):
- Camera access (for ID verification, photos)
- Photo library access (for uploading images)
- Face ID (for secure login)
- Microphone (if needed for future features)

✅ **Required Info.plist Keys**:
- `NSCameraUsageDescription` ✅
- `NSPhotoLibraryUsageDescription` ✅
- `NSPhotoLibraryAddUsageDescription` ✅
- `NSFaceIDUsageDescription` ✅
- `ITSAppUsesNonExemptEncryption` ✅ (set to false)

✅ **App Store Connect Requirements**:
- Privacy Policy URL
- Support URL
- App description
- Screenshots (all required sizes)
- App icon (1024x1024)

## Troubleshooting

### "Invalid Program License Agreement" Error ⚠️

**Error Message**: "API Keys cannot be created due to an invalid Program License Agreement. Please update this agreement and try your request again."

**This is a common issue!** Here's how to fix it:

1. **Go to Apple Developer Portal** (NOT App Store Connect):
   - Visit: [https://developer.apple.com/account](https://developer.apple.com/account)
   - Log in with your Apple Developer account

2. **Accept the Agreement**:
   - Look for a banner or notification at the top about "Program License Agreement"
   - Or go to **Membership** → Look for agreement status
   - Click **"Review Agreement"** or **"Accept"** button
   - Read and accept the latest agreement

3. **Wait for Processing**:
   - Apple usually processes this within a few minutes
   - You may receive a confirmation email

4. **Try Again**:
   - Go back to App Store Connect
   - Navigate to: **Users and Access** → **Integrations** → **App Store Connect API**
   - Click **+** to create a new key
   - It should work now!

**Important Notes**:
- Only the **Account Holder** can accept the Program License Agreement
- If you're not the Account Holder, ask them to accept it
- This agreement is separate from App Store Connect agreements
- You may need to accept it annually when Apple updates it

### "Invalid API Key" Error
- Verify the Key ID and Issuer ID are correct
- Ensure the .p8 file is the correct one
- Check the key hasn't expired (they don't expire, but check it's active)

### "App Not Found" Error
- Verify `ASC_APP_ID` matches your app's ID in App Store Connect
- Ensure the app exists and is in the correct state

### "Team ID Mismatch" Error
- Verify `APPLE_TEAM_ID` matches your Apple Developer team
- Check the bundle ID matches between app.json and App Store Connect

### Build Succeeds but Submit Fails
- Check all App Store Connect listing requirements are complete
- Verify screenshots are uploaded
- Ensure app is in "Ready to Submit" state

## Manual Submission (Fallback)

If automatic submission fails, you can manually submit:

1. Download the `.ipa` file from EAS build
2. Use **Transporter** app (from Mac App Store)
3. Or use Xcode → Window → Organizer → Distribute App

## Resources

- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi)
- [Apple Developer Portal](https://developer.apple.com/account)

