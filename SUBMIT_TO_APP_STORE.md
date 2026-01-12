# How to Submit iOS App to App Store

## ❌ Wrong: Upload Web Extension

**You're seeing the "Upload Web Extension" dialog** - this is for Safari extensions, NOT iOS apps!

**Don't use this section.** Close that dialog and follow the steps below instead.

---

## ✅ Correct: Use EAS Build & Submit

For iOS apps, you need to:

1. **Build the app** using EAS (creates a `.ipa` file)
2. **Submit automatically** using EAS Submit (uploads to App Store Connect)

You **don't manually upload files** to App Store Connect for iOS apps.

---

## Step-by-Step Guide

### Step 1: Set Up App Store Connect API (One-Time Setup)

1. **Create App in App Store Connect** (if not done):
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Click **My Apps** → **+** → **New App**
   - Bundle ID: `com.mytenant.tenantapp`
   - Name: Tenant

2. **Request API Access** (if needed):
   - In App Store Connect: **Users and Access** → **Integrations** tab
   - Click **"App Store Connect API"** in the left sidebar
   - If you see "Permission is required to access the App Store Connect API":
     - Click **"Request Access"** button (only Account Holder can do this)
     - Wait for Apple to approve (usually instant or within a few hours)
   - Once approved, you'll see the keys list with a **+** button

3. **Generate API Key**:
   - After access is granted, you'll see a list of keys (or empty if none exist)
   - Click the **+** button (top right) to create a new key
   - Name: "EAS Submit Key"
   - Role: **App Manager** or **Admin**
   - Click **Generate**
   - **Download the .p8 file** (only available once - save it immediately!)
   - Note the **Key ID** (shown after generation)
   - Note the **Issuer ID** (shown at the top of the Keys page)

3. **Set EAS Secrets**:
   ```bash
   # Install EAS CLI if not installed
   npm install -g eas-cli
   
   # Login to EAS
   eas login
   
   # Set credentials
   eas secret:create --scope project --name APPLE_ID --value "your@email.com"
   eas secret:create --scope project --name APPLE_TEAM_ID --value "YOUR_TEAM_ID"
   eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
   eas secret:create --scope project --name ASC_API_KEY_ID --value "ABC123XYZ"
   eas secret:create --scope project --name ASC_API_ISSUER_ID --value "12345678-1234-1234-1234-123456789012"
   
   # Upload API key file
   eas secret:create --scope project --name ASC_API_KEY_PATH --type file --value ./AuthKey_ABC123XYZ.p8
   ```

### Step 2: Build and Submit

Once secrets are set, simply run:

```bash
# This will:
# 1. Build the iOS app (.ipa)
# 2. Automatically submit to App Store Connect
# 3. Make it available for TestFlight or App Store review
eas build -p ios --profile production --clear-cache
```

That's it! EAS handles everything automatically.

---

## What Happens After Build

1. **Build completes** → `.ipa` file is created
2. **Auto-submit enabled** → EAS uploads to App Store Connect
3. **App appears in App Store Connect** → Under "TestFlight" or "App Store" tab
4. **You can submit for review** → From App Store Connect dashboard

---

## Alternative: Manual Submission (If Auto-Submit Fails)

If automatic submission doesn't work:

1. **Download the .ipa** from EAS build page
2. **Use Transporter app** (Mac App Store):
   - Open Transporter
   - Drag and drop the `.ipa` file
   - Click "Deliver"
3. **Or use Xcode**:
   - Window → Organizer
   - Select your archive
   - Click "Distribute App"
   - Choose "App Store Connect"

---

## Where to Find Your App in App Store Connect

After submission, your app will appear in:

- **App Store Connect** → **My Apps** → **Tenant**
- **TestFlight** tab (for beta testing)
- **App Store** tab (for production release)

**You don't need to manually upload anything** - EAS does it for you!

---

## Troubleshooting

### "Invalid Program License Agreement" Error

**Error**: "API Keys cannot be created due to an invalid Program License Agreement"

**Solution**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account) (NOT App Store Connect)
2. Log in with your Apple Developer account
3. Look for a banner or notification about "Program License Agreement"
4. Click **"Review Agreement"** or **"Accept"**
5. Read and accept the latest agreement
6. Wait a few minutes for it to process
7. Go back to App Store Connect → Users and Access → Integrations → App Store Connect API
8. Try creating the API key again

**Note**: Only the Account Holder can accept the agreement. If you're not the Account Holder, ask them to accept it.

### "Invalid API Key" Error
- Verify Key ID and Issuer ID are correct
- Ensure the .p8 file is the right one
- Check the key is active in App Store Connect

### "App Not Found" Error
- Verify `ASC_APP_ID` matches your app ID
- Ensure app exists in App Store Connect
- Check bundle ID matches: `com.mytenant.tenantapp`

### Build Succeeds but Submit Fails
- Complete App Store Connect listing (screenshots, description, etc.)
- Ensure app is in "Ready to Submit" state
- Check all required fields are filled

---

## Summary

✅ **DO**: Use `eas build -p ios --profile production`  
❌ **DON'T**: Try to upload files manually in App Store Connect  
✅ **DO**: Let EAS handle the submission automatically  
❌ **DON'T**: Use the "Upload Web Extension" section

The "Upload Web Extension" dialog you saw is for Safari browser extensions, not iOS apps!

