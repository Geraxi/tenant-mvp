import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Contract } from '../screens/ContractsScreen';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData extends Record<string, unknown> {
  contractId: string;
  contractAddress: string;
  type: 'signature_required' | 'ade_submission_reminder' | 'contract_signed';
}

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.log('Notification permissions not granted');
      }
      return false;
    }
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error requesting notification permissions:', error);
    }
    return false;
  }
};

/**
 * Schedule a notification for ADE submission reminder
 */
export const scheduleADESubmissionReminder = async (
  contract: Contract,
  delayMinutes: number = 60 // Default 1 hour delay
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '📋 Contratto Pronto per ADE',
        body: `Il contratto per ${contract.propertyAddress} è stato firmato da entrambe le parti. È ora di inviarlo all'Agenzia delle Entrate.`,
        data: {
          contractId: contract.id,
          contractAddress: contract.propertyAddress,
          type: 'ade_submission_reminder',
        } as NotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayMinutes * 60,
      },
    });

    if (__DEV__) {
      console.log('ADE submission reminder scheduled:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling ADE submission reminder:', error);
    }
    return null;
  }
};

/**
 * Schedule a notification for signature required
 */
export const scheduleSignatureRequiredNotification = async (
  contract: Contract,
  signerType: 'owner' | 'tenant',
  delayMinutes: number = 30 // Default 30 minutes delay
): Promise<string | null> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const signerName = signerType === 'owner' ? 'Proprietario' : 'Inquilino';
    const otherPartyName = signerType === 'owner' ? 'Inquilino' : 'Proprietario';

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✍️ Firma Contratto Richiesta',
        body: `Il ${signerName} ha firmato il contratto per ${contract.propertyAddress}. ${otherPartyName}, è il tuo turno di firmare!`,
        data: {
          contractId: contract.id,
          contractAddress: contract.propertyAddress,
          type: 'signature_required',
        } as NotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: delayMinutes * 60,
      },
    });

    if (__DEV__) {
      console.log('Signature required notification scheduled:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling signature required notification:', error);
    }
    return null;
  }
};

/**
 * Send immediate notification for contract signed by both parties
 */
export const sendContractFullySignedNotification = async (
  contract: Contract
): Promise<void> => {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Contratto Completamente Firmato!',
        body: `Il contratto per ${contract.propertyAddress} è stato firmato da entrambe le parti. Puoi ora inviarlo all'Agenzia delle Entrate.`,
        data: {
          contractId: contract.id,
          contractAddress: contract.propertyAddress,
          type: 'contract_signed',
        } as NotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    if (__DEV__) {
      console.log('Contract fully signed notification sent');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error sending contract fully signed notification:', error);
    }
  }
};

/**
 * Cancel a specific notification
 */
export const cancelNotification = async (notificationId: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    if (__DEV__) {
      console.log('Notification cancelled:', notificationId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error cancelling notification:', error);
    }
  }
};

/**
 * Cancel all notifications for a specific contract
 */
export const cancelContractNotifications = async (contractId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as NotificationData;
      if (data && data.contractId === contractId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    if (__DEV__) {
      console.log('All notifications cancelled for contract:', contractId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error cancelling contract notifications:', error);
    }
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    if (__DEV__) {
      console.error('Error getting scheduled notifications:', error);
    }
    return [];
  }
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (__DEV__) {
      console.log('All notifications cleared');
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error clearing all notifications:', error);
    }
  }
};
