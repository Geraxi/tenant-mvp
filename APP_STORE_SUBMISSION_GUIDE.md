# App Store Submission Guide

## Prerequisites Checklist

Before submitting to the App Store, ensure you have:

- [ ] Apple Developer Account ($99/year)
- [ ] App Store Connect access
- [ ] Xcode installed (latest version)
- [ ] All app icons generated (✅ Done)
- [ ] Privacy permissions configured (✅ Done)
- [ ] Production build tested
- [ ] App Store Connect app record created

## Step-by-Step Submission Process

### 1. Build for Production

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync ios
```

### 2. Open in Xcode

```bash
npx cap open ios
```

### 3. Configure Signing & Capabilities in Xcode

1. Select your project in the navigator
2. Select the "App" target
3. Go to "Signing & Capabilities" tab
4. Select your Team (Apple Developer account)
5. Verify Bundle Identifier: `app.tenant.rental`
6. Xcode will automatically create/update provisioning profiles

### 4. Set Version and Build Numbers

1. In Xcode, select the "App" target
2. Go to "General" tab
3. Set:
   - **Version**: `1.0.0` (or your version)
   - **Build**: `1` (increment for each submission)

### 5. Configure App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform**: iOS
   - **Name**: Tenant
   - **Primary Language**: English
   - **Bundle ID**: `app.tenant.rental`
   - **SKU**: `tenant-ios-001` (unique identifier)
   - **User Access**: Full Access

### 6. Create Archive

1. In Xcode, select "Any iOS Device" as the destination (not a simulator)
2. Go to **Product** → **Archive**
3. Wait for the archive to complete
4. The Organizer window will open automatically

### 7. Validate Archive

1. In the Organizer window, select your archive
2. Click **"Validate App"**
3. Select your distribution certificate
4. Wait for validation to complete
5. Fix any issues if they appear

### 8. Upload to App Store Connect

1. In the Organizer window, select your archive
2. Click **"Distribute App"**
3. Select **"App Store Connect"**
4. Choose **"Upload"**
5. Select your distribution options
6. Click **"Upload"**
7. Wait for upload to complete (this can take 10-30 minutes)

### 9. Complete App Store Listing

After upload completes (usually 10-30 minutes):

1. Go to App Store Connect → Your App
2. Wait for processing to complete (can take 1-2 hours)
3. Fill in required information:

#### App Information
- **Category**: Lifestyle or Real Estate
- **Subcategory**: (optional)
- **Privacy Policy URL**: (required) - Your public URL

#### Pricing and Availability
- Set price (Free or Paid)
- Select countries/regions

#### App Privacy
- Complete privacy questionnaire
- Declare data collection practices

#### Version Information
- **Screenshots** (Required):
  - iPhone 6.7" (iPhone 14 Pro Max, 15 Pro Max)
  - iPhone 6.5" (iPhone 11 Pro Max, XS Max)
  - iPhone 5.5" (iPhone 8 Plus)
  - iPad Pro 12.9" (3rd generation) - if supporting iPad

- **App Preview** (Optional but recommended)
- **Description**: Write compelling app description
- **Keywords**: Relevant search terms
- **Support URL**: Your support page
- **Marketing URL**: (Optional)

#### Age Rating
- Complete the questionnaire
- For rental/dating apps, typically 17+

### 10. Submit for Review

1. Once all required fields are complete
2. Click **"Submit for Review"**
3. Answer any additional questions
4. Submit!

## Important Notes

### Screenshots Requirements

You need screenshots in these sizes:
- **iPhone 6.7"**: 1290 x 2796 pixels
- **iPhone 6.5"**: 1242 x 2688 pixels  
- **iPhone 5.5"**: 1242 x 2208 pixels
- **iPad Pro 12.9"**: 2048 x 2732 pixels

### Testing

Before submitting:
- [ ] Test on physical iOS device
- [ ] Test all features work
- [ ] Test login/signup flow
- [ ] Test payment flow (if applicable)
- [ ] Test push notifications
- [ ] Verify no crashes

### Common Issues

1. **Missing Privacy Policy URL**: Must be publicly accessible
2. **Missing Screenshots**: Required for at least one device size
3. **App Icons**: Must be in all required sizes (✅ Done)
4. **Version Mismatch**: Build number must be unique for each submission

## Timeline

- **Upload**: 10-30 minutes
- **Processing**: 1-2 hours
- **Review**: 24-48 hours (typically)
- **Total**: 1-3 days from submission to approval

## After Submission

- You'll receive email notifications about status changes
- Check App Store Connect regularly for updates
- If rejected, address the issues and resubmit

## Need Help?

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

