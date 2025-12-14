import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { HomeGoal, HomeGoalWallet, HomeGoalProgress } from '../types';
import { t } from './translations';

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

export interface HomeGoalNotificationData extends Record<string, unknown> {
  type: 'cashback_earned' | 'milestone_reached' | 'referral_bonus' | 'top_up_reminder' | 'goal_achieved';
  homeGoalId: string;
  amount?: number;
  percentage?: number;
  milestone?: number;
}

/**
 * Request notification permissions for HomeGoal
 */
export const requestHomeGoalNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      if (__DEV__) {
        console.log('HomeGoal notification permissions not granted');
      }
      return false;
    }
    
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('Error requesting HomeGoal notification permissions:', error);
    }
    return false;
  }
};

/**
 * Send cashback earned notification
 */
export const sendCashbackEarnedNotification = async (
  amount: number,
  balance: number,
  homeGoalId: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestHomeGoalNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💰 Cashback Guadagnato!',
        body: t('cashbackEarned')
          .replace('{amount}', amount.toFixed(2))
          .replace('{balance}', balance.toFixed(2)),
        data: {
          type: 'cashback_earned',
          homeGoalId,
          amount,
        } as HomeGoalNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    if (__DEV__) {
      console.log('Cashback earned notification sent:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error sending cashback earned notification:', error);
    }
    return null;
  }
};

/**
 * Send milestone reached notification
 */
export const sendMilestoneReachedNotification = async (
  percentage: number,
  remainingAmount: number,
  homeGoalId: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestHomeGoalNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Milestone Raggiunta!',
        body: t('milestoneReached')
          .replace('{percentage}', percentage.toString())
          .replace('{remaining}', remainingAmount.toFixed(2)),
        data: {
          type: 'milestone_reached',
          homeGoalId,
          percentage,
        } as HomeGoalNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    if (__DEV__) {
      console.log('Milestone reached notification sent:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error sending milestone reached notification:', error);
    }
    return null;
  }
};

/**
 * Send referral bonus notification
 */
export const sendReferralBonusNotification = async (
  homeGoalId: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestHomeGoalNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '👥 Invita Amici!',
        body: t('referralBonus'),
        data: {
          type: 'referral_bonus',
          homeGoalId,
        } as HomeGoalNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24, // 24 hours
      },
    });

    if (__DEV__) {
      console.log('Referral bonus notification scheduled:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling referral bonus notification:', error);
    }
    return null;
  }
};

/**
 * Send top-up reminder notification
 */
export const sendTopUpReminderNotification = async (
  homeGoalId: string
): Promise<string | null> => {
  try {
    const hasPermission = await requestHomeGoalNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💡 Ricorda di Aggiungere Fondi',
        body: t('topUpReminder'),
        data: {
          type: 'top_up_reminder',
          homeGoalId,
        } as HomeGoalNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24 * 7, // 7 days
      },
    });

    if (__DEV__) {
      console.log('Top-up reminder notification scheduled:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling top-up reminder notification:', error);
    }
    return null;
  }
};

/**
 * Send goal achieved notification
 */
export const sendGoalAchievedNotification = async (
  homeGoalId: string,
  goalAmount: number
): Promise<string | null> => {
  try {
    const hasPermission = await requestHomeGoalNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Obiettivo Raggiunto!',
        body: `Congratulazioni! Hai raggiunto il tuo obiettivo di €${goalAmount.toFixed(2)}! Ora puoi iniziare a cercare la tua casa ideale.`,
        data: {
          type: 'goal_achieved',
          homeGoalId,
          amount: goalAmount,
        } as HomeGoalNotificationData,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    if (__DEV__) {
      console.log('Goal achieved notification sent:', notificationId);
    }

    return notificationId;
  } catch (error) {
    if (__DEV__) {
      console.error('Error sending goal achieved notification:', error);
    }
    return null;
  }
};

/**
 * Check and send milestone notifications based on progress
 */
export const checkAndSendMilestoneNotifications = async (
  progress: HomeGoalProgress,
  homeGoalId: string
): Promise<void> => {
  try {
    const milestones = [25, 50, 75, 100];
    
    for (const milestone of milestones) {
      const milestoneData = progress.milestones.find(m => m.percentage === milestone);
      
      if (milestoneData && milestoneData.achieved && !milestoneData.achievedAt) {
        // Mark as achieved
        milestoneData.achievedAt = new Date().toISOString();
        
        // Send notification
        if (milestone === 100) {
          await sendGoalAchievedNotification(homeGoalId, progress.goalAmount);
        } else {
          await sendMilestoneReachedNotification(
            milestone,
            progress.remainingAmount,
            homeGoalId
          );
        }
      }
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error checking milestone notifications:', error);
    }
  }
};

/**
 * Cancel all HomeGoal notifications
 */
export const cancelHomeGoalNotifications = async (homeGoalId: string): Promise<void> => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    for (const notification of scheduledNotifications) {
      const data = notification.content.data as HomeGoalNotificationData;
      if (data && data.homeGoalId === homeGoalId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    if (__DEV__) {
      console.log('All HomeGoal notifications cancelled for:', homeGoalId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error cancelling HomeGoal notifications:', error);
    }
  }
};

/**
 * Schedule all HomeGoal notifications
 */
export const scheduleHomeGoalNotifications = async (homeGoalId: string): Promise<void> => {
  try {
    await sendReferralBonusNotification(homeGoalId);
    await sendTopUpReminderNotification(homeGoalId);
    
    if (__DEV__) {
      console.log('HomeGoal notifications scheduled for:', homeGoalId);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('Error scheduling HomeGoal notifications:', error);
    }
  }
};
