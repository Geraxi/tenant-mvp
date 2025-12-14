import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RoommatePreferencesScreen2Props {
  onNext: (preferences: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function RoommatePreferencesScreen2({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: RoommatePreferencesScreen2Props) {
  const [preferredHours, setPreferredHours] = useState<string>(initialData.preferredHours || 'nightowl');
  const [guestFrequency, setGuestFrequency] = useState<string>(initialData.guestFrequency || 'often');
  const [sharedKitchen, setSharedKitchen] = useState<boolean>(initialData.sharedKitchen || false);
  const [separateKitchen, setSeparateKitchen] = useState<boolean>(initialData.separateKitchen || true);

  const handleNext = () => {
    onNext({
      preferredHours,
      guestFrequency,
      sharedKitchen,
      separateKitchen,
    });
  };

  const progressPercentage = (step / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Preferenze Chiave: Coinquilino</Text>
          <Text style={styles.headerSubtitle}>Le tue preferenze</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Passo {step} di {totalSteps}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferred Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orari preferiti</Text>
          <View style={styles.hoursContainer}>
            <TouchableOpacity
              style={[styles.hourButton, preferredHours === 'earlybird' && styles.hourButtonActive]}
              onPress={() => setPreferredHours('earlybird')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="wb-sunny" 
                size={28} 
                color={preferredHours === 'earlybird' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.hourText, preferredHours === 'earlybird' && styles.hourTextActive]}>
                Mattiniero
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hourButton, preferredHours === 'nightowl' && styles.hourButtonActive]}
              onPress={() => setPreferredHours('nightowl')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="nightlight-round" 
                size={28} 
                color={preferredHours === 'nightowl' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.hourText, preferredHours === 'nightowl' && styles.hourTextActive]}>
                Notturno
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Guest Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequenza ospiti</Text>
          <View style={styles.guestContainer}>
            <TouchableOpacity
              style={[styles.guestButton, guestFrequency === 'often' && styles.guestButtonActive]}
              onPress={() => setGuestFrequency('often')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="group" 
                size={28} 
                color={guestFrequency === 'often' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.guestText, guestFrequency === 'often' && styles.guestTextActive]}>
                Spesso
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.guestButton, guestFrequency === 'sometimes' && styles.guestButtonActive]}
              onPress={() => setGuestFrequency('sometimes')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="person" 
                size={28} 
                color={guestFrequency === 'sometimes' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.guestText, guestFrequency === 'sometimes' && styles.guestTextActive]}>
                A volte
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.guestButton, guestFrequency === 'rarely' && styles.guestButtonActive]}
              onPress={() => setGuestFrequency('rarely')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="person-off" 
                size={28} 
                color={guestFrequency === 'rarely' ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.guestText, guestFrequency === 'rarely' && styles.guestTextActive]}>
                Raramente
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Kitchen Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferenze di cucina</Text>
          <View style={styles.kitchenContainer}>
            <View style={styles.kitchenOption}>
              <View style={styles.kitchenOptionContent}>
                <Text style={styles.kitchenOptionTitle}>Cucina condivisa</Text>
                <Text style={styles.kitchenOptionSubtitle}>
                  Pasti preparati e mangiati insieme
                </Text>
              </View>
              <Switch
                value={sharedKitchen}
                onValueChange={(value) => {
                  setSharedKitchen(value);
                  if (value) setSeparateKitchen(false);
                }}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
              />
            </View>
            <View style={styles.kitchenOption}>
              <View style={styles.kitchenOptionContent}>
                <Text style={styles.kitchenOptionTitle}>Cucina separata</Text>
                <Text style={styles.kitchenOptionSubtitle}>
                  Ognuno cucina per sé
                </Text>
              </View>
              <Switch
                value={separateKitchen}
                onValueChange={(value) => {
                  setSeparateKitchen(value);
                  if (value) setSharedKitchen(false);
                }}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Salva e Continua</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 32,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  hourButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 100,
    justifyContent: 'center',
  },
  hourButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  hourText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  hourTextActive: {
    color: '#FFFFFF',
  },
  guestContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  guestButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 100,
    justifyContent: 'center',
  },
  guestButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  guestText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  guestTextActive: {
    color: '#FFFFFF',
  },
  kitchenContainer: {
    gap: 16,
  },
  kitchenOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  kitchenOptionContent: {
    flex: 1,
    marginRight: 16,
  },
  kitchenOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  kitchenOptionSubtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  continueButton: {
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

