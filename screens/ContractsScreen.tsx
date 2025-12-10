import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';
import { ContractPreviewScreen } from './ContractPreviewScreen';
import { ContractSigningScreen } from './ContractSigningScreen';

export interface Contract {
  id: string;
  propertyAddress: string;
  tenantName: string;
  homeownerName: string;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'sent' | 'signed_by_owner' | 'signed_by_tenant' | 'signed' | 'pending_review';
  role: 'tenant' | 'homeowner';
  // Dual signing support
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
}

interface ContractsScreenProps {
  currentUser: any;
  onBack: () => void;
  onCreateContract: () => void;
  onViewContract: (contract: Contract) => void;
  onDownloadPDF: (contract: Contract) => void;
}

export default function ContractsScreen({ 
  currentUser,
  onBack, 
  onCreateContract,
  onViewContract,
  onDownloadPDF
}: ContractsScreenProps) {
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractSigning, setShowContractSigning] = useState(false);
  const [selectedContractForSigning, setSelectedContractForSigning] = useState<Contract | null>(null);
  
  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      propertyAddress: 'Via Roma 123, Milano',
      tenantName: 'Mario Rossi',
      homeownerName: 'Giulia Bianchi',
      monthlyRent: 1500,
      startDate: '2024-02-01',
      endDate: '2025-02-01',
      status: 'signed',
      role: currentUser?.userType === 'tenant' ? 'tenant' : 'homeowner',
    },
    {
      id: '2',
      propertyAddress: 'Corso Italia 456, Roma',
      tenantName: 'Luca Verdi',
      homeownerName: 'Anna Neri',
      monthlyRent: 1200,
      startDate: '2024-03-01',
      endDate: '2025-03-01',
      status: 'pending_review',
      role: currentUser?.userType === 'tenant' ? 'tenant' : 'homeowner',
    },
  ]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'sent': return 'Inviato';
      case 'signed_by_owner': return 'Firmato dal Proprietario';
      case 'signed_by_tenant': return 'Firmato dall\'Inquilino';
      case 'signed': return 'Firmato da Entrambi';
      case 'pending_review': return 'In Revisione';
      default: return status;
    }
  };

  const handleContractPress = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractPreview(true);
  };

  const handleClosePreview = () => {
    setShowContractPreview(false);
    setSelectedContract(null);
  };

  const handleDownloadPDF = (contract: Contract) => {
    onDownloadPDF(contract);
    setShowContractPreview(false);
    setSelectedContract(null);
  };

  const handleStartSigning = (contract: Contract) => {
    setSelectedContractForSigning(contract);
    setShowContractSigning(true);
  };

  const handleSigningComplete = async (signature: any) => {
    if (!selectedContractForSigning) return;

    try {
      // Update contract with signature
      const updatedContract: Contract = {
        ...selectedContractForSigning,
        status: currentUser?.userType === 'homeowner' ? 'signed_by_owner' : 'signed_by_tenant',
        [currentUser?.userType === 'homeowner' ? 'ownerSignature' : 'tenantSignature']: signature,
      };

      // Check if both parties have signed
      const hasOwnerSignature = updatedContract.ownerSignature || 
        (currentUser?.userType === 'homeowner' && signature);
      const hasTenantSignature = updatedContract.tenantSignature || 
        (currentUser?.userType === 'tenant' && signature);

      if (hasOwnerSignature && hasTenantSignature) {
        // Both parties have signed
        updatedContract.status = 'signed';
        
        // Send notification
        const { sendContractFullySignedNotification } = await import('../utils/notificationService');
        await sendContractFullySignedNotification(updatedContract);
        
        Alert.alert(
          'Contratto Completamente Firmato!',
          'Entrambe le parti hanno firmato il contratto.',
          [{ text: 'OK' }]
        );
      } else {
        // Only one party has signed, notify the other
        const { scheduleSignatureRequiredNotification } = await import('../utils/notificationService');
        await scheduleSignatureRequiredNotification(
          updatedContract,
          currentUser?.userType === 'homeowner' ? 'tenant' : 'owner',
          1 // 1 minute delay
        );
        
        Alert.alert(
          'Firma Completata',
          'Il contratto è stato firmato. L\'altra parte riceverà una notifica per firmare a sua volta.',
          [{ text: 'OK' }]
        );
      }

      setShowContractSigning(false);
      setSelectedContractForSigning(null);
    } catch (error) {
      if (__DEV__) {
        console.error('Error handling signing completion:', error);
      }
      Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio della firma');
    }
  };

  const handleSigningBack = () => {
    setShowContractSigning(false);
    setSelectedContractForSigning(null);
  };

  const handleEditContract = (contract: Contract) => {
    Alert.alert(
      'Modifica Contratto',
      'La modifica del contratto aprirà l\'editor di contratti.',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Modifica', 
          onPress: () => {
            // Basic edit functionality - show input dialog for rent amount
            Alert.prompt(
              'Modifica Affitto',
              'Inserisci il nuovo importo dell\'affitto mensile:',
              [
                { text: 'Annulla', style: 'cancel' },
                { 
                  text: 'Salva', 
                  onPress: (newRent) => {
                    if (newRent && !isNaN(parseFloat(newRent))) {
                      // Update the contract rent
                      setContracts(prev => prev.map(c => 
                        c.id === contract.id 
                          ? { ...c, monthlyRent: parseFloat(newRent) }
                          : c
                      ));
                      Alert.alert('Successo', 'Contratto modificato con successo!');
                    } else {
                      Alert.alert('Errore', 'Importo non valido');
                    }
                  }
                }
              ],
              'plain-text',
              contract.monthlyRent.toString()
            );
          }
        }
      ]
    );
  };

  const handleDeleteContract = (contract: Contract) => {
    Alert.alert(
      'Elimina Contratto',
      `Sei sicuro di voler eliminare il contratto per ${contract.propertyAddress}?`,
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Elimina', 
          style: 'destructive',
          onPress: () => {
            // Remove contract from state
            setContracts(prev => prev.filter(c => c.id !== contract.id));
            Alert.alert('Successo', 'Contratto eliminato con successo!');
          }
        }
      ]
    );
  };

  const renderContract = ({ item }: { item: Contract }) => {
    const isTenant = currentUser?.userType === 'tenant';
    const otherPartyName = isTenant ? item.homeownerName : item.tenantName;
    const otherPartyLabel = isTenant ? 'Proprietario' : 'Inquilino';
    
    return (
      <TouchableOpacity 
        style={styles.contractCard}
        onPress={() => handleContractPress(item)}
      >
        <View style={styles.contractHeader}>
          <MaterialIcons name="description" size={32} color="#2196F3" />
          <View style={[
            styles.statusBadge,
            styles[`status_${item.status}`]
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.propertyAddress}>{item.propertyAddress}</Text>
        <Text style={styles.otherPartyName}>
          {otherPartyLabel}: {otherPartyName}
        </Text>
        
        <View style={styles.contractDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={16} color="#666" />
            <Text style={styles.detailText}>€{item.monthlyRent}/mese</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.detailText}>
              {new Date(item.startDate).toLocaleDateString('it-IT')}
            </Text>
          </View>
        </View>

        {/* Action Buttons for contracts */}
        {(item.status === 'sent' || item.status === 'draft' || 
          (item.status === 'signed_by_owner' && currentUser?.userType === 'tenant') ||
          (item.status === 'signed_by_tenant' && currentUser?.userType === 'homeowner')) && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.signingButton}
              onPress={() => handleStartSigning(item)}
            >
              <MaterialIcons name="edit" size={16} color="#fff" />
              <Text style={styles.signingButtonText}>
                {item.status === 'signed_by_owner' || item.status === 'signed_by_tenant' 
                  ? 'Completa Firma' 
                  : 'Firma Contratto'
                }
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Edit/Delete buttons for draft contracts */}
        {item.status === 'draft' && (
          <View style={styles.editButtonsContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditContract(item)}
            >
              <MaterialIcons name="edit" size={16} color="#2196F3" />
              <Text style={styles.editButtonText}>Modifica</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteContract(item)}
            >
              <MaterialIcons name="delete" size={16} color="#F44336" />
              <Text style={styles.deleteButtonText}>Elimina</Text>
            </TouchableOpacity>
          </View>
        )}

        
        <MaterialIcons name="chevron-right" size={24} color="#CCC" style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  if (showContractPreview && selectedContract) {
    return (
      <ContractPreviewScreen
        contract={selectedContract}
        currentUser={currentUser}
        onClose={handleClosePreview}
        onDownloadPDF={handleDownloadPDF}
      />
    );
  }

  if (showContractSigning && selectedContractForSigning) {
    return (
      <ContractSigningScreen
        contract={selectedContractForSigning}
        currentUser={currentUser}
        onSigningComplete={handleSigningComplete}
        onBack={handleSigningBack}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentUser?.userType === 'tenant' ? 'I Miei Contratti' : t('rentalContracts')}
        </Text>
        <TouchableOpacity onPress={onCreateContract}>
          <MaterialIcons name="add" size={28} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {contracts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="description" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>
            {currentUser?.userType === 'tenant' ? 'Nessun Contratto' : t('noContracts')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {currentUser?.userType === 'tenant' 
              ? 'Non hai ancora ricevuto contratti dai proprietari'
              : t('createFirstContract')
            }
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={onCreateContract}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
            <Text style={styles.createButtonText}>
              {currentUser?.userType === 'tenant' ? 'Richiedi Contratto' : t('createContract')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={contracts}
          renderItem={renderContract}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
  listContainer: {
    padding: 16,
  },
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contractHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  status_draft: {
    backgroundColor: '#FFF3E0',
  },
  status_sent: {
    backgroundColor: '#E3F2FD',
  },
  status_signed: {
    backgroundColor: '#E8F5E9',
  },
  status_pending_review: {
    backgroundColor: '#FFF8E1',
  },
  status_signed_by_owner: {
    backgroundColor: '#FF9800',
  },
  status_signed_by_tenant: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  propertyAddress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tenantName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  otherPartyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  placeholder: {
    width: 28,
  },
  contractDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  chevron: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  signingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
});