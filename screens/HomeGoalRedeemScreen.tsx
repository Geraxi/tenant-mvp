import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';
import { useHomeGoal } from '../hooks/useHomeGoal';

interface HomeGoalRedeemScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const HomeGoalRedeemScreen: React.FC<HomeGoalRedeemScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { wallet, progress } = useHomeGoal();
  const [redeemMethod, setRedeemMethod] = useState<'bank_transfer' | 'partner_deposit'>('bank_transfer');
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolder: '',
    iban: '',
    bankName: '',
  });
  const [partnerDetails, setPartnerDetails] = useState({
    agencyName: '',
    contactInfo: '',
  });
  const [loading, setLoading] = useState(false);
  
  const [slideAnimation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateForm = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || numAmount <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return false;
    }
    
    if (numAmount < 50) {
      Alert.alert('Errore', 'L\'importo minimo per il prelievo è €50');
      return false;
    }
    
    if (wallet && numAmount > wallet.totalBalance) {
      Alert.alert('Errore', 'L\'importo non può superare il saldo disponibile');
      return false;
    }
    
    if (redeemMethod === 'bank_transfer') {
      if (!bankDetails.accountHolder.trim()) {
        Alert.alert('Errore', 'Inserisci il nome dell\'intestatario del conto');
        return false;
      }
      if (!bankDetails.iban.trim()) {
        Alert.alert('Errore', 'Inserisci l\'IBAN');
        return false;
      }
      if (!bankDetails.bankName.trim()) {
        Alert.alert('Errore', 'Inserisci il nome della banca');
        return false;
      }
    } else {
      if (!partnerDetails.agencyName.trim()) {
        Alert.alert('Errore', 'Inserisci il nome dell\'agenzia');
        return false;
      }
      if (!partnerDetails.contactInfo.trim()) {
        Alert.alert('Errore', 'Inserisci le informazioni di contatto');
        return false;
      }
    }
    
    return true;
  };

  const handleRedeem = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const numAmount = parseFloat(amount);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Richiesta Inviata!',
        `La tua richiesta di prelievo di €${numAmount.toFixed(2)} è stata inviata. Riceverai i fondi entro 2-3 giorni lavorativi.`,
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'invio della richiesta');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const numAmount = parseFloat(amount) || 0;
  const remainingBalance = wallet ? wallet.totalBalance - numAmount : 0;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{
              translateY: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
            opacity: slideAnimation,
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('redeemFundsTitle')}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Current Balance */}
          {wallet && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>{t('currentBalance')}</Text>
              <Text style={styles.balanceAmount}>{formatCurrency(wallet.totalBalance)}</Text>
              {progress && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(progress.progressPercentage, 100)}%` }
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {progress.progressPercentage.toFixed(1)}% del tuo obiettivo
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('redeemAmount')} *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.helperText}>
              Importo minimo: €50 • Massimo: {wallet ? formatCurrency(wallet.totalBalance) : '€0'}
            </Text>
          </View>

          {/* Redeem Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Metodo di Prelievo *</Text>
            <View style={styles.methodsContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  redeemMethod === 'bank_transfer' && styles.methodButtonActive,
                ]}
                onPress={() => setRedeemMethod('bank_transfer')}
              >
                <MaterialIcons
                  name="account-balance"
                  size={24}
                  color={redeemMethod === 'bank_transfer' ? '#fff' : '#2196F3'}
                />
                <Text style={[
                  styles.methodButtonText,
                  redeemMethod === 'bank_transfer' && styles.methodButtonTextActive,
                ]}>
                  {t('bankTransferRedeem')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  redeemMethod === 'partner_deposit' && styles.methodButtonActive,
                ]}
                onPress={() => setRedeemMethod('partner_deposit')}
              >
                <MaterialIcons
                  name="business"
                  size={24}
                  color={redeemMethod === 'partner_deposit' ? '#fff' : '#2196F3'}
                />
                <Text style={[
                  styles.methodButtonText,
                  redeemMethod === 'partner_deposit' && styles.methodButtonTextActive,
                ]}>
                  {t('partnerDeposit')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bank Transfer Details */}
          {redeemMethod === 'bank_transfer' && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>{t('bankDetails')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('accountHolder')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.accountHolder}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, accountHolder: text }))}
                  placeholder="Mario Rossi"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('iban')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.iban}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, iban: text.toUpperCase() }))}
                  placeholder="IT60X0542811101000000123456"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('bankName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={bankDetails.bankName}
                  onChangeText={(text) => setBankDetails(prev => ({ ...prev, bankName: text }))}
                  placeholder="Banca Intesa Sanpaolo"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Partner Deposit Details */}
          {redeemMethod === 'partner_deposit' && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>{t('partnerAgency')}</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('agencyName')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={partnerDetails.agencyName}
                  onChangeText={(text) => setPartnerDetails(prev => ({ ...prev, agencyName: text }))}
                  placeholder="Immobiliare Milano Centro"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>{t('contactInfo')} *</Text>
                <TextInput
                  style={styles.textInput}
                  value={partnerDetails.contactInfo}
                  onChangeText={(text) => setPartnerDetails(prev => ({ ...prev, contactInfo: text }))}
                  placeholder="Via Roma 123, Milano - Tel: 02 1234567"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          )}

          {/* Preview */}
          {numAmount > 0 && (
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                <MaterialIcons name="info" size={24} color="#2196F3" />
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>Anteprima Prelievo</Text>
                  <Text style={styles.previewText}>
                    Importo da prelevare: {formatCurrency(numAmount)}
                  </Text>
                  <Text style={styles.previewText}>
                    Saldo rimanente: {formatCurrency(remainingBalance)}
                  </Text>
                  <Text style={styles.previewText}>
                    Tempi di elaborazione: 2-3 giorni lavorativi
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Terms */}
          <View style={styles.termsContainer}>
            <MaterialIcons name="info" size={20} color="#666" />
            <Text style={styles.termsText}>
              I prelievi sono elaborati in sicurezza e i fondi vengono trasferiti entro 2-3 giorni lavorativi. 
              Non sono previste commissioni per i prelievi.
            </Text>
          </View>

          {/* Redeem Button */}
          <TouchableOpacity
            style={[styles.redeemButton, loading && styles.redeemButtonDisabled]}
            onPress={handleRedeem}
            disabled={loading}
          >
            <MaterialIcons name="account-balance" size={24} color="#fff" />
            <Text style={styles.redeemButtonText}>
              {loading ? 'Elaborazione...' : t('confirmRedeem')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 15,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  methodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 5,
    textAlign: 'center',
  },
  methodButtonTextActive: {
    color: '#fff',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  previewContainer: {
    marginBottom: 20,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    alignItems: 'flex-start',
  },
  previewContent: {
    flex: 1,
    marginLeft: 10,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 5,
  },
  previewText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  termsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  redeemButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  redeemButtonDisabled: {
    backgroundColor: '#CCC',
  },
  redeemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
