import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RoommatePreferencesSummaryScreenProps {
  onComplete: (summary: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  preferences: any;
}

export default function RoommatePreferencesSummaryScreen({
  onComplete,
  onBack,
  step,
  totalSteps,
  preferences,
}: RoommatePreferencesSummaryScreenProps) {
  const [budget, setBudget] = useState<string>(preferences.budget || '');
  const [note, setNote] = useState<string>(preferences.note || '');

  const handleComplete = () => {
    onComplete({
      ...preferences,
      budget,
      note,
    });
  };

  const progressPercentage = (step / totalSteps) * 100;

  const getHabitLabel = (habit: string) => {
    const labels: Record<string, string> = {
      smoker: 'Fumatore',
      pets: 'Animali domestici',
      nightowl: 'Notturno',
    };
    return labels[habit] || habit;
  };

  const getLifestyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      sociable: 'Socievole',
      quiet: 'Tranquillo',
      student: 'Studente',
      worker: 'Lavoratore',
      tidy: 'Ordinato',
      sporty: 'Sportivo',
    };
    return labels[style] || style;
  };

  const getHoursLabel = (hours: string) => {
    const labels: Record<string, string> = {
      earlybird: 'Mattiniero',
      nightowl: 'Notturno',
    };
    return labels[hours] || hours;
  };

  const getGuestFrequencyLabel = (freq: string) => {
    const labels: Record<string, string> = {
      often: 'Spesso',
      sometimes: 'A volte',
      rarely: 'Raramente',
    };
    return labels[freq] || freq;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Preferenze Chiave: Coinquilino</Text>
          <Text style={styles.headerSubtitle}>Riepilogo Preferenze</Text>
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
        {/* Review Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rivedi le tue scelte</Text>
          <View style={styles.reviewContainer}>
            {/* Age Range */}
            <View style={styles.reviewItem}>
              <MaterialIcons name="person" size={20} color="#2196F3" />
              <Text style={styles.reviewText}>
                Età: {preferences.ageRange?.min || 18}-{preferences.ageRange?.max || 35} anni
              </Text>
            </View>

            {/* Habits */}
            {preferences.habits && preferences.habits.length > 0 && (
              <View style={styles.reviewItem}>
                <MaterialIcons name="smoking-rooms" size={20} color="#2196F3" />
                <Text style={styles.reviewText}>
                  Abitudini: {preferences.habits.map((h: string) => getHabitLabel(h)).join(', ')}
                </Text>
              </View>
            )}

            {/* Lifestyle */}
            {preferences.lifestyle && preferences.lifestyle.length > 0 && (
              <View style={styles.reviewItem}>
                <MaterialIcons name="business-center" size={20} color="#2196F3" />
                <View style={styles.lifestyleReview}>
                  <Text style={styles.reviewText}>Stile di vita:</Text>
                  <View style={styles.lifestyleTags}>
                    {preferences.lifestyle.map((l: string) => (
                      <View key={l} style={styles.lifestyleTag}>
                        <Text style={styles.lifestyleTagText}>{getLifestyleLabel(l)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Preferred Hours */}
            {preferences.preferredHours && (
              <View style={styles.reviewItem}>
                <MaterialIcons name="access-time" size={20} color="#2196F3" />
                <Text style={styles.reviewText}>
                  Orari: {getHoursLabel(preferences.preferredHours)}
                </Text>
              </View>
            )}

            {/* Guest Frequency */}
            {preferences.guestFrequency && (
              <View style={styles.reviewItem}>
                <MaterialIcons name="group" size={20} color="#2196F3" />
                <Text style={styles.reviewText}>
                  Ospiti: {getGuestFrequencyLabel(preferences.guestFrequency)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Budget coinquilino</Text>
          <View style={styles.budgetContainer}>
            <Text style={styles.budgetPrefix}>€</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              placeholder="1650"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.budgetSuffix}>/ 1650€</Text>
          </View>
        </View>

        {/* Optional Note */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aggiungi una nota (opzionale)</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Scrivi una breve nota sul tuo coinquilino ideale..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
        </View>
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Completa Preferenze</Text>
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
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  reviewText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  lifestyleReview: {
    flex: 1,
  },
  lifestyleTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  lifestyleTag: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  lifestyleTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  budgetPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  budgetSuffix: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  completeButton: {
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

