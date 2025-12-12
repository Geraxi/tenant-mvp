import type { User, Property, Roommate, Match, Favorite } from "@shared/schema";
import { supabase } from "./supabase";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function fetchApi(url: string, options?: RequestInit) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new ApiError(response.status, error.message);
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
  getMatches: (): Promise<Match[]> => fetchApi('/api/matches'),

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
};
