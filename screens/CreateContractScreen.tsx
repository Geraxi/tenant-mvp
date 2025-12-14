import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';

interface CreateContractScreenProps {
  onBack: () => void;
  onSave: () => void;
}

export default function CreateContractScreen({ onBack, onSave }: CreateContractScreenProps) {
  const [propertyAddress, setPropertyAddress] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [terms, setTerms] = useState('');
  const [registerWithAgency, setRegisterWithAgency] = useState(false);

  const isValid = propertyAddress && monthlyRent && startDate && endDate && tenantName;

  const handleSave = () => {
    if (isValid) {
      Alert.alert(
        'Contratto Salvato',
        'Il contratto è stato salvato con successo!',
        [{ text: 'OK', onPress: onSave }]
      );
    }
  };

  const handleShare = () => {
    if (isValid) {
      const message = registerWithAgency 
        ? 'Il contratto verrà inviato all\'inquilino via email e registrato presso l\'Agenzia delle Entrate.'
        : 'Il contratto verrà inviato all\'inquilino via email.';
      
      Alert.alert(
        'Condividi Contratto',
        message,
        [
          { text: 'Annulla', style: 'cancel' },
          { text: 'Invia', onPress: () => {
            if (registerWithAgency) {
              Alert.alert(t('registrationSuccess'), 'Il contratto è stato registrato presso l\'Agenzia delle Entrate.');
            } else {
              Alert.alert('Successo', 'Contratto inviato!');
            }
            onSave();
          }}
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="close" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('createContract')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('propertyAddress')}</Text>
              <TextInput
                style={styles.input}
                value={propertyAddress}
                onChangeText={setPropertyAddress}
                placeholder="Via Roma 123, Milano"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('monthlyRent')} (€)</Text>
                <TextInput
                  style={styles.input}
                  value={monthlyRent}
                  onChangeText={setMonthlyRent}
                  placeholder="1500"
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('securityDeposit')} (€)</Text>
                <TextInput
                  style={styles.input}
                  value={securityDeposit}
                  onChangeText={setSecurityDeposit}
                  placeholder="3000"
                  keyboardType="number-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('startDate')}</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="01/02/2024"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.label}>{t('endDate')}</Text>
                <TextInput
                  style={styles.input}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="01/02/2025"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('tenantName')}</Text>
              <TextInput
                style={styles.input}
                value={tenantName}
                onChangeText={setTenantName}
                placeholder="Mario Rossi"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('terms')}</Text>
              <TextInput
                style={[styles.input, styles.termsInput]}
                value={terms}
                onChangeText={setTerms}
                placeholder={t('termsPlaceholder')}
                placeholderTextColor="#999"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.registrationContainer}>
              <View style={styles.registrationHeader}>
                <MaterialIcons name="account-balance" size={24} color="#2196F3" />
                <Text style={styles.registrationTitle}>{t('registerWithAgency')}</Text>
              </View>
              <Text style={styles.registrationInfo}>{t('registrationInfo')}</Text>
              <Switch
                value={registerWithAgency}
                onValueChange={setRegisterWithAgency}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor="#fff"
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton, !isValid && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={!isValid}
            >
              <MaterialIcons name="save" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('saveContract')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.shareButton, !isValid && styles.buttonDisabled]}
              onPress={handleShare}
              disabled={!isValid}
            >
              <MaterialIcons name="share" size={24} color="#fff" />
              <Text style={styles.buttonText}>{t('shareContract')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  form: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  termsInput: {
    height: 150,
    paddingTop: 16,
  },
  registrationContainer: {
    backgroundColor: '#E8F9F7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  registrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  registrationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
