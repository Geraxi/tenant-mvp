import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RangeSlider from '../components/RangeSlider';

interface OnboardingFiltersScreenProps {
  onNext: (filters: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
}

export default function OnboardingFiltersScreen({
  onNext,
  onBack,
  step,
  totalSteps,
}: OnboardingFiltersScreenProps) {
  const [searchType, setSearchType] = useState<'accommodation' | 'roommate'>('accommodation');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 250, max: 750 });
  const [propertyType, setPropertyType] = useState<'single' | 'double' | 'apartment'>('single');
  const [numRooms, setNumRooms] = useState(3);
  const [services, setServices] = useState({
    wifi: true,
    parking: false,
    airConditioning: true,
    balcony: true,
    petsAllowed: true,
    furnished: false,
  });
  const [roommateAgeRange, setRoommateAgeRange] = useState({ min: 22, max: 35 });
  const [habits, setHabits] = useState<string[]>([]);

  const habitOptions = ['Fumatore', 'Studente', 'Lavoratore', 'Notturno', 'Diurno'];

  const toggleHabit = (habit: string) => {
    if (habits.includes(habit)) {
      setHabits(habits.filter(h => h !== habit));
    } else {
      setHabits([...habits, habit]);
    }
  };

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNext = () => {
    onNext({
      searchType,
      location: location.trim(),
      priceRange,
      propertyType,
      numRooms,
      services,
      roommateAgeRange,
      habits,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filtri di Ricerca</Text>
        <TouchableOpacity onPress={() => {
          setLocation('');
          setPriceRange({ min: 250, max: 750 });
          setPropertyType('single');
          setNumRooms(3);
          setServices({
            wifi: false,
            parking: false,
            airConditioning: false,
            balcony: false,
            petsAllowed: false,
            furnished: false,
          });
          setRoommateAgeRange({ min: 22, max: 35 });
          setHabits([]);
        }}>
          <Text style={styles.resetText}>Azzera</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Search Type */}
        <View style={styles.section}>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, searchType === 'accommodation' && styles.segmentActive]}
              onPress={() => setSearchType('accommodation')}
            >
              <Text style={[styles.segmentText, searchType === 'accommodation' && styles.segmentTextActive]}>
                Cerca Alloggio
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, searchType === 'roommate' && styles.segmentActive]}
              onPress={() => setSearchType('roommate')}
            >
              <Text style={[styles.segmentText, searchType === 'roommate' && styles.segmentTextActive]}>
                Cerca Coinquilino
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Città, quartiere, indirizzo"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Price Range */}
        <View style={styles.section}>
          <RangeSlider
            label="Prezzo"
            minValue={0}
            maxValue={2000}
            currentMin={priceRange.min}
            currentMax={priceRange.max}
            step={50}
            unit="€"
            onMinChange={(value) => setPriceRange(prev => ({ ...prev, min: value }))}
            onMaxChange={(value) => setPriceRange(prev => ({ ...prev, max: value }))}
          />
        </View>

        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tipologia</Text>
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[styles.segment, propertyType === 'single' && styles.segmentActive]}
              onPress={() => setPropertyType('single')}
            >
              <Text style={[styles.segmentText, propertyType === 'single' && styles.segmentTextActive]}>
                Singola
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, propertyType === 'double' && styles.segmentActive]}
              onPress={() => setPropertyType('double')}
            >
              <Text style={[styles.segmentText, propertyType === 'double' && styles.segmentTextActive]}>
                Doppia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segment, propertyType === 'apartment' && styles.segmentActive]}
              onPress={() => setPropertyType('apartment')}
            >
              <Text style={[styles.segmentText, propertyType === 'apartment' && styles.segmentTextActive]}>
                Appartamento
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Number of Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Numero di stanze</Text>
          <View style={styles.stepperContainer}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setNumRooms(Math.max(1, numRooms - 1))}
            >
              <MaterialIcons name="remove" size={20} color="#2196F3" />
            </TouchableOpacity>
            <View style={styles.stepperValueContainer}>
              <Text style={styles.stepperValue}>{numRooms}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setNumRooms(numRooms + 1)}
            >
              <MaterialIcons name="add" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servizi</Text>
          <View style={styles.servicesCard}>
            <View style={styles.servicesGrid}>
              {Object.entries(services).map(([key, value]) => (
                <View key={key} style={styles.serviceItemGrid}>
                  <Text style={styles.serviceLabel}>
                    {key === 'wifi' ? 'Wi-Fi' :
                     key === 'parking' ? 'Parcheggio' :
                     key === 'airConditioning' ? 'AC' :
                     key === 'balcony' ? 'Balcone' :
                     key === 'petsAllowed' ? 'Pet' :
                     'Arredato'}
                  </Text>
                  <Switch
                    value={value}
                    onValueChange={() => toggleService(key as keyof typeof services)}
                    trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                    thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
                  />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Roommate Age Range */}
        {searchType === 'roommate' && (
          <View style={styles.section}>
            <RangeSlider
              label="Età coinquilino"
              minValue={18}
              maxValue={60}
              currentMin={roommateAgeRange.min}
              currentMax={roommateAgeRange.max}
              step={1}
              unit=" anni"
              onMinChange={(value) => setRoommateAgeRange(prev => ({ ...prev, min: value }))}
              onMaxChange={(value) => setRoommateAgeRange(prev => ({ ...prev, max: value }))}
            />
          </View>
        )}

        {/* Habits */}
        {searchType === 'roommate' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Abitudini</Text>
            <View style={styles.habitsContainer}>
              {habitOptions.map((habit) => (
                <TouchableOpacity
                  key={habit}
                  style={[
                    styles.habitTag,
                    habits.includes(habit) && styles.habitTagActive
                  ]}
                  onPress={() => toggleHabit(habit)}
                >
                  <Text style={[
                    styles.habitText,
                    habits.includes(habit) && styles.habitTextActive
                  ]}>
                    {habit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Results Button */}
        <TouchableOpacity style={styles.resultsButton} onPress={handleNext}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Mostra risultati</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  resetText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1A1A1A',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 7,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: '#2196F3',
  },
  segmentText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepperValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  servicesCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItemGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '48%',
    paddingVertical: 6,
    marginBottom: 4,
  },
  serviceLabel: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  habitTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  habitTagActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  habitText: {
    fontSize: 12,
    color: '#666',
  },
  habitTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  resultsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

