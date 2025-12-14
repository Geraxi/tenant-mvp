import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface HomeGoalOnboardingSetupScreenProps {
  onNext: (goalData: {
    amount: number;
    timeline: number;
    nickname: string;
    monthlyContribution: number;
  }) => void;
  onBack: () => void;
}

export default function HomeGoalOnboardingSetupScreen({
  onNext,
  onBack,
}: HomeGoalOnboardingSetupScreenProps) {
  const [amount, setAmount] = useState('');
  const [timeline, setTimeline] = useState('');
  const [nickname, setNickname] = useState('');

  const calculateMonthlyContribution = () => {
    const goalAmount = parseFloat(amount) || 0;
    const months = parseInt(timeline) || 0;
    return months > 0 ? goalAmount / months : 0;
  };

  const handleNext = () => {
    const goalAmount = parseFloat(amount);
    const months = parseInt(timeline);
    const goalNickname = nickname.trim();

    if (!goalAmount || goalAmount <= 0) {
      Alert.alert('Errore', 'Inserisci un importo obiettivo valido');
      return;
    }

    if (!months || months <= 0) {
      Alert.alert('Errore', 'Inserisci una timeline valida');
      return;
    }

    if (!goalNickname) {
      Alert.alert('Errore', 'Inserisci un nickname per il tuo obiettivo');
      return;
    }

    const monthlyContribution = calculateMonthlyContribution();

    onNext({
      amount: goalAmount,
      timeline: months,
      nickname: goalNickname,
      monthlyContribution,
    });
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/[^\d]/g, ''));
    return isNaN(num) ? '' : num.toLocaleString('it-IT');
  };

  const monthlyContribution = calculateMonthlyContribution();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Imposta HomeGoal</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Crea il tuo obiettivo casa</Text>
          <Text style={styles.subtitle}>
            Definisci quanto vuoi risparmiare e in quanto tempo
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Importo obiettivo (€)</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="euro" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Es. 50000"
                  value={amount}
                  onChangeText={(text) => setAmount(text.replace(/[^\d]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Timeline (mesi)</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="schedule" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Es. 36"
                  value={timeline}
                  onChangeText={(text) => setTimeline(text.replace(/[^\d]/g, ''))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nickname obiettivo</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="home" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Es. Casa dei sogni"
                  value={nickname}
                  onChangeText={setNickname}
                />
              </View>
            </View>

            {monthlyContribution > 0 && (
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Riepilogo</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Contributo mensile suggerito:</Text>
                  <Text style={styles.summaryValue}>
                    €{monthlyContribution.toLocaleString('it-IT', { maximumFractionDigits: 0 })}
                  </Text>
                </View>
                <Text style={styles.summaryNote}>
                  Puoi sempre modificare questo importo in base ai tuoi guadagni
                </Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaButtonText}>Conferma Obiettivo</Text>
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
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  summaryNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  ctaButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
