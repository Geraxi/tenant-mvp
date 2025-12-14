import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from './src/supabaseClient';
import { Alert } from 'react-native';

export type UploadType = 'avatar' | 'id_document' | 'selfie' | 'property_image' | 'contract';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Request permissions for image picker
export async function requestImagePermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permessi Richiesti', 'Per favore abilita l\'accesso alla galleria fotografica nelle impostazioni.');
    return false;
  }
  return true;
}

// Request permissions for camera
export async function requestCameraPermissions(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permessi Richiesti', 'Per favore abilita l\'accesso alla fotocamera nelle impostazioni.');
    return false;
  }
  return true;
}

// Upload image from gallery
export async function uploadImageFromGallery(
  userId: string,
  type: UploadType,
  options?: ImagePicker.ImagePickerOptions
): Promise<UploadResult> {
  try {
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return { success: false, error: 'Permessi non concessi' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [4, 3],
      quality: 0.8,
      base64: true,
      ...options,
    });

    if (result.canceled) {
      return { success: false, error: 'Selezione annullata' };
    }

    const image = result.assets[0];
    if (!image.base64) {
      return { success: false, error: 'Errore durante il caricamento dell\'immagine' };
    }

    return await uploadFile(userId, type, image.base64, image.fileName || 'image.jpg');
  } catch (error) {
    console.error('Upload image from gallery error:', error);
    return { success: false, error: 'Errore durante il caricamento' };
  }
}

// Upload image from camera
export async function uploadImageFromCamera(
  userId: string,
  type: UploadType,
  options?: ImagePicker.ImagePickerOptions
): Promise<UploadResult> {
  try {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) {
      return { success: false, error: 'Permessi non concessi' };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [4, 3],
      quality: 0.8,
      base64: true,
      ...options,
    });

    if (result.canceled) {
      return { success: false, error: 'Foto annullata' };
    }

    const image = result.assets[0];
    if (!image.base64) {
      return { success: false, error: 'Errore durante la cattura dell\'immagine' };
    }

    return await uploadFile(userId, type, image.base64, image.fileName || 'photo.jpg');
  } catch (error) {
    console.error('Upload image from camera error:', error);
    return { success: false, error: 'Errore durante la cattura' };
  }
}

// Upload document
export async function uploadDocument(
  userId: string,
  type: UploadType,
  options?: DocumentPicker.DocumentPickerOptions
): Promise<UploadResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
      ...options,
    });

    if (result.canceled) {
      return { success: false, error: 'Selezione annullata' };
    }

    const document = result.assets[0];
    const response = await fetch(document.uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return await uploadFile(userId, type, base64, document.name);
  } catch (error) {
    console.error('Upload document error:', error);
    return { success: false, error: 'Errore durante il caricamento del documento' };
  }
}

// Upload file to Supabase Storage
async function uploadFile(
  userId: string,
  type: UploadType,
  base64Data: string,
  fileName: string
): Promise<UploadResult> {
  try {
    // Determine bucket based on type
    let bucket: string;
    let folder: string;

    switch (type) {
      case 'avatar':
        bucket = 'user_uploads';
        folder = 'avatar';
        break;
      case 'id_document':
      case 'selfie':
        bucket = 'user_uploads_private';
        folder = type;
        break;
      case 'property_image':
        bucket = 'property_images';
        folder = 'properties';
        break;
      case 'contract':
        bucket = 'contracts';
        folder = 'contracts';
        break;
      default:
        bucket = 'user_uploads';
        folder = 'misc';
    }

    // Generate file path
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop() || 'jpg';
    const filePath = `${folder}/${userId}/${timestamp}_${fileName}`;

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: getContentType(fileExtension),
        upsert: true,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Upload file error:', error);
    return { success: false, error: 'Errore durante il caricamento' };
  }
}

// Get content type based on file extension
function getContentType(extension: string): string {
  const types: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    pdf: 'application/pdf',
  };

  return types[extension.toLowerCase()] || 'application/octet-stream';
}

// Delete file from Supabase Storage
export async function deleteFile(bucket: string, filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete file error:', error);
    return { success: false, error: 'Errore durante l\'eliminazione' };
  }
}

// Get file URL from Supabase Storage
export function getFileUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
