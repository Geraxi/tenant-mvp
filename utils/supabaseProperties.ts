import { supabase } from './src/supabaseClient';
import { uploadImageFromGallery, uploadImageFromCamera, UploadResult } from './supabaseUpload';

// Network connectivity check
const isNetworkAvailable = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

// Flag to disable Supabase calls when network is consistently failing
let supabaseDisabled = false;

// Function to reset Supabase disabled flag (useful for testing or when network is restored)
export const resetSupabaseConnection = () => {
  supabaseDisabled = false;
  console.log('Supabase connection reset - will attempt to reconnect');
};

export interface PropertyData {
  title: string;
  description: string;
  rent: number;
  location: string;
  images: string[];
}

export interface PropertyWithOwner extends Property {
  owner: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    verified: boolean;
  };
}

// Get all properties
export async function getProperties(limit: number = 20, offset: number = 0): Promise<PropertyWithOwner[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles!properties_owner_id_fkey(
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get properties error:', error);
    return [];
  }
}

// Get property by ID
export async function getPropertyById(propertyId: string): Promise<PropertyWithOwner | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        owner:profiles!properties_owner_id_fkey(
          id,
          full_name,
          avatar_url,
          verified
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Get property by ID error:', error);
    return null;
  }
}

// Get user's properties
export async function getUserProperties(userId: string): Promise<Property[]> {
  // Reset disabled flag to allow retry
  supabaseDisabled = false;
  
  // If Supabase is disabled due to repeated failures, return empty array immediately
  if (supabaseDisabled) {
    return [];
  }

  try {
    // Check network connectivity first
    const networkAvailable = await isNetworkAvailable();
    if (!networkAvailable) {
      console.warn('Network not available, returning empty array');
      return [];
    }

    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 10000);
    });

    const fetchPromise = supabase
      .from('properties')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

    if (error) {
      // Suppress network errors to prevent console spam
      if (error.message && error.message.includes('Network request failed')) {
        console.warn('Network request failed, using fallback data');
        // Disable Supabase for subsequent calls to prevent repeated failures
        supabaseDisabled = true;
      } else {
        console.error('Error fetching user properties:', error);
      }
      return [];
    }

    return data || [];
  } catch (error) {
    // Suppress network errors to prevent console spam
    if (error instanceof Error && error.message.includes('Network request failed')) {
      console.warn('Network request failed, using fallback data');
      // Disable Supabase for subsequent calls to prevent repeated failures
      supabaseDisabled = true;
    } else {
      console.error('Get user properties error:', error);
    }
    // Return empty array on any error to prevent app crashes
    return [];
  }
}

// Create new property
export async function createProperty(
  userId: string,
  propertyData: Omit<PropertyData, 'images'>,
  images: string[] = []
): Promise<{ success: boolean; property?: Property; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        owner_id: userId,
        ...propertyData,
        images,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, property: data };
  } catch (error) {
    console.error('Create property error:', error);
    return { success: false, error: 'Errore durante la creazione dell\'annuncio' };
  }
}

// Update property
export async function updateProperty(
  propertyId: string,
  userId: string,
  updates: Partial<PropertyData>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', propertyId)
      .eq('owner_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update property error:', error);
    return { success: false, error: 'Errore durante l\'aggiornamento dell\'annuncio' };
  }
}

// Delete property
export async function deleteProperty(propertyId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('owner_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete property error:', error);
    return { success: false, error: 'Errore durante l\'eliminazione dell\'annuncio' };
  }
}

// Upload property images
export async function uploadPropertyImages(
  userId: string,
  propertyId: string,
  imageSources: ('gallery' | 'camera')[]
): Promise<{ success: boolean; images?: string[]; error?: string }> {
  try {
    const uploadPromises: Promise<UploadResult>[] = [];

    for (const source of imageSources) {
      if (source === 'gallery') {
        uploadPromises.push(uploadImageFromGallery(userId, 'property_image'));
      } else {
        uploadPromises.push(uploadImageFromCamera(userId, 'property_image'));
      }
    }

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (failedUploads.length > 0) {
      console.warn('Some images failed to upload:', failedUploads);
    }

    if (successfulUploads.length === 0) {
      return { success: false, error: 'Nessuna immagine caricata con successo' };
    }

    const imageUrls = successfulUploads.map(result => result.url!);

    // Update property with new images
    const { error: updateError } = await supabase
      .from('properties')
      .update({ images: imageUrls })
      .eq('id', propertyId)
      .eq('owner_id', userId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, images: imageUrls };
  } catch (error) {
    console.error('Upload property images error:', error);
    return { success: false, error: 'Errore durante il caricamento delle immagini' };
  }
}

// Search properties
export async function searchProperties(
  query: string,
  filters?: {
    minRent?: number;
    maxRent?: number;
    location?: string;
  },
  limit: number = 20,
  offset: number = 0
): Promise<PropertyWithOwner[]> {
  try {
    let queryBuilder = supabase
      .from('properties')
      .select(`
        *,
        owner:profiles!properties_owner_id_fkey(
          id,
          full_name,
          avatar_url,
          verified
        )
      `);

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);
    }

    // Rent filters
    if (filters?.minRent) {
      queryBuilder = queryBuilder.gte('rent', filters.minRent);
    }
    if (filters?.maxRent) {
      queryBuilder = queryBuilder.lte('rent', filters.maxRent);
    }

    // Location filter
    if (filters?.location) {
      queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`);
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error searching properties:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Search properties error:', error);
    return [];
  }
}

// Get property statistics
export async function getPropertyStats(userId: string): Promise<{
  totalProperties: number;
  totalViews: number;
  averageRent: number;
}> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('rent')
      .eq('owner_id', userId);

    if (error) {
      console.error('Error fetching property stats:', error);
      return {
        totalProperties: 0,
        totalViews: 0,
        averageRent: 0,
      };
    }

    const properties = data || [];
    const totalProperties = properties.length;
    const totalRent = properties.reduce((sum, property) => sum + (property.rent || 0), 0);
    const averageRent = totalProperties > 0 ? totalRent / totalProperties : 0;

    return {
      totalProperties,
      totalViews: 0, // This would need to be tracked separately
      averageRent,
    };
  } catch (error) {
    console.error('Get property stats error:', error);
    return {
      totalProperties: 0,
      totalViews: 0,
      averageRent: 0,
    };
  }
}
