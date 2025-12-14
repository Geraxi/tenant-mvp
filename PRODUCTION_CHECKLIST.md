# Production Build Checklist

## Pre-Build Checklist

### ✅ Configuration Files
- [x] app.json updated with production settings
- [x] Italian privacy descriptions added
- [x] usesNonExemptEncryption: false added
- [x] eas.json production profile configured
- [x] buildNumber set to "1"

### ⚠️ Mock Data
- [x] Mock data marked with PRODUCTION NOTE comments
- [ ] **TODO**: Review mock data usage in:
  - `screens/PropertySwipeScreen.tsx` (Mock properties for tenants)
  - `screens/LandlordSwipeScreen.tsx` (Mock tenants and properties)
  - `screens/LandlordHomeScreen.tsx` (Mock properties fallback)
  - `src/services/matchingService.ts` (Mock users and properties)
  - `screens/GestioneImmobiliScreen.tsx` (Mock immobili)

### 🔐 Environment Variables
- [x] Check .env.local for production Supabase URL
- [x] Verify Supabase keys are production keys
- [ ] Replace Kiki API placeholder keys with real production keys

### 📝 Documentation Created
- [x] CHANGELOG.md created
- [x] TESTFLIGHT_NOTES.md created
- [x] PRODUCTION_CHECKLIST.md created

### 🔍 Code Quality
- [x] Logger configured with production mode flag
- [ ] Consider removing/commenting console.log statements (currently using logger utility)
- [x] No debug overlays in production

### 📦 Build Configuration
- [x] EAS Build configured for App Store distribution
- [x] autoIncrement enabled for build numbers
- [x] Release configuration set

## Manual Steps Required

### Before Building
1. Update `PRODUCTION_MODE` in `src/utils/logger.ts` to `true`
2. Replace Kiki API keys in `.env.local` with production keys
3. Update `your-project-id` in `app.json` with your actual EAS project ID
4. Update Apple credentials in `eas.json`:
   - `appleId`: Your Apple ID email
   - `ascAppId`: Your App Store Connect app ID
   - `appleTeamId`: Your Apple Team ID

### Build Commands
```bash
# Build for production
eas build --profile production --platform ios

# Submit to TestFlight (after build completes)
eas submit --profile production --platform ios
```

## Post-Build Checklist

- [ ] Test the build on a physical device
- [ ] Verify all features work without mock data
- [ ] Check network connectivity works
- [ ] Verify Stripe payments (test mode)
- [ ] Test camera and QR scanning
- [ ] Verify push notifications
- [ ] Check authentication flow
- [ ] Test for memory leaks with Instruments
- [ ] Verify no console logs appear in production

## Known Issues to Address
1. Mock data is used in swipe screens - needs real Supabase integration
2. Kiki API keys are placeholders - needs real keys
3. EAS project ID needs to be set
4. Apple credentials need to be set in eas.json

## Next Steps
1. Review mock data usage and decide if acceptable for v1.0
2. Set production keys for Kiki API
3. Configure App Store Connect app metadata
4. Create App Store Connect listing with Italian descriptions
5. Prepare screenshots and app previews
