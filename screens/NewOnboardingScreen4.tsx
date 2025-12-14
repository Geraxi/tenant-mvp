import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RangeSlider from '../components/RangeSlider';

interface NewOnboardingScreen4Props {
  onNext: (preferences: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function NewOnboardingScreen4({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: NewOnboardingScreen4Props) {
  const [priceRange, setPriceRange] = useState(initialData.priceRange || { min: 300, max: 1125 });
  const [bedrooms, setBedrooms] = useState(initialData.bedrooms || 2);
  const [bathrooms, setBathrooms] = useState(initialData.bathrooms || 1);
  const [propertyType, setPropertyType] = useState<'apartment' | 'room' | 'house'>(initialData.propertyType || 'apartment');
  const [city, setCity] = useState(initialData.city || '');

  const handleNext = () => {
    onNext({
      priceRange,
      bedrooms,
      bathrooms,
      propertyType,
      city: city.trim(),
    });
  };

  // Screen 4 shows 3/7 in the design
  const displayStep = 3;
  const progressPercentage = (displayStep / totalSteps) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{displayStep}/{totalSteps}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Preferenze Alloggio</Text>
        <Text style={styles.sectionSubtitle}>Filtri Essenziali</Text>

        {/* Price Range */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fascia di Prezzo</Text>
          <View style={styles.priceDisplay}>
            <Text style={styles.priceText}>€{priceRange.min} - €{priceRange.max}</Text>
          </View>
          <View style={styles.sliderContainer} pointerEvents="box-none">
            <RangeSlider
              label=""
              minValue={300}
              maxValue={1500}
              currentMin={priceRange.min}
              currentMax={priceRange.max}
              step={50}
              unit="€"
              onMinChange={(value) => setPriceRange(prev => ({ ...prev, min: value }))}
              onMaxChange={(value) => setPriceRange(prev => ({ ...prev, max: value }))}
            />
          </View>
        </View>

        {/* Bedrooms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Camere da Letto</Text>
          <View style={styles.optionsRow}>
            {['1', '2', '3', '4+'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, bedrooms.toString() === option && styles.optionButtonActive]}
                onPress={() => setBedrooms(option === '4+' ? 4 : parseInt(option))}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionButtonText, bedrooms.toString() === option && styles.optionButtonTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bathrooms */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bagni</Text>
          <View style={styles.optionsRow}>
            {['1', '2', '3+'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.optionButton, bathrooms.toString() === option && styles.optionButtonActive]}
                onPress={() => setBathrooms(option === '3+' ? 3 : parseInt(option))}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionButtonText, bathrooms.toString() === option && styles.optionButtonTextActive]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Property Type */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tipo di Proprietà</Text>
          <View style={styles.propertyTypeContainer}>
            <TouchableOpacity
              style={[styles.propertyTypeCard, propertyType === 'apartment' && styles.propertyTypeCardActive]}
              onPress={() => setPropertyType('apartment')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="apartment" size={32} color={propertyType === 'apartment' ? '#FFFFFF' : '#2196F3'} />
              <Text style={[styles.propertyTypeText, propertyType === 'apartment' && styles.propertyTypeTextActive]}>
                Appartamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyTypeCard, propertyType === 'room' && styles.propertyTypeCardActive]}
              onPress={() => setPropertyType('room')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="bed" size={32} color={propertyType === 'room' ? '#FFFFFF' : '#2196F3'} />
              <Text style={[styles.propertyTypeText, propertyType === 'room' && styles.propertyTypeTextActive]}>
                Stanza
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.propertyTypeCard, propertyType === 'house' && styles.propertyTypeCardActive]}
              onPress={() => setPropertyType('house')}
              activeOpacity={0.7}
            >
              <MaterialIcons name="home" size={32} color={propertyType === 'house' ? '#FFFFFF' : '#2196F3'} />
              <Text style={[styles.propertyTypeText, propertyType === 'house' && styles.propertyTypeTextActive]}>
                Casa
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* City/Zone */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Città / Zona</Text>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Es. Milano, Porta Romana"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#999"
            />
          </View>
        </View>
      </ScrollView>

      {/* Next Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
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
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
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
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  priceDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
  },
  sliderContainer: {
    marginTop: 8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  propertyTypeCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
    justifyContent: 'center',
  },
  propertyTypeCardActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  propertyTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  propertyTypeTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
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

