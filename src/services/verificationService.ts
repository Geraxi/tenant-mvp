import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';
import { supabase } from '../../client/supabase';
import { getApiBaseUrl } from '../utils/apiBaseUrl';

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
  private static formatSupabaseError(error: any) {
    if (!error) return 'Unknown error';
    return [
      error.message,
      error.details ? `details: ${error.details}` : null,
      error.hint ? `hint: ${error.hint}` : null,
      error.code ? `code: ${error.code}` : null,
    ]
      .filter(Boolean)
      .join(' | ');
  }

  /**
   * Prepare document image payload for backend upload
   */
  private static async prepareDocumentImage(
    fileUri: string,
    fileName: string
  ): Promise<{ success: boolean; file?: { base64: string; fileName: string; contentType: string }; error?: string }> {
    try {
      const fileExt = fileName.split('.').pop() || 'jpg';
      const base64Encoding =
        FileSystem?.EncodingType?.Base64 ? FileSystem.EncodingType.Base64 : 'base64';
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: base64Encoding as any,
      });
      const contentType = this.getContentType(fileExt);

      return { success: true, file: { base64, fileName, contentType } };
    } catch (error: any) {
      console.error('Error in prepareDocumentImage:', error);
      return { success: false, error: error.message || 'File read failed' };
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
      const ownerId = userId;

      const [frontResult, backResult, selfieResult] = await Promise.all([
        this.prepareDocumentImage(documentFrontUri, 'document-front.jpg'),
        documentBackUri
          ? this.prepareDocumentImage(documentBackUri, 'document-back.jpg')
          : Promise.resolve({ success: true, file: undefined }),
        this.prepareDocumentImage(selfieUri, 'selfie.jpg'),
      ]);

      if (!frontResult.success || !selfieResult.success) {
        return {
          success: false,
          error:
            frontResult.error ||
            selfieResult.error ||
            'Failed to read documents. Please try again.',
        };
      }

      const apiBaseUrl = getApiBaseUrl();
      const prepareResponse = await fetch(`${apiBaseUrl}/api/verification/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: ownerId,
          documentFront: {
            fileName: frontResult.file?.fileName,
            contentType: frontResult.file?.contentType,
          },
          documentBack: backResult.file
            ? {
                fileName: backResult.file.fileName,
                contentType: backResult.file.contentType,
              }
            : null,
          selfie: {
            fileName: selfieResult.file?.fileName,
            contentType: selfieResult.file?.contentType,
          },
        }),
      });

      const prepareText = await prepareResponse.text();
      let prepareBody: any = null;
      try {
        prepareBody = prepareText ? JSON.parse(prepareText) : null;
      } catch {
        prepareBody = null;
      }
      if (!prepareResponse.ok) {
        return {
          success: false,
          error:
            prepareBody?.message ||
            prepareText ||
            `Verification failed (${prepareResponse.status})`,
        };
      }

      if (!prepareBody?.documentFront?.signedUrl || !prepareBody?.selfie?.signedUrl) {
        return {
          success: false,
          error: prepareBody?.message || 'Missing upload URL from server',
        };
      }

      const uploadResults = await Promise.all([
        this.uploadToSignedUrl(frontResult.file!, prepareBody.documentFront.signedUrl),
        prepareBody?.documentBack?.signedUrl && backResult.file
          ? this.uploadToSignedUrl(backResult.file, prepareBody.documentBack.signedUrl)
          : Promise.resolve({ success: true }),
        this.uploadToSignedUrl(selfieResult.file!, prepareBody.selfie.signedUrl),
      ]);

      const uploadError = uploadResults.find((result) => !result.success);
      if (uploadError) {
        return { success: false, error: uploadError.error || 'Upload failed' };
      }

      const submitResponse = await fetch(`${apiBaseUrl}/api/verification/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: ownerId,
          documentType,
          documentFrontPath: prepareBody?.documentFront?.path,
          documentBackPath: prepareBody?.documentBack?.path,
          selfiePath: prepareBody?.selfie?.path,
          documentNumber,
          expiryDate,
        }),
      });

      const submitText = await submitResponse.text();
      let submitBody: any = null;
      try {
        submitBody = submitText ? JSON.parse(submitText) : null;
      } catch {
        submitBody = null;
      }
      if (!submitResponse.ok) {
        return {
          success: false,
          error:
            submitBody?.message ||
            submitText ||
            `Verification failed (${submitResponse.status})`,
        };
      }

      return { success: true, documentId: submitBody?.documentId };
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
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/api/verification/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const text = await response.text();
        let body: any = null;
        try {
          body = text ? JSON.parse(text) : null;
        } catch {
          body = null;
        }
        throw new Error(
          body?.message || text || `Failed to fetch verification status (${response.status})`
        );
      }

      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
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

  private static getContentType(extension: string): string {
    const types: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };

    return types[extension.toLowerCase()] || 'application/octet-stream';
  }

  private static async uploadToSignedUrl(
    file: { base64: string; fileName: string; contentType: string },
    signedUrl: string | undefined
  ): Promise<{ success: boolean; error?: string }> {
    if (!signedUrl) {
      return { success: false, error: 'Missing upload URL' };
    }

    try {
      const base64Data = file.base64.includes('base64,')
        ? file.base64.split('base64,')[1]
        : file.base64;
      const buffer = Buffer.from(base64Data, 'base64');

      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.contentType || 'application/octet-stream' },
        body: buffer,
      });

      if (!uploadResponse.ok) {
        return { success: false, error: `Upload failed (${uploadResponse.status})` };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Upload failed' };
    }
  }

  // getApiBaseUrl moved to src/utils/apiBaseUrl
}
