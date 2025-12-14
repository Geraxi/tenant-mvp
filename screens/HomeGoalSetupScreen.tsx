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
import { HomeGoal } from '../types';

interface HomeGoalSetupScreenProps {
  onBack: () => void;
  onGoalSet: (goal: HomeGoal) => void;
  existingGoal?: HomeGoal | null;
}

export const HomeGoalSetupScreen: React.FC<HomeGoalSetupScreenProps> = ({
  onBack,
  onGoalSet,
  existingGoal,
}) => {
  const [goalAmount, setGoalAmount] = useState(existingGoal?.goalAmount.toString() || '');
  const [timeline, setTimeline] = useState(24); // months
  const [timelineUnit, setTimelineUnit] = useState<'months' | 'years'>('months');
  const [nickname, setNickname] = useState(existingGoal?.nickname || '');
  const [loading, setLoading] = useState(false);
  
  const [slideAnimation] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const calculateMonthlyTarget = () => {
    const amount = parseFloat(goalAmount) || 0;
    const months = timelineUnit === 'years' ? timeline * 12 : timeline;
    return months > 0 ? amount / months : 0;
  };

  const validateForm = () => {
    if (!goalAmount || parseFloat(goalAmount) <= 0) {
      Alert.alert('Errore', 'Inserisci un importo obiettivo valido');
      return false;
    }
    if (parseFloat(goalAmount) < 1000) {
      Alert.alert('Errore', 'L\'importo minimo è €1.000');
      return false;
    }
    if (parseFloat(goalAmount) > 1000000) {
      Alert.alert('Errore', 'L\'importo massimo è €1.000.000');
      return false;
    }
    return true;
  };

  const handleSetGoal = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const amount = parseFloat(goalAmount);
      const months = timelineUnit === 'years' ? timeline * 12 : timeline;
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + months);
      
      const newGoal: HomeGoal = {
        id: existingGoal?.id || `homegoal-${Date.now()}`,
        userId: 'user-1', // In real app, get from auth context
        goalAmount: amount,
        deadline: deadline.toISOString(),
        nickname: nickname.trim() || undefined,
        createdAt: existingGoal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };
      
      onGoalSet(newGoal);
    } catch (error) {
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio dell\'obiettivo');
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

  const monthlyTarget = calculateMonthlyTarget();

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
            <Text style={styles.headerTitle}>
              {existingGoal ? 'Modifica Obiettivo' : t('setHomeGoal')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Goal Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('goalAmount')} *</Text>
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>€</Text>
              <TextInput
                style={styles.amountInput}
                value={goalAmount}
                onChangeText={setGoalAmount}
                placeholder="50000"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.helperText}>
              Importo minimo: €1.000 • Massimo: €1.000.000
            </Text>
          </View>

          {/* Timeline */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('timeline')} *</Text>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineSlider}>
                <View style={styles.timelineTrack}>
                  <View 
                    style={[
                      styles.timelineFill,
                      { width: `${(timeline / (timelineUnit === 'years' ? 10 : 120)) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.timelineValue}>
                  {timeline} {timelineUnit === 'years' ? t('years') : t('months')}
                </Text>
              </View>
              
              <View style={styles.timelineButtons}>
                <TouchableOpacity
                  style={[
                    styles.timelineButton,
                    timelineUnit === 'months' && styles.timelineButtonActive,
                  ]}
                  onPress={() => {
                    setTimelineUnit('months');
                    if (timeline > 120) setTimeline(120);
                  }}
                >
                  <Text style={[
                    styles.timelineButtonText,
                    timelineUnit === 'months' && styles.timelineButtonTextActive,
                  ]}>
                    {t('months')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.timelineButton,
                    timelineUnit === 'years' && styles.timelineButtonActive,
                  ]}
                  onPress={() => {
                    setTimelineUnit('years');
                    if (timeline > 10) setTimeline(10);
                  }}
                >
                  <Text style={[
                    styles.timelineButtonText,
                    timelineUnit === 'years' && styles.timelineButtonTextActive,
                  ]}>
                    {t('years')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Nickname */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('nickname')}</Text>
            <TextInput
              style={styles.textInput}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('nicknamePlaceholder')}
              placeholderTextColor="#999"
            />
            <Text style={styles.helperText}>
              Un nome personalizzato per il tuo obiettivo (opzionale)
            </Text>
          </View>

          {/* Monthly Target Preview */}
          {monthlyTarget > 0 && (
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                <MaterialIcons name="info" size={24} color="#2196F3" />
                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>Target Mensile</Text>
                  <Text style={styles.previewText}>
                    Per raggiungere {formatCurrency(parseFloat(goalAmount) || 0)} in {timeline} {timelineUnit === 'years' ? t('years') : t('months')}, 
                    devi risparmiare {formatCurrency(monthlyTarget)}/mese
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Consigli per raggiungere il tuo obiettivo</Text>
            <View style={styles.tipItem}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Paga l'affitto tramite Tenant per guadagnare cashback automatico</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Aggiungi fondi manualmente quando hai disponibilità extra</Text>
            </View>
            <View style={styles.tipItem}>
              <MaterialIcons name="check" size={16} color="#4CAF50" />
              <Text style={styles.tipText}>Invita amici per guadagnare bonus di €10 per ogni referral</Text>
            </View>
          </View>

          {/* Set Goal Button */}
          <TouchableOpacity
            style={[styles.setGoalButton, loading && styles.setGoalButtonDisabled]}
            onPress={handleSetGoal}
            disabled={loading}
          >
            <MaterialIcons name="savings" size={24} color="#fff" />
            <Text style={styles.setGoalButtonText}>
              {loading ? 'Salvataggio...' : t('confirmGoal')}
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
  timelineContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  timelineSlider: {
    marginBottom: 15,
  },
  timelineTrack: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 10,
  },
  timelineFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  timelineValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
  },
  timelineButtons: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  timelineButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  timelineButtonActive: {
    backgroundColor: '#2196F3',
  },
  timelineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timelineButtonTextActive: {
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
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  setGoalButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  setGoalButtonDisabled: {
    backgroundColor: '#CCC',
  },
  setGoalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});





