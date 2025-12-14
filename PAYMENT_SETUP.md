# Payment Integration Setup

This document explains how to set up the enhanced payment functionality in the React Native app.

## 🚀 Features Implemented

### 1. **Stripe Payment Integration**
- **Apple Pay** support for iOS devices
- **Google Pay** support for Android devices  
- **Card payments** with saved card fallback
- **PaymentIntent API** integration

### 2. **QR Code Scanning**
- **PagoPA QR code** parsing (Italian payment standard)
- **SEPA EPC QR code** parsing (European payment standard)
- **Generic QR code** fallback parsing
- **Camera and gallery** image selection

### 3. **OCR Text Extraction**
- **Bill text extraction** from images
- **Automatic categorization** based on content
- **Amount, date, and creditor** parsing
- **Multiple date format** support

## 📁 Files Added/Modified

### New Files:
- `src/config/stripe.ts` - Stripe configuration
- `src/services/stripeService.ts` - Stripe payment service
- `src/services/qrService.ts` - QR code scanning service
- `src/services/ocrService.ts` - OCR text extraction service
- `screens/EnhancedPagamentoScreen.tsx` - Enhanced payment screen

### Modified Files:
- `App.tsx` - Added Stripe initialization
- `screens/LeMieBolletteScreen.tsx` - Added scan functionality
- `package.json` - Added new dependencies

## 🔧 Dependencies Installed

```bash
npm install @stripe/stripe-react-native expo-camera expo-barcode-scanner expo-image-picker react-native-text-detector --legacy-peer-deps
```

## ⚙️ Configuration Required

### 1. **Stripe Setup**
Add to your `.env.local` file:
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### 2. **Apple Pay Setup**
- Add your merchant ID to `src/config/stripe.ts`
- Update URL scheme in `app.json`
- Add Apple Pay capability to your iOS app

### 3. **Google Pay Setup**
- Configure Google Pay in your Stripe dashboard
- Add Google Pay to your Android app

## 🎯 Usage

### **Bills Screen**
1. Tap the **QR scanner icon** in the header
2. Choose **QR Code** or **OCR** scanning
3. Follow the prompts to scan/upload bill image
4. Review parsed data and add to bills

### **Payment Screen**
1. Select payment method (Apple Pay, Google Pay, Card)
2. Use **QR/OCR scanning** to update bill details
3. Complete payment with selected method
4. Payment status updates automatically

## 🔍 QR Code Formats Supported

### **PagoPA Format**
```
PAGOPA|002|12345678901|IT60X0542811101000000123456|Mario Rossi|Via Roma 1, Milano|EUR|1200.00|2024-02-01|IT1234567890123456789012345|Descrizione bolletta
```

### **SEPA EPC Format**
```
BCD
002
1
SCT
IT60X0542811101000000123456
Mario Rossi
EUR1200.00

Descrizione bolletta
```

## 🧪 Testing

### **Mock Data**
The implementation includes mock data for testing:
- Mock QR codes return sample bill data
- Mock OCR returns sample extracted text
- Payment simulation for development

### **Test Flow**
1. Navigate to Bills screen
2. Tap QR scanner icon
3. Select "QR Code" or "OCR"
4. Review parsed data
5. Navigate to payment screen
6. Test payment methods

## 🚨 Important Notes

### **Development Mode**
- Currently uses mock data for QR/OCR parsing
- Payment simulation for testing
- No real Stripe charges in development

### **Production Setup**
- Replace mock services with real implementations
- Configure proper Stripe keys
- Set up webhook endpoints
- Test with real payment methods

## 🔄 Next Steps

1. **Backend Integration**
   - Create API endpoints for payment processing
   - Implement webhook handlers
   - Add database integration

2. **Real OCR Integration**
   - Replace mock OCR with real service
   - Add image preprocessing
   - Improve text extraction accuracy

3. **Enhanced QR Support**
   - Add more QR code formats
   - Improve parsing accuracy
   - Add validation

## 📱 Platform Support

- **iOS**: Apple Pay, Camera, Gallery
- **Android**: Google Pay, Camera, Gallery
- **Cross-platform**: Card payments, QR scanning

## 🛠️ Troubleshooting

### **Common Issues**
1. **Stripe not initialized**: Check publishable key
2. **Camera permissions**: Request camera access
3. **Payment fails**: Check network connection
4. **QR not detected**: Ensure good lighting and focus

### **Debug Logs**
Enable debug logging by checking console output for:
- Stripe initialization status
- Payment method availability
- QR/OCR parsing results
- Payment processing steps
