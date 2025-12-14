import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { uploadImageFromGallery, uploadImageFromCamera, UploadType } from '../utils/supabaseUpload';
import { updateProfile } from '../utils/supabaseAuth';

interface ProfileVerificationScreenProps {
  onBack: () => void;
  onComplete: () => void;
  userId: string;
}

export default function ProfileVerificationScreen({
  onBack,
  onComplete,
  userId,
}: ProfileVerificationScreenProps) {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const [uploading, setUploading] = useState<UploadType | null>(null);

  const handleUpload = async (type: UploadType, source: 'gallery' | 'camera') => {
    setUploading(type);
    
    try {
      let result;
      if (source === 'gallery') {
        result = await uploadImageFromGallery(userId, type);
      } else {
        result = await uploadImageFromCamera(userId, type);
      }

      if (result.success && result.url) {
        // Update profile in Supabase
        const fieldMap = {
          avatar: 'avatar_url',
          id_document: 'id_document_url',
          selfie: 'selfie_url',
        };

        const updateResult = await updateProfile({
          [fieldMap[type]]: result.url,
        });

        if (updateResult.success) {
          // Update local state
          switch (type) {
            case 'avatar':
              setAvatar(result.url);
              break;
            case 'id_document':
              setIdDocument(result.url);
              break;
            case 'selfie':
              setSelfie(result.url);
              break;
          }
          
          Alert.alert('Successo', 'Immagine caricata con successo!');
        } else {
          Alert.alert('Errore', updateResult.error || 'Errore durante l\'aggiornamento del profilo');
        }
      } else {
        Alert.alert('Errore', result.error || 'Errore durante il caricamento');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Errore', 'Errore durante il caricamento');
    } finally {
      setUploading(null);
    }
  };

  const handleComplete = async () => {
    if (!avatar || !idDocument || !selfie) {
      Alert.alert('Verifica Incompleta', 'Devi caricare tutte le immagini richieste per completare la verifica.');
      return;
    }

    try {
      setUploading('avatar'); // Use as loading state
      
      // Update user verification status to pending
      const updateResult = await updateProfile({
        verification_pending: true,
        verification_submitted_at: new Date().toISOString(),
      });

      if (updateResult.success) {
        Alert.alert(
          'Verifica Inviata',
          'Le tue informazioni sono state inviate per la verifica. Riceverai una notifica quando il processo sarà completato.',
          [
            {
              text: 'OK',
              onPress: onComplete,
            },
          ]
        );
      } else {
        Alert.alert('Errore', updateResult.error || 'Errore durante l\'invio della verifica');
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      Alert.alert('Errore', 'Errore durante l\'invio della verifica');
    } finally {
      setUploading(null);
    }
  };

  const renderUploadSection = (
    title: string,
    description: string,
    type: UploadType,
    image: string | null,
    icon: string
  ) => (
    <View style={styles.uploadSection}>
      <View style={styles.uploadHeader}>
        <MaterialIcons name={icon as any} size={24} color="#2196F3" />
        <View style={styles.uploadText}>
          <Text style={styles.uploadTitle}>{title}</Text>
          <Text style={styles.uploadDescription}>{description}</Text>
        </View>
      </View>

      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.uploadedImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => {
              switch (type) {
                case 'avatar':
                  setAvatar(null);
                  break;
                case 'id_document':
                  setIdDocument(null);
                  break;
                case 'selfie':
                  setSelfie(null);
                  break;
              }
            }}
          >
            <MaterialIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.uploadButtons}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading === type && styles.uploadButtonDisabled]}
            onPress={() => handleUpload(type, 'gallery')}
            disabled={uploading === type}
          >
            {uploading === type ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="photo-library" size={20} color="#fff" />
            )}
            <Text style={styles.uploadButtonText}>Galleria</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, uploading === type && styles.uploadButtonDisabled]}
            onPress={() => handleUpload(type, 'camera')}
            disabled={uploading === type}
          >
            {uploading === type ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            )}
            <Text style={styles.uploadButtonText}>Fotocamera</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Verifica Profilo</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Completa la verifica del tuo profilo</Text>
          <Text style={styles.subtitle}>
            Carica le immagini richieste per verificare la tua identità e accedere a tutte le funzionalità
          </Text>

          {renderUploadSection(
            'Foto Profilo',
            'Carica una foto chiara del tuo viso per il profilo',
            'avatar',
            avatar,
            'person'
          )}

          {renderUploadSection(
            'Documento d\'Identità',
            'Carica una foto del tuo documento d\'identità (carta d\'identità, passaporto, patente)',
            'id_document',
            idDocument,
            'credit-card'
          )}

          {renderUploadSection(
            'Selfie di Verifica',
            'Scatta un selfie per verificare che corrispondi al documento caricato',
            'selfie',
            selfie,
            'face'
          )}

          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#2196F3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Sicurezza e Privacy</Text>
              <Text style={styles.infoText}>
                Le tue informazioni sono protette e crittografate. I documenti d'identità sono accessibili solo a te e vengono utilizzati esclusivamente per la verifica dell'identità.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.completeButton,
            (!avatar || !idDocument || !selfie) && styles.completeButtonDisabled
          ]}
          onPress={handleComplete}
          disabled={!avatar || !idDocument || !selfie}
        >
          <Text style={styles.completeButtonText}>Completa Verifica</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  uploadSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: {
    flex: 1,
    marginLeft: 12,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  uploadedImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  uploadButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 8,
    justifyContent: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  completeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
