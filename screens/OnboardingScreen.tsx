import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserType } from '../types';
import Logo from '../components/Logo';

interface OnboardingScreenProps {
  onComplete: (userType: UserType) => void;
  onBack?: () => void;
}

export default function OnboardingScreen({ onComplete, onBack }: OnboardingScreenProps) {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  const handleContinue = () => {
    if (selectedType) {
      onComplete(selectedType);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.header}>
          <Logo size="large" showBackground={false} />
          <Text style={styles.title}>Scegli il tuo ruolo</Text>
          <Text style={styles.subtitle}>Come vuoi utilizzare l'app?</Text>
        </View>
        
        <View style={styles.typesContainer}>
          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'tenant' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('tenant')}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="home" 
                size={24} 
                color="#3F51B5" 
              />
              <MaterialIcons 
                name="keyboard-arrow-up" 
                size={16} 
                color="#3F51B5" 
                style={styles.arrowIcon}
              />
            </View>
            <Text style={[
              styles.typeTitle,
              selectedType === 'tenant' && styles.typeTitleSelected,
            ]}>
              Inquilino
            </Text>
            <Text style={[
              styles.typeDescription,
              selectedType === 'tenant' && styles.typeDescriptionSelected,
            ]}>
              Cerco una casa in affitto - Vedrò annunci di proprietari
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'homeowner' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('homeowner')}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="vpn-key" 
                size={24} 
                color="#fff" 
              />
            </View>
            <Text style={[
              styles.typeTitle,
              selectedType === 'homeowner' && styles.typeTitleSelected,
            ]}>
              Proprietario
            </Text>
            <Text style={[
              styles.typeDescription,
              selectedType === 'homeowner' && styles.typeDescriptionSelected,
            ]}>
              Affitto la mia proprietà - Vedrò profili di inquilini
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'roommate' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('roommate')}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons 
                name="people" 
                size={24} 
                color="#fff" 
              />
            </View>
            <Text style={[
              styles.typeTitle,
              selectedType === 'roommate' && styles.typeTitleSelected,
            ]}>
              Coinquilino
            </Text>
            <Text style={[
              styles.typeDescription,
              selectedType === 'roommate' && styles.typeDescriptionSelected,
            ]}>
              Cerco coinquilini - Vedrò altri che cercano coinquilini
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
          >
            <Text style={styles.continueButtonText}>Continua</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Indietro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F51B5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 20,
  },
  typesContainer: {
    gap: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  typeCardSelected: {
    backgroundColor: '#4A63D0',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  arrowIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3F51B5',
    marginBottom: 8,
    textAlign: 'center',
  },
  typeTitleSelected: {
    color: '#fff',
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  typeDescriptionSelected: {
    color: '#fff',
  },
  buttonsContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 16,
    width: '100%',
    maxWidth: 200,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
  continueButtonText: {
    color: '#3F51B5',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
