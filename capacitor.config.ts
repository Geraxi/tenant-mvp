import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mytenant.tenantapp',
  appName: 'Tenant',
  webDir: 'dist/public',
  server: process.env.NODE_ENV === 'development' 
    ? {
        url: 'http://192.168.1.14:5000',
        cleartext: true,
      }
    : undefined, // Production: serve from webDir, no external server
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#3B82F6',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#3B82F6',
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
