# Authentication Setup Guide

This guide will help you set up Google, Apple, and email authentication for the Tenant app.

## 1. Google Authentication Setup

### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Create credentials for:
   - **Web application** (for server-side)
   - **iOS application** (for iOS app)
   - **Android application** (for Android app)

### Step 2: Configure the App
1. Copy your **Web Client ID** from Google Cloud Console
2. Set the environment variable:
   ```bash
   export GOOGLE_WEB_CLIENT_ID="your-web-client-id-here"
   ```

### Step 3: Update app.json
Add the following to your `app.json`:
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

## 2. Apple Authentication Setup

### Step 1: Enable Apple Sign-In
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Select your app identifier
3. Enable "Sign In with Apple" capability
4. Configure the service

### Step 2: Update app.json
Add the following to your `app.json`:
```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.applesignin": ["Default"]
      }
    }
  }
}
```

## 3. Email Service Setup

### Step 1: Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"

### Step 2: Configure Email Service
Set the following environment variables:
```bash
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
```

### Alternative: Other Email Providers
You can use other SMTP providers by updating the `EMAIL_CONFIG` in `utils/emailService.ts`:

```javascript
const EMAIL_CONFIG = {
  host: 'smtp.your-provider.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@your-provider.com',
    pass: 'your-password',
  },
};
```

## 4. Environment Variables

Create a `.env` file in your project root:
```env
# Google OAuth
GOOGLE_WEB_CLIENT_ID=your-google-web-client-id

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# App Configuration
APP_NAME=Tenant App
APP_URL=https://yourapp.com
```

## 5. Testing

### Test Google Authentication
1. Run the app on a physical device (Google Sign-In doesn't work in simulators)
2. Tap "Continua con Google"
3. Complete the Google Sign-In flow

### Test Apple Authentication
1. Run the app on a physical iOS device
2. Tap "Continua con Apple"
3. Complete the Apple Sign-In flow

### Test Email Confirmation
1. Enter a valid email address during signup
2. Check your email inbox for the confirmation email
3. Click the confirmation link

## 6. Troubleshooting

### Google Sign-In Issues
- Ensure you're testing on a physical device
- Check that your Web Client ID is correct
- Verify that the Google+ API is enabled

### Apple Sign-In Issues
- Ensure you're testing on a physical iOS device
- Check that Apple Sign-In is enabled in your Apple Developer account
- Verify the app identifier configuration

### Email Issues
- Check your email credentials
- Ensure 2FA is enabled and you're using an App Password
- Check your email provider's SMTP settings
- Verify the email is not going to spam

## 7. Production Considerations

1. **Security**: Never commit your actual credentials to version control
2. **Environment Variables**: Use proper environment variable management in production
3. **Email Templates**: Customize email templates for your brand
4. **Error Handling**: Implement proper error handling and logging
5. **Rate Limiting**: Implement rate limiting for email sending
6. **Monitoring**: Set up monitoring for authentication failures

## 8. Agenzia delle Entrate Integration

### Step 1: Request API Access
1. Contact Agenzia delle Entrate to request API access
2. Provide business documentation and use case
3. Complete the registration process
4. Obtain API credentials

### Step 2: Configure Environment Variables
Add these to your `.env` file:
```bash
# Agenzia delle Entrate Integration
EXPO_PUBLIC_ADE_BASE_URL=https://api.agenziaentrate.gov.it
EXPO_PUBLIC_ADE_API_KEY=your-ade-api-key
EXPO_PUBLIC_ADE_CLIENT_ID=your-ade-client-id
EXPO_PUBLIC_ADE_CLIENT_SECRET=your-ade-client-secret
EXPO_PUBLIC_ADE_ENVIRONMENT=sandbox
```

### Step 3: Test Integration
1. Use sandbox environment for testing
2. Validate all contract data
3. Test error handling scenarios
4. Verify successful submissions

## 9. Next Steps

After setting up authentication and ADE integration:
1. Test all authentication flows thoroughly
2. Customize email templates
3. Implement proper error handling
4. Set up monitoring and analytics
5. Configure production environment variables
6. Test ADE integration with real API
