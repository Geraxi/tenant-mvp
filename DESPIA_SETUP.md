# Despia Integration Setup Guide

Despia.com is a platform that converts web applications into native iOS and Android apps with automatic App Store submission.

## What Despia Does

- Converts your web app to native iOS/Android apps
- Handles code signing automatically
- Builds native binaries
- Automatically submits to App Store and Google Play
- Manages the entire deployment pipeline

## Project Configuration

✅ **Despia config file created**: `despia.config.json`
- Contains all app settings, permissions, and App Store configuration
- Ready to import into Despia dashboard

## Setup Steps

### 1. Create Despia Account

1. Go to [despia.com](https://despia.com)
2. Sign up for an account
3. Complete your profile setup

### 2. Create New Project in Despia Dashboard

1. Log in to Despia dashboard
2. Click **"Create New Project"**
3. **Option A - Import Config** (Recommended):
   - Use the **"Import Configuration"** feature
   - Upload or paste contents of `despia.config.json`
   - This will auto-configure all settings

   **Option B - Manual Setup**:
   - Enter project details:
     - **Name**: Tenant
     - **Description**: Rental marketplace app
     - **Web App URL**: Your deployed web app URL (or GitHub repo: `https://github.com/Geraxi/tenant-mvp`)
     - **Bundle ID**: `com.mytenant.tenantapp`

### 3. Configure App Settings in Despia

In the Despia dashboard, configure:

- **App Icon**: Upload your 1024x1024 icon
- **Splash Screen**: Configure splash screen
- **Bundle ID**: `com.mytenant.tenantapp` (from app.json)
- **App Name**: Tenant
- **Version**: 1.0.0

### 4. Connect App Store Connect

1. In Despia dashboard, go to **Settings** → **App Store Connect**
2. Provide your App Store Connect API credentials:
   - **Key ID**: From App Store Connect API key
   - **Issuer ID**: From App Store Connect
   - **Private Key (.p8 file)**: Upload the API key file
   - **App ID**: Your App Store Connect App ID

### 5. Install Despia SDK (Optional)

If you want to use Despia's native features:

```bash
npm install despia-native
```

Then in your code:
```javascript
import despia from 'despia-native';

// Use Despia native features
despia('command', { options });
```

### 6. Enable Auto Publish

1. In Despia dashboard, go to **Deployment** → **Auto Publish**
2. Enable **"Auto Publish to App Store"**
3. Configure submission settings:
   - Select production profile
   - Enable automatic submission after build

### 7. Connect Your Repository (Optional)

If Despia supports Git integration:

1. Go to **Settings** → **Repository**
2. Connect your GitHub repository: `https://github.com/Geraxi/tenant-mvp`
3. Configure build triggers (e.g., on push to main branch)

## Despia vs EAS

**Current Setup**: Using EAS (Expo Application Services)
- Already configured in `eas.json`
- Uses App Store Connect API directly
- Works with your existing Expo/Capacitor setup

**Despia Alternative**:
- Web-to-native conversion platform
- May require different project structure
- Handles builds and submission through their platform

## Both Options Configured

You now have **both** options set up:

### ✅ EAS (Expo Application Services)
- **Config**: `eas.json`
- **Status**: Fully configured
- **Use**: `eas build -p ios --profile production`
- **Best for**: Direct control, Expo/Capacitor projects

### ✅ Despia
- **Config**: `despia.config.json`
- **Status**: Configuration file ready
- **Use**: Import config in Despia dashboard, then build from there
- **Best for**: Web-to-native conversion, managed builds

**You can use either platform** - both are configured and ready!

## Next Steps

If you want to use Despia:

1. Sign up at [despia.com](https://despia.com)
2. Create project in Despia dashboard
3. Connect App Store Connect API credentials
4. Configure auto-publish settings
5. Trigger build from Despia dashboard

If you want to continue with EAS (recommended since it's already set up):

1. Follow `APP_STORE_CONNECT_SETUP.md` guide
2. Add App Store Connect API credentials to EAS
3. Run: `eas build -p ios --profile production`

Both approaches will automatically submit to the App Store!

