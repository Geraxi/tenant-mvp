import { api } from './api';

// For web builds, Capacitor won't be available - handle gracefully
// Only use Capacitor if it's actually available (native builds)
let Capacitor: any = null;
let PushNotifications: any = null;

// Initialize Capacitor modules only if available (native builds)
const initCapacitorIfAvailable = () => {
  if (typeof window === 'undefined') return false;
  
  const windowAny = window as any;
  
  // Check if Capacitor is loaded via script tag or globals (native builds)
  if (windowAny.Capacitor) {
    Capacitor = windowAny.Capacitor;
    try {
      PushNotifications = windowAny.PushNotifications || 
        (windowAny.Capacitor?.Plugins?.PushNotifications);
    } catch (e) {
      console.log('[capacitorPush] PushNotifications not available');
    }
    return true;
  }
  
  return false;
};

export async function initializeCapacitorPush(): Promise<boolean> {
  // For web builds, Capacitor won't be available - return false gracefully
  if (!initCapacitorIfAvailable() || !Capacitor?.isNativePlatform()) {
    console.log('[capacitorPush] Capacitor not available - skipping push notifications (web build)');
    return false;
  }

  if (!PushNotifications) {
    console.warn('[capacitorPush] PushNotifications plugin not available');
    return false;
  }

  try {
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.log('Push notifications permission denied');
      return false;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration token:', token.value);
      try {
        await api.subscribeToPush({
          endpoint: `capacitor://${Capacitor.getPlatform()}/${token.value}`,
          p256dh: token.value,
          auth: token.value,
        });
      } catch (err) {
        console.error('Failed to subscribe to push:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action:', notification);
      const url = notification.notification.data?.url;
      if (url) {
        window.location.href = url;
      }
    });

    return true;
  } catch (error) {
    console.error('Failed to initialize Capacitor push:', error);
    return false;
  }
}

export function isCapacitorPlatform(): boolean {
  // Check if Capacitor is available without trying to import it
  if (typeof window === 'undefined') return false;
  const windowAny = window as any;
  return windowAny.Capacitor?.isNativePlatform() || false;
}
