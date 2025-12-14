import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { useNotifications } from '../src/hooks/useNotifications';
import { Utente } from '../src/types';
import { FadeIn, ScaleIn, GradientCard, Shimmer } from '../components/AnimatedComponents';

import { logger } from '../src/utils/logger';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onNavigateToBills: () => void;
  onNavigateToPayments: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToHelp: () => void;
  onNavigateToContracts: () => void;
  onNavigateToContractSignature: () => void;
}

export default function HomeScreen({ 
  onNavigateToBills,
  onNavigateToPayments,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToHelp,
  onNavigateToContracts,
  onNavigateToContractSignature,
}: HomeScreenProps) {
  const { user } = useSupabaseAuth();
  logger.debug('HomeScreen - User data:', user);
  const { unreadCount } = useNotifications(user?.id || '');
  
  const [refreshing, setRefreshing] = useState(false);
  const [hasBills, setHasBills] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      // Load any necessary data here
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
    }).format(new Date(dateString));
  };

  const getBillIcon = (categoria: string) => {
    switch (categoria) {
      case 'affitto':
        return 'home';
      case 'luce':
        return 'lightbulb';
      case 'gas':
        return 'local-fire-department';
      case 'acqua':
        return 'water-drop';
      case 'riscaldamento':
        return 'thermostat';
      case 'condominio':
        return 'apartment';
      case 'tasse':
        return 'receipt';
      default:
        return 'receipt';
    }
  };

  const getBillColor = (categoria: string) => {
    switch (categoria) {
      case 'affitto':
        return '#2196F3';
      case 'luce':
        return '#FFC107';
      case 'gas':
        return '#FF5722';
      case 'acqua':
        return '#00BCD4';
      case 'riscaldamento':
        return '#FF9800';
      case 'condominio':
        return '#9C27B0';
      case 'tasse':
        return '#795548';
      default:
        return '#607D8B';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <FadeIn delay={200} from="top">
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Logo size="small" showText={false} />
              <Text style={styles.greeting}>
                Ciao, {user?.nome || user?.email?.split('@')[0] || 'Utente'}!
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={onNavigateToProfile}
            >
              <MaterialIcons name="person" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Quick Overview */}
        <FadeIn delay={1000} from="bottom">
          <View style={styles.section}>
            <View style={styles.centeredSectionHeader}>
              <Text style={styles.sectionTitle}>Quick Overview</Text>
            </View>
            <View style={styles.quickOverviewContainer}>
              <View style={styles.overviewCard}>
                <MaterialIcons name="people" size={24} color="#2196F3" />
                <Text style={styles.overviewNumber}>3</Text>
                <Text style={styles.overviewLabel}>
                  {user?.ruolo === 'tenant' ? 'Proprietà' : 'Inquilini'}
                </Text>
              </View>
              <View style={styles.overviewCard}>
                <MaterialIcons name="notifications" size={24} color="#2196F3" />
                <Text style={styles.overviewNumber}>{unreadCount}</Text>
                <Text style={styles.overviewLabel}>Notifiche</Text>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Spese Mensili */}
        <FadeIn delay={1200} from="bottom">
          <View style={styles.section}>
            <View style={styles.centeredSectionHeader}>
              <Text style={styles.sectionTitle}>Spese Mensili</Text>
            </View>
            <View style={styles.chartContainer}>
              <View style={styles.donutChart}>
                <View style={styles.donutChartInner}>
                  <Text style={styles.chartCenterText}>€0</Text>
                  <Text style={styles.chartCenterSubtext}>Totale</Text>
                </View>
              </View>
            </View>
          </View>
        </FadeIn>

        {/* Prossimi Pagamenti */}
        <FadeIn delay={1400} from="bottom">
          <View style={styles.section}>
            <View style={styles.centeredSectionHeader}>
              <Text style={styles.sectionTitle}>
                {user?.ruolo === 'tenant' ? 'Prossimi Pagamenti' : 'Entrate Previste'}
              </Text>
            </View>
            
            {/* Rent Subsection - Different for tenants vs landlords */}
            <View style={styles.subsection}>
              <View style={styles.subsectionHeader}>
                <MaterialIcons name="home" size={20} color="#2196F3" />
                <Text style={styles.subsectionTitle}>
                  {user?.ruolo === 'tenant' ? 'Affitto' : 'Affitti'}
                </Text>
              </View>
              <TouchableOpacity style={styles.paymentCard}>
                <View style={styles.paymentIconContainer}>
                  <MaterialIcons name="home" size={20} color="#2196F3" />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>
                    {user?.ruolo === 'tenant' ? 'Affitto Mensile' : 'Affitto Appartamento A'}
                  </Text>
                  <Text style={styles.paymentDate}>
                    {user?.ruolo === 'tenant' ? 'Scadenza: 01/07/2024' : 'Entrata: 01/07/2024'}
                  </Text>
                </View>
                <Text style={styles.paymentAmount}>€800</Text>
              </TouchableOpacity>
            </View>

            {/* Bills/Expenses Subsection - Different for tenants vs landlords */}
            {hasBills && (
              <View style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <MaterialIcons name="receipt" size={20} color="#FF9800" />
                  <Text style={styles.subsectionTitle}>
                    {user?.ruolo === 'tenant' ? 'Bollette' : 'Spese Immobili'}
                  </Text>
                </View>
                <View style={styles.billsContainer}>
                  {user?.ruolo === 'tenant' ? (
                    // Tenant bills
                    <>
                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="water-drop" size={18} color="#2196F3" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Acqua</Text>
                          <Text style={styles.billDate}>15/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€45</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="lightbulb" size={18} color="#FFC107" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Elettricità</Text>
                          <Text style={styles.billDate}>20/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€75</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="local-fire-department" size={18} color="#FF5722" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Gas</Text>
                          <Text style={styles.billDate}>25/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€60</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="apartment" size={18} color="#9C27B0" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Spese Condominiali</Text>
                          <Text style={styles.billDate}>30/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€120</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    // Landlord property expenses
                    <>
                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="build" size={18} color="#FF9800" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Manutenzione</Text>
                          <Text style={styles.billDate}>15/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€200</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="security" size={18} color="#4CAF50" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Assicurazione</Text>
                          <Text style={styles.billDate}>20/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€150</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="account-balance" size={18} color="#2196F3" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Tasse Immobili</Text>
                          <Text style={styles.billDate}>25/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€300</Text>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.billCard}>
                        <View style={styles.billIconContainer}>
                          <MaterialIcons name="cleaning-services" size={18} color="#9C27B0" />
                        </View>
                        <View style={styles.billInfo}>
                          <Text style={styles.billTitle}>Pulizie</Text>
                          <Text style={styles.billDate}>30/07/2024</Text>
                        </View>
                        <Text style={styles.billAmount}>€80</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        </FadeIn>

        {/* Contratti Condivisi */}
        <FadeIn delay={1600} from="bottom">
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle} numberOfLines={2}>
                {user?.ruolo === 'tenant' ? 'Contratti Condivisi' : 'I Miei Contratti'}
              </Text>
              <View style={styles.sectionHeaderActions}>
                <TouchableOpacity 
                  style={styles.signContractButton}
                  onPress={onNavigateToContractSignature}
                >
                  <MaterialIcons name="edit" size={16} color="#2196F3" />
                  <Text style={styles.signContractText}>Firma</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onNavigateToContracts}>
                  <Text style={styles.sectionLink} numberOfLines={1}>Vedi tutti</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.contractsContainer}>
              {user?.ruolo === 'tenant' ? (
                // Tenant contracts (shared by landlords)
                <>
                  <TouchableOpacity style={styles.contractCard} onPress={onNavigateToContracts}>
                    <View style={styles.contractIconContainer}>
                      <MaterialIcons name="description" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractTitle} numberOfLines={1}>Contratto di Affitto</Text>
                      <Text style={styles.contractProperty} numberOfLines={1}>Via Roma 123, Milano</Text>
                      <Text style={styles.contractOwner} numberOfLines={1}>Proprietario: Mario Rossi</Text>
                    </View>
                    <View style={styles.contractStatus}>
                      <Text style={styles.contractStatusText}>Attivo</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contractCard} onPress={onNavigateToContracts}>
                    <View style={styles.contractIconContainer}>
                      <MaterialIcons name="description" size={20} color="#FF9800" />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractTitle} numberOfLines={1}>Contratto di Rinnovo</Text>
                      <Text style={styles.contractProperty} numberOfLines={1}>Via Garibaldi 45, Milano</Text>
                      <Text style={styles.contractOwner} numberOfLines={1}>Proprietario: Anna Bianchi</Text>
                    </View>
                    <View style={styles.contractStatus}>
                      <Text style={styles.contractStatusText}>In Revisione</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                // Landlord contracts (their own contracts)
                <>
                  <TouchableOpacity style={styles.contractCard} onPress={onNavigateToContracts}>
                    <View style={styles.contractIconContainer}>
                      <MaterialIcons name="description" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractTitle} numberOfLines={1}>Contratto Appartamento A</Text>
                      <Text style={styles.contractProperty} numberOfLines={1}>Via Roma 123, Milano</Text>
                      <Text style={styles.contractOwner} numberOfLines={1}>Inquilino: Mario Rossi</Text>
                    </View>
                    <View style={styles.contractStatus}>
                      <Text style={styles.contractStatusText}>Attivo</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contractCard} onPress={onNavigateToContracts}>
                    <View style={styles.contractIconContainer}>
                      <MaterialIcons name="description" size={20} color="#FF9800" />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractTitle} numberOfLines={1}>Contratto Appartamento B</Text>
                      <Text style={styles.contractProperty} numberOfLines={1}>Via Garibaldi 45, Milano</Text>
                      <Text style={styles.contractOwner} numberOfLines={1}>Inquilino: Anna Bianchi</Text>
                    </View>
                    <View style={styles.contractStatus}>
                      <Text style={styles.contractStatusText}>In Revisione</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.contractCard} onPress={onNavigateToContracts}>
                    <View style={styles.contractIconContainer}>
                      <MaterialIcons name="description" size={20} color="#2196F3" />
                    </View>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractTitle} numberOfLines={1}>Contratto Ufficio</Text>
                      <Text style={styles.contractProperty} numberOfLines={1}>Via Dante 78, Milano</Text>
                      <Text style={styles.contractOwner} numberOfLines={1}>Inquilino: Luca Verdi</Text>
                    </View>
                    <View style={styles.contractStatus}>
                      <Text style={styles.contractStatusText}>Firmato</Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </FadeIn>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  profileButton: {
    padding: 8,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  alertText: {
    flex: 1,
    marginLeft: 12,
    color: '#D32F2F',
    fontWeight: '500',
  },
  alertLink: {
    color: '#F44336',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickOverviewContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  overviewNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutChartInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCenterSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  subsection: {
    marginBottom: 20,
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  billsContainer: {
    gap: 8,
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e0e0e0',
  },
  billIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  billDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  contractsContainer: {
    gap: 12,
  },
  contractCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contractIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contractInfo: {
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  contractTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
    numberOfLines: 1,
  },
  contractProperty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    flexShrink: 1,
    numberOfLines: 1,
  },
  contractOwner: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    flexShrink: 1,
    numberOfLines: 1,
  },
  contractStatus: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contractStatusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    flex: 1,
  },
  sectionHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  signContractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  signContractText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  centeredSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionLinkContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexShrink: 1,
  },
  sectionLink: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '500',
    flexShrink: 1,
    numberOfLines: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  billCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  billCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  billAmount: {
    alignItems: 'flex-end',
  },
  billAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  billDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  blueHighlightCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  blueHighlightIcon: {
    backgroundColor: '#2196F3',
  },
});