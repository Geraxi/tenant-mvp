import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

interface EditProfileScreenProps {
  onNavigateBack: () => void;
}

export default function EditProfileScreen({ onNavigateBack }: EditProfileScreenProps) {
  const { user, updateProfile, uploadProfilePhoto } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefono: '',
    bio: '',
    indirizzo: '',
    dataNascita: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefono: user.telefono || '',
        bio: user.bio || '',
        indirizzo: user.indirizzo || '',
        dataNascita: user.dataNascita || '',
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!formData.nome.trim()) {
      Alert.alert('Errore', 'Il nome è obbligatorio');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Errore', 'L\'email è obbligatoria');
      return;
    }

    try {
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        Alert.alert('Successo', 'Profilo aggiornato con successo!', [
          { text: 'OK', onPress: onNavigateBack }
        ]);
      } else {
        Alert.alert('Errore', result.error || 'Impossibile aggiornare il profilo');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Errore', 'Errore durante l\'aggiornamento del profilo');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Errore', 'Permessi libreria non concessi');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const uploadResult = await uploadProfilePhoto(result.assets[0] as any);
        if (uploadResult.success) {
          Alert.alert('Successo', 'Foto profilo aggiornata');
        } else {
          Alert.alert('Errore', uploadResult.error || 'Impossibile aggiornare la foto');
        }
      }
    } catch (error) {
      console.error('Error changing photo:', error);
      Alert.alert('Errore', 'Impossibile cambiare la foto');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Errore', 'Permessi fotocamera non concessi');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const uploadResult = await uploadProfilePhoto(result.assets[0] as any);
        if (uploadResult.success) {
          Alert.alert('Successo', 'Foto profilo aggiornata');
        } else {
          Alert.alert('Errore', uploadResult.error || 'Impossibile aggiornare la foto');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Errore', 'Impossibile scattare la foto');
    } finally {
      setLoading(false);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      'Cambia Foto Profilo',
      'Come vuoi aggiornare la tua foto?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Galleria', onPress: handleChangePhoto },
        { text: 'Fotocamera', onPress: handleTakePhoto },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifica Profilo</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#2196F3" />
          ) : (
            <Text style={styles.saveButtonText}>Salva</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.avatarContainer}>
            <Image
              key={user?.foto || 'default'}
              source={
                user?.foto 
                  ? { uri: user.foto }
                  : require('../assets/images/icon.png')
              }
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={showPhotoOptions}
              disabled={loading}
            >
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.photoText}>Tocca per cambiare foto</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.nome}
              onChangeText={(value) => handleInputChange('nome', value)}
              placeholder="Inserisci il tuo nome"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Inserisci la tua email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Telefono</Text>
            <TextInput
              style={styles.textInput}
              value={formData.telefono}
              onChangeText={(value) => handleInputChange('telefono', value)}
              placeholder="Inserisci il tuo numero di telefono"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Indirizzo</Text>
            <TextInput
              style={styles.textInput}
              value={formData.indirizzo}
              onChangeText={(value) => handleInputChange('indirizzo', value)}
              placeholder="Inserisci il tuo indirizzo"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Data di Nascita</Text>
            <TextInput
              style={styles.textInput}
              value={formData.dataNascita}
              onChangeText={(value) => handleInputChange('dataNascita', value)}
              placeholder="GG/MM/AAAA"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Raccontaci qualcosa di te..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveProfileButton} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.saveProfileButtonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.saveProfileButtonText}>Salva Modifiche</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  scrollView: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  photoText: {
    fontSize: 14,
    color: '#666',
  },
  formSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
  },
  saveProfileButton: {
    margin: 20,
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveProfileButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveProfileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});