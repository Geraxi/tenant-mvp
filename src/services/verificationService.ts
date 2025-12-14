import { supabase } from '../lib/supabase';
import * as FileSystem from 'expo-file-system';

export interface VerificationDocument {
  id: string;
  user_id: string;
  document_type: 'carta-identita' | 'passaporto' | 'patente';
  document_front_url: string;
  document_back_url?: string;
  selfie_url: string;
  document_number?: string;
  expiry_date?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export class VerificationService {
  /**
   * Upload a document image to Supabase Storage
   */
  static async uploadDocumentImage(
    userId: string,
    fileUri: string,
    fileName: string,
    folder: 'documents' | 'selfies'
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Generate unique filename
      const fileExt = fileName.split('.').pop() || 'jpg';
      const uniqueFileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

      // For React Native, use FileSystem to read the file
      if (Platform.OS !== 'web') {
        const base64 = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Convert base64 to ArrayBuffer
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(uniqueFileName, byteArray, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (error) {
          console.error('Error uploading document:', error);
          return { success: false, error: error.message };
        }

        // Get public URL (even for private buckets, we can generate a signed URL)
        const {
          data: { publicUrl },
        } = supabase.storage.from('verification-documents').getPublicUrl(uniqueFileName);

        return { success: true, url: publicUrl };
      } else {
        // For web, use fetch to get blob
        const response = await fetch(fileUri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from('verification-documents')
          .upload(uniqueFileName, blob, {
            contentType: blob.type || 'image/jpeg',
            upsert: false,
          });

        if (error) {
          console.error('Error uploading document:', error);
          return { success: false, error: error.message };
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('verification-documents').getPublicUrl(uniqueFileName);

        return { success: true, url: publicUrl };
      }
    } catch (error: any) {
      console.error('Error in uploadDocumentImage:', error);
      return { success: false, error: error.message || 'Upload failed' };
    }
  }

  /**
   * Submit verification documents
   */
  static async submitVerification(
    userId: string,
    documentType: 'carta-identita' | 'passaporto' | 'patente',
    documentFrontUri: string,
    documentBackUri: string | null,
    selfieUri: string,
    documentNumber?: string,
    expiryDate?: string
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // Upload all images
      const [frontResult, backResult, selfieResult] = await Promise.all([
        this.uploadDocumentImage(userId, documentFrontUri, 'document-front.jpg', 'documents'),
        documentBackUri
          ? this.uploadDocumentImage(userId, documentBackUri, 'document-back.jpg', 'documents')
          : Promise.resolve({ success: true, url: undefined }),
        this.uploadDocumentImage(userId, selfieUri, 'selfie.jpg', 'selfies'),
      ]);

      if (!frontResult.success || !selfieResult.success) {
        return {
          success: false,
          error: 'Failed to upload documents. Please try again.',
        };
      }

      // Create verification document record
      const { data, error } = await supabase
        .from('verification_documents')
        .insert({
          user_id: userId,
          document_type: documentType,
          document_front_url: frontResult.url!,
          document_back_url: backResult.url,
          selfie_url: selfieResult.url!,
          document_number: documentNumber,
          expiry_date: expiryDate,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating verification document:', error);
        return { success: false, error: error.message };
      }

      // Update user's verification status to pending
      const { error: updateError } = await supabase
        .from('utenti')
        .update({
          verification_pending: true,
          verification_submitted_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user verification status:', updateError);
      }

      return { success: true, documentId: data.id };
    } catch (error: any) {
      console.error('Error in submitVerification:', error);
      return { success: false, error: error.message || 'Verification submission failed' };
    }
  }

  /**
   * Get user's verification status
   */
  static async getVerificationStatus(
    userId: string
  ): Promise<VerificationDocument | null> {
    try {
      const { data, error } = await supabase
        .from('verification_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No document found
          return null;
        }
        console.error('Error fetching verification status:', error);
        throw error;
      }

      return data as VerificationDocument;
    } catch (error) {
      console.error('Error in getVerificationStatus:', error);
      return null;
    }
  }

  /**
   * Check if user is verified
   */
  static async isUserVerified(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('utenti')
        .select('verificato')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error checking verification status:', error);
        return false;
      }

      return data?.verificato || false;
    } catch (error) {
      console.error('Error in isUserVerified:', error);
      return false;
    }
  }
}

