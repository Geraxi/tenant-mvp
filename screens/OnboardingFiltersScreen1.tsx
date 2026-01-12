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

interface OnboardingFiltersScreen1Props {
  onNext: (filters: any) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  initialData?: any;
}

export default function OnboardingFiltersScreen1({
  onNext,
  onBack,
  step,
  totalSteps,
  initialData = {},
}: OnboardingFiltersScreen1Props) {
  const searchType = initialData.searchType || 'accommodation';
  const [location, setLocation] = useState(initialData.location || '');
  const [priceRange, setPriceRange] = useState(initialData.priceRange || { min: 250, max: 750 });
  const [propertyType, setPropertyType] = useState<'single' | 'double' | 'apartment'>(initialData.propertyType || 'single');

  const handleNext = () => {
    onNext({
      searchType,
      location: location.trim(),
      priceRange,
      propertyType,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <ScrollView 
          style={styles.cardsContainer}
          contentContainerStyle={styles.cardsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Location Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Dove vuoi cercare?</Text>
            <View style={styles.searchBar}>
              <View style={styles.searchIconContainer}>
                <MaterialIcons name="location-on" size={20} color="#2196F3" />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Città, quartiere, indirizzo"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Price Range Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Budget mensile</Text>
            <View style={styles.priceDisplay}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Min</Text>
                <Text style={styles.priceValue}>{priceRange.min}€</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Max</Text>
                <Text style={styles.priceValue}>{priceRange.max}€</Text>
              </View>
            </View>
            <View style={styles.sliderContainer} pointerEvents="box-none">
              <RangeSlider
                label=""
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
          </View>

          {/* Property Type Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tipo di alloggio</Text>
            <View style={styles.propertyTypeContainer}>
              <TouchableOpacity
                style={[styles.propertyCard, propertyType === 'single' && styles.propertyCardActive]}
                onPress={() => setPropertyType('single')}
                activeOpacity={0.7}
              >
                <View style={[styles.propertyIconContainer, propertyType === 'single' && styles.propertyIconContainerActive]}>
                  <MaterialIcons 
                    name="bed" 
                    size={22} 
                    color={propertyType === 'single' ? '#FFFFFF' : '#2196F3'} 
                  />
                </View>
                <Text style={[styles.propertyText, propertyType === 'single' && styles.propertyTextActive]}>
                  Singola
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.propertyCard, propertyType === 'double' && styles.propertyCardActive]}
                onPress={() => setPropertyType('double')}
                activeOpacity={0.7}
              >
                <View style={[styles.propertyIconContainer, propertyType === 'double' && styles.propertyIconContainerActive]}>
                  <MaterialIcons 
                    name="hotel" 
                    size={22} 
                    color={propertyType === 'double' ? '#FFFFFF' : '#2196F3'} 
                  />
                </View>
                <Text style={[styles.propertyText, propertyType === 'double' && styles.propertyTextActive]}>
                  Doppia
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.propertyCard, propertyType === 'apartment' && styles.propertyCardActive]}
                onPress={() => setPropertyType('apartment')}
                activeOpacity={0.7}
              >
                <View style={[styles.propertyIconContainer, propertyType === 'apartment' && styles.propertyIconContainerActive]}>
                  <MaterialIcons 
                    name="apartment" 
                    size={22} 
                    color={propertyType === 'apartment' ? '#FFFFFF' : '#2196F3'} 
                  />
                </View>
                <Text style={[styles.propertyText, propertyType === 'apartment' && styles.propertyTextActive]}>
                  Appartamento
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

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
              <Text style={styles.buttonText}>Continua</Text>
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
    paddingVertical: 10,
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
    paddingTop: 12,
    backgroundColor: '#F5F7FA',
  },
  cardsContainer: {
    flex: 1,
  },
  cardsContent: {
    paddingBottom: 12,
  },
  buttonContainer: {
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F5F7FA',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchIconContainer: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  priceDisplay: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  priceBox: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2196F3',
  },
  priceDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  sliderContainer: {
    marginTop: 4,
  },
  propertyTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  propertyCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  propertyCardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyIconContainerActive: {
    backgroundColor: '#2196F3',
  },
  propertyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  propertyTextActive: {
    color: '#2196F3',
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
