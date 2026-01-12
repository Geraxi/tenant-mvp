# Build and Submission Options

This project supports **two methods** for building and automatically submitting to the App Store:

## Option 1: EAS (Expo Application Services) ✅ Configured

**Status**: Fully configured and ready to use

**Configuration File**: `eas.json`

**How to Use**:
```bash
# Build and automatically submit
eas build -p ios --profile production --clear-cache

# Or build first, submit separately
eas build -p ios --profile production
eas submit -p ios --profile production
```

**Setup Required**:
1. Add App Store Connect API credentials (see `APP_STORE_CONNECT_SETUP.md`)
2. Set environment variables or EAS secrets:
   - `APPLE_ID`
   - `APPLE_TEAM_ID`
   - `ASC_APP_ID`
   - `ASC_API_KEY_ID`
   - `ASC_API_ISSUER_ID`
   - `ASC_API_KEY_PATH`

**Pros**:
- ✅ Already configured
- ✅ Direct App Store Connect integration
- ✅ Works with existing Expo/Capacitor setup
- ✅ Full control over build process

---

## Option 2: Despia ✅ Configuration Ready

**Status**: Configuration file created, needs dashboard setup

**Configuration File**: `despia.config.json`

**How to Use**:
1. Sign up at [despia.com](https://despia.com)
2. Create new project in Despia dashboard
3. Import `despia.config.json` or configure manually
4. Connect App Store Connect API credentials
5. Enable Auto Publish
6. Build from Despia dashboard

**Setup Required**:
1. Create Despia account
2. Create project in Despia dashboard
3. Import `despia.config.json` configuration
4. Connect App Store Connect API credentials
5. Enable Auto Publish feature

**Pros**:
- ✅ Web-to-native conversion platform
- ✅ Managed build infrastructure
- ✅ Simple dashboard interface
- ✅ Handles code signing automatically

---

## Which Should You Use?

### Use EAS if:
- You want direct control over builds
- You're comfortable with command-line tools
- You want to keep using Expo/Capacitor workflow
- You prefer Expo's ecosystem

### Use Despia if:
- You prefer a web-based dashboard
- You want managed build infrastructure
- You want web-to-native conversion features
- You prefer a simpler, more guided process

### Use Both:
- You can use EAS for development/testing
- Use Despia for production releases
- Or switch between them as needed

---

## Quick Start

### EAS Quick Start:
```bash
# 1. Set credentials (one-time setup)
eas secret:create --name APPLE_ID --value "your@email.com"
# ... (add other secrets)

# 2. Build and submit
eas build -p ios --profile production --clear-cache
```

### Despia Quick Start:
1. Go to [despia.com](https://despia.com) and sign up
2. Create new project
3. Import `despia.config.json`
4. Connect App Store Connect
5. Click "Build & Publish"

Both will automatically submit to the App Store after successful builds!




