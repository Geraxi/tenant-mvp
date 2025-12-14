import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Utente } from '../src/types';

interface PersonalDetailsScreenProps {
  user: Utente;
  onComplete: (personalDetails: any) => void;
  onBack: () => void;
}

export default function PersonalDetailsScreen({ user, onComplete, onBack }: PersonalDetailsScreenProps) {
  const [personalDetails, setPersonalDetails] = useState({
    nome: user.nome || '',
    cognome: '',
    dataNascita: '',
    telefono: '',
    indirizzo: '',
    citta: '',
    cap: '',
    bio: '',
    foto: user.foto || '',
  });
  const [uploading, setUploading] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permessi', 'È necessario concedere l\'accesso alla galleria per caricare una foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        // In a real app, you would upload the image to Supabase Storage here
        // For now, we'll just use the local URI
        setPersonalDetails(prev => ({
          ...prev,
          foto: result.assets[0].uri
        }));
        setUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Errore', 'Errore durante la selezione dell\'immagine');
      setUploading(false);
    }
  };

  const handleCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permessi', 'È necessario concedere l\'accesso alla fotocamera per scattare una foto');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        // In a real app, you would upload the image to Supabase Storage here
        setPersonalDetails(prev => ({
          ...prev,
          foto: result.assets[0].uri
        }));
        setUploading(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Errore', 'Errore durante la cattura della foto');
      setUploading(false);
    }
  };

  const handleComplete = () => {
    if (!personalDetails.nome.trim() || !personalDetails.cognome.trim()) {
      Alert.alert('Attenzione', 'Nome e cognome sono obbligatori');
      return;
    }
    onComplete(personalDetails);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Foto Profilo</Text>
        <View style={styles.photoContainer}>
          {personalDetails.foto ? (
            <Image source={{ uri: personalDetails.foto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="person" size={60} color="#999" />
            </View>
          )}
          
          {uploading && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          )}
          
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.photoAction} onPress={handleImagePicker}>
              <MaterialIcons name="photo-library" size={20} color="#2196F3" />
              <Text style={styles.photoActionText}>Galleria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoAction} onPress={handleCamera}>
              <MaterialIcons name="camera-alt" size={20} color="#2196F3" />
              <Text style={styles.photoActionText}>Fotocamera</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Informazioni Personali</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nome *</Text>
          <TextInput
            style={styles.textInput}
            value={personalDetails.nome}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, nome: text }))}
            placeholder="Inserisci il tuo nome"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Cognome *</Text>
          <TextInput
            style={styles.textInput}
            value={personalDetails.cognome}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, cognome: text }))}
            placeholder="Inserisci il tuo cognome"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data di Nascita</Text>
          <TextInput
            style={styles.textInput}
            value={personalDetails.dataNascita}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, dataNascita: text }))}
            placeholder="DD/MM/YYYY"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Telefono</Text>
          <TextInput
            style={styles.textInput}
            value={personalDetails.telefono}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, telefono: text }))}
            placeholder="+39 123 456 7890"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Indirizzo</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Indirizzo</Text>
          <TextInput
            style={styles.textInput}
            value={personalDetails.indirizzo}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, indirizzo: text }))}
            placeholder="Via, numero civico"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.inputLabel}>Città</Text>
            <TextInput
              style={styles.textInput}
              value={personalDetails.citta}
              onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, citta: text }))}
              placeholder="Milano"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.inputLabel}>CAP</Text>
            <TextInput
              style={styles.textInput}
              value={personalDetails.cap}
              onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, cap: text }))}
              placeholder="20100"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={5}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Biografia</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Raccontaci qualcosa di te</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={personalDetails.bio}
            onChangeText={(text) => setPersonalDetails(prev => ({ ...prev, bio: text }))}
            placeholder="Scrivi una breve descrizione di te..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 20,
  },
  photoAction: {
    alignItems: 'center',
    padding: 10,
  },
  photoActionText: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
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
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
  },
  row: {
    flexDirection: 'row',
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




