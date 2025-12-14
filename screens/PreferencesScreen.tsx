import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { UserType, UserPreferences, JobType, EmploymentStatus } from '../types';
import { t } from '../utils/translations';
import Slider from '../components/Slider';
import RangeSlider from '../components/RangeSlider';

interface PreferencesScreenProps {
  userType: UserType;
  onComplete: (preferences: UserPreferences) => void;
  onBack?: () => void;
}

export default function PreferencesScreen({ userType, onComplete, onBack }: PreferencesScreenProps) {
  // Tenant preferences
  const [budget, setBudget] = useState('');
  const [petFriendly, setPetFriendly] = useState(false);
  const [smoking, setSmoking] = useState(false);
  const [childFriendlyProperties, setChildFriendlyProperties] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(false);

  // Homeowner preferences - focused on finding ideal tenant
  const [requiresEmployed, setRequiresEmployed] = useState(false);
  const [minimumIncome, setMinimumIncome] = useState('');
  const [minIncome, setMinIncome] = useState(1500);
  const [maxIncome, setMaxIncome] = useState(5000);
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [selectedEmploymentStatuses, setSelectedEmploymentStatuses] = useState<EmploymentStatus[]>([]);
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [childrenAllowed, setChildrenAllowed] = useState(false);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(65);
  const [preferredGender, setPreferredGender] = useState<'any' | 'male' | 'female'>('any');
  const [maxOccupants, setMaxOccupants] = useState(1);
  const [minLeaseDuration, setMinLeaseDuration] = useState<'any' | '3' | '6' | '12' | '24'>('any');

  const jobTypes: { value: JobType; label: string; icon: string }[] = [
    { value: 'professional', label: 'Professionista', icon: 'business-center' },
    { value: 'cabin-crew', label: 'Assistente di Volo', icon: 'flight-takeoff' },
    { value: 'pilot', label: 'Pilota', icon: 'flight' },
    { value: 'healthcare', label: 'Sanità', icon: 'local-hospital' },
    { value: 'tech', label: 'Tecnologia', icon: 'computer' },
    { value: 'finance', label: 'Finanza', icon: 'account-balance' },
    { value: 'education', label: 'Istruzione', icon: 'school' },
    { value: 'hospitality', label: 'Ospitalità', icon: 'restaurant' },
    { value: 'student', label: 'Studente', icon: 'menu-book' },
    { value: 'other', label: 'Altro', icon: 'work' },
  ];

  const employmentStatuses: { value: EmploymentStatus; label: string; icon: string }[] = [
    { value: 'employed', label: 'Dipendente', icon: 'work' },
    { value: 'self-employed', label: 'Autonomo', icon: 'business' },
    { value: 'student', label: 'Studente', icon: 'school' },
    { value: 'retired', label: 'Pensionato', icon: 'elderly' },
  ];

  const toggleJobType = (jobType: JobType) => {
    setSelectedJobTypes(prev => 
      prev.includes(jobType) 
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    );
  };

  const toggleEmploymentStatus = (status: EmploymentStatus) => {
    setSelectedEmploymentStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleContinue = () => {
    const preferences: UserPreferences = {};
    
    if (userType === 'tenant') {
      if (budget) preferences.budget = parseInt(budget);
      preferences.petFriendly = petFriendly;
      preferences.smoking = smoking;
      preferences.childFriendlyProperties = childFriendlyProperties;
      preferences.furnished = furnished;
      preferences.parkingAvailable = parkingAvailable;
    } else if (userType === 'homeowner') {
      // Tenant requirements
      preferences.requiresEmployed = requiresEmployed;
      if (minimumIncome) preferences.minimumIncome = parseInt(minimumIncome);
      preferences.acceptedJobTypes = selectedJobTypes.length > 0 ? selectedJobTypes : undefined;
      preferences.acceptedEmploymentStatuses = selectedEmploymentStatuses.length > 0 ? selectedEmploymentStatuses : undefined;
      preferences.petsAllowed = petsAllowed;
      preferences.childrenAllowed = childrenAllowed;
      preferences.smokingAllowed = smokingAllowed;
      preferences.ageRange = { min: minAge, max: maxAge };
      preferences.gender = preferredGender !== 'any' ? preferredGender : undefined;
      preferences.maxOccupants = maxOccupants;
      preferences.minLeaseDuration = minLeaseDuration !== 'any' ? minLeaseDuration : undefined;
    }
    
    onComplete(preferences);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <MaterialIcons name="arrow-back" size={28} color="#333" />
            </TouchableOpacity>
          )}
          <MaterialIcons name="tune" size={64} color="#2196F3" />
          <Text style={styles.title}>
            {userType === 'homeowner' ? 'Trova l\'Inquilino Ideale' : t('setPreferences')}
          </Text>
          <Text style={styles.subtitle}>
            {userType === 'homeowner' 
              ? 'Imposta i criteri per trovare l\'inquilino perfetto per la tua proprietà'
              : t('preferencesSubtitle')
            }
          </Text>
        </View>

        <View style={styles.form}>
          {userType === 'tenant' ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('budget')} (€)</Text>
                <TextInput
                  style={styles.input}
                  value={budget}
                  onChangeText={setBudget}
                  placeholder="1500"
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="pets" size={24} color="#2196F3" />
                  <Text style={styles.switchLabel}>{t('petFriendly')}</Text>
                </View>
                <Switch
                  value={petFriendly}
                  onValueChange={setPetFriendly}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="child-care" size={24} color="#2196F3" />
                  <Text style={styles.switchLabel}>{t('childFriendlyProperties')}</Text>
                </View>
                <Switch
                  value={childFriendlyProperties}
                  onValueChange={setChildFriendlyProperties}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="smoking-rooms" size={24} color="#2196F3" />
                  <Text style={styles.switchLabel}>{t('smoking')}</Text>
                </View>
                <Switch
                  value={smoking}
                  onValueChange={setSmoking}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="weekend" size={24} color="#2196F3" />
                  <Text style={styles.switchLabel}>{t('furnished')}</Text>
                </View>
                <Switch
                  value={furnished}
                  onValueChange={setFurnished}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.switchContainer}>
                <View style={styles.switchRow}>
                  <MaterialIcons name="local-parking" size={24} color="#2196F3" />
                  <Text style={styles.switchLabel}>{t('parkingAvailable')}</Text>
                </View>
                <Switch
                  value={parkingAvailable}
                  onValueChange={setParkingAvailable}
                  trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              </View>
            </>
          ) : (
            <>
              {/* Employment & Income Requirements */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💼 Requisiti Lavorativi</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Stato Occupazionale Accettato</Text>
                  <Text style={styles.helperText}>Seleziona uno o più stati (lascia vuoto per accettare tutti)</Text>
                  <View style={styles.chipsContainer}>
                    {employmentStatuses.map((status) => (
                      <TouchableOpacity
                        key={status.value}
                        style={[
                          styles.chip,
                          selectedEmploymentStatuses.includes(status.value) && styles.chipSelected
                        ]}
                        onPress={() => toggleEmploymentStatus(status.value)}
                      >
                        <MaterialIcons 
                          name={status.icon as any} 
                          size={18} 
                          color={selectedEmploymentStatuses.includes(status.value) ? '#fff' : '#2196F3'} 
                        />
                        <Text style={[
                          styles.chipText,
                          selectedEmploymentStatuses.includes(status.value) && styles.chipTextSelected
                        ]}>
                          {status.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Tipo di Lavoro Preferito</Text>
                  <Text style={styles.helperText}>Seleziona uno o più settori (lascia vuoto per accettare tutti)</Text>
                  <View style={styles.chipsContainer}>
                    {jobTypes.map((job) => (
                      <TouchableOpacity
                        key={job.value}
                        style={[
                          styles.chip,
                          selectedJobTypes.includes(job.value) && styles.chipSelected
                        ]}
                        onPress={() => toggleJobType(job.value)}
                      >
                        <MaterialIcons 
                          name={job.icon as any} 
                          size={18} 
                          color={selectedJobTypes.includes(job.value) ? '#fff' : '#2196F3'} 
                        />
                        <Text style={[
                          styles.chipText,
                          selectedJobTypes.includes(job.value) && styles.chipTextSelected
                        ]}>
                          {job.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <RangeSlider
                  label="Fascia di Reddito Mensile"
                  minValue={500}
                  maxValue={10000}
                  currentMin={minIncome}
                  currentMax={maxIncome}
                  step={100}
                  unit=" €"
                  onMinChange={setMinIncome}
                  onMaxChange={setMaxIncome}
                />
              </View>

              {/* Demographic Preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👥 Preferenze Demografiche</Text>
                
                <RangeSlider
                  label="Età"
                  minValue={18}
                  maxValue={65}
                  currentMin={minAge}
                  currentMax={maxAge}
                  step={1}
                  unit=" anni"
                  onMinChange={setMinAge}
                  onMaxChange={setMaxAge}
                />

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Genere Preferito</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        preferredGender === 'any' && styles.genderButtonSelected
                      ]}
                      onPress={() => setPreferredGender('any')}
                    >
                      <MaterialIcons 
                        name="people" 
                        size={24} 
                        color={preferredGender === 'any' ? '#fff' : '#2196F3'} 
                      />
                      <Text style={[
                        styles.genderButtonText,
                        preferredGender === 'any' && styles.genderButtonTextSelected
                      ]}>
                        Qualsiasi
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        preferredGender === 'male' && styles.genderButtonSelected
                      ]}
                      onPress={() => setPreferredGender('male')}
                    >
                      <MaterialIcons 
                        name="man" 
                        size={24} 
                        color={preferredGender === 'male' ? '#fff' : '#2196F3'} 
                      />
                      <Text style={[
                        styles.genderButtonText,
                        preferredGender === 'male' && styles.genderButtonTextSelected
                      ]}>
                        Uomo
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        preferredGender === 'female' && styles.genderButtonSelected
                      ]}
                      onPress={() => setPreferredGender('female')}
                    >
                      <MaterialIcons 
                        name="woman" 
                        size={24} 
                        color={preferredGender === 'female' ? '#fff' : '#2196F3'} 
                      />
                      <Text style={[
                        styles.genderButtonText,
                        preferredGender === 'female' && styles.genderButtonTextSelected
                      ]}>
                        Donna
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Slider
                  label="Numero Massimo di Occupanti"
                  value={maxOccupants}
                  minValue={1}
                  maxValue={6}
                  step={1}
                  unit=" persone"
                  onValueChange={setMaxOccupants}
                />
              </View>

              {/* Lifestyle Preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏡 Preferenze di Stile di Vita</Text>
                
                <View style={styles.switchContainer}>
                  <View style={styles.switchRow}>
                    <MaterialIcons name="pets" size={24} color="#2196F3" />
                    <Text style={styles.switchLabel}>Animali Ammessi</Text>
                  </View>
                  <Switch
                    value={petsAllowed}
                    onValueChange={setPetsAllowed}
                    trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.switchContainer}>
                  <View style={styles.switchRow}>
                    <MaterialIcons name="child-care" size={24} color="#2196F3" />
                    <Text style={styles.switchLabel}>Bambini Ammessi</Text>
                  </View>
                  <Switch
                    value={childrenAllowed}
                    onValueChange={setChildrenAllowed}
                    trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.switchContainer}>
                  <View style={styles.switchRow}>
                    <MaterialIcons name="smoking-rooms" size={24} color="#2196F3" />
                    <Text style={styles.switchLabel}>Fumatori Ammessi</Text>
                  </View>
                  <Switch
                    value={smokingAllowed}
                    onValueChange={setSmokingAllowed}
                    trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Lease Preferences */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📅 Preferenze Contratto</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Durata Minima Contratto</Text>
                  <View style={styles.durationContainer}>
                    {[
                      { value: 'any', label: 'Qualsiasi' },
                      { value: '3', label: '3 mesi' },
                      { value: '6', label: '6 mesi' },
                      { value: '12', label: '12 mesi' },
                      { value: '24', label: '24 mesi' },
                    ].map((duration) => (
                      <TouchableOpacity
                        key={duration.value}
                        style={[
                          styles.durationButton,
                          minLeaseDuration === duration.value && styles.durationButtonSelected
                        ]}
                        onPress={() => setMinLeaseDuration(duration.value as any)}
                      >
                        <Text style={[
                          styles.durationButtonText,
                          minLeaseDuration === duration.value && styles.durationButtonTextSelected
                        ]}>
                          {duration.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>{t('done')}</Text>
          <MaterialIcons name="check" size={24} color="#fff" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  genderButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  genderButtonTextSelected: {
    color: '#fff',
  },
  durationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  durationButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  durationButtonTextSelected: {
    color: '#fff',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
});