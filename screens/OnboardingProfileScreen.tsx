import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Utente } from '../src/types';
import { premiumTheme } from '../styles/premiumTheme';

interface OnboardingProfileScreenProps {
  user: Utente;
  onNext: (data: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
}

export default function OnboardingProfileScreen({
  user,
  onNext,
  onBack,
  step,
  totalSteps,
}: OnboardingProfileScreenProps) {
  const [nome, setNome] = useState(user.nome || '');
  const [cognome, setCognome] = useState('');
  const [eta, setEta] = useState('25');
  const [professione, setProfessione] = useState('Studente');
  const [bio, setBio] = useState('');
  const [foto, setFoto] = useState(user.foto || '');
  const [cercaCoinquilino, setCercaCoinquilino] = useState(false);

  const handleImagePicker = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permessi', 'È necessario concedere l\'accesso alla galleria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Errore', 'Errore durante la selezione dell\'immagine');
    }
  };

  const handleNext = () => {
    if (!nome.trim()) {
      Alert.alert('Attenzione', 'Inserisci il tuo nome');
      return;
    }
    
    onNext({
      nome: nome.trim(),
      cognome: cognome.trim(),
      eta: parseInt(eta) || 25,
      professione: professione.trim(),
      bio: bio.trim(),
      foto,
      cercaCoinquilino,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={premiumTheme.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crea il tuo profilo</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.stepIndicator}>Passo {step} di {totalSteps}</Text>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Iniziamo con le basi</Text>
        <Text style={styles.sectionSubtitle}>
          Queste informazioni ci aiuteranno a trovare l'abbinamento perfetto per te.
        </Text>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.photoContainer}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="camera-alt" size={24} color={premiumTheme.colors.accent} />
              </View>
            )}
            <View style={styles.photoAddButton}>
              <MaterialIcons name="add" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.photoHint}>Carica una foto profilo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Es. Mario"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Cognome</Text>
              <TextInput
                style={styles.input}
                placeholder="Es. Rossi"
                value={cognome}
                onChangeText={setCognome}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Età</Text>
              <TextInput
                style={styles.input}
                placeholder="25"
                value={eta}
                onChangeText={setEta}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Professione</Text>
              <TextInput
                style={styles.input}
                placeholder="Studente"
                value={professione}
                onChangeText={setProfessione}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Parlaci un po' di te</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Scrivi una breve biografia..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          {/* Roommate Toggle */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleContent}>
              <Text style={styles.toggleLabel}>Sto cercando anche un coinquilino</Text>
              <Switch
                value={cercaCoinquilino}
                onValueChange={setCercaCoinquilino}
                trackColor={{ false: premiumTheme.colors.border, true: premiumTheme.colors.accent }}
                thumbColor={cercaCoinquilino ? '#FFFFFF' : '#F4F3F4'}
              />
            </View>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <LinearGradient
            colors={premiumTheme.gradients.cta}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Prosegui</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: premiumTheme.colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumTheme.colors.ink,
    fontFamily: premiumTheme.typography.display,
  },
  placeholder: {
    width: 32,
  },
  stepIndicator: {
    fontSize: 12,
    color: premiumTheme.colors.inkMuted,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: premiumTheme.colors.surfaceMuted,
    fontFamily: premiumTheme.typography.body,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: premiumTheme.colors.ink,
    marginBottom: 4,
    fontFamily: premiumTheme.typography.display,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: premiumTheme.colors.inkMuted,
    marginBottom: 16,
    lineHeight: 18,
    fontFamily: premiumTheme.typography.body,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
  },
  photoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: premiumTheme.colors.surface,
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoAddButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: premiumTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: {
    fontSize: 11,
    color: premiumTheme.colors.inkMuted,
    fontFamily: premiumTheme.typography.body,
  },
  formSection: {
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: premiumTheme.colors.ink,
    marginBottom: 6,
    fontFamily: premiumTheme.typography.body,
  },
  input: {
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: premiumTheme.colors.ink,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
    fontFamily: premiumTheme.typography.body,
  },
  textArea: {
    height: 60,
    paddingTop: 10,
  },
  toggleSection: {
    marginTop: 4,
  },
  toggleContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    color: premiumTheme.colors.ink,
    flex: 1,
    fontFamily: premiumTheme.typography.body,
  },
  continueButton: {
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
    marginTop: 12,
    ...premiumTheme.shadows.lift,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: premiumTheme.typography.body,
  },
});
