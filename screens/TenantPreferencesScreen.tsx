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

interface TenantPreferencesScreenProps {
  onComplete: (preferences: any) => void;
  onSkip: () => void;
}

interface PropertyPreferences {
  budget: {
    min: number;
    max: number;
  };
  propertyType: string[];
  bedrooms: number[];
  bathrooms: number[];
  furnished: boolean | null;
  petFriendly: boolean | null;
  parking: boolean | null;
  balcony: boolean | null;
  garden: boolean | null;
  elevator: boolean | null;
  energyClass: string[];
  location: string[];
  amenities: string[];
}

export default function TenantPreferencesScreen({ onComplete, onSkip }: TenantPreferencesScreenProps) {
  const [preferences, setPreferences] = useState<PropertyPreferences>({
    budget: { min: 500, max: 2000 },
    propertyType: [],
    bedrooms: [],
    bathrooms: [],
    furnished: null,
    petFriendly: null,
    parking: null,
    balcony: null,
    garden: null,
    elevator: null,
    energyClass: [],
    location: [],
    amenities: [],
  });

  const propertyTypes = [
    { id: 'appartamento', label: 'Appartamento', icon: 'apartment' },
    { id: 'casa', label: 'Casa', icon: 'home' },
    { id: 'monolocale', label: 'Monolocale', icon: 'single-bed' },
    { id: 'bilo', label: 'Bilocale', icon: 'bed' },
    { id: 'trilocale', label: 'Trilocale', icon: 'king-bed' },
    { id: 'quadrilocale', label: 'Quadrilocale', icon: 'hotel' },
  ];

  const bedroomOptions = [1, 2, 3, 4, 5];
  const bathroomOptions = [1, 2, 3, 4];
  const energyClasses = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'];
  const amenities = [
    'Wi-Fi', 'Aria Condizionata', 'Riscaldamento', 'Lavatrice', 
    'Dishwasher', 'TV', 'Balcone', 'Terrazza', 'Giardino', 
    'Cantina', 'Soffitta', 'Ascensore', 'Portiere', 'Videocitofono'
  ];

  const locations = [
    'Centro', 'Zona Universitaria', 'Zona Residenziale', 'Vicino Metro',
    'Vicino Stazione', 'Zona Commerciale', 'Zona Verde', 'Periferia'
  ];

  const toggleArray = (array: any[], value: any) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    } else {
      return [...array, value];
    }
  };

  const handleComplete = () => {
    if (preferences.propertyType.length === 0) {
      Alert.alert('Attenzione', 'Seleziona almeno un tipo di immobile');
      return;
    }
    onComplete(preferences);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Tipo di Immobile</Text>
        <View style={styles.optionsGrid}>
          {propertyTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                preferences.propertyType.includes(type.id) && styles.optionCardSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                propertyType: toggleArray(prev.propertyType, type.id)
              }))}
            >
              <MaterialIcons 
                name={type.icon as any} 
                size={24} 
                color={preferences.propertyType.includes(type.id) ? '#2196F3' : '#666'} 
              />
              <Text style={[
                styles.optionText,
                preferences.propertyType.includes(type.id) && styles.optionTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <RangeSlider
          label="Budget Mensile"
          minValue={300}
          maxValue={5000}
          currentMin={preferences.budget.min}
          currentMax={preferences.budget.max}
          step={50}
          unit=" €"
          onMinChange={(value) => setPreferences(prev => ({
            ...prev,
            budget: { ...prev.budget, min: value }
          }))}
          onMaxChange={(value) => setPreferences(prev => ({
            ...prev,
            budget: { ...prev.budget, max: value }
          }))}
        />

        <Text style={styles.sectionTitle}>Camere da Letto</Text>
        <View style={styles.optionsRow}>
          {bedroomOptions.map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                preferences.bedrooms.includes(num) && styles.optionButtonSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                bedrooms: toggleArray(prev.bedrooms, num)
              }))}
            >
              <Text style={[
                styles.optionButtonText,
                preferences.bedrooms.includes(num) && styles.optionButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Bagni</Text>
        <View style={styles.optionsRow}>
          {bathroomOptions.map((num) => (
            <TouchableOpacity
              key={num}
              style={[
                styles.optionButton,
                preferences.bathrooms.includes(num) && styles.optionButtonSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                bathrooms: toggleArray(prev.bathrooms, num)
              }))}
            >
              <Text style={[
                styles.optionButtonText,
                preferences.bathrooms.includes(num) && styles.optionButtonTextSelected
              ]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Caratteristiche</Text>
        <View style={styles.characteristicsContainer}>
          {[
            { key: 'furnished', label: 'Arredato' },
            { key: 'petFriendly', label: 'Animali Ammessi' },
            { key: 'parking', label: 'Parcheggio' },
            { key: 'balcony', label: 'Balcone' },
            { key: 'garden', label: 'Giardino' },
            { key: 'elevator', label: 'Ascensore' },
          ].map((char) => (
            <TouchableOpacity
              key={char.key}
              style={styles.characteristicRow}
              onPress={() => setPreferences(prev => ({
                ...prev,
                [char.key]: prev[char.key as keyof PropertyPreferences] === null 
                  ? true 
                  : prev[char.key as keyof PropertyPreferences] === true 
                    ? false 
                    : null
              }))}
            >
              <Text style={styles.characteristicLabel}>{char.label}</Text>
              <View style={styles.characteristicOptions}>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof PropertyPreferences] === true && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: true
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof PropertyPreferences] === true && styles.characteristicOptionTextSelected
                  ]}>
                    Sì
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof PropertyPreferences] === false && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: false
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof PropertyPreferences] === false && styles.characteristicOptionTextSelected
                  ]}>
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.characteristicOption,
                    preferences[char.key as keyof PropertyPreferences] === null && styles.characteristicOptionSelected
                  ]}
                  onPress={() => setPreferences(prev => ({
                    ...prev,
                    [char.key]: null
                  }))}
                >
                  <Text style={[
                    styles.characteristicOptionText,
                    preferences[char.key as keyof PropertyPreferences] === null && styles.characteristicOptionTextSelected
                  ]}>
                    Indifferente
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Zona Preferita</Text>
        <View style={styles.optionsGrid}>
          {locations.map((location) => (
            <TouchableOpacity
              key={location}
              style={[
                styles.optionChip,
                preferences.location.includes(location) && styles.optionChipSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                location: toggleArray(prev.location, location)
              }))}
            >
              <Text style={[
                styles.optionChipText,
                preferences.location.includes(location) && styles.optionChipTextSelected
              ]}>
                {location}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Servizi Aggiuntivi</Text>
        <View style={styles.optionsGrid}>
          {amenities.map((amenity) => (
            <TouchableOpacity
              key={amenity}
              style={[
                styles.optionChip,
                preferences.amenities.includes(amenity) && styles.optionChipSelected
              ]}
              onPress={() => setPreferences(prev => ({
                ...prev,
                amenities: toggleArray(prev.amenities, amenity)
              }))}
            >
              <Text style={[
                styles.optionChipText,
                preferences.amenities.includes(amenity) && styles.optionChipTextSelected
              ]}>
                {amenity}
              </Text>
            </TouchableOpacity>
          ))}
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
  budgetContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  budgetLabel: {
    fontSize: 16,
    color: '#666',
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    width: 50,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionButtonSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  optionButtonTextSelected: {
    color: '#2196F3',
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