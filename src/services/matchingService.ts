import { supabase } from '../../client/supabase';
import { Utente } from '../types';
import { Property } from '../../types';

export interface Like {
  id: string;
  likerId: string;
  likedId: string;
  type: 'property' | 'tenant';
  createdAt: string;
}

export interface Match {
  id: string;
  tenantId: string;
  landlordId: string;
  propertyId: string;
  created_at: string;
  status: 'active' | 'expired' | 'rejected';
}

// Mock data for development
const mockUsers: Utente[] = [
  { id: 'tenant1', ruolo: 'tenant', nome: 'Alice', email: 'alice@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'landlord1', ruolo: 'landlord', nome: 'Bob', email: 'bob@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'tenant2', ruolo: 'tenant', nome: 'Charlie', email: 'charlie@example.com', verificato: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Test users
  { id: 'test_user_1', ruolo: 'tenant', nome: 'Test User', email: 'test@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'test_user_2', ruolo: 'landlord', nome: 'Test Landlord', email: 'landlord@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  // Additional users for matches
  { id: 'owner1', ruolo: 'landlord', nome: 'Marco', email: 'marco@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'owner2', ruolo: 'landlord', nome: 'Sofia', email: 'sofia@example.com', verificato: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockProperties: Property[] = [
  { id: '1', ownerId: 'owner1', title: 'Appartamento Moderno nel Centro', description: 'Bellissimo appartamento di 2 camere nel cuore della città, completamente ristrutturato con design moderno.', location: 'Milano, Centro', rent: 1200, bedrooms: 2, bathrooms: 1, squareMeters: 65, photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'], amenities: ['WiFi', 'Riscaldamento', 'Balcone'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', ownerId: 'owner2', title: 'Casa con Giardino', description: 'Casa indipendente con giardino privato, perfetta per chi cerca tranquillità e spazi verdi.', location: 'Roma, Trastevere', rent: 1800, bedrooms: 3, bathrooms: 2, squareMeters: 120, photos: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=500'], amenities: ['Giardino', 'Parcheggio', 'Cantina'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', ownerId: 'owner3', title: 'Loft Industriale Ristrutturato', description: 'Spazioso loft in ex fabbrica, caratterizzato da soffitti alti e grandi finestre.', location: 'Torino, San Salvario', rent: 950, bedrooms: 1, bathrooms: 1, squareMeters: 80, photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'], amenities: ['Open Space', 'Soffitti Alti', 'Ascensore'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', ownerId: 'owner4', title: 'Villa con Vista Mare', description: 'Elegante villa con vista panoramica sul mare, ideale per chi ama il lusso e la tranquillità.', location: 'Napoli, Posillipo', rent: 2500, bedrooms: 4, bathrooms: 3, squareMeters: 200, photos: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500'], amenities: ['Vista Mare', 'Piscina', 'Terrazza'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', ownerId: 'owner5', title: 'Monolocale nel Quartiere Universitario', description: 'Piccolo ma funzionale monolocale, perfetto per studenti o giovani professionisti.', location: 'Bologna, Università', rent: 600, bedrooms: 1, bathrooms: 1, squareMeters: 35, photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500'], amenities: ['WiFi', 'Riscaldamento', 'Vicino Università'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const mockLikes: Like[] = [
  // Example: owner1 liked tenant1
  { id: 'like-o1-t1', likerId: 'owner1', likedId: 'tenant1', type: 'tenant', createdAt: new Date().toISOString() },
  // Example: tenant1 liked property 1
  { id: 'like-t1-p1', likerId: 'tenant1', likedId: '1', type: 'property', createdAt: new Date().toISOString() },
];

const mockMatches: Match[] = [
  // Example: tenant1 and owner1 matched for property 1
  { id: 'match-1', tenantId: 'tenant1', landlordId: 'owner1', propertyId: '1', status: 'active', created_at: new Date().toISOString() },
  // Test user matches
  { id: 'match-test-1', tenantId: 'test_user_1', landlordId: 'owner1', propertyId: '1', status: 'active', created_at: new Date().toISOString() },
  { id: 'match-test-2', tenantId: 'test_user_1', landlordId: 'owner2', propertyId: '2', status: 'active', created_at: new Date().toISOString() },
  { id: 'match-test-3', tenantId: 'tenant1', landlordId: 'test_user_2', propertyId: '3', status: 'active', created_at: new Date().toISOString() },
  { id: 'match-test-4', tenantId: 'tenant2', landlordId: 'test_user_2', propertyId: '4', status: 'active', created_at: new Date().toISOString() },
];

export class MatchingService {
  // Like a property (tenant likes landlord's property)
  static async likeProperty(tenantId: string, propertyId: string): Promise<{ success: boolean; match?: Match }> {
    try {
      // Use mock data since we're not connected to Supabase yet
      const property = mockProperties.find(p => p.id === propertyId);
      
      if (!property) {
        throw new Error('Property not found');
      }

      const landlordId = property.ownerId;

      // Check if landlord has already liked this tenant (using mock data)
      const existingLike = mockLikes.find(
        like => like.likerId === landlordId && 
                like.likedId === tenantId && 
                like.type === 'tenant'
      );

      // If landlord has already liked this tenant, create a match
      if (existingLike) {
        const match = await this.createMatch(tenantId, landlordId, propertyId);
        return { success: true, match };
      } else {
        // Just record the tenant's like
        const newLike: Like = {
          id: `like-${Date.now()}-${Math.random()}`,
          likerId: tenantId,
          likedId: propertyId,
          type: 'property',
          createdAt: new Date().toISOString(),
        };
        mockLikes.push(newLike);
        return { success: true };
      }
    } catch (error) {
      console.error('Error liking property:', error);
      return { success: false };
    }
  }

  // Like a tenant (landlord likes tenant)
  static async likeTenant(landlordId: string, tenantId: string, propertyId: string): Promise<{ success: boolean; match?: Match }> {
    try {
      // Check if tenant has already liked this property (using mock data)
      const existingLike = mockLikes.find(
        like => like.likerId === tenantId && 
                like.likedId === propertyId && 
                like.type === 'property'
      );

      // If tenant has already liked this property, create a match
      if (existingLike) {
        const match = await this.createMatch(tenantId, landlordId, propertyId);
        return { success: true, match };
      } else {
        // Just record the landlord's like
        const newLike: Like = {
          id: `like-${Date.now()}-${Math.random()}`,
          likerId: landlordId,
          likedId: tenantId,
          type: 'tenant',
          createdAt: new Date().toISOString(),
        };
        mockLikes.push(newLike);
        return { success: true };
      }
    } catch (error) {
      console.error('Error liking tenant:', error);
      return { success: false };
    }
  }

  // Create a match when both parties have liked each other
  private static async createMatch(tenantId: string, landlordId: string, propertyId: string): Promise<Match> {
    const newMatch: Match = {
      id: `match-${Date.now()}-${Math.random()}`,
      tenantId,
      landlordId,
      propertyId,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    
    mockMatches.push(newMatch);
    return newMatch;
  }

  // Get matches for a user
  static async getMatches(userId: string, userRole: 'tenant' | 'landlord'): Promise<Match[]> {
    try {
      console.log('🔍 MatchingService - getMatches called with:', { userId, userRole });
      console.log('🔍 MatchingService - Available mock matches:', mockMatches);
      
      // Use mock data since we're not connected to Supabase yet
      const matches = mockMatches.filter(match => {
        if (userRole === 'tenant') {
          return match.tenantId === userId && match.status === 'active';
        } else {
          return match.landlordId === userId && match.status === 'active';
        }
      });

      console.log('🔍 MatchingService - Filtered matches for user:', matches);
      return matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  // Get match details with user and property information
  static async getMatchDetails(matchId: string): Promise<{
    match: Match;
    tenant: Utente;
    landlord: Utente;
    property: Property;
  } | null> {
    try {
      console.log('🔍 MatchingService - getMatchDetails called with matchId:', matchId);
      
      // Use mock data since we're not connected to Supabase yet
      const match = mockMatches.find(m => m.id === matchId);
      console.log('🔍 MatchingService - Found match:', match);
      if (!match) return null;

      const tenant = mockUsers.find(u => u.id === match.tenantId);
      const landlord = mockUsers.find(u => u.id === match.landlordId);
      const property = mockProperties.find(p => p.id === match.propertyId);

      console.log('🔍 MatchingService - Found details:', { tenant, landlord, property });

      if (!tenant || !landlord || !property) return null;

      return {
        match,
        tenant,
        landlord,
        property,
      };
    } catch (error) {
      console.error('Error fetching match details:', error);
      return null;
    }
  }

  // Reject a match
  static async rejectMatch(matchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'rejected' })
        .eq('id', matchId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting match:', error);
      return false;
    }
  }

  // Get liked properties for a tenant (properties they've liked)
  static async getLikedProperties(tenantId: string): Promise<Property[]> {
    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select(`
          target_id,
          immobili(*)
        `)
        .eq('user_id', tenantId)
        .eq('target_type', 'property');

      if (error) throw error;
      return likes?.map(like => like.immobili).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching liked properties:', error);
      return [];
    }
  }

  // Get liked tenants for a landlord (tenants they've liked)
  static async getLikedTenants(landlordId: string): Promise<Utente[]> {
    try {
      const { data: likes, error } = await supabase
        .from('likes')
        .select(`
          target_id,
          utenti!target_id(*)
        `)
        .eq('user_id', landlordId)
        .eq('target_type', 'tenant');

      if (error) throw error;
      return likes?.map(like => like.utenti).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching liked tenants:', error);
      return [];
    }
  }
}
