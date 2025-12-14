import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Utente } from '../src/types';
import TenantPreferencesScreen from './TenantPreferencesScreen';
import LandlordPreferencesScreen from './LandlordPreferencesScreen';

interface RoleSwitchOnboardingScreenProps {
  user: Utente;
  targetRole: 'tenant' | 'landlord';
  onComplete: () => void;
  onSkip: () => void;
}

export default function RoleSwitchOnboardingScreen({ 
  user, 
  targetRole, 
  onComplete, 
  onSkip 
}: RoleSwitchOnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<'preferences' | 'complete'>('preferences');
  const [preferences, setPreferences] = useState<any>({});

  const handlePreferencesComplete = (prefs: any) => {
    setPreferences(prefs);
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    // Save preferences and mark onboarding as completed for this role
    console.log('Role switch onboarding completed for:', targetRole);
    console.log('Preferences saved:', preferences);
    onComplete();
  };

  const getTitle = () => {
    if (targetRole === 'tenant') {
      return 'Configura le tue preferenze da inquilino';
    } else {
      return 'Configura le tue preferenze da proprietario';
    }
  };

  const getDescription = () => {
    if (targetRole === 'tenant') {
      return 'Imposta le tue preferenze per trovare la casa perfetta e dimmi se cerchi un coinquilino.';
    } else {
      return 'Imposta le tue preferenze per i tenant che cerchi e crea la tua prima inserzione.';
    }
  };

  if (currentStep === 'preferences') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Salta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <MaterialIcons 
              name={targetRole === 'tenant' ? 'home' : 'business'} 
              size={48} 
              color="#2196F3" 
            />
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.description}>{getDescription()}</Text>
          </View>

          {targetRole === 'tenant' ? (
            <TenantPreferencesScreen
              onComplete={handlePreferencesComplete}
              onSkip={onSkip}
            />
          ) : (
            <LandlordPreferencesScreen
              onComplete={handlePreferencesComplete}
              onSkip={onSkip}
            />
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.completionContainer}>
        <MaterialIcons 
          name="check-circle" 
          size={80} 
          color="#4CAF50" 
        />
        <Text style={styles.completionTitle}>Perfetto!</Text>
        <Text style={styles.completionDescription}>
          {targetRole === 'tenant' 
            ? 'Le tue preferenze da inquilino sono state salvate. Ora puoi iniziare a cercare la casa perfetta!'
            : 'Le tue preferenze da proprietario sono state salvate. Ora puoi iniziare a cercare i tenant ideali!'
          }
        </Text>
        
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.completeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.completeButtonText}>
              {targetRole === 'tenant' ? 'Inizia a cercare' : 'Inizia a cercare tenant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 16,
  },
  completionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  completeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completeButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});



