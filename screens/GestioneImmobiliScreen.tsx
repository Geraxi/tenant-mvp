import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { Immobile, Contratto, FiltroImmobili } from '../src/types';

interface GestioneImmobiliScreenProps {
  onNavigateToPropertyDetails: (propertyId: string) => void;
  onNavigateToAddProperty: () => void;
  onBack: () => void;
}

export default function GestioneImmobiliScreen({
  onNavigateToPropertyDetails,
  onNavigateToAddProperty,
  onBack,
}: GestioneImmobiliScreenProps) {
  const { user } = useSupabaseAuth();
  const [immobili, setImmobili] = useState<Immobile[]>([]);
  const [contratti, setContratti] = useState<Contratto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<FiltroImmobili>('tutti');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (user?.id && user?.ruolo === 'landlord') {
      loadData();
    }
  }, [user?.id, filtro]);

  const loadData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from Supabase
      // For now, we'll use mock data
      await loadImmobili();
      await loadContratti();
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Errore', 'Impossibile caricare i dati');
    } finally {
      setLoading(false);
    }
  };

  const loadImmobili = async () => {
    // Mock data - replace with actual Supabase query
    const mockImmobili: Immobile[] = [
      {
        id: '1',
        owner_id: user?.id || '',
        indirizzo: 'Via Roma 123, Milano',
        descrizione: 'Appartamento moderno nel centro di Milano',
        foto: ['https://via.placeholder.com/300x200'],
        tipo: 'appartamento',
        superficie: 80,
        locali: 3,
        piano: 2,
        ascensore: true,
        balcone: true,
        giardino: false,
        garage: true,
        canone_mensile: 1200,
        spese_condominiali: 150,
        deposito_cauzionale: 2400,
        disponibile: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        owner_id: user?.id || '',
        indirizzo: 'Corso Italia 456, Roma',
        descrizione: 'Casa indipendente con giardino',
        foto: ['https://via.placeholder.com/300x200'],
        tipo: 'casa',
        superficie: 120,
        locali: 4,
        piano: 0,
        ascensore: false,
        balcone: false,
        giardino: true,
        garage: true,
        canone_mensile: 1500,
        spese_condominiali: 0,
        deposito_cauzionale: 3000,
        disponibile: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setImmobili(mockImmobili);
  };

  const loadContratti = async () => {
    // Mock data - replace with actual Supabase query
    const mockContratti: Contratto[] = [
      {
        id: '1',
        property_id: '1',
        tenant_id: 'tenant1',
        landlord_id: user?.id || '',
        canone: 1200,
        data_inizio: '2024-01-01',
        data_fine: '2024-12-31',
        deposito_cauzionale: 2400,
        spese_condominiali: 150,
        stato: 'attivo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    setContratti(mockContratti);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEditProperty = (immobile: Immobile) => {
    Alert.alert(
      'Modifica Immobile',
      `Vuoi modificare l'immobile "${immobile.indirizzo}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Modifica', 
          onPress: () => {
            // Basic edit functionality - show input dialog for rent
            Alert.prompt(
              'Modifica Canone',
              'Inserisci il nuovo canone mensile:',
              [
                { text: 'Annulla', style: 'cancel' },
                { 
                  text: 'Salva', 
                  onPress: (newRent) => {
                    if (newRent && !isNaN(parseFloat(newRent))) {
                      // Update the property rent
                      setImmobili(prev => prev.map(i => 
                        i.id === immobile.id 
                          ? { ...i, canone_mensile: parseFloat(newRent) }
                          : i
                      ));
                      Alert.alert('Successo', 'Immobile modificato con successo!');
                    } else {
                      Alert.alert('Errore', 'Importo non valido');
                    }
                  }
                }
              ],
              'plain-text',
              immobile.canone_mensile.toString()
            );
          }
        }
      ]
    );
  };

  const handleDeleteProperty = (immobile: Immobile) => {
    Alert.alert(
      'Elimina Immobile',
      `Sei sicuro di voler eliminare l'immobile "${immobile.indirizzo}"? Questa azione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            // Remove property from state
            setImmobili(prev => prev.filter(i => i.id !== immobile.id));
            Alert.alert('Successo', 'Immobile eliminato con successo!');
          }
        }
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getPropertyTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'appartamento':
        return 'apartment';
      case 'casa':
        return 'home';
      case 'ufficio':
        return 'business';
      case 'negozio':
        return 'store';
      default:
        return 'home';
    }
  };

  const getPropertyTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'appartamento':
        return '#2196F3';
      case 'casa':
        return '#4CAF50';
      case 'ufficio':
        return '#FF9800';
      case 'negozio':
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const getStatusColor = (disponibile: boolean) => {
    return disponibile ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (disponibile: boolean) => {
    return disponibile ? 'Disponibile' : 'Affittato';
  };

  const getContractStatus = (propertyId: string) => {
    const contratto = contratti.find(c => c.property_id === propertyId);
    if (!contratto) return null;
    
    const now = new Date();
    const dataFine = new Date(contratto.data_fine);
    
    if (dataFine < now) {
      return { status: 'scaduto', text: 'Scaduto', color: '#F44336' };
    } else if (contratto.stato === 'attivo') {
      return { status: 'attivo', text: 'Attivo', color: '#4CAF50' };
    } else {
      return { status: contratto.stato, text: contratto.stato, color: '#FF9800' };
    }
  };

  const filteredImmobili = immobili.filter(immobile => {
    switch (filtro) {
      case 'disponibili':
        return immobile.disponibile;
      case 'affittati':
        return !immobile.disponibile;
      case 'miei_immobili':
        return immobile.owner_id === user?.id;
      default:
        return true;
    }
  });

  const filterOptions: { value: FiltroImmobili; label: string }[] = [
    { value: 'tutti', label: 'Tutti' },
    { value: 'disponibili', label: 'Disponibili' },
    { value: 'affittati', label: 'Affittati' },
    { value: 'miei_immobili', label: 'I Miei Immobili' },
  ];

  if (user?.ruolo !== 'landlord') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestione Immobili</Text>
        </View>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Accesso Negato</Text>
          <Text style={styles.errorText}>
            Solo i proprietari possono accedere a questa sezione.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestione Immobili</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <MaterialIcons name="filter-list" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{immobili.length}</Text>
          <Text style={styles.statLabel}>Immobili</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>
            {immobili.filter(i => i.disponibile).length}
          </Text>
          <Text style={styles.statLabel}>Disponibili</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>
            {immobili.filter(i => !i.disponibile).length}
          </Text>
          <Text style={styles.statLabel}>Affittati</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#2196F3' }]}>
            {formatCurrency(immobili.reduce((sum, i) => sum + i.canone_mensile, 0))}
          </Text>
          <Text style={styles.statLabel}>Reddito Mensile</Text>
        </View>
      </View>

      {/* Properties List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        ) : filteredImmobili.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="home" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>Nessun Immobile</Text>
            <Text style={styles.emptyStateText}>
              {filtro === 'tutti' 
                ? 'Non hai ancora immobili registrati'
                : `Nessun immobile per il filtro "${filterOptions.find(f => f.value === filtro)?.label}"`
              }
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={onNavigateToAddProperty}>
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.addButtonGradient}
              >
                <MaterialIcons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Aggiungi Immobile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          filteredImmobili.map((immobile) => {
            const contractStatus = getContractStatus(immobile.id);
            return (
              <TouchableOpacity
                key={immobile.id}
                style={styles.propertyCard}
                onPress={() => onNavigateToPropertyDetails(immobile.id)}
              >
                <View style={styles.propertyImageContainer}>
                  <Image
                    source={{ uri: immobile.foto[0] || 'https://via.placeholder.com/300x200' }}
                    style={styles.propertyImage}
                  />
                  <View style={styles.propertyTypeBadge}>
                    <MaterialIcons 
                      name={getPropertyTypeIcon(immobile.tipo)} 
                      size={16} 
                      color="#fff" 
                    />
                    <Text style={styles.propertyTypeText}>
                      {immobile.tipo.charAt(0).toUpperCase() + immobile.tipo.slice(1)}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(immobile.disponibile) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(immobile.disponibile)}
                    </Text>
                  </View>
                </View>

                <View style={styles.propertyInfo}>
                  <Text style={styles.propertyAddress}>{immobile.indirizzo}</Text>
                  <Text style={styles.propertyDescription}>{immobile.descrizione}</Text>
                  
                  <View style={styles.propertyDetails}>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="straighten" size={16} color="#666" />
                      <Text style={styles.detailText}>{immobile.superficie} m²</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="room" size={16} color="#666" />
                      <Text style={styles.detailText}>{immobile.locali} locali</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <MaterialIcons name="stairs" size={16} color="#666" />
                      <Text style={styles.detailText}>
                        {immobile.piano !== undefined ? `Piano ${immobile.piano}` : 'Piano terra'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.propertyFooter}>
                    <View style={styles.rentInfo}>
                      <Text style={styles.rentLabel}>Canone Mensile</Text>
                      <Text style={styles.rentAmount}>
                        {formatCurrency(immobile.canone_mensile)}
                      </Text>
                    </View>
                    
                    {contractStatus && (
                      <View style={styles.contractInfo}>
                        <View style={[
                          styles.contractStatus,
                          { backgroundColor: contractStatus.color }
                        ]}>
                          <Text style={styles.contractStatusText}>
                            {contractStatus.text}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Edit/Delete buttons for properties */}
                  <View style={styles.propertyActionsContainer}>
                    <TouchableOpacity 
                      style={styles.editPropertyButton}
                      onPress={() => handleEditProperty(immobile)}
                    >
                      <MaterialIcons name="edit" size={16} color="#2196F3" />
                      <Text style={styles.editPropertyButtonText}>Modifica</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.deletePropertyButton}
                      onPress={() => handleDeleteProperty(immobile)}
                    >
                      <MaterialIcons name="delete" size={16} color="#F44336" />
                      <Text style={styles.deletePropertyButtonText}>Elimina</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add Property Button */}
      <TouchableOpacity style={styles.fab} onPress={onNavigateToAddProperty}>
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtra Immobili</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filtro === option.value && styles.filterOptionActive
                ]}
                onPress={() => {
                  setFiltro(option.value);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[
                  styles.filterOptionText,
                  filtro === option.value && styles.filterOptionTextActive
                ]}>
                  {option.label}
                </Text>
                {filtro === option.value && (
                  <MaterialIcons name="check" size={20} color="#2196F3" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    borderRadius: 12,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  propertyCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyImageContainer: {
    position: 'relative',
    height: 200,
  },
  propertyImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  propertyTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  propertyTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  propertyInfo: {
    padding: 16,
  },
  propertyAddress: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  propertyDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rentInfo: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  rentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  contractInfo: {
    alignItems: 'flex-end',
  },
  contractStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  contractStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  propertyActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  editPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  editPropertyButtonText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  deletePropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  deletePropertyButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#f8f9fa',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
