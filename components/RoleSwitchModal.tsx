import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FadeIn, ScaleIn } from './AnimatedComponents';

const { width } = Dimensions.get('window');

interface RoleSwitchModalProps {
  visible: boolean;
  currentRole: 'tenant' | 'landlord';
  onClose: () => void;
  onSwitchRole: (newRole: 'tenant' | 'landlord') => void;
}

export default function RoleSwitchModal({
  visible,
  currentRole,
  onClose,
  onSwitchRole,
}: RoleSwitchModalProps) {
  const handleRoleSwitch = (newRole: 'tenant' | 'landlord') => {
    if (newRole === currentRole) {
      onClose();
      return;
    }

    Alert.alert(
      'Cambia Ruolo',
      `Sei sicuro di voler passare a ${newRole === 'tenant' ? 'Inquilino' : 'Proprietario'}?`,
      [
        {
          text: 'Annulla',
          style: 'cancel',
        },
        {
          text: 'Conferma',
          onPress: () => {
            onSwitchRole(newRole);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <FadeIn>
          <View style={styles.modalContainer}>
            <ScaleIn delay={100}>
              <View style={styles.header}>
                <Text style={styles.title}>Cambia Ruolo</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </ScaleIn>

            <FadeIn delay={200}>
              <Text style={styles.subtitle}>
                Scegli come vuoi utilizzare l'app
              </Text>
            </FadeIn>

            <View style={styles.rolesContainer}>
              <ScaleIn delay={300}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    currentRole === 'tenant' && styles.activeRoleCard,
                  ]}
                  onPress={() => handleRoleSwitch('tenant')}
                >
                  <LinearGradient
                    colors={
                      currentRole === 'tenant'
                        ? ['#2196F3', '#1976D2']
                        : ['#f8f9fa', '#e9ecef']
                    }
                    style={styles.roleGradient}
                  >
                    <MaterialIcons
                      name="home"
                      size={32}
                      color={currentRole === 'tenant' ? '#fff' : '#2196F3'}
                    />
                    <Text
                      style={[
                        styles.roleTitle,
                        currentRole === 'tenant' && styles.activeRoleTitle,
                      ]}
                    >
                      Inquilino
                    </Text>
                    <Text
                      style={[
                        styles.roleDescription,
                        currentRole === 'tenant' && styles.activeRoleDescription,
                      ]}
                    >
                      Cerca e affitta immobili
                    </Text>
                    {currentRole === 'tenant' && (
                      <View style={styles.checkIcon}>
                        <MaterialIcons name="check" size={20} color="#fff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScaleIn>

              <ScaleIn delay={400}>
                <TouchableOpacity
                  style={[
                    styles.roleCard,
                    currentRole === 'landlord' && styles.activeRoleCard,
                  ]}
                  onPress={() => handleRoleSwitch('landlord')}
                >
                  <LinearGradient
                    colors={
                      currentRole === 'landlord'
                        ? ['#4CAF50', '#388E3C']
                        : ['#f8f9fa', '#e9ecef']
                    }
                    style={styles.roleGradient}
                  >
                    <MaterialIcons
                      name="business"
                      size={32}
                      color={currentRole === 'landlord' ? '#fff' : '#4CAF50'}
                    />
                    <Text
                      style={[
                        styles.roleTitle,
                        currentRole === 'landlord' && styles.activeRoleTitle,
                      ]}
                    >
                      Proprietario
                    </Text>
                    <Text
                      style={[
                        styles.roleDescription,
                        currentRole === 'landlord' && styles.activeRoleDescription,
                      ]}
                    >
                      Gestisci e affitta i tuoi immobili
                    </Text>
                    {currentRole === 'landlord' && (
                      <View style={styles.checkIcon}>
                        <MaterialIcons name="check" size={20} color="#fff" />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </ScaleIn>
            </View>

            <FadeIn delay={500}>
              <View style={styles.infoContainer}>
                <MaterialIcons name="info" size={16} color="#666" />
                <Text style={styles.infoText}>
                  Puoi cambiare account in qualsiasi momento dalle impostazioni
                </Text>
              </View>
            </FadeIn>
          </View>
        </FadeIn>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width - 40,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activeRoleCard: {
    shadowColor: '#2196F3',
    shadowOpacity: 0.3,
    elevation: 8,
  },
  roleGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  activeRoleTitle: {
    color: '#fff',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activeRoleDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
});




