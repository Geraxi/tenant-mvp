import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NewOnboardingScreen2Props {
  onNext: (role: 'tenant' | 'landlord' | 'roommate') => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function NewOnboardingScreen2({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: NewOnboardingScreen2Props) {
  const [selectedRole, setSelectedRole] = useState<'tenant' | 'landlord' | 'roommate'>(initialData.role || 'tenant');

  const handleNext = () => {
    onNext(selectedRole);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Tu Sei?</Text>

        {/* Role Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, selectedRole === 'tenant' && styles.optionCardActive]}
            onPress={() => setSelectedRole('tenant')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, selectedRole === 'tenant' && styles.optionIconActive]}>
              <MaterialIcons name="vpn-key" size={28} color={selectedRole === 'tenant' ? '#FFFFFF' : '#2196F3'} />
            </View>
            <Text style={[styles.optionText, selectedRole === 'tenant' && styles.optionTextActive]}>
              Inquilino
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color={selectedRole === 'tenant' ? '#FFFFFF' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, selectedRole === 'landlord' && styles.optionCardActive]}
            onPress={() => setSelectedRole('landlord')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, selectedRole === 'landlord' && styles.optionIconActive]}>
              <MaterialIcons name="home" size={28} color={selectedRole === 'landlord' ? '#FFFFFF' : '#2196F3'} />
            </View>
            <Text style={[styles.optionText, selectedRole === 'landlord' && styles.optionTextActive]}>
              Proprietario
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color={selectedRole === 'landlord' ? '#FFFFFF' : '#999'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, selectedRole === 'roommate' && styles.optionCardActive]}
            onPress={() => setSelectedRole('roommate')}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, selectedRole === 'roommate' && styles.optionIconActive]}>
              <MaterialIcons name="people" size={28} color={selectedRole === 'roommate' ? '#FFFFFF' : '#2196F3'} />
            </View>
            <Text style={[styles.optionText, selectedRole === 'roommate' && styles.optionTextActive]}>
              Coinquilino
            </Text>
            <MaterialIcons name="arrow-forward" size={20} color={selectedRole === 'roommate' ? '#FFFFFF' : '#999'} />
          </TouchableOpacity>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Avanti</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionsContainer: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionIconActive: {
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#2196F3',
    width: 24,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

