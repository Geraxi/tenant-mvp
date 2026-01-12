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
import { premiumTheme } from '../styles/premiumTheme';

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
          <MaterialIcons name="arrow-back" size={22} color={premiumTheme.colors.ink} />
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
                <MaterialIcons name="location-on" size={20} color={premiumTheme.colors.accent} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Città, quartiere, indirizzo"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={premiumTheme.colors.inkMuted}
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
                    color={propertyType === 'single' ? '#FFFFFF' : premiumTheme.colors.accent} 
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
                    color={propertyType === 'double' ? '#FFFFFF' : premiumTheme.colors.accent} 
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
                    color={propertyType === 'apartment' ? '#FFFFFF' : premiumTheme.colors.accent} 
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
              colors={premiumTheme.gradients.cta}
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
    backgroundColor: premiumTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    paddingTop: 12,
    backgroundColor: premiumTheme.colors.background,
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
    backgroundColor: premiumTheme.colors.background,
  },
  card: {
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.card,
    padding: 16,
    marginBottom: 12,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderRadius: premiumTheme.radii.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
  },
  searchIconContainer: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: premiumTheme.colors.ink,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  priceDisplay: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  priceBox: {
    flex: 1,
    backgroundColor: premiumTheme.colors.surfaceMuted,
    borderRadius: premiumTheme.radii.input,
    padding: 10,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: premiumTheme.colors.inkMuted,
    marginBottom: 4,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumTheme.colors.accent,
    fontFamily: premiumTheme.typography.display,
  },
  priceDivider: {
    width: 1,
    backgroundColor: premiumTheme.colors.border,
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
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.input,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: premiumTheme.colors.border,
  },
  propertyCardActive: {
    backgroundColor: premiumTheme.colors.accentSoft,
    borderColor: premiumTheme.colors.accent,
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: premiumTheme.colors.sky,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  propertyIconContainerActive: {
    backgroundColor: premiumTheme.colors.accent,
  },
  propertyText: {
    fontSize: 14,
    fontWeight: '600',
    color: premiumTheme.colors.inkMuted,
    textAlign: 'center',
    fontFamily: premiumTheme.typography.body,
  },
  propertyTextActive: {
    color: premiumTheme.colors.ink,
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
