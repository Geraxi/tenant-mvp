import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { MessagingService, Message, Conversation } from '../src/services/messagingService';
import { supabase } from '../client/supabase';

interface MessagesScreenProps {
  onNavigateBack: () => void;
  targetUserId?: string | null;
  targetUserName?: string | null;
}

export default function MessagesScreen({ onNavigateBack, targetUserId, targetUserName }: MessagesScreenProps) {
  const { user } = useSupabaseAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedConversationOtherUserId, setSelectedConversationOtherUserId] = useState<string | null>(null);
  const [selectedConversationOtherUserName, setSelectedConversationOtherUserName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  // If targetUserId is provided, automatically open/create that conversation
  useEffect(() => {
    if (targetUserId && targetUserName && user) {
      openConversationWithUser(targetUserId, targetUserName);
    }
  }, [targetUserId, targetUserName, user]);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const convs = await MessagingService.getConversations(user.id);
      setConversations(convs);
      
      // Update selected conversation's other user info if available
      if (selectedConversationId) {
        const updatedConversation = convs.find(c => c.id === selectedConversationId);
        if (updatedConversation) {
          const otherUserId = updatedConversation.participant1_id === user.id 
            ? updatedConversation.participant2_id 
            : updatedConversation.participant1_id;
          setSelectedConversationOtherUserId(otherUserId);
          if (updatedConversation.other_user?.nome) {
            setSelectedConversationOtherUserName(updatedConversation.other_user.nome);
          }
        }
      }
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      // Don't show alert for network errors - might be missing tables
      // Just set empty array and let user see empty state
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const openConversationWithUser = async (otherUserId: string, otherUserName: string) => {
    if (!user) return;

    try {
      console.log('Opening conversation with user:', otherUserId, otherUserName);
      
      // Get or create conversation
      const conversationId = await MessagingService.getOrCreateConversation(user.id, otherUserId);
      
      console.log('Got conversation ID:', conversationId);
      
      // Check if it's a temporary ID (database not set up)
      if (conversationId.startsWith('temp_')) {
        console.log('Database not set up - got temp ID');
        Alert.alert(
          'Database non configurato',
          'Le tabelle del database non sono ancora state create. Esegui lo script SQL fornito in Supabase per abilitare la messaggistica.\n\nDettagli: La tabella "conversations" non esiste nel database.'
        );
        return;
      }
      
      setSelectedConversationId(conversationId);
      setSelectedConversationOtherUserId(otherUserId);
      
      // Try to fetch the actual user name from database, fallback to provided name
      let displayName = otherUserName;
      try {
        const { data: userData, error: userError } = await supabase
          .from('utenti')
          .select('nome')
          .eq('id', otherUserId)
          .single();
        
        if (!userError && userData?.nome) {
          displayName = userData.nome;
          console.log('Fetched user name from database:', displayName);
        } else {
          console.log('Could not fetch user name, using provided:', otherUserName);
        }
      } catch (error) {
        // Use the provided name as fallback
        console.log('Error fetching user name from database, using provided name:', otherUserName, error);
      }
      
      setSelectedConversationOtherUserName(displayName);
      await loadMessages(conversationId);
      
      // Mark messages as read
      await MessagingService.markMessagesAsRead(conversationId, user.id);
      
      // Reload conversations to update unread counts
      await loadConversations();
    } catch (error: any) {
      console.error('Error opening conversation:', error);
      // Don't show alert - might be network/table issues
      // Just log the error
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      const msgs = await MessagingService.getMessages(conversationId);
      setMessages(msgs);
      setSelectedConversationId(conversationId);
      
      // Find the conversation to get the other user's info
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation) {
        const otherUserId = conversation.participant1_id === user.id 
          ? conversation.participant2_id 
          : conversation.participant1_id;
        setSelectedConversationOtherUserId(otherUserId);
        if (conversation.other_user?.nome) {
          setSelectedConversationOtherUserName(conversation.other_user.nome);
        }
      }
      
      // Mark messages as read
      await MessagingService.markMessagesAsRead(conversationId, user.id);
      
      // Subscribe to new messages
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      
      unsubscribeRef.current = MessagingService.subscribeToMessages(
        conversationId,
        (newMessage) => {
          setMessages(prev => [...prev, newMessage]);
          // Mark as read if it's for current user
          if (newMessage.receiver_id === user.id) {
            MessagingService.markMessagesAsRead(conversationId, user.id);
          }
        }
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show alert for network errors, just log them
      // Alert.alert('Errore', 'Impossibile caricare i messaggi');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user) {
      console.log('Cannot send: missing message, conversation, or user', {
        hasMessage: !!newMessage.trim(),
        hasConversation: !!selectedConversationId,
        hasUser: !!user
      });
      return;
    }

    // Check if it's a temporary ID (database not set up)
    if (selectedConversationId.startsWith('temp_')) {
      Alert.alert(
        'Database non configurato',
        'Le tabelle del database non sono ancora state create. Esegui lo script SQL fornito in Supabase per abilitare la messaggistica.'
      );
      return;
    }

    // Get receiver ID from conversation or from state
    let receiverId = selectedConversationOtherUserId;
    
    if (!receiverId) {
      // Try to find it from conversations array
      const conversation = conversations.find(c => c.id === selectedConversationId);
      if (conversation) {
        receiverId = conversation.participant1_id === user.id
          ? conversation.participant2_id
          : conversation.participant1_id;
      }
    }

    if (!receiverId) {
      console.error('Cannot determine receiver ID', {
        selectedConversationId,
        selectedConversationOtherUserId,
        conversationsCount: conversations.length
      });
      Alert.alert('Errore', 'Impossibile determinare il destinatario');
      return;
    }

    console.log('Sending message', {
      conversationId: selectedConversationId,
      senderId: user.id,
      receiverId,
      messageLength: newMessage.trim().length
    });

    try {
      const sentMessage = await MessagingService.sendMessage(
        selectedConversationId,
        user.id,
        receiverId,
        newMessage.trim()
      );

      if (sentMessage) {
        console.log('Message sent successfully', sentMessage.id);
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        // Reload conversations to update last message
        await loadConversations();
      } else {
        console.log('Message not sent - returned null');
        Alert.alert(
          'Errore',
          'Impossibile inviare il messaggio. Verifica che le tabelle del database siano state create.'
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Errore', 'Impossibile inviare il messaggio');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Ora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h fa`;
    } else {
      return date.toLocaleDateString('it-IT');
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUserName = item.other_user?.nome || 'Utente';
    const lastMessageText = item.last_message?.content || 'Nessun messaggio';
    const lastMessageTime = item.last_message_at 
      ? formatTime(item.last_message_at) 
      : '';
    
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => loadMessages(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationAvatar}>
          {item.other_user?.foto ? (
            <Image 
              source={{ uri: item.other_user.foto }} 
              style={styles.avatarImage}
            />
          ) : (
            <MaterialIcons name="person" size={24} color="#666" />
          )}
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.participantName} numberOfLines={1}>
              {otherUserName}
            </Text>
            <Text style={styles.lastMessageTime}>{lastMessageTime}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessageText}
            </Text>
            {(item.unread_count || 0) > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <Text style={[
          styles.messageText,
          isOwnMessage ? styles.ownMessageText : styles.otherMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={[
          styles.messageTime,
          isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(item.created_at)}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messaggi</Text>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="search" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Caricamento conversazioni...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (selectedConversationId) {
    const conversation = conversations.find(c => c.id === selectedConversationId);
    const displayName = selectedConversationOtherUserName 
      || conversation?.other_user?.nome 
      || targetUserName 
      || 'Utente';
    
    // Debug log
    if (!selectedConversationOtherUserName && !conversation?.other_user?.nome) {
      console.log('User name not found:', {
        selectedConversationOtherUserName,
        conversationOtherUser: conversation?.other_user,
        targetUserName,
        selectedConversationOtherUserId
      });
    }
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              setSelectedConversationId(null);
              setSelectedConversationOtherUserId(null);
              setSelectedConversationOtherUserName(null);
              if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
              }
            }} 
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{displayName}</Text>
            <Text style={styles.headerSubtitle}>Messaggi</Text>
          </View>
          <TouchableOpacity style={styles.headerButton}>
            <MaterialIcons name="more-vert" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
        />

        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Scrivi un messaggio..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messaggi</Text>
        <TouchableOpacity style={styles.headerButton}>
          <MaterialIcons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="message" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>Nessun messaggio</Text>
          <Text style={styles.emptyDescription}>
            Inizia una conversazione dai tuoi match per vedere i messaggi qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversation}
          style={styles.conversationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Caricamento messaggi...</Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  conversationAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownMessageText: {
    backgroundColor: '#2196F3',
    color: '#fff',
  },
  otherMessageText: {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    textAlign: 'right',
    color: '#666',
  },
  otherMessageTime: {
    textAlign: 'left',
    color: '#666',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});