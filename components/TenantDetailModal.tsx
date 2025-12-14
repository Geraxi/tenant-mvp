import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';

interface TenantDetailModalProps {
  visible: boolean;
  tenant: User | null;
  onClose: () => void;
}

export default function TenantDetailModal({ visible, tenant, onClose }: TenantDetailModalProps) {
  if (!tenant) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dettagli Inquilino</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <Image
                source={{ uri: tenant.photos?.[0] || 'https://via.placeholder.com/120' }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{tenant.name}</Text>
                <Text style={styles.email}>{tenant.email}</Text>
                <View style={styles.verificationBadge}>
                  <MaterialIcons 
                    name={tenant.verified === 'verified' ? "verified" : "warning"} 
                    size={16} 
                    color={tenant.verified === 'verified' ? "#4CAF50" : "#FF9800"} 
                  />
                  <Text style={[
                    styles.verificationText,
                    { color: tenant.verified === 'verified' ? "#4CAF50" : "#FF9800" }
                  ]}>
                    {tenant.verified === 'verified' ? "Verificato" : "Non verificato"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informazioni Personali</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="person" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Nome</Text>
                  <Text style={styles.infoValue}>{tenant.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="email" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{tenant.email}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="badge" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Documento ID</Text>
                  <Text style={styles.infoValue}>{tenant.idDocument || 'Non fornito'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="calendar-today" size={20} color="#4A90E2" />
                  <Text style={styles.infoLabel}>Membro dal</Text>
                  <Text style={styles.infoValue}>
                    {new Date(tenant.createdAt).toLocaleDateString('it-IT')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Verification Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stato Verifica</Text>
              <View style={styles.verificationContainer}>
                <View style={styles.verificationItem}>
                  <MaterialIcons 
                    name={tenant.verified === 'verified' ? "check-circle" : "radio-button-unchecked"} 
                    size={24} 
                    color={tenant.verified === 'verified' ? "#4CAF50" : "#ccc"} 
                  />
                  <View style={styles.verificationDetails}>
                    <Text style={styles.verificationTitle}>Account Verificato</Text>
                    <Text style={styles.verificationDescription}>
                      {tenant.verified === 'verified' 
                        ? "L'account è stato verificato con successo" 
                        : "L'account non è ancora verificato"
                      }
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contatti</Text>
              <View style={styles.contactContainer}>
                <TouchableOpacity style={styles.contactButton}>
                  <MaterialIcons name="message" size={20} color="white" />
                  <Text style={styles.contactButtonText}>Invia Messaggio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactButtonSecondary}>
                  <MaterialIcons name="phone" size={20} color="#4A90E2" />
                  <Text style={styles.contactButtonTextSecondary}>Chiama</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Additional Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Note Aggiuntive</Text>
              <View style={styles.notesContainer}>
                <Text style={styles.notesText}>
                  Questo inquilino ha mostrato interesse per le tue proprietà. 
                  Puoi contattarlo direttamente per discutere i dettagli dell'affitto 
                  e organizzare una visita.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  verificationContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationDetails: {
    marginLeft: 15,
    flex: 1,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  verificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contactButtonSecondary: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  contactButtonTextSecondary: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});




