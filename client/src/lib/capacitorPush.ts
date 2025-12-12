import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from './api';

export async function initializeCapacitorPush(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
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
      await api.subscribeToPush({
        endpoint: `capacitor://${Capacitor.getPlatform()}/${token.value}`,
        p256dh: token.value,
        auth: token.value,
      });
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
  return Capacitor.isNativePlatform();
}
