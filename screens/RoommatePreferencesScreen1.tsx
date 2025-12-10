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
import { LinearGradient } from 'expo-linear-gradient';
import RangeSlider from '../components/RangeSlider';

interface RoommatePreferencesScreen1Props {
  onNext: (preferences: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function RoommatePreferencesScreen1({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: RoommatePreferencesScreen1Props) {
  const [ageRange, setAgeRange] = useState(initialData.ageRange || { min: 18, max: 35 });
  const [habits, setHabits] = useState<string[]>(initialData.habits || ['smoker']);
  const [lifestyle, setLifestyle] = useState<string[]>(initialData.lifestyle || ['sociable', 'tidy']);

  const toggleHabit = (habit: string) => {
    setHabits(prev => 
      prev.includes(habit) 
        ? prev.filter(h => h !== habit)
        : [...prev, habit]
    );
  };

  const toggleLifestyle = (style: string) => {
    setLifestyle(prev => 
      prev.includes(style) 
        ? prev.filter(l => l !== style)
        : [...prev, style]
    );
  };

  const handleNext = () => {
    onNext({
      ageRange,
      habits,
      lifestyle,
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
        {/* Age Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fascia d'età preferita</Text>
          <View style={styles.sliderContainer} pointerEvents="box-none">
            <RangeSlider
              label=""
              minValue={18}
              maxValue={60}
              currentMin={ageRange.min}
              currentMax={ageRange.max}
              step={1}
              unit=""
              onMinChange={(value) => setAgeRange(prev => ({ ...prev, min: value }))}
              onMaxChange={(value) => setAgeRange(prev => ({ ...prev, max: value }))}
            />
          </View>
        </View>

        {/* Habits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abitudini principali</Text>
          <View style={styles.habitsContainer}>
            <TouchableOpacity
              style={[styles.habitButton, habits.includes('smoker') && styles.habitButtonActive]}
              onPress={() => toggleHabit('smoker')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="smoking-rooms" 
                size={24} 
                color={habits.includes('smoker') ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.habitText, habits.includes('smoker') && styles.habitTextActive]}>
                Fumatore
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.habitButton, habits.includes('pets') && styles.habitButtonActive]}
              onPress={() => toggleHabit('pets')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="pets" 
                size={24} 
                color={habits.includes('pets') ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.habitText, habits.includes('pets') && styles.habitTextActive]}>
                Animali domestici
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.habitButton, habits.includes('nightowl') && styles.habitButtonActive]}
              onPress={() => toggleHabit('nightowl')}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name="nightlight-round" 
                size={24} 
                color={habits.includes('nightowl') ? '#FFFFFF' : '#666'} 
              />
              <Text style={[styles.habitText, habits.includes('nightowl') && styles.habitTextActive]}>
                Notturno
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stile di vita ideale</Text>
          <View style={styles.lifestyleContainer}>
            {[
              { key: 'sociable', label: 'Socievole' },
              { key: 'quiet', label: 'Tranquillo' },
              { key: 'student', label: 'Studente' },
              { key: 'worker', label: 'Lavoratore' },
              { key: 'tidy', label: 'Ordinato' },
              { key: 'sporty', label: 'Sportivo' },
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[styles.lifestyleButton, lifestyle.includes(item.key) && styles.lifestyleButtonActive]}
                onPress={() => toggleLifestyle(item.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.lifestyleText, lifestyle.includes(item.key) && styles.lifestyleTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
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
  sliderContainer: {
    marginTop: 8,
  },
  habitsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  habitButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minHeight: 100,
    justifyContent: 'center',
  },
  habitButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  habitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  habitTextActive: {
    color: '#FFFFFF',
  },
  lifestyleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lifestyleButton: {
    flexBasis: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  lifestyleButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  lifestyleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  lifestyleTextActive: {
    color: '#FFFFFF',
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

