import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RangeSlider from '../components/RangeSlider';

interface OnboardingFiltersScreen2Props {
  onNext: (filters: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function OnboardingFiltersScreen2({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: OnboardingFiltersScreen2Props) {
  const [numRooms, setNumRooms] = useState(initialData.numRooms || 3);
  const [services, setServices] = useState(initialData.services || {
    wifi: true,
    parking: false,
    airConditioning: true,
    balcony: true,
    petsAllowed: true,
    furnished: false,
  });
  const [roommateAgeRange, setRoommateAgeRange] = useState(initialData.roommateAgeRange || { min: 22, max: 35 });
  const [habits, setHabits] = useState<string[]>(initialData.habits || []);
  const searchType = initialData.searchType || 'accommodation';

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
      numRooms,
      services,
      roommateAgeRange,
      habits,
    });
  };

  const getServiceIcon = (key: string) => {
    switch (key) {
      case 'wifi': return 'wifi';
      case 'parking': return 'local-parking';
      case 'airConditioning': return 'ac-unit';
      case 'balcony': return 'balcony';
      case 'petsAllowed': return 'pets';
      default: return 'chair';
    }
  };

  const getServiceLabel = (key: string) => {
    switch (key) {
      case 'wifi': return 'Wi-Fi';
      case 'parking': return 'Parcheggio';
      case 'airConditioning': return 'Aria condizionata';
      case 'balcony': return 'Balcone';
      case 'petsAllowed': return 'Animali ammessi';
      default: return 'Arredato';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Filtri</Text>
          <Text style={styles.headerSubtitle}>Passo {step} di {totalSteps}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.cardsContainer}>
          {/* Number of Rooms Card */}
          <View style={styles.card}>
          <Text style={styles.cardTitle}>Numero di stanze</Text>
          <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setNumRooms(Math.max(1, numRooms - 1))}
                activeOpacity={0.7}
              >
              <MaterialIcons name="remove" size={24} color="#2196F3" />
            </TouchableOpacity>
            <View style={styles.stepperValueContainer}>
              <Text style={styles.stepperValue}>{numRooms}</Text>
              <Text style={styles.stepperLabel}>stanze</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setNumRooms(numRooms + 1)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Services Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Servizi</Text>
          <View style={styles.servicesList}>
            {Object.entries(services).map(([key, value], index) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.serviceItem,
                  index !== Object.entries(services).length - 1 && styles.serviceItemBorder
                ]}
                onPress={() => toggleService(key as keyof typeof services)}
                activeOpacity={0.7}
              >
                <View style={styles.serviceContent}>
                  <View style={[styles.serviceIconContainer, value && styles.serviceIconContainerActive]}>
                    <MaterialIcons 
                      name={getServiceIcon(key) as any}
                      size={20}
                      color={value ? '#FFFFFF' : '#999'} 
                    />
                  </View>
                  <Text style={[styles.serviceLabel, value && styles.serviceLabelActive]}>
                    {getServiceLabel(key)}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => toggleService(key as keyof typeof services)}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor={value ? '#FFFFFF' : '#F4F3F4'}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Roommate Age Range Card */}
        {searchType === 'roommate' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Età del coinquilino</Text>
            <View style={styles.ageDisplay}>
              <View style={styles.ageBox}>
                <Text style={styles.ageLabel}>Min</Text>
                <Text style={styles.ageValue}>{roommateAgeRange.min}</Text>
              </View>
              <View style={styles.ageDivider} />
              <View style={styles.ageBox}>
                <Text style={styles.ageLabel}>Max</Text>
                <Text style={styles.ageValue}>{roommateAgeRange.max}</Text>
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <RangeSlider
                label=""
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
          </View>
        )}

        {/* Habits Card */}
        {searchType === 'roommate' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Abitudini preferite</Text>
            <View style={styles.habitsContainer}>
              {habitOptions.map((habit) => (
                <TouchableOpacity
                  key={habit}
                  style={[
                    styles.habitTag,
                    habits.includes(habit) && styles.habitTagActive
                  ]}
                  onPress={() => toggleHabit(habit)}
                  activeOpacity={0.7}
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
        </View>

        {/* Continue Button - Fixed at bottom */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Mostra risultati</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  cardsContainer: {
    flex: 1,
    minHeight: 0,
  },
  buttonContainer: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperValueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  stepperValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  stepperLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginTop: 2,
  },
  servicesList: {
    gap: 0,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  serviceItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serviceIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconContainerActive: {
    backgroundColor: '#2196F3',
  },
  serviceLabel: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  serviceLabelActive: {
    color: '#1A1A1A',
    fontWeight: '600',
  },
  ageDisplay: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  ageBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  ageLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
    fontWeight: '500',
  },
  ageValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
  },
  ageDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  sliderContainer: {
    marginTop: 4,
  },
  habitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  habitTagActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  habitText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  habitTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  continueButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
