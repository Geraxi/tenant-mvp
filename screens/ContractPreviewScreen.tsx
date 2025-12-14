import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Contract } from './ContractsScreen';
import { MaterialIcons } from '@expo/vector-icons';
import Logo from '../components/Logo';


interface ContractPreviewScreenProps {
  contract: Contract;
  currentUser: any;
  onClose: () => void;
  onDownloadPDF: (contract: Contract) => void;
}

export const ContractPreviewScreen: React.FC<ContractPreviewScreenProps> = ({
  contract,
  currentUser,
  onClose,
  onDownloadPDF,
}) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Bozza';
      case 'sent': return 'Inviato';
      case 'signed': return 'Firmato';
      case 'pending_review': return 'In Revisione';
      case 'published_ade': return 'Pubblicato ADE';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FFF3E0';
      case 'sent': return '#E3F2FD';
      case 'signed': return '#E8F5E9';
      case 'pending_review': return '#FFF8E1';
      case 'published_ade': return '#E8F5E9';
      default: return '#F5F5F5';
    }
  };

  const isTenant = currentUser?.userType === 'tenant';
  const otherPartyName = isTenant ? contract.homeownerName : contract.tenantName;
  const otherPartyLabel = isTenant ? 'Proprietario' : 'Inquilino';

  const handleDownloadPDF = () => {
    onDownloadPDF(contract);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Anteprima Contratto</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contract Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(contract.status)}
            </Text>
          </View>
        </View>

        {/* Contract Icon */}
        <View style={styles.iconContainer}>
          <MaterialIcons name="description" size={64} color="#2196F3" />
        </View>

        {/* Contract Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.propertyAddress}>{contract.propertyAddress}</Text>
          
          <View style={styles.partyInfo}>
            <Text style={styles.partyLabel}>{otherPartyLabel}:</Text>
            <Text style={styles.partyName}>{otherPartyName}</Text>
          </View>

          {/* Financial Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dettagli Finanziari</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="attach-money" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Affitto Mensile:</Text>
              <Text style={styles.detailValue}>€{contract.monthlyRent}</Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="security" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Deposito Cauzionale:</Text>
              <Text style={styles.detailValue}>€{contract.monthlyRent * 3}</Text>
            </View>
          </View>

          {/* Duration Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Durata Contratto</Text>
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Data Inizio:</Text>
              <Text style={styles.detailValue}>
                {new Date(contract.startDate).toLocaleDateString('it-IT')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="event" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Data Fine:</Text>
              <Text style={styles.detailValue}>
                {new Date(contract.endDate).toLocaleDateString('it-IT')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialIcons name="schedule" size={20} color="#2196F3" />
              <Text style={styles.detailLabel}>Durata:</Text>
              <Text style={styles.detailValue}>
                {Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} mesi
              </Text>
            </View>
          </View>

          {/* Contract Terms */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termini del Contratto</Text>
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                • Il contratto di affitto è regolato dalle norme del Codice Civile italiano{'\n'}
                • L'inquilino si impegna a pagare l'affitto entro il 5 di ogni mese{'\n'}
                • Il proprietario garantisce la disponibilità dell'immobile per l'uso residenziale{'\n'}
                • Entrambe le parti possono recedere con preavviso di 6 mesi{'\n'}
                • Eventuali modifiche devono essere concordate per iscritto
              </Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informazioni Aggiuntive</Text>
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <MaterialIcons name="home" size={16} color="#666" />
                <Text style={styles.infoText}>Tipo: Appartamento residenziale</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.infoText}>Zona: Centro città</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.infoText}>Contratto verificato</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.closeActionButton}
          onPress={onClose}
        >
          <MaterialIcons name="close" size={20} color="#666" />
          <Text style={styles.closeActionText}>Chiudi</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={handleDownloadPDF}
        >
          <MaterialIcons name="download" size={20} color="#fff" />
          <Text style={styles.downloadButtonText}>Scarica PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertyAddress: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  partyInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  partyLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  termsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  closeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  closeActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
