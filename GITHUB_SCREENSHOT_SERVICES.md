# GitHub Repo → Screenshot Services

## Services That Connect to GitHub

### 1. AppScreens (Recommended)
**Website:** https://appscreens.com

**Features:**
- ✅ Connect to GitHub repository
- ✅ Automatically builds and runs your app
- ✅ Takes screenshots at specified screens
- ✅ Generates all App Store sizes
- ✅ Can upload directly to App Store Connect
- ✅ Supports iOS and Android
- ✅ Multiple languages support

**How it works:**
1. Connect your GitHub repo
2. Configure which screens to capture
3. Service builds app and takes screenshots
4. Downloads or uploads to App Store Connect

**Pricing:** Paid service (check website for current pricing)

### 2. Fastlane + GitHub Actions (Free)
**Best for:** Full automation with your existing repo

**Setup:**
- Add Fastlane to your repo
- Use GitHub Actions to run screenshot automation
- Screenshots generated on every commit/tag

**Pros:**
- ✅ Free (if you have GitHub Actions minutes)
- ✅ Fully automated
- ✅ Integrates with your workflow
- ✅ Screenshots in your repo

**Cons:**
- ⚠️ Requires setup
- ⚠️ Need to configure GitHub Actions

### 3. Bitrise (CI/CD Platform)
**Website:** https://bitrise.io

**Features:**
- ✅ Connect GitHub repo
- ✅ Automated builds
- ✅ Screenshot generation workflows
- ✅ Can integrate Fastlane
- ✅ Free tier available

**Pricing:** Free tier + paid plans

### 4. AppCenter (Microsoft)
**Website:** https://appcenter.ms

**Features:**
- ✅ Connect GitHub repo
- ✅ Automated builds
- ✅ Test on real devices
- ✅ Screenshot capture during testing
- ✅ Free tier available

**Pricing:** Free tier + paid plans

## Recommended: Fastlane + GitHub Actions

Since you already have a GitHub repo, the best free option is to set up Fastlane with GitHub Actions. This will:

1. Automatically build your app
2. Run it in simulators
3. Take screenshots at specified points
4. Generate all required sizes
5. Commit screenshots back to your repo (optional)

## Quick Setup Option

If you want something quick without setup:

1. **AppScreens** - Paid but easiest, just connect GitHub
2. **Manual + Online Tools** - Take screenshots manually, use online tools to resize

## For Your Tenant App

Since your app is a web app (Capacitor), you'll need a service that can:
- Build the iOS app from your repo
- Run it in a simulator
- Take screenshots

**Best options:**
1. **AppScreens** - If you want the easiest paid solution
2. **Fastlane + GitHub Actions** - If you want free automation
3. **Manual** - If you want to do it quickly now

Would you like me to set up Fastlane + GitHub Actions for automated screenshots?

