import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { t } from '../utils/translations';
import { useHomeGoal } from '../hooks/useHomeGoal';
import { useTransactions } from '../hooks/useTransactions';
import { HomeGoalProgress } from '../types';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

interface HomeGoalDashboardScreenProps {
  onBack: () => void;
  onAddFunds: () => void;
  onRedeemFunds: () => void;
  onViewTransactions: () => void;
  onInviteFriends: () => void;
}

export const HomeGoalDashboardScreen: React.FC<HomeGoalDashboardScreenProps> = ({
  onBack,
  onAddFunds,
  onRedeemFunds,
  onViewTransactions,
  onInviteFriends,
}) => {
  const { homeGoal, wallet, progress, loading, error } = useHomeGoal();
  const { getTotalCashback, getTotalDeposits, getTotalBonuses } = useTransactions();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMilestoneText = (percentage: number) => {
    switch (percentage) {
      case 25:
        return t('milestone25');
      case 50:
        return t('milestone50');
      case 75:
        return t('milestone75');
      case 100:
        return t('milestone100');
      default:
        return `${percentage}% Completato!`;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Caricamento...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF4444" />
          <Text style={styles.errorText}>Errore nel caricamento</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Riprova</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!progress || !wallet) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="savings" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Nessun Obiettivo Attivo</Text>
          <Text style={styles.emptySubtitle}>
            Inizia a risparmiare per la tua prima casa
          </Text>
          <TouchableOpacity style={styles.setupButton} onPress={onAddFunds}>
            <Text style={styles.setupButtonText}>Imposta Obiettivo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HomeGoal</Text>
          <TouchableOpacity onPress={onViewTransactions} style={styles.transactionsButton}>
            <MaterialIcons name="history" size={24} color="#2196F3" />
          </TouchableOpacity>
        </View>

        {/* Goal Card */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{homeGoal?.nickname || 'Casa dei Sogni'}</Text>
            <Text style={styles.goalAmount}>{formatCurrency(progress.goalAmount)}</Text>
          </View>
          
          <Text style={styles.deadlineText}>
            Scadenza: {homeGoal?.deadline ? formatDate(homeGoal.deadline) : 'Non impostata'}
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>{t('progress')}</Text>
              <Text style={styles.progressPercentage}>
                {progress.progressPercentage.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(progress.progressPercentage, 100)}%`,
                    },
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
                  {formatCurrency(progress.totalBalance)}
                </Text>
                <Text style={styles.progressAmountGoal}>
                  {formatCurrency(progress.goalAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Milestones */}
          <View style={styles.milestonesContainer}>
            <View style={[styles.milestone, progress.progressPercentage >= 25 && styles.milestoneAchieved]}>
              <View style={[styles.milestoneDot, progress.progressPercentage >= 25 && styles.milestoneDotAchieved]}>
                {progress.progressPercentage >= 25 && (
                  <MaterialIcons name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.milestoneText}>25%</Text>
            </View>
            <View style={[styles.milestone, progress.progressPercentage >= 50 && styles.milestoneAchieved]}>
              <View style={[styles.milestoneDot, progress.progressPercentage >= 50 && styles.milestoneDotAchieved]}>
                {progress.progressPercentage >= 50 && (
                  <MaterialIcons name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.milestoneText}>50%</Text>
            </View>
            <View style={[styles.milestone, progress.progressPercentage >= 75 && styles.milestoneAchieved]}>
              <View style={[styles.milestoneDot, progress.progressPercentage >= 75 && styles.milestoneDotAchieved]}>
                {progress.progressPercentage >= 75 && (
                  <MaterialIcons name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.milestoneText}>75%</Text>
            </View>
            <View style={[styles.milestone, progress.progressPercentage >= 100 && styles.milestoneAchieved]}>
              <View style={[styles.milestoneDot, progress.progressPercentage >= 100 && styles.milestoneDotAchieved]}>
                {progress.progressPercentage >= 100 && (
                  <MaterialIcons name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.milestoneText}>100%</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialIcons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{formatCurrency(getTotalCashback())}</Text>
            <Text style={styles.statLabel}>Cashback</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{formatCurrency(getTotalDeposits())}</Text>
            <Text style={styles.statLabel}>Depositi</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialIcons name="card-giftcard" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{formatCurrency(getTotalBonuses())}</Text>
            <Text style={styles.statLabel}>Bonus</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={onAddFunds}>
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Aggiungi Fondi</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onRedeemFunds}>
            <MaterialIcons name="account-balance" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Riscuoti</Text>
          </TouchableOpacity>
        </View>

        {/* Invite Friends */}
        <View style={styles.inviteContainer}>
          <View style={styles.inviteContent}>
            <MaterialIcons name="group-add" size={32} color="#4CAF50" />
            <View style={styles.inviteText}>
              <Text style={styles.inviteTitle}>Invita Amici</Text>
              <Text style={styles.inviteSubtitle}>Guadagna €10 per ogni amico che si iscrive</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.inviteButton} onPress={onInviteFriends}>
            <Text style={styles.inviteButtonText}>Invita</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  setupButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  setupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionsButton: {
    padding: 8,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    margin: 20,
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
  },
  milestone: {
    alignItems: 'center',
    flex: 1,
  },
  milestoneAchieved: {
    // This will be applied to achieved milestones
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
  milestoneDotAchieved: {
    backgroundColor: '#4CAF50',
  },
  milestoneText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginHorizontal: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  inviteContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inviteText: {
    marginLeft: 16,
    flex: 1,
  },
  inviteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  inviteSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inviteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});