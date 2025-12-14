# App Store Screenshot Generation Guide

## Automated Screenshot Tools

### 1. Fastlane (Recommended - Free & Open Source)
**Best for:** Automated screenshot generation from your app

**Setup:**
```bash
# Install Fastlane
sudo gem install fastlane

# Navigate to iOS directory
cd ios/App

# Initialize Fastlane
fastlane init

# Add screenshot lane
```

**Features:**
- Automatically launches app in simulator
- Takes screenshots at specified points
- Generates all required sizes automatically
- Can upload directly to App Store Connect
- Free and open source

**Pros:**
- ✅ Free
- ✅ Fully automated
- ✅ Integrates with CI/CD
- ✅ Can test on multiple devices
- ✅ Supports multiple languages

**Cons:**
- ⚠️ Requires setup
- ⚠️ Need to write screenshot scripts

### 2. AppMockup (Paid Service)
**Website:** https://appmockup.com

**Features:**
- Upload your app screens
- Automatically wraps in device frames
- Generates all App Store sizes
- Multiple device styles
- Export ready-to-use images

**Pricing:** ~$9-29/month

**Pros:**
- ✅ Easy to use
- ✅ Professional device frames
- ✅ Quick turnaround
- ✅ No coding required

**Cons:**
- ❌ Paid service
- ❌ Requires manual screenshots first

### 3. Screenshot Builder (Online Tool)
**Website:** https://screenshotbuilder.com

**Features:**
- Web-based tool
- Upload screenshots
- Auto-generates all sizes
- Device frame options
- Free tier available

**Pricing:** Free tier + paid plans

**Pros:**
- ✅ Free tier available
- ✅ No installation needed
- ✅ Simple interface

**Cons:**
- ⚠️ Manual upload required
- ⚠️ Limited customization

### 4. Xcode Simulator (Manual but Free)
**Best for:** Quick manual screenshots

**Steps:**
1. Open Xcode Simulator
2. Run your app
3. Navigate to desired screens
4. Device → Screenshot (or Cmd+S)
5. Screenshots saved to Desktop

**Pros:**
- ✅ Free
- ✅ Built into Xcode
- ✅ No additional tools needed

**Cons:**
- ❌ Manual process
- ❌ Need to resize manually
- ❌ Time-consuming

### 5. App Store Screenshot Generator (Online)
**Website:** Various (search "app store screenshot generator")

**Features:**
- Upload screenshots
- Auto-resize to required dimensions
- Add device frames
- Export in correct formats

**Pros:**
- ✅ Quick
- ✅ No installation
- ✅ Multiple options available

**Cons:**
- ⚠️ Quality varies by service
- ⚠️ May require manual work

## Recommended Approach

### For Quick Start (Manual):
1. Use **Xcode Simulator** to take screenshots
2. Use **AppMockup** or similar to add device frames and resize

### For Automation (Best Long-term):
1. Set up **Fastlane** for automated screenshot generation
2. Create screenshot scripts for key app screens
3. Run automatically before each release

## Fastlane Setup Example

Create `fastlane/Screenshots.swift` or use Fastlane's snapshot feature:

```ruby
# fastlane/Snapshotfile
devices([
  "iPhone 15 Pro Max",      # 6.7"
  "iPhone 11 Pro Max",      # 6.5"
  "iPhone 8 Plus",          # 5.5"
  "iPad Pro (12.9-inch)"    # iPad
])

languages([
  "en-US"
])

scheme("App")

# Screenshot script
# fastlane/Fastfile
lane :screenshots do
  snapshot
end
```

Then run:
```bash
fastlane screenshots
```

## Screenshot Requirements Reminder

- **iPhone 6.7"**: 1290 x 2796 pixels
- **iPhone 6.5"**: 1242 x 2688 pixels
- **iPhone 5.5"**: 1242 x 2208 pixels
- **iPad Pro 12.9"**: 2048 x 2732 pixels (if supporting iPad)

## Quick Manual Method

If you need screenshots quickly:

1. **Take screenshots in Simulator:**
   - Open Xcode Simulator
   - Run your app
   - Navigate to key screens (home, profile, listings, etc.)
   - Cmd+S to save screenshot

2. **Resize using online tool:**
   - Use https://www.iloveimg.com/resize-image
   - Or use Preview app on Mac (Tools → Adjust Size)

3. **Add device frames (optional):**
   - Use AppMockup or similar service
   - Or use design tools like Figma/Photoshop

## Best Practice

For your first submission, use the **manual method** (Xcode Simulator + resize tool) to get screenshots quickly.

For future updates, consider setting up **Fastlane** for automation.

