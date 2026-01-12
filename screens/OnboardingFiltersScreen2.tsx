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
import { premiumTheme } from '../styles/premiumTheme';

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
          <MaterialIcons name="arrow-back" size={22} color={premiumTheme.colors.ink} />
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
              <MaterialIcons name="remove" size={24} color={premiumTheme.colors.accent} />
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
              <MaterialIcons name="add" size={24} color={premiumTheme.colors.accent} />
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
                      color={value ? '#FFFFFF' : premiumTheme.colors.inkMuted} 
                    />
                  </View>
                  <Text style={[styles.serviceLabel, value && styles.serviceLabelActive]}>
                    {getServiceLabel(key)}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => toggleService(key as keyof typeof services)}
                  trackColor={{ false: premiumTheme.colors.border, true: premiumTheme.colors.accent }}
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
              colors={premiumTheme.gradients.cta}
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
    backgroundColor: premiumTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: premiumTheme.colors.background,
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
    color: premiumTheme.colors.ink,
    fontFamily: premiumTheme.typography.display,
  },
  headerSubtitle: {
    fontSize: 13,
    color: premiumTheme.colors.inkMuted,
    marginTop: 2,
    fontFamily: premiumTheme.typography.body,
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
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.card,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
    ...premiumTheme.shadows.card,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: premiumTheme.colors.ink,
    marginBottom: 10,
    fontFamily: premiumTheme.typography.display,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderRadius: premiumTheme.radii.input,
    padding: 10,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumTheme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumTheme.colors.accent,
    shadowColor: premiumTheme.colors.accent,
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
    color: premiumTheme.colors.ink,
    fontFamily: premiumTheme.typography.display,
  },
  stepperLabel: {
    fontSize: 13,
    color: premiumTheme.colors.inkMuted,
    fontWeight: '500',
    marginTop: 2,
    fontFamily: premiumTheme.typography.body,
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
    borderBottomColor: premiumTheme.colors.border,
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
    backgroundColor: premiumTheme.colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceIconContainerActive: {
    backgroundColor: premiumTheme.colors.accent,
  },
  serviceLabel: {
    fontSize: 15,
    color: premiumTheme.colors.inkMuted,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  serviceLabelActive: {
    color: premiumTheme.colors.ink,
    fontWeight: '600',
  },
  ageDisplay: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  ageBox: {
    flex: 1,
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderRadius: premiumTheme.radii.input,
    padding: 12,
    alignItems: 'center',
  },
  ageLabel: {
    fontSize: 11,
    color: premiumTheme.colors.inkMuted,
    marginBottom: 6,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  ageValue: {
    fontSize: 20,
    fontWeight: '700',
    color: premiumTheme.colors.accent,
    fontFamily: premiumTheme.typography.display,
  },
  ageDivider: {
    width: 1,
    backgroundColor: premiumTheme.colors.border,
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
    borderRadius: premiumTheme.radii.pill,
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
  },
  habitTagActive: {
    backgroundColor: premiumTheme.colors.accent,
    borderColor: premiumTheme.colors.accent,
    shadowColor: premiumTheme.colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  habitText: {
    fontSize: 14,
    color: premiumTheme.colors.inkMuted,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  habitTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  continueButton: {
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
    marginTop: 4,
    ...premiumTheme.shadows.lift,
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
    fontFamily: premiumTheme.typography.body,
  },
});
