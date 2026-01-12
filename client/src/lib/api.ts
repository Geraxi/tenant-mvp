import type { User, Property, Roommate, Match, Favorite, Message } from "@shared/schema";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

async function fetchApi(url: string, options?: RequestInit) {
  // Get Clerk session token
  const clerk = (window as any).Clerk;
  let token: string | null = null;
  
  if (clerk?.session) {
    try {
      token = await clerk.session.getToken();
    } catch (error) {
      // Session might not be ready yet
      console.warn('Failed to get Clerk token:', error);
    }
  }
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message, error.code);
  }

  return response.json();
}

export const api = {
  // Auth
  getMe: (): Promise<User> => fetchApi('/api/auth/user'),

  // Users
  updateUser: (id: string, updates: Partial<User>) =>
    fetchApi(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  // Properties
  getProperties: (): Promise<Property[]> => fetchApi('/api/properties'),

  getProperty: (id: string): Promise<Property> => fetchApi(`/api/properties/${id}`),

  getLandlordProperties: (): Promise<Property[]> => fetchApi('/api/landlord/properties'),

  createProperty: (property: Partial<Property>) =>
    fetchApi('/api/properties', {
      method: 'POST',
      body: JSON.stringify(property),
    }),

  updateProperty: (id: string, updates: Partial<Property>) =>
    fetchApi(`/api/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    }),

  deleteProperty: (id: string) =>
    fetchApi(`/api/properties/${id}`, { method: 'DELETE' }),

  // Roommates
  getRoommates: (): Promise<Roommate[]> => fetchApi('/api/roommates'),

  getRoommate: (id: string): Promise<Roommate> => fetchApi(`/api/roommates/${id}`),

  createRoommate: (roommate: Partial<Roommate>) =>
    fetchApi('/api/roommates', {
      method: 'POST',
      body: JSON.stringify(roommate),
    }),

  // Swipes
  swipe: (targetType: 'property' | 'roommate', targetId: string, action: 'like' | 'skip') =>
    fetchApi('/api/swipes', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, action }),
    }),

  // Matches
  getMatches: (): Promise<(Match & { otherUserId: string; otherUser: { id: string; firstName: string | null; lastName: string | null; profilePhoto: string | null } | null })[]> => fetchApi('/api/matches'),

  getMatch: (matchId: string): Promise<Match & { otherUserId: string; otherUser: { id: string; firstName: string | null; lastName: string | null; profilePhoto: string | null } | null }> =>
    fetchApi(`/api/matches/${matchId}`),

  // Favorites
  getFavorites: (): Promise<Property[]> => fetchApi('/api/favorites'),

  addFavorite: (propertyId: string) =>
    fetchApi('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    }),

  removeFavorite: (propertyId: string) =>
    fetchApi(`/api/favorites/${propertyId}`, { method: 'DELETE' }),

  checkFavorite: (propertyId: string): Promise<{ isFavorited: boolean }> =>
    fetchApi(`/api/favorites/${propertyId}/check`),

  // Image Upload
  uploadImage: (base64: string, fileName: string, contentType?: string): Promise<{ url: string }> =>
    fetchApi('/api/upload/image', {
      method: 'POST',
      body: JSON.stringify({ base64, fileName, contentType }),
    }),

  // Messages
  getMatchMessages: (matchId: string): Promise<Message[]> =>
    fetchApi(`/api/matches/${matchId}/messages`),

  sendMessage: (matchId: string, content: string): Promise<Message> =>
    fetchApi(`/api/matches/${matchId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  markMessageRead: (messageId: string) =>
    fetchApi(`/api/messages/${messageId}/read`, { method: 'PATCH' }),

  getUnreadCount: (): Promise<{ count: number }> =>
    fetchApi('/api/messages/unread-count'),

  // Reports
  reportUser: (reportedUserId: string, reason: string, description?: string) =>
    fetchApi('/api/reports', {
      method: 'POST',
      body: JSON.stringify({ reportedUserId, reason, description }),
    }),

  // Blocks
  blockUser: (blockedId: string) =>
    fetchApi('/api/blocks', {
      method: 'POST',
      body: JSON.stringify({ blockedId }),
    }),

  unblockUser: (blockedId: string) =>
    fetchApi(`/api/blocks/${blockedId}`, { method: 'DELETE' }),

  getBlocks: () => fetchApi('/api/blocks'),

  // Stripe
  getStripeConfig: (): Promise<{ publishableKey: string }> =>
    fetchApi('/api/stripe/config'),

  createCheckoutSession: (priceId: string): Promise<{ url: string }> =>
    fetchApi('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),

  createPortalSession: (): Promise<{ url: string }> =>
    fetchApi('/api/stripe/portal', { method: 'POST' }),

  getSubscription: (): Promise<{ isPremium: boolean; premiumUntil: string | null; subscriptionId: string | null }> =>
    fetchApi('/api/subscription'),

  // Push Notifications
  subscribeToPush: (subscription: { endpoint: string; p256dh: string; auth: string }) =>
    fetchApi('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    }),

  unsubscribeFromPush: (endpoint: string) =>
    fetchApi('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    }),
};
