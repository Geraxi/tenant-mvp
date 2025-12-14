import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Utente, Immobile } from '../src/types';

interface HomeownerOnboardingScreenProps {
  user: Utente;
  onComplete: (preferences: any, filters: any, firstListing: Partial<Immobile>) => void;
  onBack: () => void;
}

type OnboardingStep = 'welcome' | 'preferences' | 'filters' | 'listing' | 'complete';

export default function HomeownerOnboardingScreen({
  user,
  onComplete,
  onBack,
}: HomeownerOnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [preferences, setPreferences] = useState({
    maxTenants: 2,
    minRent: 500,
    maxRent: 2000,
    preferredTenantType: 'any', // 'student', 'professional', 'family', 'any'
    smokingAllowed: false,
    petsAllowed: false,
    furnished: false,
  });
  
  const [filters, setFilters] = useState({
    ageRange: [18, 65],
    incomeMultiplier: 3, // rent should be max 1/3 of income
    creditScoreMin: 600,
    employmentRequired: true,
    referencesRequired: true,
  });

  const [firstListing, setFirstListing] = useState<Partial<Immobile>>({
    indirizzo: '',
    descrizione: '',
    tipo: 'appartamento',
    superficie: 0,
    locali: 0,
    piano: 0,
    ascensore: false,
    balcone: false,
    giardino: false,
    prezzo_affitto: 0,
    spese_condominiali: 0,
    deposito_cauzione: 0,
    disponibile_da: new Date().toISOString().split('T')[0],
  });

  const nextStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'preferences', 'filters', 'listing', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const steps: OnboardingStep[] = ['welcome', 'preferences', 'filters', 'listing', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = () => {
    if (!firstListing.indirizzo || !firstListing.descrizione || firstListing.prezzo_affitto === 0) {
      Alert.alert('Errore', 'Completa tutti i campi obbligatori per la tua prima proprietà');
      return;
    }
    onComplete(preferences, filters, firstListing);
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="home" size={80} color="#2196F3" />
      </View>
      <Text style={styles.title}>Benvenuto come Proprietario!</Text>
      <Text style={styles.subtitle}>
        Ciao {user.nome}! Ora che sei un proprietario, ti aiuteremo a configurare le tue preferenze e creare la tua prima proprietà.
      </Text>
      <Text style={styles.description}>
        Questo processo ti aiuterà a:
        {'\n'}• Configurare le tue preferenze per gli inquilini
        {'\n'}• Impostare i filtri di ricerca
        {'\n'}• Creare la tua prima proprietà
      </Text>
    </View>
  );

  const renderPreferences = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Le Tue Preferenze</Text>
      <Text style={styles.stepSubtitle}>Configura le tue preferenze per gli inquilini</Text>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numero massimo di inquilini</Text>
          <TextInput
            style={styles.input}
            value={preferences.maxTenants.toString()}
            onChangeText={(text) => setPreferences({...preferences, maxTenants: parseInt(text) || 1})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Range di affitto (€/mese)</Text>
          <View style={styles.rangeContainer}>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              placeholder="Min"
              value={preferences.minRent.toString()}
              onChangeText={(text) => setPreferences({...preferences, minRent: parseInt(text) || 0})}
              keyboardType="numeric"
            />
            <Text style={styles.rangeSeparator}>-</Text>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              placeholder="Max"
              value={preferences.maxRent.toString()}
              onChangeText={(text) => setPreferences({...preferences, maxRent: parseInt(text) || 0})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo di inquilino preferito</Text>
          <View style={styles.optionContainer}>
            {['any', 'student', 'professional', 'family'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  preferences.preferredTenantType === type && styles.optionButtonSelected
                ]}
                onPress={() => setPreferences({...preferences, preferredTenantType: type})}
              >
                <Text style={[
                  styles.optionText,
                  preferences.preferredTenantType === type && styles.optionTextSelected
                ]}>
                  {type === 'any' ? 'Qualsiasi' : type === 'student' ? 'Studente' : type === 'professional' ? 'Professionista' : 'Famiglia'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setPreferences({...preferences, smokingAllowed: !preferences.smokingAllowed})}
          >
            <MaterialIcons 
              name={preferences.smokingAllowed ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Fumatori ammessi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setPreferences({...preferences, petsAllowed: !preferences.petsAllowed})}
          >
            <MaterialIcons 
              name={preferences.petsAllowed ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Animali domestici ammessi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setPreferences({...preferences, furnished: !preferences.furnished})}
          >
            <MaterialIcons 
              name={preferences.furnished ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Arredato</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Filtri di Ricerca</Text>
      <Text style={styles.stepSubtitle}>Imposta i criteri per trovare inquilini ideali</Text>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fascia d'età</Text>
          <View style={styles.rangeContainer}>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              placeholder="Min"
              value={filters.ageRange[0].toString()}
              onChangeText={(text) => setFilters({...filters, ageRange: [parseInt(text) || 18, filters.ageRange[1]]})}
              keyboardType="numeric"
            />
            <Text style={styles.rangeSeparator}>-</Text>
            <TextInput
              style={[styles.input, styles.rangeInput]}
              placeholder="Max"
              value={filters.ageRange[1].toString()}
              onChangeText={(text) => setFilters({...filters, ageRange: [filters.ageRange[0], parseInt(text) || 65]})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Moltiplicatore di reddito</Text>
          <Text style={styles.helperText}>L'affitto dovrebbe essere al massimo 1/X del reddito</Text>
          <TextInput
            style={styles.input}
            value={filters.incomeMultiplier.toString()}
            onChangeText={(text) => setFilters({...filters, incomeMultiplier: parseInt(text) || 3})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Punteggio di credito minimo</Text>
          <TextInput
            style={styles.input}
            value={filters.creditScoreMin.toString()}
            onChangeText={(text) => setFilters({...filters, creditScoreMin: parseInt(text) || 600})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFilters({...filters, employmentRequired: !filters.employmentRequired})}
          >
            <MaterialIcons 
              name={filters.employmentRequired ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Lavoro stabile richiesto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFilters({...filters, referencesRequired: !filters.referencesRequired})}
          >
            <MaterialIcons 
              name={filters.referencesRequired ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Referenze richieste</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderListing = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>La Tua Prima Proprietà</Text>
      <Text style={styles.stepSubtitle}>Crea la tua prima proprietà da affittare</Text>
      
      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Indirizzo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Via, Città, CAP"
            value={firstListing.indirizzo}
            onChangeText={(text) => setFirstListing({...firstListing, indirizzo: text})}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrizione *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descrivi la proprietà..."
            value={firstListing.descrizione}
            onChangeText={(text) => setFirstListing({...firstListing, descrizione: text})}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo di proprietà</Text>
          <View style={styles.optionContainer}>
            {['appartamento', 'casa', 'ufficio', 'negozio'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  firstListing.tipo === type && styles.optionButtonSelected
                ]}
                onPress={() => setFirstListing({...firstListing, tipo: type as any})}
              >
                <Text style={[
                  styles.optionText,
                  firstListing.tipo === type && styles.optionTextSelected
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Superficie (m²)</Text>
          <TextInput
            style={styles.input}
            value={firstListing.superficie?.toString()}
            onChangeText={(text) => setFirstListing({...firstListing, superficie: parseInt(text) || 0})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numero di locali</Text>
          <TextInput
            style={styles.input}
            value={firstListing.locali?.toString()}
            onChangeText={(text) => setFirstListing({...firstListing, locali: parseInt(text) || 0})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prezzo affitto (€/mese) *</Text>
          <TextInput
            style={styles.input}
            value={firstListing.prezzo_affitto?.toString()}
            onChangeText={(text) => setFirstListing({...firstListing, prezzo_affitto: parseInt(text) || 0})}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFirstListing({...firstListing, ascensore: !firstListing.ascensore})}
          >
            <MaterialIcons 
              name={firstListing.ascensore ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Ascensore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFirstListing({...firstListing, balcone: !firstListing.balcone})}
          >
            <MaterialIcons 
              name={firstListing.balcone ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Balcone</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setFirstListing({...firstListing, giardino: !firstListing.giardino})}
          >
            <MaterialIcons 
              name={firstListing.giardino ? "check-box" : "check-box-outline-blank"} 
              size={24} 
              color="#2196F3" 
            />
            <Text style={styles.checkboxLabel}>Giardino</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
      </View>
      <Text style={styles.title}>Perfetto!</Text>
      <Text style={styles.subtitle}>
        Hai completato la configurazione come proprietario. Ora puoi iniziare a cercare inquilini per la tua proprietà.
      </Text>
      <Text style={styles.description}>
        La tua proprietà "{firstListing.indirizzo}" è stata creata e sarà visibile agli inquilini che cercano casa.
      </Text>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome': return renderWelcome();
      case 'preferences': return renderPreferences();
      case 'filters': return renderFilters();
      case 'listing': return renderListing();
      case 'complete': return renderComplete();
      default: return renderWelcome();
    }
  };

  const getStepNumber = () => {
    const steps = ['welcome', 'preferences', 'filters', 'listing', 'complete'];
    return steps.indexOf(currentStep) + 1;
  };

  const getTotalSteps = () => 5;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurazione Proprietario</Text>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{getStepNumber()}/{getTotalSteps()}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(getStepNumber() / getTotalSteps()) * 100}%` }]} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {currentStep !== 'welcome' && (
          <TouchableOpacity style={styles.secondaryButton} onPress={prevStep}>
            <Text style={styles.secondaryButtonText}>Indietro</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={currentStep === 'complete' ? handleComplete : nextStep}
        >
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>
              {currentStep === 'complete' ? 'Completa' : 'Avanti'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  stepIndicator: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
  },
  rangeSeparator: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#666',
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionButtonSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  optionTextSelected: {
    color: '#fff',
  },
  checkboxContainer: {
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  secondaryButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    borderRadius: 8,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonGradient: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});



