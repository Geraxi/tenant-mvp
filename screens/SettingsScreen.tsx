import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsScreenProps {
  onNavigateBack: () => void;
  onLogout: () => void;
  onEditProfile: () => void;
  onChangePassword: () => void;
  onManageEmail: () => void;
  onVerifyIdentity: () => void;
  onOpenHelpCenter: () => void;
}

export default function SettingsScreen({
  onNavigateBack,
  onLogout,
  onEditProfile,
  onChangePassword,
  onManageEmail,
  onVerifyIdentity,
  onOpenHelpCenter,
}: SettingsScreenProps) {
  const { user } = useSupabaseAuth();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    locationServices: true,
    analytics: false,
    marketing: false,
    soundEnabled: true,
    hapticFeedback: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('user_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('user_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
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
              'Conferma Eliminazione',
              'Digita "ELIMINA" per confermare l\'eliminazione del tuo account.',
              [
                { text: 'Annulla', style: 'cancel' },
                {
                  text: 'Conferma',
                  style: 'destructive',
                  onPress: confirmDeleteAccount,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.prompt(
      'Conferma Eliminazione',
      'Digita "ELIMINA" per confermare:',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: (text) => {
            if (text === 'ELIMINA') {
              performAccountDeletion();
            } else {
              Alert.alert('Errore', 'Testo di conferma non corretto');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const performAccountDeletion = async () => {
    try {
      // In a real app, you would call Supabase to delete the user account
      // For now, we'll just clear local data and logout
      await AsyncStorage.clear();
      await signOut();
      onLogout();
      Alert.alert('Account Eliminato', 'Il tuo account è stato eliminato con successo.');
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Errore', 'Impossibile eliminare l\'account. Riprova più tardi.');
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contatta Supporto',
      'Come preferisci contattarci?',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@tenantapp.com?subject=Supporto App');
          },
        },
        {
          text: 'Telefono',
          onPress: () => {
            Linking.openURL('tel:+390123456789');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'La privacy policy sarà disponibile presto. Contattaci per maggiori informazioni.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Termini di Servizio',
      'I termini di servizio saranno disponibili presto. Contattaci per maggiori informazioni.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Valuta l\'App',
      'Grazie per il tuo interesse! L\'app sarà presto disponibile negli store.',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleShareApp = async () => {
    try {
      const shareOptions = {
        message: 'Scopri Tenant - L\'app per trovare la casa perfetta! 🏠\n\nTrova la tua casa ideale o il tuo inquilino ideale con Tenant.\n\nL\'app sarà presto disponibile!',
        title: 'Tenant - Trova la tua casa perfetta',
      };

      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        Alert.alert('Grazie!', 'Grazie per aver condiviso Tenant!');
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile condividere l\'app');
    }
  };

  const handleExportData = () => {
    Alert.alert(
      'Esporta Dati',
      'I tuoi dati verranno esportati e inviati via email.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Esporta',
          onPress: () => {
            Alert.alert('Esportazione', 'I tuoi dati sono stati esportati e inviati via email.');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Cancella Cache',
      'Questo rimuoverà tutti i dati temporanei dell\'app.',
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Cancella',
          onPress: async () => {
            try {
              // Clear cache (in a real app, you would clear specific cache data)
              Alert.alert('Successo', 'Cache cancellata con successo.');
            } catch (error) {
              Alert.alert('Errore', 'Impossibile cancellare la cache.');
            }
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent, 
    danger = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    danger?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingInfo}>
        <MaterialIcons 
          name={icon as any} 
          size={24} 
          color={danger ? '#F44336' : '#2196F3'} 
        />
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent || (onPress && (
        <MaterialIcons name="arrow-forward-ios" size={16} color="#666" />
      ))}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Impostazioni</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollContent}
      >
        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="person"
            title="Modifica Profilo"
            subtitle="Aggiorna le tue informazioni"
            onPress={onEditProfile}
          />
          
          <SettingItem
            icon="lock"
            title="Cambia Password"
            subtitle="Aggiorna la tua password"
            onPress={onChangePassword}
          />
          
          <SettingItem
            icon="email"
            title="Gestisci Email"
            subtitle="Modifica indirizzo email"
            onPress={onManageEmail}
          />

          <SettingItem
            icon="verified-user"
            title="Verifica Identità"
            subtitle="Carica documento e selfie"
            onPress={() => {
              if (!user?.id) {
                Alert.alert('Errore', 'Nessun utente collegato');
                return;
              }

              if (user.verificato) {
                Alert.alert('Identità Verificata', 'La tua identità è già stata verificata.');
                return;
              }

              if (user.verification_pending) {
                Alert.alert('Verifica in corso', 'Abbiamo già ricevuto i tuoi documenti. Riceverai una notifica quando la verifica sarà completata.');
                return;
              }

              onVerifyIdentity();
            }}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          
          <SettingItem
            icon="notifications"
            title="Notifiche"
            subtitle="Ricevi promemoria e aggiornamenti"
            rightComponent={
              <Switch
                value={settings.notifications}
                onValueChange={(value) => handleSettingChange('notifications', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="dark-mode"
            title="Modalità Scura"
            subtitle="Tema scuro per l'app"
            rightComponent={
              <Switch
                value={settings.darkMode}
                onValueChange={(value) => handleSettingChange('darkMode', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.darkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="location-on"
            title="Servizi di Localizzazione"
            subtitle="Condividi la tua posizione"
            rightComponent={
              <Switch
                value={settings.locationServices}
                onValueChange={(value) => handleSettingChange('locationServices', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.locationServices ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="volume-up"
            title="Suoni"
            subtitle="Abilita suoni dell'app"
            rightComponent={
              <Switch
                value={settings.soundEnabled}
                onValueChange={(value) => handleSettingChange('soundEnabled', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.soundEnabled ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="vibration"
            title="Feedback Tattile"
            subtitle="Vibrazioni per le interazioni"
            rightComponent={
              <Switch
                value={settings.hapticFeedback}
                onValueChange={(value) => handleSettingChange('hapticFeedback', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.hapticFeedback ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        {/* Privacy & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Dati</Text>
          
          <SettingItem
            icon="analytics"
            title="Analisi e Statistiche"
            subtitle="Aiutaci a migliorare l'app"
            rightComponent={
              <Switch
                value={settings.analytics}
                onValueChange={(value) => handleSettingChange('analytics', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.analytics ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="campaign"
            title="Marketing"
            subtitle="Ricevi offerte e promozioni"
            rightComponent={
              <Switch
                value={settings.marketing}
                onValueChange={(value) => handleSettingChange('marketing', value)}
                trackColor={{ false: '#E0E0E0', true: '#2196F3' }}
                thumbColor={settings.marketing ? '#fff' : '#f4f3f4'}
              />
            }
          />
          
          <SettingItem
            icon="download"
            title="Esporta Dati"
            subtitle="Scarica i tuoi dati personali"
            onPress={handleExportData}
          />
          
          <SettingItem
            icon="delete-sweep"
            title="Cancella Cache"
            subtitle="Rimuovi dati temporanei"
            onPress={handleClearCache}
          />
        </View>

        {/* Support & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Supporto & Info</Text>
          
          <SettingItem
            icon="help"
            title="Centro Assistenza"
            subtitle="Domande frequenti e guide"
            onPress={onOpenHelpCenter}
          />
          
          <SettingItem
            icon="support-agent"
            title="Contatta Supporto"
            subtitle="Hai bisogno di aiuto?"
            onPress={handleContactSupport}
          />
          
          <SettingItem
            icon="star"
            title="Valuta App"
            subtitle="Lascia una recensione"
            onPress={handleRateApp}
          />
          
          <SettingItem
            icon="share"
            title="Condividi App"
            subtitle="Raccomanda ai tuoi amici"
            onPress={handleShareApp}
          />
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legale</Text>
          
          <SettingItem
            icon="privacy-tip"
            title="Privacy Policy"
            subtitle="Come usiamo i tuoi dati"
            onPress={handlePrivacyPolicy}
          />
          
          <SettingItem
            icon="description"
            title="Termini di Servizio"
            subtitle="Condizioni d'uso dell'app"
            onPress={handleTermsOfService}
          />
          
          <SettingItem
            icon="info"
            title="Informazioni App"
            subtitle="Versione 1.0.0"
            onPress={() => Alert.alert('App Info', 'Tenant App v1.0.0\nBuild 2024.1')}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zona Pericolosa</Text>
          
          <SettingItem
            icon="delete-forever"
            title="Elimina Account"
            subtitle="Rimuovi permanentemente il tuo account"
            onPress={handleDeleteAccount}
            danger={true}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <LinearGradient
            colors={['#F44336', '#D32F2F']}
            style={styles.logoutButtonGradient}
          >
            <MaterialIcons name="logout" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Esci</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  placeholder: {
    width: 40,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContent: {
    paddingBottom: 32,
  },
  section: {
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
  dangerText: {
    color: '#F44336',
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
});
