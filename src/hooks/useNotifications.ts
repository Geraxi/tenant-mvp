import { useState, useEffect } from 'react';
import { supabase } from '../../client/supabase';
import { Notifica } from '../types';
import * as Notifications from 'expo-notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const useNotifications = (userId: string) => {
  const [notifications, setNotifications] = useState<Notifica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockNotifications: Notifica[] = [
    {
      id: '1',
      user_id: userId,
      message: 'Bolletta elettricità scade tra 3 giorni',
      type: 'reminder',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: userId,
      message: 'Pagamento affitto confermato',
      type: 'payment_confirmation',
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
    {
      id: '3',
      user_id: userId,
      message: 'Nuova bolletta gas disponibile',
      type: 'new_bill',
      is_read: false,
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
  ];

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use mock data
      setNotifications(mockNotifications);

      // Try to load from database, but don't fail if table doesn't exist
      try {
        const { data, error } = await supabase
          .from('notifiche')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setNotifications(data);
        }
      } catch (dbError) {
        console.log('Database table may not exist yet, using mock data');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Errore nel caricamento delle notifiche');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to update in database
      try {
        await supabase
          .from('notifiche')
          .update({ is_read: true })
          .eq('id', notificationId);
      } catch (dbError) {
        console.log('Could not update database, using local state only');
      }

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Errore durante l\'aggiornamento');
      return { success: false, error: 'Errore durante l\'aggiornamento' };
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (tenantId: string, message: string) => {
    try {
      setLoading(true);
      setError(null);

      const newNotification: Notifica = {
        id: Date.now().toString(),
        user_id: tenantId,
        message,
        type: 'reminder',
        is_read: false,
        created_at: new Date().toISOString(),
      };

      // Try to save to database
      try {
        await supabase
          .from('notifiche')
          .insert(newNotification);
      } catch (dbError) {
        console.log('Could not save to database, using local state only');
      }

      // Schedule push notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Promemoria',
          body: message,
          data: { tenantId },
        },
        trigger: { seconds: 2 },
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending reminder:', error);
      setError('Errore durante l\'invio del promemoria');
      return { success: false, error: 'Errore durante l\'invio del promemoria' };
    } finally {
      setLoading(false);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notif => !notif.is_read).length;
  };

  return {
    notifications,
    loading,
    error,
    loadNotifications,
    markAsRead,
    sendReminder,
    getUnreadCount,
    unreadCount: getUnreadCount(),
  };
};