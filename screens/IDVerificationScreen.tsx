import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Utente } from '../src/types';
import { VerificationService } from '../src/services/verificationService';

interface IDVerificationScreenProps {
  user: Utente;
  onComplete: (idVerification: any) => void;
  onBack: () => void;
}

export default function IDVerificationScreen({ user, onComplete, onBack }: IDVerificationScreenProps) {
  const [idVerification, setIdVerification] = useState({
    documentType: '',
    documentFront: '',
    documentBack: '',
    selfie: '',
    documentNumber: '',
    expiryDate: '',
  });
  const [uploading, setUploading] = useState<string | null>(null);

  const documentTypes = [
    { id: 'carta-identita', label: 'Carta d\'Identità', icon: 'credit-card' },
    { id: 'passaporto', label: 'Passaporto', icon: 'card-travel' },
    { id: 'patente', label: 'Patente di Guida', icon: 'drive-eta' },
  ];

  const handleImagePicker = async (type: 'documentFront' | 'documentBack' | 'selfie') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permessi', 'È necessario concedere l\'accesso alla galleria per caricare un documento');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: type === 'selfie' ? [1, 1] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(type);
        // In a real app, you would upload the image to Supabase Storage here
        setIdVerification(prev => ({
          ...prev,
          [type]: result.assets[0].uri
        }));
        setUploading(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Errore', 'Errore durante la selezione dell\'immagine');
      setUploading(null);
    }
  };

  const handleCamera = async (type: 'documentFront' | 'documentBack' | 'selfie') => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permessi', 'È necessario concedere l\'accesso alla fotocamera per scattare una foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: type === 'selfie' ? [1, 1] : [16, 10],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(type);
        // In a real app, you would upload the image to Supabase Storage here
        setIdVerification(prev => ({
          ...prev,
          [type]: result.assets[0].uri
        }));
        setUploading(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Errore', 'Errore durante la cattura della foto');
      setUploading(null);
    }
  };

  const handleDocumentPicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        Alert.alert('Documento Selezionato', 'Documento PDF caricato con successo');
        // In a real app, you would upload the document to Supabase Storage here
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Errore', 'Errore durante la selezione del documento');
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Errore', 'Utente non trovato');
      return;
    }

    if (!idVerification.documentType) {
      Alert.alert('Attenzione', 'Seleziona il tipo di documento');
      return;
    }
    if (!idVerification.documentFront) {
      Alert.alert('Attenzione', 'Carica la foto del fronte del documento');
      return;
    }
    if (!idVerification.selfie) {
      Alert.alert('Attenzione', 'Carica una foto selfie per la verifica');
      return;
    }

    setUploading('submitting');
    try {
      const result = await VerificationService.submitVerification(
        user.id,
        idVerification.documentType as 'carta-identita' | 'passaporto' | 'patente',
        idVerification.documentFront,
        idVerification.documentBack || null,
        idVerification.selfie,
        idVerification.documentNumber || undefined,
        idVerification.expiryDate || undefined
      );

      if (result.success) {
        Alert.alert(
          'Successo',
          'Documenti inviati con successo! La verifica è in corso e riceverai una notifica quando sarà completata.',
          [{ text: 'OK', onPress: () => onComplete(idVerification) }]
        );
      } else {
        Alert.alert('Errore', result.error || 'Impossibile inviare i documenti');
        setUploading(null);
      }
    } catch (error: any) {
      console.error('Error submitting verification:', error);
      Alert.alert('Errore', error.message || 'Impossibile inviare i documenti');
      setUploading(null);
    }
  };

  const renderImageUpload = (type: 'documentFront' | 'documentBack' | 'selfie', label: string) => {
    const imageUri = idVerification[type];
    const isUploading = uploading === type;

    return (
      <View style={styles.uploadContainer}>
        <Text style={styles.uploadLabel}>{label}</Text>
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialIcons name="cloud-upload" size={40} color="#999" />
              <Text style={styles.placeholderText}>Carica immagine</Text>
            </View>
          )}
          
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          )}
        </View>
        
        <View style={styles.uploadActions}>
          <TouchableOpacity 
            style={styles.uploadAction} 
            onPress={() => handleImagePicker(type)}
            disabled={isUploading}
          >
            <MaterialIcons name="photo-library" size={20} color="#2196F3" />
            <Text style={styles.uploadActionText}>Galleria</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.uploadAction} 
            onPress={() => handleCamera(type)}
            disabled={isUploading}
          >
            <MaterialIcons name="camera-alt" size={20} color="#2196F3" />
            <Text style={styles.uploadActionText}>Fotocamera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tipo di Documento</Text>
        <View style={styles.documentTypes}>
          {documentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.documentTypeCard,
                idVerification.documentType === type.id && styles.documentTypeCardSelected
              ]}
              onPress={() => setIdVerification(prev => ({ ...prev, documentType: type.id }))}
            >
              <MaterialIcons 
                name={type.icon as any} 
                size={32} 
                color={idVerification.documentType === type.id ? '#2196F3' : '#666'} 
              />
              <Text style={[
                styles.documentTypeText,
                idVerification.documentType === type.id && styles.documentTypeTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Carica Documento</Text>
        {renderImageUpload('documentFront', 'Fronte del Documento')}
        
        {idVerification.documentType === 'carta-identita' && (
          renderImageUpload('documentBack', 'Retro del Documento')
        )}

        <Text style={styles.sectionTitle}>Verifica Identità</Text>
        {renderImageUpload('selfie', 'Selfie per Verifica')}

        <Text style={styles.sectionTitle}>Informazioni Documento</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Numero Documento</Text>
          <View style={styles.textInput}>
            <Text style={styles.inputText}>
              {idVerification.documentNumber || 'Inserisci il numero del documento'}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data di Scadenza</Text>
          <View style={styles.textInput}>
            <Text style={styles.inputText}>
              {idVerification.expiryDate || 'DD/MM/YYYY'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Le tue informazioni sono protette e utilizzate solo per la verifica dell'identità. 
            Non condivideremo mai i tuoi documenti con terze parti.
          </Text>
        </View>

        <TouchableOpacity style={styles.documentButton} onPress={handleDocumentPicker}>
          <MaterialIcons name="description" size={20} color="#2196F3" />
          <Text style={styles.documentButtonText}>Carica Documento PDF (Opzionale)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Indietro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
          <Text style={styles.continueButtonText}>Continua</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 20,
  },
  documentTypes: {
    flexDirection: 'row',
    gap: 10,
  },
  documentTypeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  documentTypeCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  documentTypeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  documentTypeTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  uploadContainer: {
    marginBottom: 25,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 15,
  },
  uploadAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    gap: 8,
  },
  uploadActionText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    color: '#999',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 10,
  },
  documentButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  continueButton: {
    flex: 2,
    paddingVertical: 15,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    borderRadius: 8,
  },
  continueButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});
