import webpush from 'web-push';
import { storage } from './storage';
import type { PushSubscription } from '@shared/schema';

const VAPID_SUBJECT = 'mailto:support@tenant.app';

class PushService {
  private initialized = false;

  async init() {
    if (this.initialized) return;

    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.warn('VAPID keys not configured. Push notifications disabled.');
      return;
    }

    webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
    this.initialized = true;
    console.log('Push notifications initialized');
  }

  getPublicKey(): string | null {
    return process.env.VAPID_PUBLIC_KEY || null;
  }

  async sendNotification(userId: string, payload: {
    title: string;
    body: string;
    icon?: string;
    url?: string;
    data?: Record<string, unknown>;
  }) {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.initialized) {
      console.warn('Push not initialized, skipping notification');
      return;
    }

    const subscriptions = await storage.getUserPushSubscriptions(userId);
    
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: '/icon-72.png',
      url: payload.url || '/',
      data: payload.data || {},
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub: PushSubscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth,
              },
            },
            notificationPayload
          );
        } catch (error: unknown) {
          const err = error as { statusCode?: number };
          if (err.statusCode === 410 || err.statusCode === 404) {
            await storage.deletePushSubscription(sub.id);
          }
          throw error;
        }
      })
    );

    const succeeded = results.filter((r: PromiseSettledResult<void>) => r.status === 'fulfilled').length;
    const failed = results.filter((r: PromiseSettledResult<void>) => r.status === 'rejected').length;
    
    console.log(`Push sent to ${userId}: ${succeeded} succeeded, ${failed} failed`);
  }

  async notifyNewMatch(userId: string, matchedUserName: string) {
    await this.sendNotification(userId, {
      title: 'New Match! 🎉',
      body: `You matched with ${matchedUserName}!`,
      url: '/tenant/matches',
    });
  }

  async notifyNewMessage(userId: string, senderName: string, matchId: string) {
    await this.sendNotification(userId, {
      title: 'New Message 💬',
      body: `${senderName} sent you a message`,
      url: `/chat/${matchId}`,
    });
  }
}

export const pushService = new PushService();
