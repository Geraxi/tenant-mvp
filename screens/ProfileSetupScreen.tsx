import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserType } from '../types';
import { t } from '../utils/translations';
import { showPermissionDeniedAlert } from '../utils/permissionUtils';

export interface ProfileData {
  name: string;
  dateOfBirth: string;
  phone: string;
  location: string;
  bio: string;
  photos: string[];
}

interface ProfileSetupScreenProps {
  userType: UserType;
  onComplete: (data: ProfileData) => void;
  onBack: () => void;
}

export default function ProfileSetupScreen({ userType, onComplete, onBack }: ProfileSetupScreenProps) {
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const minPhotos = 3;

  // Helper function to format date of birth with automatic "/" insertion
  const handleDateOfBirthChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/[^\d]/g, '');
    
    // Format the date as DD/MM/YYYY
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2);
      if (cleaned.length >= 3) {
        formatted += '/' + cleaned.slice(2, 4);
        if (cleaned.length >= 5) {
          formatted += '/' + cleaned.slice(4, 8);
        }
      }
    }
    
    setDateOfBirth(formatted);
  };

  // Helper function to validate date format and calculate age
  const validateDateOfBirth = (date: string): { valid: boolean; age?: number; error?: string } => {
    // Check format DD/MM/YYYY
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);
    
    if (!match) {
      return { valid: false, error: 'Formato data non valido. Usa GG/MM/AAAA' };
    }

    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Validate date values
    if (month < 1 || month > 12) {
      return { valid: false, error: 'Mese non valido' };
    }
    if (day < 1 || day > 31) {
      return { valid: false, error: 'Giorno non valido' };
    }

    // Create date object
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    // Check if date is in the future
    if (birthDate > today) {
      return { valid: false, error: 'La data di nascita non può essere nel futuro' };
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check minimum age (18)
    if (age < 18) {
      return { valid: false, error: 'Devi avere almeno 18 anni' };
    }

    return { valid: true, age };
  };

  const handleAddPhoto = async () => {
    Alert.alert(
      t('addPhoto'),
      'Choose how to add a photo',
      [
        {
          text: t('takePhoto'),
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
              
              if (permissionResult.granted === false) {
                showPermissionDeniedAlert('camera', () => handleAddPhoto());
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setPhotos([...photos, result.assets[0].uri]);
                Alert.alert(t('success'), t('uploadSuccess'));
              }
            } catch (error) {
              Alert.alert('Errore', 'Impossibile scattare la foto');
            }
          },
        },
        {
          text: t('chooseFromLibrary'),
          onPress: async () => {
            try {
              const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
              
              if (permissionResult.granted === false) {
                showPermissionDeniedAlert('photos', () => handleAddPhoto());
                return;
              }

              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
              });

              if (!result.canceled && result.assets[0]) {
                setPhotos([...photos, result.assets[0].uri]);
                Alert.alert(t('success'), t('uploadSuccess'));
              }
            } catch (error) {
              Alert.alert('Errore', 'Impossibile selezionare la foto');
            }
          },
        },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleContinue = () => {
    if (!name.trim() || !dateOfBirth.trim() || !phone.trim() || !location.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    // Validate date of birth
    const validation = validateDateOfBirth(dateOfBirth);
    if (!validation.valid) {
      Alert.alert(t('error'), validation.error || 'Data di nascita non valida');
      return;
    }

    if (photos.length < minPhotos) {
      Alert.alert(t('error'), t('uploadMinPhotos', { min: minPhotos.toString() }));
      return;
    }

    onComplete({
      name,
      dateOfBirth,
      phone,
      location,
      bio,
      photos,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('personalInfo')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('fullName')}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Mario Rossi"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>{t('dateOfBirth')}</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={handleDateOfBirthChange}
                placeholder={t('dateOfBirthPlaceholder')}
                keyboardType="number-pad"
                placeholderTextColor="#999"
                maxLength={10}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.label}>{t('phone')}</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+39 123 456 7890"
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('location')}</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Milano, Italia"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('bio')}</Text>
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder={t('bioPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.photosSection}>
            <Text style={styles.label}>
              {t('uploadProfilePhotos')} ({photos.length}/{minPhotos} min)
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.photosScroll}
            >
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <MaterialIcons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                <MaterialIcons name="add-a-photo" size={32} color="#2196F3" />
                <Text style={styles.addPhotoText}>{t('addPhoto')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, (photos.length < minPhotos || !name || !dateOfBirth || !phone || !location) && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={photos.length < minPhotos || !name || !dateOfBirth || !phone || !location}
        >
          <Text style={styles.continueButtonText}>{t('continue')}</Text>
          <MaterialIcons name="arrow-forward" size={24} color="#fff" />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  photosSection: {
    marginTop: 8,
  },
  photosScroll: {
    marginTop: 12,
  },
  photoContainer: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F9F7',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
