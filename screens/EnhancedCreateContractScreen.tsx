import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';
import { ContractSigningScreen } from './ContractSigningScreen';
import { 
  scheduleSignatureRequiredNotification,
  sendContractFullySignedNotification 
} from '../utils/notificationService';

interface Contract {
  id: string;
  propertyAddress: string;
  tenantName: string;
  homeownerName: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'sent' | 'signed_by_owner' | 'signed_by_tenant' | 'signed' | 'pending_review' | 'published_ade';
  role: 'tenant' | 'homeowner';
  ownerSignature?: {
    signatureId: string;
    signatureHash: string;
    timestamp: string;
    provider: string;
    signerFiscalCode: string;
  };
  tenantSignature?: {
    signatureId: string;
    signatureHash: string;
    timestamp: string;
    provider: string;
    signerFiscalCode: string;
  };
  needsADESubmission?: boolean;
  adeSubmissionReminder?: boolean;
}

interface EnhancedCreateContractScreenProps {
  currentUser: any;
  onBack: () => void;
  onContractCreated: (contract: Contract) => void;
}

export const EnhancedCreateContractScreen: React.FC<EnhancedCreateContractScreenProps> = ({
  currentUser,
  onBack,
  onContractCreated,
}) => {
  const [step, setStep] = useState<'form' | 'signing' | 'complete'>('form');
  const [loading, setLoading] = useState(false);
  const [contractData, setContractData] = useState({
    propertyAddress: '',
    tenantName: '',
    monthlyRent: '',
    startDate: '',
    endDate: '',
    terms: '',
  });
  const [createdContract, setCreatedContract] = useState<Contract | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setContractData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!contractData.propertyAddress.trim()) {
      Alert.alert('Errore', 'Inserisci l\'indirizzo della proprietà');
      return false;
    }
    if (!contractData.tenantName.trim()) {
      Alert.alert('Errore', 'Inserisci il nome dell\'inquilino');
      return false;
    }
    if (!contractData.monthlyRent.trim()) {
      Alert.alert('Errore', 'Inserisci l\'affitto mensile');
      return false;
    }
    if (!contractData.startDate.trim()) {
      Alert.alert('Errore', 'Inserisci la data di inizio');
      return false;
    }
    if (!contractData.endDate.trim()) {
      Alert.alert('Errore', 'Inserisci la data di fine');
      return false;
    }
    return true;
  };

  const handleCreateContract = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Create contract object
      const newContract: Contract = {
        id: `contract_${Date.now()}`,
        propertyAddress: contractData.propertyAddress,
        tenantName: contractData.tenantName,
        homeownerName: currentUser.fullName || currentUser.name,
        monthlyRent: parseFloat(contractData.monthlyRent),
        startDate: contractData.startDate,
        endDate: contractData.endDate,
        status: 'draft',
        role: currentUser.userType,
        needsADESubmission: false,
        adeSubmissionReminder: false,
      };

      setCreatedContract(newContract);
      setStep('signing');
    } catch (error) {
      if (__DEV__) {
        console.error('Error creating contract:', error);
      }
      Alert.alert('Errore', 'Si è verificato un errore durante la creazione del contratto');
    } finally {
      setLoading(false);
    }
  };

  const handleSigningComplete = async (signature: any) => {
    if (!createdContract) return;

    try {
      // Update contract with signature
      const updatedContract: Contract = {
        ...createdContract,
        status: currentUser.userType === 'homeowner' ? 'signed_by_owner' : 'signed_by_tenant',
        [currentUser.userType === 'homeowner' ? 'ownerSignature' : 'tenantSignature']: signature,
      };

      // Schedule notification for the other party
      await scheduleSignatureRequiredNotification(
        updatedContract,
        currentUser.userType === 'homeowner' ? 'tenant' : 'owner',
        1 // 1 minute delay for immediate notification
      );

      setCreatedContract(updatedContract);
      setStep('complete');
    } catch (error) {
      if (__DEV__) {
        console.error('Error handling signing completion:', error);
      }
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio della firma');
    }
  };

  const handleComplete = () => {
    if (createdContract) {
      onContractCreated(createdContract);
    }
    onBack();
  };

  const renderForm = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>Crea Nuovo Contratto</Text>
      <Text style={styles.subtitle}>
        Compila i dettagli del contratto e firma immediatamente con SPID
      </Text>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Indirizzo Proprietà *</Text>
          <TextInput
            style={styles.input}
            value={contractData.propertyAddress}
            onChangeText={(value) => handleInputChange('propertyAddress', value)}
            placeholder="Via Roma 123, Milano"
            multiline
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Inquilino *</Text>
          <TextInput
            style={styles.input}
            value={contractData.tenantName}
            onChangeText={(value) => handleInputChange('tenantName', value)}
            placeholder="Mario Rossi"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Affitto Mensile (€) *</Text>
          <TextInput
            style={styles.input}
            value={contractData.monthlyRent}
            onChangeText={(value) => handleInputChange('monthlyRent', value)}
            placeholder="1500"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateInput}>
            <Text style={styles.label}>Data Inizio *</Text>
            <TextInput
              style={styles.input}
              value={contractData.startDate}
              onChangeText={(value) => handleInputChange('startDate', value)}
              placeholder="2024-02-01"
            />
          </View>
          <View style={styles.dateInput}>
            <Text style={styles.label}>Data Fine *</Text>
            <TextInput
              style={styles.input}
              value={contractData.endDate}
              onChangeText={(value) => handleInputChange('endDate', value)}
              placeholder="2025-02-01"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Termini e Condizioni</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={contractData.terms}
            onChangeText={(value) => handleInputChange('terms', value)}
            placeholder="Inserisci i termini del contratto..."
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color="#2196F3" />
        <Text style={styles.infoText}>
          Dopo aver creato il contratto, potrai firmarlo immediatamente con SPID. 
          L'altra parte riceverà una notifica per firmare a sua volta.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.createButton, loading && styles.createButtonDisabled]}
        onPress={handleCreateContract}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Crea e Firma Contratto</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSigning = () => {
    if (!createdContract) return null;

    return (
      <ContractSigningScreen
        contract={createdContract}
        currentUser={currentUser}
        onSigningComplete={handleSigningComplete}
        onBack={() => setStep('form')}
      />
    );
  };

  const renderComplete = () => (
    <View style={styles.completeContainer}>
      <MaterialIcons name="check-circle" size={80} color="#4CAF50" />
      <Text style={styles.completeTitle}>Contratto Creato e Firmato!</Text>
      <Text style={styles.completeDescription}>
        Il contratto è stato creato e firmato con successo. L'altra parte riceverà 
        una notifica per firmare a sua volta.
      </Text>
      
      <View style={styles.nextStepsContainer}>
        <Text style={styles.nextStepsTitle}>Prossimi Passi:</Text>
        <View style={styles.stepItem}>
          <MaterialIcons name="notifications" size={20} color="#2196F3" />
          <Text style={styles.stepText}>
            L'altra parte riceverà una notifica per firmare
          </Text>
        </View>
        <View style={styles.stepItem}>
          <MaterialIcons name="check" size={20} color="#4CAF50" />
          <Text style={styles.stepText}>
            Quando entrambi avranno firmato, riceverai una notifica
          </Text>
        </View>
        <View style={styles.stepItem}>
          <MaterialIcons name="account-balance" size={20} color="#FF9800" />
          <Text style={styles.stepText}>
            Potrai inviare il contratto all'Agenzia delle Entrate
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
        <Text style={styles.completeButtonText}>Completato</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuovo Contratto</Text>
        <View style={{ width: 28 }} />
      </View>

      {step === 'form' && renderForm()}
      {step === 'signing' && renderSigning()}
      {step === 'complete' && renderComplete()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  form: {
    marginBottom: 20,
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
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 15,
  },
  dateInput: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    gap: 10,
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  completeDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  nextStepsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  nextStepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});





