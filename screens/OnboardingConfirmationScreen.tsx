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
import { Utente } from '../src/types';

interface OnboardingConfirmationScreenProps {
  user: Utente;
  onboardingData: any;
  onComplete: () => void;
  onBack: () => void;
}

export default function OnboardingConfirmationScreen({ 
  user, 
  onboardingData, 
  onComplete, 
  onBack 
}: OnboardingConfirmationScreenProps) {
  const [saving, setSaving] = useState(false);

  const handleComplete = async () => {
    setSaving(true);
    try {
      // In a real app, you would save all onboarding data to Supabase here
      // This includes preferences, personal details, and ID verification
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Perfetto! 🎉',
        'Il tuo profilo è stato configurato con successo. Ora puoi iniziare a utilizzare Tenant!',
        [{ text: 'Inizia', onPress: onComplete }]
      );
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      Alert.alert('Errore', 'Errore durante il salvataggio. Riprova.');
    } finally {
      setSaving(false);
    }
  };

  const renderPreferencesSummary = () => {
    if (user.ruolo === 'tenant') {
      const prefs = onboardingData.preferences;
      return (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Preferenze Immobili</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Tipo: </Text>
              {prefs.propertyType?.join(', ') || 'Non specificato'}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Budget: </Text>
              €{prefs.budget?.min} - €{prefs.budget?.max}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Camere: </Text>
              {prefs.bedrooms?.join(', ') || 'Non specificato'}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Zona: </Text>
              {prefs.location?.join(', ') || 'Non specificato'}
            </Text>
          </View>
        </View>
      );
    } else {
      const prefs = onboardingData.preferences;
      return (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Preferenze Inquilini</Text>
          <View style={styles.summaryContent}>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Occupazione: </Text>
              {prefs.employmentStatus?.join(', ') || 'Non specificato'}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Reddito: </Text>
              €{prefs.incomeRange?.min} - €{prefs.incomeRange?.max}
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Età: </Text>
              {prefs.ageRange?.min} - {prefs.ageRange?.max} anni
            </Text>
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Sesso: </Text>
              {prefs.gender?.join(', ') || 'Non specificato'}
            </Text>
          </View>
        </View>
      );
    }
  };

  const renderPersonalDetailsSummary = () => {
    const details = onboardingData.personalDetails;
    return (
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Informazioni Personali</Text>
        <View style={styles.summaryContent}>
          <View style={styles.profileRow}>
            {details.foto && (
              <Image source={{ uri: details.foto }} style={styles.profileImage} />
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {details.nome} {details.cognome}
              </Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
          {details.telefono && (
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Telefono: </Text>
              {details.telefono}
            </Text>
          )}
          {details.citta && (
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Città: </Text>
              {details.citta}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderIDVerificationSummary = () => {
    const id = onboardingData.idVerification;
    return (
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Verifica Identità</Text>
        <View style={styles.summaryContent}>
          <View style={styles.verificationRow}>
            <MaterialIcons 
              name={id.documentFront ? "check-circle" : "radio-button-unchecked"} 
              size={20} 
              color={id.documentFront ? "#4CAF50" : "#999"} 
            />
            <Text style={styles.verificationText}>
              Documento caricato
            </Text>
          </View>
          <View style={styles.verificationRow}>
            <MaterialIcons 
              name={id.selfie ? "check-circle" : "radio-button-unchecked"} 
              size={20} 
              color={id.selfie ? "#4CAF50" : "#999"} 
            />
            <Text style={styles.verificationText}>
              Selfie per verifica
            </Text>
          </View>
          {id.documentType && (
            <Text style={styles.summaryText}>
              <Text style={styles.summaryLabel}>Tipo documento: </Text>
              {id.documentType.replace('-', ' ').toUpperCase()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialIcons name="check-circle" size={60} color="#4CAF50" />
          <Text style={styles.title}>Quasi Fatto!</Text>
          <Text style={styles.subtitle}>
            Controlla le tue informazioni prima di completare la configurazione
          </Text>
        </View>

        {renderPreferencesSummary()}
        {renderPersonalDetailsSummary()}
        {renderIDVerificationSummary()}

        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Puoi modificare queste informazioni in qualsiasi momento dalle impostazioni del profilo.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={20} color="#666" />
          <Text style={styles.backButtonText}>Indietro</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.completeButton, saving && styles.completeButtonDisabled]} 
          onPress={handleComplete}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color="white" />
              <Text style={styles.completeButtonText}>Completa</Text>
            </>
          )}
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryContent: {
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryLabel: {
    fontWeight: '600',
    color: '#333',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
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
  completeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    gap: 8,
  },
  completeButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  completeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});




