import { getStripeSync } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string, uuid: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature, uuid);
  }

  static async handleSubscriptionUpdate(customerId: string, subscriptionId: string, status: string) {
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (user) {
      const isPremium = ['active', 'trialing'].includes(status);
      await storage.updateUser(user.id, {
        isPremium,
        stripeSubscriptionId: subscriptionId,
      });
    }
  }
}
