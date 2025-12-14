import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeGoalOnboardingPreviewScreenProps {
  onNext: () => void;
  onBack: () => void;
  goalData: {
    amount: number;
    timeline: number;
    nickname: string;
    monthlyContribution: number;
  };
}

export default function HomeGoalOnboardingPreviewScreen({
  onNext,
  onBack,
  goalData,
}: HomeGoalOnboardingPreviewScreenProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const progressPercentage = 15; // Example progress
  const currentBalance = goalData.amount * (progressPercentage / 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anteprima Dashboard</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Ecco come apparirà il tuo HomeGoal</Text>
          <Text style={styles.subtitle}>
            Un'anteprima della tua dashboard personale
          </Text>

          <View style={styles.previewCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goalData.nickname}</Text>
              <Text style={styles.goalAmount}>{formatCurrency(goalData.amount)}</Text>
            </View>
            
            <Text style={styles.deadlineText}>
              Scadenza: {goalData.timeline} mesi
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progresso</Text>
                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` }
                    ]}
                  >
                    <LinearGradient
                      colors={['#2196F3', '#64B5F6', '#90CAF9']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.progressGradient}
                    />
                  </View>
                </View>
                <View style={styles.progressAmounts}>
                  <Text style={styles.progressAmountCurrent}>
                    {formatCurrency(currentBalance)}
                  </Text>
                  <Text style={styles.progressAmountGoal}>
                    {formatCurrency(goalData.amount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Milestones */}
            <View style={styles.milestonesContainer}>
              <View style={[styles.milestone, styles.milestoneAchieved]}>
                <View style={styles.milestoneDot}>
                  <MaterialIcons name="check" size={12} color="#fff" />
                </View>
                <Text style={styles.milestoneText}>25%</Text>
              </View>
              <View style={styles.milestone}>
                <View style={styles.milestoneDot} />
                <Text style={styles.milestoneText}>50%</Text>
              </View>
              <View style={styles.milestone}>
                <View style={styles.milestoneDot} />
                <Text style={styles.milestoneText}>75%</Text>
              </View>
              <View style={styles.milestone}>
                <View style={styles.milestoneDot} />
                <Text style={styles.milestoneText}>100%</Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(currentBalance)}</Text>
                <Text style={styles.statLabel}>Totale Risparmiato</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{goalData.timeline - 2}</Text>
                <Text style={styles.statLabel}>Mesi Rimanenti</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatCurrency(goalData.monthlyContribution)}</Text>
                <Text style={styles.statLabel}>Target Mensile</Text>
              </View>
            </View>
          </View>

          <View style={styles.featuresPreview}>
            <Text style={styles.featuresTitle}>Funzionalità disponibili:</Text>
            <View style={styles.featureItem}>
              <MaterialIcons name="add-circle" size={20} color="#2196F3" />
              <Text style={styles.featureText}>Aggiungi fondi manualmente</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="history" size={20} color="#2196F3" />
              <Text style={styles.featureText}>Visualizza cronologia transazioni</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialIcons name="account-balance" size={20} color="#2196F3" />
              <Text style={styles.featureText}>Riscuoti fondi quando raggiungi l'obiettivo</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onNext}>
          <Text style={styles.ctaButtonText}>Vai al mio HomeGoal</Text>
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
    marginBottom: 30,
    lineHeight: 24,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  goalHeader: {
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  goalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  deadlineText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressGradient: {
    flex: 1,
    borderRadius: 4,
  },
  progressAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  progressAmountCurrent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  progressAmountGoal: {
    fontSize: 14,
    color: '#666',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  milestone: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  milestoneAchieved: {
    // This will be applied to the first milestone
  },
  milestoneText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  featuresPreview: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
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
