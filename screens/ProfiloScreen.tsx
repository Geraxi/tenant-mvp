import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { Utente } from '../src/types';
import { FadeIn, ScaleIn, GradientCard, Shimmer } from '../components/AnimatedComponents';
import RoleSwitchModal from '../components/RoleSwitchModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '../src/utils/logger';

const { width } = Dimensions.get('window');

interface ProfiloScreenProps {
  onNavigateToEditProfile: () => void;
  onNavigateToVerification: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  onBack: () => void;
  onRoleSwitch: (newRole: 'tenant' | 'landlord') => void;
}

export default function ProfiloScreen({
  onNavigateToEditProfile,
  onNavigateToVerification,
  onNavigateToSettings,
  onLogout,
  onBack,
  onRoleSwitch,
}: ProfiloScreenProps) {
  const { user, updateProfile, uploadProfilePhoto, signOut, switchRole, deleteAccount } = useSupabaseAuth();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [showRoleSwitchModal, setShowRoleSwitchModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  // Debug user data changes
  useEffect(() => {
    logger.debug('ProfiloScreen - User data changed:', {
      hasUser: !!user,
      userFoto: user?.foto,
      userName: user?.nome,
      userEmail: user?.email
    });
  }, [user]);

  const loadSettings = async () => {
    try {
      const [notifications, darkMode] = await Promise.all([
        AsyncStorage.getItem('notifications_enabled'),
        AsyncStorage.getItem('dark_mode_enabled'),
      ]);
      
      if (notifications !== null) {
        setNotificationsEnabled(JSON.parse(notifications));
      }
      if (darkMode !== null) {
        setDarkModeEnabled(JSON.parse(darkMode));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Conferma Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { 
          text: 'Esci', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            onLogout();
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Elimina Account',
      'Sei sicuro di voler eliminare il tuo account? Questa azione non può essere annullata e tutti i tuoi dati verranno rimossi permanentemente.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Conferma Finale',
              'Questa è l\'ultima conferma. Il tuo account e tutti i dati associati verranno eliminati permanentemente. Vuoi continuare?',
              [
                { text: 'Annulla', style: 'cancel' },
                {
                  text: 'Elimina Definitivamente',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoading(true);
                      const result = await deleteAccount();
                      if (result.success) {
                        Alert.alert(
                          'Account Eliminato',
                          'Il tuo account è stato eliminato con successo.',
                          [{ text: 'OK', onPress: () => onLogout() }]
                        );
                      } else {
                        Alert.alert('Errore', result.error || 'Impossibile eliminare l\'account. Riprova più tardi.');
                      }
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      Alert.alert('Errore', 'Impossibile eliminare l\'account. Riprova più tardi.');
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleChangePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Errore', 'Permessi libreria non concessi');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLoading(true);
        const uploadResult = await uploadProfilePhoto(result.assets[0] as any);
        if (uploadResult.success) {
          Alert.alert('Successo', 'Foto profilo aggiornata');
        } else {
          Alert.alert('Errore', uploadResult.error || 'Impossibile aggiornare la foto');
        }
      }
    } catch (error) {
      console.error('Error changing photo:', error);
      Alert.alert('Errore', 'Impossibile cambiare la foto');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      setNotificationsEnabled(value);
      // Save to AsyncStorage
      await AsyncStorage.setItem('notifications_enabled', JSON.stringify(value));
      Alert.alert('Successo', `Notifiche ${value ? 'abilitate' : 'disabilitate'}`);
    } catch (error) {
      console.error('Error saving notification preference:', error);
      Alert.alert('Errore', 'Impossibile salvare le preferenze');
    }
  };

  const handleToggleDarkMode = async (value: boolean) => {
    try {
      setDarkModeEnabled(value);
      // Save to AsyncStorage
      await AsyncStorage.setItem('dark_mode_enabled', JSON.stringify(value));
      Alert.alert('Successo', `Modalità scura ${value ? 'abilitata' : 'disabilitata'}`);
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
      Alert.alert('Errore', 'Impossibile salvare le preferenze');
    }
  };

  const handleRoleSwitch = async (newRole: 'tenant' | 'landlord') => {
    try {
      setLoading(true);
      logger.debug('🔄 ProfiloScreen - Calling App handleRoleSwitch with:', newRole);
      
      if (onRoleSwitch) {
        onRoleSwitch(newRole);
        // Close the modal after calling the centralized role switch
        setShowRoleSwitchModal(false);
      } else {
        // Fallback to local role switch if App function not available
        const result = await switchRole(newRole);
        if (result.success) {
          Alert.alert(
            'Ruolo Cambiato',
            `Ora stai utilizzando l'app come ${newRole === 'tenant' ? 'Inquilino' : 'Proprietario'}`,
            [{ text: 'OK' }]
          );
          setShowRoleSwitchModal(false);
        } else {
          Alert.alert('Errore', result.error || 'Impossibile cambiare ruolo');
        }
      }
    } catch (error) {
      console.error('Error switching role:', error);
      Alert.alert('Errore', 'Impossibile cambiare ruolo');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationPress = () => {
    if (user?.verificato) {
      Alert.alert(
        'Identità Verificata',
        'La tua identità è già stata verificata con successo.',
        [{ text: 'OK' }]
      );
    } else if (user?.verification_pending) {
      Alert.alert(
        'Verifica in Corso',
        'La tua verifica identità è in corso. Riceverai una notifica quando sarà completata.',
        [{ text: 'OK' }]
      );
    } else {
      onNavigateToVerification();
    }
  };

  const getRoleText = (ruolo: string) => {
    switch (ruolo) {
      case 'tenant':
        return 'Inquilino';
      case 'landlord':
      case 'homeowner':
        return 'Proprietario';
      default:
        return ruolo;
    }
  };

  const getRoleColor = (ruolo: string) => {
    switch (ruolo) {
      case 'tenant':
        return '#4CAF50';
      case 'landlord':
      case 'homeowner':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const getVerificationStatus = () => {
    if (user?.verificato) {
      return {
        status: 'verified',
        text: 'Verificato',
        color: '#4CAF50',
        icon: 'verified',
      };
    } else if (user?.verification_pending) {
      return {
        status: 'pending',
        text: 'In attesa di verifica',
        color: '#FF9800',
        icon: 'schedule',
      };
    } else {
      return {
        status: 'not_started',
        text: 'Verifica la tua identità',
        color: '#2196F3',
        icon: 'info',
      };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <FadeIn delay={200} from="top">
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profilo</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={onNavigateToSettings}>
            <MaterialIcons name="settings" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </FadeIn>

      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <FadeIn delay={400} from="bottom">
          <GradientCard style={styles.profileHeader}>
            <ScaleIn delay={600}>
              <View style={styles.avatarContainer}>
                <Image
                  key={user?.foto || 'default'}
                  source={
                    user?.foto 
                      ? { uri: user.foto }
                      : require('../assets/images/icon.png')
                  }
                  style={styles.avatar}
                />
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={handleChangePhoto}
                  disabled={loading}
                >
                  <MaterialIcons name="camera-alt" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </ScaleIn>
            
            <FadeIn delay={800}>
              <Text style={styles.userName}>{user?.nome || 'Utente'}</Text>
            </FadeIn>
            <FadeIn delay={1000}>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </FadeIn>
            
            <FadeIn delay={1200}>
              <TouchableOpacity 
                style={styles.roleContainer}
                onPress={() => setShowRoleSwitchModal(true)}
                disabled={loading}
              >
                <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user?.userType || user?.ruolo || '') }]}>
                  <MaterialIcons 
                    name={(user?.userType || user?.ruolo) === 'landlord' ? 'business' : 'home'} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.roleText}>
                    {getRoleText(user?.userType || user?.ruolo || '')}
                  </Text>
                  <MaterialIcons 
                    name="swap-horiz" 
                    size={16} 
                    color="#fff" 
                    style={styles.swapIcon}
                  />
                </View>
              </TouchableOpacity>
            </FadeIn>

            <FadeIn delay={1400}>
              <View style={styles.verificationContainer}>
                <View style={[styles.verificationBadge, { backgroundColor: verificationStatus.color }]}>
                  <MaterialIcons 
                    name={verificationStatus.icon as any} 
                    size={16} 
                    color="#fff" 
                  />
                  <Text style={styles.verificationText}>
                    {verificationStatus.text}
                  </Text>
                </View>
              </View>
            </FadeIn>
          </GradientCard>
        </FadeIn>

        {/* Profile Actions */}
        <FadeIn delay={1600} from="bottom">
          <View style={styles.actionsContainer}>
            <ScaleIn delay={1800}>
              <TouchableOpacity style={styles.actionButton} onPress={onNavigateToEditProfile}>
                <View style={styles.actionIcon}>
                  <MaterialIcons name="edit" size={24} color="#2196F3" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Modifica Profilo</Text>
                  <Text style={styles.actionSubtitle}>Aggiorna le tue informazioni personali</Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
              </TouchableOpacity>
            </ScaleIn>

            <ScaleIn delay={2000}>
              <TouchableOpacity style={styles.actionButton} onPress={handleVerificationPress}>
                <View style={styles.actionIcon}>
                  <MaterialIcons name="verified-user" size={24} color="#FF9800" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Verifica Identità</Text>
                  <Text style={styles.actionSubtitle}>
                    {verificationStatus.text}
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
              </TouchableOpacity>
            </ScaleIn>

          </View>
        </FadeIn>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          <Text style={styles.sectionTitle}>Impostazioni</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="notifications" size={24} color="#2196F3" />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Notifiche</Text>
                <Text style={styles.settingSubtitle}>Ricevi promemoria e aggiornamenti</Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <MaterialIcons name="dark-mode" size={24} color="#333" />
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Modalità Scura</Text>
                <Text style={styles.settingSubtitle}>Tema scuro per l'app</Text>
              </View>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
              thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.sectionTitle}>Informazioni App</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Versione</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Tipo Account</Text>
            <Text style={styles.infoValue}>{getRoleText(user?.userType || user?.ruolo || '')}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data Registrazione</Text>
            <Text style={styles.infoValue}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('it-IT') : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.logoutButtonGradient}
          >
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Esci</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount} disabled={loading}>
          <View style={styles.deleteAccountButtonContent}>
            <MaterialIcons name="delete-forever" size={20} color="#F44336" />
            <Text style={styles.deleteAccountButtonText}>Elimina Account</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Role Switch Modal */}
      <RoleSwitchModal
        visible={showRoleSwitchModal}
        currentRole={(user?.userType || user?.ruolo) as 'tenant' | 'landlord' || 'tenant'}
        onClose={() => setShowRoleSwitchModal(false)}
        onSwitchRole={handleRoleSwitch}
      />
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
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  roleContainer: {
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  swapIcon: {
    marginLeft: 8,
  },
  verificationContainer: {
    marginBottom: 8,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionsContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingContent: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  appInfoContainer: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  logoutButton: {
    margin: 20,
    borderRadius: 12,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteAccountButton: {
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F44336',
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteAccountButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  deleteAccountButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
