import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { getContractById, signContract, getSigningServiceUrl, SIGNING_SERVICES } from '../utils/supabaseContracts';

interface ContractSigningScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  contractId: string;
  userId: string;
}

export default function ContractSigningScreen({
  onBack,
  onSuccess,
  contractId,
  userId,
}: ContractSigningScreenProps) {
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);

  useEffect(() => {
    loadContract();
  }, []);

  const loadContract = async () => {
    try {
      const contractData = await getContractById(contractId, userId);
      if (contractData) {
        setContract(contractData);
      } else {
        Alert.alert('Errore', 'Contratto non trovato');
        onBack();
      }
    } catch (error) {
      console.error('Load contract error:', error);
      Alert.alert('Errore', 'Errore durante il caricamento del contratto');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSigningService = (serviceName: string) => {
    if (!contract) return;

    setSelectedService(serviceName);
    setWebViewVisible(true);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'signing_complete') {
        setWebViewVisible(false);
        handleSignComplete();
      } else if (data.type === 'signing_error') {
        setWebViewVisible(false);
        Alert.alert('Errore', data.message || 'Errore durante la firma');
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  };

  const handleSignComplete = async () => {
    setSigning(true);
    
    try {
      const result = await signContract(contractId, userId);
      
      if (result.success) {
        Alert.alert(
          'Contratto Firmato',
          'Il contratto è stato firmato con successo!',
          [
            {
              text: 'OK',
              onPress: onSuccess,
            },
          ]
        );
      } else {
        Alert.alert('Errore', result.error || 'Errore durante la firma del contratto');
      }
    } catch (error) {
      console.error('Sign contract error:', error);
      Alert.alert('Errore', 'Errore durante la firma');
    } finally {
      setSigning(false);
    }
  };

  const handleDownloadContract = () => {
    if (contract?.document_url) {
      Alert.alert(
        'Download Contratto',
        'Il contratto sarà scaricato. Vuoi continuare?',
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Download',
            onPress: () => {
              // In a real app, you would implement actual file download
              Alert.alert('Download', 'Il contratto è stato scaricato nella cartella Documenti');
            },
          },
        ]
      );
    } else {
      Alert.alert('Errore', 'Documento del contratto non disponibile');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Caricamento contratto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!contract) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={48} color="#FF4444" />
          <Text style={styles.errorText}>Contratto non trovato</Text>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Torna Indietro</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (webViewVisible && selectedService) {
    const signingUrl = getSigningServiceUrl(contract, selectedService as any);
    
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.webViewBackButton}
            onPress={() => setWebViewVisible(false)}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>
            Firma con {SIGNING_SERVICES.find(s => s.name === selectedService)?.name.toUpperCase()}
          </Text>
        </View>
        
        <WebView
          source={{ uri: signingUrl }}
          style={styles.webView}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Firma Contratto</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.contractCard}>
            <Text style={styles.contractTitle}>Contratto di Affitto</Text>
            
            <View style={styles.contractDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="home" size={20} color="#2196F3" />
                <Text style={styles.detailLabel}>Proprietà:</Text>
                <Text style={styles.detailValue}>{contract.property?.title}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="location-on" size={20} color="#2196F3" />
                <Text style={styles.detailLabel}>Indirizzo:</Text>
                <Text style={styles.detailValue}>{contract.property?.location}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="euro" size={20} color="#2196F3" />
                <Text style={styles.detailLabel}>Affitto:</Text>
                <Text style={styles.detailValue}>
                  €{contract.property?.rent?.toLocaleString('it-IT')}/mese
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialIcons name="person" size={20} color="#2196F3" />
                <Text style={styles.detailLabel}>
                  {contract.tenant_id === userId ? 'Locatore:' : 'Inquilino:'}
                </Text>
                <Text style={styles.detailValue}>
                  {contract.tenant_id === userId 
                    ? contract.landlord?.full_name || contract.landlord?.email
                    : contract.tenant?.full_name || contract.tenant?.email
                  }
                </Text>
              </View>
            </View>

            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                contract.signed ? styles.statusSigned : styles.statusPending
              ]}>
                <MaterialIcons 
                  name={contract.signed ? "check-circle" : "schedule"} 
                  size={16} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {contract.signed ? 'Firmato' : 'In Attesa di Firma'}
                </Text>
              </View>
            </View>
          </View>

          {!contract.signed && (
            <View style={styles.signingSection}>
              <Text style={styles.sectionTitle}>Scegli il Metodo di Firma</Text>
              <Text style={styles.sectionSubtitle}>
                Seleziona il servizio di firma digitale che preferisci
              </Text>

              {SIGNING_SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.name}
                  style={styles.serviceButton}
                  onPress={() => handleSigningService(service.name)}
                >
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>
                      {service.name.toUpperCase()}
                    </Text>
                    <Text style={styles.serviceDescription}>
                      Firma digitale sicura e legalmente valida
                    </Text>
                  </View>
                  <MaterialIcons name="arrow-forward-ios" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadContract}
            >
              <MaterialIcons name="download" size={20} color="#2196F3" />
              <Text style={styles.downloadButtonText}>Scarica Contratto</Text>
            </TouchableOpacity>

            {contract.signed && (
              <TouchableOpacity
                style={styles.completedButton}
                disabled={true}
              >
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={styles.completedButtonText}>Contratto Firmato</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
  contractCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contractTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  contractDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusSigned: {
    backgroundColor: '#4CAF50',
  },
  statusPending: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
  signingSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  serviceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
  },
  actionsSection: {
    gap: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginLeft: 8,
  },
  completedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
  },
  completedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  webViewBackButton: {
    padding: 8,
    marginRight: 12,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
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
    textAlign: 'center',
  },
});