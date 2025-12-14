import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface SignatureMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  backgroundColor: string;
  description: string;
  isConnected: boolean;
  connectionStatus: 'not_connected' | 'connecting' | 'connected' | 'error';
}

const signatureMethods: SignatureMethod[] = [
  {
    id: 'aruba',
    name: 'Firma con Aruba',
    icon: 'verified-user',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    description: 'Firma digitale con certificato Aruba',
    isConnected: false,
    connectionStatus: 'not_connected',
  },
  {
    id: 'docusign',
    name: 'Firma con Docusign',
    icon: 'description',
    color: '#8D6E63',
    backgroundColor: '#F5F5DC',
    description: 'Piattaforma leader per firme digitali',
    isConnected: false,
    connectionStatus: 'not_connected',
  },
  {
    id: 'spid',
    name: 'Firma con SPID',
    icon: 'security',
    color: '#2E7D32',
    backgroundColor: '#E8F5E8',
    description: 'Sistema Pubblico di Identità Digitale',
    isConnected: false,
    connectionStatus: 'not_connected',
  },
];

interface ContractSignatureScreenProps {
  onBack: () => void;
  contractId?: string;
}

export default function ContractSignatureScreen({ onBack, contractId }: ContractSignatureScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<'awaiting' | 'in_progress' | 'completed'>('awaiting');
  const [methods, setMethods] = useState<SignatureMethod[]>(signatureMethods);

  const handleConnectAccount = async (methodId: string) => {
    const method = methods.find(m => m.id === methodId);
    if (!method) return;

    // Update connection status to connecting
    setMethods(prev => prev.map(m => 
      m.id === methodId 
        ? { ...m, connectionStatus: 'connecting' }
        : m
    ));

    try {
      // Simulate API call for account connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful connection
      setMethods(prev => prev.map(m => 
        m.id === methodId 
          ? { ...m, isConnected: true, connectionStatus: 'connected' }
          : m
      ));

      Alert.alert(
        'Account Connesso',
        `Il tuo account ${method.name} è stato connesso con successo!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Handle connection error
      setMethods(prev => prev.map(m => 
        m.id === methodId 
          ? { ...m, connectionStatus: 'error' }
          : m
      ));

      Alert.alert(
        'Errore di Connessione',
        'Impossibile connettere l\'account. Riprova più tardi.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMethodSelect = (methodId: string) => {
    const method = methods.find(m => m.id === methodId);
    if (!method) return;

    if (!method.isConnected) {
      Alert.alert(
        'Account Non Connesso',
        `Per utilizzare ${method.name}, devi prima connettere il tuo account. Vuoi procedere con la connessione?`,
        [
          { text: 'Annulla', style: 'cancel' },
          {
            text: 'Connetti',
            onPress: () => handleConnectAccount(methodId),
          },
        ]
      );
      return;
    }

    setSelectedMethod(methodId);
    Alert.alert(
      'Metodo Selezionato',
      `Hai selezionato ${method.name}. Vuoi procedere con la firma?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Procedi',
          onPress: () => {
            setSignatureStatus('in_progress');
            // Simulate signature process
            setTimeout(() => {
              setSignatureStatus('completed');
              Alert.alert('Firma Completata', 'Il contratto è stato firmato con successo!');
            }, 2000);
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    switch (signatureStatus) {
      case 'awaiting':
        return { text: 'In attesa di firma', color: '#FF9800', icon: 'info' };
      case 'in_progress':
        return { text: 'Firma in corso...', color: '#2196F3', icon: 'hourglass-empty' };
      case 'completed':
        return { text: 'Firma completata', color: '#4CAF50', icon: 'check-circle' };
      default:
        return { text: 'In attesa di firma', color: '#FF9800', icon: 'info' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contratto e Pagamenti</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Firma del Contratto</Text>
          <Text style={styles.subtitle}>
            Seleziona un metodo per firmare digitalmente il tuo contratto di locazione.
          </Text>
        </View>

        {/* Signature Methods */}
        <View style={styles.methodsContainer}>
          {methods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
                method.isConnected && styles.connectedMethodCard,
              ]}
              onPress={() => handleMethodSelect(method.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.backgroundColor }]}>
                <MaterialIcons 
                  name={method.icon as any} 
                  size={32} 
                  color={method.color} 
                />
              </View>
              <View style={styles.methodInfo}>
                <View style={styles.methodHeader}>
                  <Text style={styles.methodName}>{method.name}</Text>
                  {method.isConnected && (
                    <View style={styles.connectedBadge}>
                      <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                      <Text style={styles.connectedText}>Connesso</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodDescription}>{method.description}</Text>
                {method.connectionStatus === 'connecting' && (
                  <Text style={styles.connectingText}>Connessione in corso...</Text>
                )}
                {method.connectionStatus === 'error' && (
                  <Text style={styles.errorText}>Errore di connessione</Text>
                )}
              </View>
              <View style={styles.methodActions}>
                {selectedMethod === method.id && (
                  <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
                )}
                {!method.isConnected && method.connectionStatus !== 'connecting' && (
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleConnectAccount(method.id);
                    }}
                  >
                    <MaterialIcons name="link" size={16} color="#2196F3" />
                    <Text style={styles.connectButtonText}>Connetti</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Stato Firma</Text>
            <View style={styles.statusInfo}>
              <MaterialIcons 
                name={statusInfo.icon as any} 
                size={16} 
                color={statusInfo.color} 
              />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Contract Details */}
        <View style={styles.contractDetails}>
          <Text style={styles.detailsTitle}>Dettagli Contratto</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo:</Text>
            <Text style={styles.detailValue}>Contratto di Locazione</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Durata:</Text>
            <Text style={styles.detailValue}>12 mesi</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Canone:</Text>
            <Text style={styles.detailValue}>€1,200/mese</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Deposito:</Text>
            <Text style={styles.detailValue}>€2,400</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={onBack}
          >
            <Text style={styles.secondaryButtonText}>Annulla</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.primaryButton,
              (!selectedMethod || !methods.find(m => m.id === selectedMethod)?.isConnected) && styles.disabledButton
            ]}
            onPress={() => selectedMethod && handleMethodSelect(selectedMethod)}
            disabled={!selectedMethod || !methods.find(m => m.id === selectedMethod)?.isConnected}
          >
            <LinearGradient
              colors={
                selectedMethod && methods.find(m => m.id === selectedMethod)?.isConnected
                  ? ['#2196F3', '#1976D2']
                  : ['#ccc', '#999']
              }
              style={styles.buttonGradient}
            >
              <MaterialIcons name="edit" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Firma Contratto</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
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
    paddingHorizontal: 20,
  },
  titleSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  methodsContainer: {
    marginBottom: 32,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedMethodCard: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  methodIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  connectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  connectingText: {
    fontSize: 12,
    color: '#2196F3',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    fontStyle: 'italic',
  },
  methodActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  connectButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  connectedMethodCard: {
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contractDetails: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButton: {
    // Handled by gradient
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});
