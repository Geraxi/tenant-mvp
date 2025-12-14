import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { uploadImageFromGallery, uploadImageFromCamera } from '../utils/supabaseUpload';
import { createProperty, uploadPropertyImages } from '../utils/supabaseProperties';

interface PropertyListingScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function PropertyListingScreen({
  onBack,
  onSuccess,
  userId,
}: PropertyListingScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rent, setRent] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddImage = async (source: 'gallery' | 'camera') => {
    if (images.length >= 10) {
      Alert.alert('Limite Raggiunto', 'Puoi caricare massimo 10 immagini per proprietà.');
      return;
    }

    setUploading(true);
    
    try {
      let result;
      if (source === 'gallery') {
        result = await uploadImageFromGallery(userId, 'property_image');
      } else {
        result = await uploadImageFromCamera(userId, 'property_image');
      }

      if (result.success && result.url) {
        setImages(prev => [...prev, result.url!]);
        Alert.alert('Successo', 'Immagine caricata con successo!');
      } else {
        Alert.alert('Errore', result.error || 'Errore durante il caricamento');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Errore', 'Errore durante il caricamento');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || !rent.trim() || !location.trim()) {
      Alert.alert('Campi Richiesti', 'Compila tutti i campi obbligatori.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Immagini Richieste', 'Aggiungi almeno una immagine della proprietà.');
      return;
    }

    setSaving(true);
    
    try {
      const result = await createProperty(userId, {
        title: title.trim(),
        description: description.trim(),
        rent: parseFloat(rent),
        location: location.trim(),
        images,
      });

      if (result.success) {
        Alert.alert(
          'Annuncio Creato',
          'Il tuo annuncio è stato pubblicato con successo!',
          [
            {
              text: 'OK',
              onPress: onSuccess,
            },
          ]
        );
      } else {
        Alert.alert('Errore', result.error || 'Errore durante la creazione dell\'annuncio');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Errore', 'Errore durante il salvataggio');
    } finally {
      setSaving(false);
    }
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item }} style={styles.image} />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => handleRemoveImage(index)}
      >
        <MaterialIcons name="close" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuovo Annuncio</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Crea il tuo annuncio</Text>
          <Text style={styles.subtitle}>
            Compila i dettagli della tua proprietà per pubblicare l'annuncio
          </Text>

          {/* Images Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Immagini della Proprietà</Text>
            <Text style={styles.sectionSubtitle}>
              Aggiungi foto della tua proprietà (minimo 1, massimo 10)
            </Text>

            <FlatList
              data={images}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => `${item}-${index}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imagesList}
              ListEmptyComponent={
                <View style={styles.emptyImages}>
                  <MaterialIcons name="photo-camera" size={48} color="#ccc" />
                  <Text style={styles.emptyImagesText}>Nessuna immagine</Text>
                </View>
              }
            />

            {images.length < 10 && (
              <View style={styles.addImageButtons}>
                <TouchableOpacity
                  style={[styles.addImageButton, uploading && styles.addImageButtonDisabled]}
                  onPress={() => handleAddImage('gallery')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialIcons name="photo-library" size={20} color="#fff" />
                  )}
                  <Text style={styles.addImageButtonText}>Galleria</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.addImageButton, uploading && styles.addImageButtonDisabled]}
                  onPress={() => handleAddImage('camera')}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialIcons name="camera-alt" size={20} color="#fff" />
                  )}
                  <Text style={styles.addImageButtonText}>Fotocamera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dettagli della Proprietà</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Titolo dell'Annuncio *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Es. Appartamento moderno nel centro"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descrizione *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descrivi la proprietà, le caratteristiche, i servizi inclusi..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Affitto Mensile (€) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Es. 1200"
                value={rent}
                onChangeText={setRent}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Località *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Es. Milano, Via Roma 123"
                value={location}
                onChangeText={setLocation}
                maxLength={100}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="publish" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? 'Pubblicando...' : 'Pubblica Annuncio'}
          </Text>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  imagesList: {
    marginBottom: 16,
  },
  imageItem: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF4444',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyImages: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyImagesText: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 8,
  },
  addImageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  addImageButton: {
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
  addImageButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addImageButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
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
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginHorizontal: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});
