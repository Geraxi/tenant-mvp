// Configuration file for Tenant App
// Copy this file to config.js and fill in your actual values

module.exports = {
  // Email Configuration
  email: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password', // Use App Password for Gmail
    host: 'smtp.gmail.com',
    port: 587,
  },
  
  // Google OAuth Configuration
  google: {
    webClientId: 'your-google-web-client-id',
  },
  
  // App Configuration
  app: {
    name: 'Tenant App',
    url: 'https://yourapp.com',
  },
};

