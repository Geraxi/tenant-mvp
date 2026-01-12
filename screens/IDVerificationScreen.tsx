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
import { LinearGradient } from 'expo-linear-gradient';
import { Utente } from '../src/types';
import { VerificationService } from '../src/services/verificationService';
import { premiumTheme } from '../styles/premiumTheme';

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
              <MaterialIcons name="cloud-upload" size={40} color={premiumTheme.colors.inkMuted} />
              <Text style={styles.placeholderText}>Carica immagine</Text>
            </View>
          )}
          
          {isUploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color={premiumTheme.colors.accent} />
            </View>
          )}
        </View>
        
        <View style={styles.uploadActions}>
          <TouchableOpacity 
            style={styles.uploadAction} 
            onPress={() => handleImagePicker(type)}
            disabled={isUploading}
          >
            <MaterialIcons name="photo-library" size={20} color={premiumTheme.colors.accent} />
            <Text style={styles.uploadActionText}>Galleria</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.uploadAction} 
            onPress={() => handleCamera(type)}
            disabled={isUploading}
          >
            <MaterialIcons name="camera-alt" size={20} color={premiumTheme.colors.accent} />
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
                color={idVerification.documentType === type.id ? premiumTheme.colors.accent : premiumTheme.colors.inkMuted} 
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
          <MaterialIcons name="info" size={20} color={premiumTheme.colors.accent} />
          <Text style={styles.infoText}>
            Le tue informazioni sono protette e utilizzate solo per la verifica dell'identità. 
            Non condivideremo mai i tuoi documenti con terze parti.
          </Text>
        </View>

        <TouchableOpacity style={styles.documentButton} onPress={handleDocumentPicker}>
          <MaterialIcons name="description" size={20} color={premiumTheme.colors.accent} />
          <Text style={styles.documentButtonText}>Carica Documento PDF (Opzionale)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={20} color={premiumTheme.colors.inkMuted} />
          <Text style={styles.backButtonText}>Indietro</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
          <LinearGradient colors={premiumTheme.gradients.cta} style={styles.continueButtonGradient}>
            <Text style={styles.continueButtonText}>Continua</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumTheme.colors.background,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumTheme.colors.ink,
    marginBottom: 15,
    marginTop: 20,
    fontFamily: premiumTheme.typography.display,
  },
  documentTypes: {
    flexDirection: 'row',
    gap: 10,
  },
  documentTypeCard: {
    flex: 1,
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.card,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
  },
  documentTypeCardSelected: {
    borderColor: premiumTheme.colors.accent,
    backgroundColor: premiumTheme.colors.accentSoft,
  },
  documentTypeText: {
    fontSize: 12,
    color: premiumTheme.colors.inkMuted,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: premiumTheme.typography.body,
  },
  documentTypeTextSelected: {
    color: premiumTheme.colors.ink,
    fontWeight: '600',
  },
  uploadContainer: {
    marginBottom: 25,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumTheme.colors.ink,
    marginBottom: 10,
    fontFamily: premiumTheme.typography.display,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: premiumTheme.radii.card,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderRadius: premiumTheme.radii.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 14,
    color: premiumTheme.colors.inkMuted,
    marginTop: 8,
    fontFamily: premiumTheme.typography.body,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: premiumTheme.radii.card,
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
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.input,
    borderWidth: 1,
    borderColor: premiumTheme.colors.accent,
    gap: 8,
  },
  uploadActionText: {
    fontSize: 14,
    color: premiumTheme.colors.accent,
    fontWeight: '600',
    fontFamily: premiumTheme.typography.body,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumTheme.colors.ink,
    marginBottom: 8,
    fontFamily: premiumTheme.typography.body,
  },
  textInput: {
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.input,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
  },
  inputText: {
    fontSize: 16,
    color: premiumTheme.colors.inkMuted,
    fontFamily: premiumTheme.typography.body,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: premiumTheme.colors.sky,
    borderRadius: premiumTheme.radii.input,
    padding: 15,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: premiumTheme.colors.navy,
    lineHeight: 20,
    fontFamily: premiumTheme.typography.body,
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.input,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
    gap: 10,
  },
  documentButtonText: {
    fontSize: 16,
    color: premiumTheme.colors.accent,
    fontWeight: '600',
    fontFamily: premiumTheme.typography.body,
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
    borderRadius: premiumTheme.radii.button,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
    gap: 8,
    backgroundColor: premiumTheme.colors.surface,
  },
  backButtonText: {
    fontSize: 16,
    color: premiumTheme.colors.inkMuted,
    fontFamily: premiumTheme.typography.body,
  },
  continueButton: {
    flex: 2,
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
    ...premiumTheme.shadows.lift,
  },
  continueButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    fontFamily: premiumTheme.typography.body,
  },
});
