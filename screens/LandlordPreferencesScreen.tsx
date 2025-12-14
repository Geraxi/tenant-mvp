import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import RangeSlider from '../components/RangeSlider';

interface LandlordPreferencesScreenProps {
  onComplete: (preferences: any) => void;
  onSkip: () => void;
}

interface TenantPreferences {
  employmentStatus: string[];
  incomeRange: {
    min: number;
    max: number;
  };
  smoking: boolean | null;
  pets: boolean | null;
  deposit: boolean | null;
  references: boolean | null;
  ageRange: {
    min: number;
    max: number;
  };
  gender: string[];
  nationality: string[];
  occupation: string[];
  familyStatus: string[];
  maxOccupants: number;
  leaseDuration: string[];
}

export default function LandlordPreferencesScreen({ onComplete, onSkip }: LandlordPreferencesScreenProps) {
  const [preferences, setPreferences] = useState<TenantPreferences>({
    employmentStatus: [],
    incomeRange: { min: 1500, max: 5000 },
    smoking: null,
    pets: null,
    deposit: null,
    references: null,
    ageRange: { min: 18, max: 65 },
    gender: [],
    nationality: [],
    occupation: [],
    familyStatus: [],
    maxOccupants: 2,
    leaseDuration: [],
  });

  const employmentOptions = [
    { id: 'employed', label: 'Dipendente', icon: 'work' },
    { id: 'self-employed', label: 'Autonomo', icon: 'business-center' },
    { id: 'student', label: 'Studente', icon: 'school' },
    { id: 'retired', label: 'Pensionato', icon: 'elderly' },
    { id: 'unemployed', label: 'Disoccupato', icon: 'person-off' },
  ];

  const genderOptions = [
    { id: 'male', label: 'Uomo' },
    { id: 'female', label: 'Donna' },
    { id: 'other', label: 'Altro' },
  ];

  const nationalityOptions = [
    'Italiana', 'Europea', 'Extra-UE', 'Americana', 'Asiatica', 'Africana'
  ];

  const occupationOptions = [
    'Impiegato', 'Dirigente', 'Libero Professionista', 'Commerciante', 
    'Insegnante', 'Medico', 'Avvocato', 'Ingegnere', 'Studente', 'Altro'
  ];

  const familyStatusOptions = [
    { id: 'single', label: 'Single' },
    { id: 'couple', label: 'Coppia' },
    { id: 'family', label: 'Famiglia' },
    { id: 'roommates', label: 'Coinquilini' },
  ];

  const leaseDurationOptions = [
    { id: 'short', label: 'Breve (1-6 mesi)' },
    { id: 'medium', label: 'Medio (6-12 mesi)' },
    { id: 'long', label: 'Lungo (1+ anni)' },
  ];

  const toggleArray = (array: any[], value: any) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else {
      return [...array, value];
    }
  };

  const handleComplete = () => {
    if (preferences.employmentStatus.length === 0) {
      Alert.alert('Attenzione', 'Seleziona almeno uno stato di occupazione');
      return;
    }
    onComplete(preferences);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Stato di Occupazione</Text>
        <View style={styles.optionsGrid}>
          {employmentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                preferences.employmentStatus.includes(option.id) && styles.optionCardSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                employmentStatus: toggleArray(prev.employmentStatus, option.id)
              }))}
            >
              <MaterialIcons 
                name={option.icon as any} 
                size={24} 
                color={preferences.employmentStatus.includes(option.id) ? '#2196F3' : '#666'} 
              />
              <Text style={[
                styles.optionText,
                preferences.employmentStatus.includes(option.id) && styles.optionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <RangeSlider
          label="Fascia di Reddito Mensile"
          minValue={500}
          maxValue={10000}
          currentMin={preferences.incomeRange.min}
          currentMax={preferences.incomeRange.max}
          step={100}
          unit="€"
          onMinChange={(value) => setPreferences(prev => ({
            ...prev,
            incomeRange: { ...prev.incomeRange, min: value }
          }))}
          onMaxChange={(value) => setPreferences(prev => ({
            ...prev,
            incomeRange: { ...prev.incomeRange, max: value }
          }))}
        />

        <RangeSlider
          label="Età"
          minValue={18}
          maxValue={80}
          currentMin={preferences.ageRange.min}
          currentMax={preferences.ageRange.max}
          step={1}
          unit=" anni"
          onMinChange={(value) => setPreferences(prev => ({
            ...prev,
            ageRange: { ...prev.ageRange, min: value }
          }))}
          onMaxChange={(value) => setPreferences(prev => ({
            ...prev,
            ageRange: { ...prev.ageRange, max: value }
          }))}
        />

        <Text style={styles.sectionTitle}>Sesso</Text>
        <View style={styles.optionsRow}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionButton,
                preferences.gender.includes(option.id) && styles.optionButtonSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                gender: toggleArray(prev.gender, option.id)
              }))}
            >
              <Text style={[
                styles.optionButtonText,
                preferences.gender.includes(option.id) && styles.optionButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Nazionalità</Text>
        <View style={styles.optionsGrid}>
          {nationalityOptions.map((nationality) => (
            <TouchableOpacity
              key={nationality}
              style={[
                styles.optionChip,
                preferences.nationality.includes(nationality) && styles.optionChipSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                nationality: toggleArray(prev.nationality, nationality)
              }))}
            >
              <Text style={[
                styles.optionChipText,
                preferences.nationality.includes(nationality) && styles.optionChipTextSelected
              ]}>
                {nationality}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Professione</Text>
        <View style={styles.optionsGrid}>
          {occupationOptions.map((occupation) => (
            <TouchableOpacity
              key={occupation}
              style={[
                styles.optionChip,
                preferences.occupation.includes(occupation) && styles.optionChipSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                occupation: toggleArray(prev.occupation, occupation)
              }))}
            >
              <Text style={[
                styles.optionChipText,
                preferences.occupation.includes(occupation) && styles.optionChipTextSelected
              ]}>
                {occupation}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Stato Familiare</Text>
        <View style={styles.optionsGrid}>
          {familyStatusOptions.map((status) => (
            <TouchableOpacity
              key={status.id}
              style={[
                styles.optionCard,
                preferences.familyStatus.includes(status.id) && styles.optionCardSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                familyStatus: toggleArray(prev.familyStatus, status.id)
              }))}
            >
              <Text style={[
                styles.optionText,
                preferences.familyStatus.includes(status.id) && styles.optionTextSelected
              ]}>
                {status.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Durata Contratto</Text>
        <View style={styles.optionsGrid}>
          {leaseDurationOptions.map((duration) => (
            <TouchableOpacity
              key={duration.id}
              style={[
                styles.optionCard,
                preferences.leaseDuration.includes(duration.id) && styles.optionCardSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                leaseDuration: toggleArray(prev.leaseDuration, duration.id)
              }))}
            >
              <Text style={[
                styles.optionText,
                preferences.leaseDuration.includes(duration.id) && styles.optionTextSelected
              ]}>
                {duration.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Caratteristiche</Text>
        <View style={styles.characteristicsContainer}>
          {[
            { key: 'smoking', label: 'Fumatore' },
            { key: 'pets', label: 'Animali' },
            { key: 'deposit', label: 'Caparra' },
            { key: 'references', label: 'Referenze' },
          ].map((char) => (
            <TouchableOpacity
              key={char.key}
              style={styles.characteristicRow}
              onPress={() => setPreferences(prev => ({
                ...prev,
                [char.key]: prev[char.key as keyof TenantPreferences] === null 
                  ? true 
                  : prev[char.key as keyof TenantPreferences] === true 
                    ? false 
                    : null
              }))}
            >
              <Text style={styles.characteristicLabel}>{char.label}</Text>
              <View style={styles.characteristicOptions}>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof TenantPreferences] === true && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: true
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof TenantPreferences] === true && styles.characteristicOptionTextSelected
                  ]}>
                    Accettato
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof TenantPreferences] === false && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: false
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof TenantPreferences] === false && styles.characteristicOptionTextSelected
                  ]}>
                    Non Accettato
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof TenantPreferences] === null && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: null
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof TenantPreferences] === null && styles.characteristicOptionTextSelected
                  ]}>
                    Indifferente
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Numero Massimo Occupanti</Text>
        <View style={styles.occupantsContainer}>
          <TouchableOpacity
            style={styles.occupantButton}
            onPress={() => setPreferences(prev => ({
              ...prev,
              maxOccupants: Math.max(1, prev.maxOccupants - 1)
            }))}
          >
            <MaterialIcons name="remove" size={20} color="#666" />
          </TouchableOpacity>
          <Text style={styles.occupantValue}>{preferences.maxOccupants}</Text>
          <TouchableOpacity
            style={styles.occupantButton}
            onPress={() => setPreferences(prev => ({
              ...prev,
              maxOccupants: Math.min(10, prev.maxOccupants + 1)
            }))}
          >
            <MaterialIcons name="add" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>Salta per ora</Text>
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  optionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionChipSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionChipText: {
    fontSize: 14,
    color: '#666',
  },
  optionChipTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  characteristicsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  characteristicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  characteristicLabel: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    flexShrink: 0,
    minWidth: 80,
    marginRight: 10,
  },
  characteristicOptions: {
    flexDirection: 'row',
    gap: 4,
    flexShrink: 1,
    justifyContent: 'flex-end',
  },
  characteristicOption: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flex: 1,
    alignItems: 'center',
    maxWidth: 80,
  },
  characteristicOptionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  characteristicOptionText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  characteristicOptionTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
  occupantsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    gap: 20,
  },
  occupantButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupantValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  skipButtonText: {
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


