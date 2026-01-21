import { supabase } from '../../client/supabase';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_id: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  // Populated fields
  other_user?: {
    id: string;
    nome: string;
    foto?: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export class MessagingService {
  private static isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    );
  }

  /**
   * Get or create a conversation between two users
   */
  static async getOrCreateConversation(user1Id: string, user2Id: string): Promise<string> {
    try {
      if (!this.isUuid(user1Id) || !this.isUuid(user2Id)) {
        return `temp_${Date.now()}`;
      }
      console.log('=== getOrCreateConversation START ===');
      console.log('User IDs:', user1Id, user2Id);
      
      // Try to call the RPC function first (most reliable)
      console.log('Attempting RPC call...');
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user1Id,
        user2_id: user2Id,
      });

      if (error) {
        console.log('RPC function error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        if (error.code === '22P02' || error.message?.includes('invalid input syntax for type uuid')) {
          return `temp_${Date.now()}`;
        }
        
        // If function doesn't exist, return temp ID
        if (error.code === '42883' || error.message?.includes('does not exist') || error.message?.includes('function') && error.message?.includes('does not exist')) {
          console.log('❌ RPC function does not exist');
          return `temp_${Date.now()}`;
        }
        
        // If it's a table doesn't exist error, return temp ID
        if (error.code === '42P01' || error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.log('❌ Table does not exist (error from RPC)');
          return `temp_${Date.now()}`;
        }
        
        // For other errors (like RLS, permissions), try manual creation
        console.log('⚠️ RPC error, trying manual creation...');
        return await this.createConversationManually(user1Id, user2Id);
      }

      if (!data) {
        console.log('⚠️ RPC returned no data, trying manual creation...');
        return await this.createConversationManually(user1Id, user2Id);
      }

      console.log('✅ Conversation created/found via RPC:', data);
      return data;
    } catch (error: any) {
      console.log('❌ Exception in getOrCreateConversation:', error);
      // Fallback to manual creation
      return await this.createConversationManually(user1Id, user2Id);
    }
  }

  /**
   * Manually create a conversation (fallback if RPC function doesn't exist)
   */
  private static async createConversationManually(user1Id: string, user2Id: string): Promise<string> {
    try {
      if (!this.isUuid(user1Id) || !this.isUuid(user2Id)) {
        return `temp_${Date.now()}`;
      }
      // Ensure consistent ordering
      const smallerId = user1Id < user2Id ? user1Id : user2Id;
      const largerId = user1Id < user2Id ? user2Id : user1Id;

      // Check if conversation already exists
      let existing = null;
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('id')
          .eq('participant1_id', smallerId)
          .eq('participant2_id', largerId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw error;
        }
        existing = data;
      } catch (error: any) {
        // If table doesn't exist, return temp ID
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.log('Conversations table does not exist in createConversationManually');
          return `temp_${Date.now()}`;
        }
        // Conversation doesn't exist, continue to create
        existing = null;
      }

      if (existing) {
        console.log('Found existing conversation:', existing.id);
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: smallerId,
          participant2_id: largerId,
        })
        .select('id')
        .single();

      if (error) {
        console.log('Error creating conversation:', error.code, error.message);
        // If table doesn't exist, return temp ID
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return `temp_${Date.now()}`;
        }
        if (error.code === '22P02' || error.message?.includes('invalid input syntax for type uuid')) {
          return `temp_${Date.now()}`;
        }
        // For other errors, still return temp ID to prevent app crash
        console.error('Error creating conversation manually:', error);
        return `temp_${Date.now()}`;
      }

      console.log('Created new conversation:', data.id);
      return data.id;
    } catch (error: any) {
      console.log('Exception in createConversationManually:', error);
      // Always return temp ID to prevent app crash
      return `temp_${Date.now()}`;
    }
  }

  /**
   * Get all conversations for a user
   */
  static async getConversations(userId: string): Promise<Conversation[]> {
    try {
      if (!this.isUuid(userId)) {
        return [];
      }
      // Get conversations where user is participant1 or participant2
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(100);

      if (convError) {
        // If table doesn't exist or network error, return empty array instead of throwing
        if (
          convError.code === '42P01' ||
          convError.code === '22P02' ||
          convError.message?.includes('does not exist') ||
          convError.message?.includes('Network request failed') ||
          convError.message?.includes('invalid input syntax for type uuid')
        ) {
          // Silently return empty array - don't log network errors
          return [];
        }
        // Only log other errors
        console.error('Error fetching conversations:', convError);
        throw convError;
      }

      if (!conversations || conversations.length === 0) {
        return [];
      }

      // Get the other user's info for each conversation
      const conversationsWithUsers = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId =
            conv.participant1_id === userId
              ? conv.participant2_id
              : conv.participant1_id;

          // Get other user's profile - try utenti table first, fallback gracefully
          let userData: any = null;
          
          try {
            // Try to get from utenti table if it exists
            const { data: utentiData, error: utentiError } = await supabase
              .from('utenti')
              .select('id, nome, foto')
              .eq('id', otherUserId)
              .single();
            
            if (!utentiError && utentiData) {
              userData = utentiData;
            }
          } catch (error) {
            // Table doesn't exist or query failed, continue without user data
            console.log('utenti table not available, using fallback');
          }
          
          // If no user data found, create a basic object
          if (!userData) {
            userData = {
              id: otherUserId,
              nome: 'Utente',
              foto: null,
            };
          }

          // Get last message if exists
          let lastMessage: Message | undefined;
          if (conv.last_message_id) {
            try {
              const { data: msgData, error: msgError } = await supabase
                .from('messages')
                .select('*')
                .eq('id', conv.last_message_id)
                .single();

              if (!msgError && msgData) {
                lastMessage = msgData as Message;
              }
            } catch (error) {
              // Ignore errors when fetching last message
            }
          }

          // Get unread count
          let unreadCount = 0;
          try {
            const { count, error: countError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('receiver_id', userId)
              .eq('is_read', false);
            
            if (!countError) {
              unreadCount = count || 0;
            }
          } catch (error) {
            // Ignore errors when counting unread messages
            unreadCount = 0;
          }

          return {
            ...conv,
            other_user: userData
              ? {
                  id: userData.id,
                  nome: userData.nome,
                  foto: userData.foto,
                }
              : undefined,
            last_message: lastMessage,
            unread_count: unreadCount,
          } as Conversation;
        })
      );

      return conversationsWithUsers;
    } catch (error: any) {
      // Only log non-network errors to reduce noise
      if (error?.message && !error.message.includes('Network request failed')) {
        console.error('Error in getConversations:', error);
      }
      return [];
    }
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    try {
      // Skip if it's a temporary ID (table doesn't exist)
      if (conversationId.startsWith('temp_')) {
        return [];
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching messages:', error);
        // If table doesn't exist, return empty array
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return [];
        }
        throw error;
      }

      return (data || []).reverse() as Message[]; // Reverse to show oldest first
    } catch (error: any) {
      // Only log non-network errors to reduce noise
      if (error?.message && !error.message.includes('Network request failed')) {
        console.error('Error in getMessages:', error);
      }
      // Return empty array for any error
      return [];
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<Message | null> {
    try {
      if (!this.isUuid(senderId) || !this.isUuid(receiverId)) {
        return null;
      }
      // Skip if it's a temporary ID (table doesn't exist)
      if (conversationId.startsWith('temp_')) {
        console.log('Cannot send message - conversations table does not exist');
        return null;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          receiver_id: receiverId,
          content: content.trim(),
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        // If table doesn't exist or network error, return null instead of throwing
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('Network request failed')) {
          return null;
        }
        // Only log other errors
        if (!error.message?.includes('Network request failed')) {
          console.error('Error sending message:', error);
        }
        throw error;
      }

      return data as Message;
    } catch (error: any) {
      // Only log non-network errors to reduce noise
      if (error?.message && !error.message.includes('Network request failed')) {
        console.error('Error in sendMessage:', error);
      }
      // Return null for any error instead of throwing
      return null;
    }
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      if (!this.isUuid(userId)) {
        return false;
      }
      // Skip if it's a temporary ID (table doesn't exist)
      if (conversationId.startsWith('temp_')) {
        return false;
      }

      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('receiver_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        // If table doesn't exist, just return false
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          return false;
        }
        // Don't throw, just return false
        return false;
      }

      return true;
    } catch (error: any) {
      // Only log non-network errors
      if (error?.message && !error.message.includes('Network request failed')) {
        console.error('Error in markMessagesAsRead:', error);
      }
      // Always return false instead of throwing
      return false;
    }
  }

  /**
   * Subscribe to new messages in a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ) {
    // Skip if it's a temporary ID (table doesn't exist)
    if (conversationId.startsWith('temp_')) {
      // Return a no-op unsubscribe function
      return () => {};
    }

    try {
      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            callback(payload.new as Message);
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          // Ignore errors when unsubscribing
        }
      };
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      // Return a no-op unsubscribe function
      return () => {};
    }
  }
}
