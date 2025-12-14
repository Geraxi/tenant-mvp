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

interface HomeGoalAddFundsScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

const QUICK_AMOUNTS = [20, 50, 100, 250, 500, 1000];

export const HomeGoalAddFundsScreen: React.FC<HomeGoalAddFundsScreenProps> = ({
  onBack,
  onSuccess,
}) => {
  const { addFunds, wallet, progress } = useHomeGoal();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'bank_transfer'>('apple_pay');
  const [loading, setLoading] = useState(false);
  
  const [slideAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    
    // Pulse animation for quick amount selection
    Animated.sequence([
      Animated.timing(pulseAnimation, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      Alert.alert('Errore', 'Inserisci un importo valido');
      return false;
    }
    if (numAmount < 5) {
      Alert.alert('Errore', 'L\'importo minimo è €5');
      return false;
    }
    if (numAmount > 10000) {
      Alert.alert('Errore', 'L\'importo massimo è €10.000');
      return false;
    }
    return true;
  };

  const handleAddFunds = async () => {
    if (!validateAmount()) return;

    setLoading(true);
    
    try {
      const numAmount = parseFloat(amount);
      await addFunds(numAmount, paymentMethod);
      
      Alert.alert(
        'Successo!',
        `Hai aggiunto €${numAmount.toFixed(2)} al tuo HomeGoal`,
        [
          {
            text: 'OK',
            onPress: onSuccess,
          },
        ]
      );
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante l\'aggiunta di fondi');
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

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'apple_pay':
        return 'apple';
      case 'card':
        return 'credit-card';
      case 'bank_transfer':
        return 'account-balance';
      default:
        return 'payment';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'apple_pay':
        return t('applePay');
      case 'card':
        return t('card');
      case 'bank_transfer':
        return t('bankTransfer');
      default:
        return 'Metodo di Pagamento';
    }
  };

  const numAmount = parseFloat(amount) || 0;
  const newBalance = wallet ? wallet.totalBalance + numAmount : 0;
  const newProgress = progress ? (newBalance / progress.goalAmount) * 100 : 0;

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
            <Text style={styles.headerTitle}>{t('addFundsTitle')}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Current Balance */}
          {wallet && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Saldo Attuale</Text>
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
                    {progress.progressPercentage.toFixed(1)}% completato
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('amount')} *</Text>
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
              Importo minimo: €5 • Massimo: €10.000
            </Text>
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmountsContainer}>
            <Text style={styles.quickAmountsLabel}>{t('quickAmounts')}</Text>
            <View style={styles.quickAmountsGrid}>
              {QUICK_AMOUNTS.map((quickAmount) => (
                <Animated.View
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount.toString() && styles.quickAmountButtonActive,
                    { transform: [{ scale: pulseAnimation }] },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleQuickAmount(quickAmount)}
                    style={styles.quickAmountTouchable}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() && styles.quickAmountTextActive,
                    ]}>
                      €{quickAmount}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('paymentMethod')}</Text>
            <View style={styles.paymentMethodsContainer}>
              {(['apple_pay', 'card', 'bank_transfer'] as const).map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethodButton,
                    paymentMethod === method && styles.paymentMethodButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <MaterialIcons
                    name={getPaymentMethodIcon(method) as any}
                    size={24}
                    color={paymentMethod === method ? '#fff' : '#2196F3'}
                  />
                  <Text style={[
                    styles.paymentMethodText,
                    paymentMethod === method && styles.paymentMethodTextActive,
                  ]}>
                    {getPaymentMethodName(method)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          {numAmount > 0 && (
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                <MaterialIcons name="info" size={24} color="#2196F3" />
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>Anteprima</Text>
                  <Text style={styles.previewText}>
                    Aggiungendo €{numAmount.toFixed(2)}, il tuo saldo diventerà {formatCurrency(newBalance)}
                  </Text>
                  {progress && (
                    <Text style={styles.previewText}>
                      Progresso: {newProgress.toFixed(1)}% del tuo obiettivo
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}

          {/* Security Note */}
          <View style={styles.securityNote}>
            <MaterialIcons name="security" size={20} color="#4CAF50" />
            <Text style={styles.securityText}>
              I tuoi pagamenti sono protetti con crittografia end-to-end e processati in modo sicuro.
            </Text>
          </View>

          {/* Add Funds Button */}
          <TouchableOpacity
            style={[styles.addFundsButton, loading && styles.addFundsButtonDisabled]}
            onPress={handleAddFunds}
            disabled={loading}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.addFundsButtonText}>
              {loading ? 'Elaborazione...' : t('addToHomeGoal')}
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
    marginBottom: 25,
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
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  quickAmountsContainer: {
    marginBottom: 25,
  },
  quickAmountsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    marginBottom: 10,
  },
  quickAmountTouchable: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quickAmountTextActive: {
    color: '#fff',
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentMethodButton: {
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
  paymentMethodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginTop: 5,
    textAlign: 'center',
  },
  paymentMethodTextActive: {
    color: '#fff',
  },
  previewContainer: {
    marginBottom: 25,
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
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
    alignItems: 'flex-start',
  },
  securityText: {
    fontSize: 14,
    color: '#2E7D32',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  addFundsButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  addFundsButtonDisabled: {
    backgroundColor: '#CCC',
  },
  addFundsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
