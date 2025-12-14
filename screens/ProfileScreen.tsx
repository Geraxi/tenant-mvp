import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User, Property } from '../types';
import VerificationBadge from '../components/VerificationBadge';
import Logo from '../components/Logo';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import AccountDeletionScreen from './AccountDeletionScreen';
import HelpCenterScreen from './HelpCenterScreen';
import SendFeedbackScreen from './SendFeedbackScreen';

interface ProfileScreenProps {
  user: User;
  properties?: Property[];
  onBack: () => void;
  onVerification: () => void;
  onCreateListing?: () => void;
  onHomeGoal?: () => void;
  onLogout: () => void;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  onDeleteAccount: (feedback: any) => void;
  onToggleAccountType: () => void;
}

export default function ProfileScreen({ 
  user, 
  properties = [], 
  onBack, 
  onVerification, 
  onCreateListing,
  onHomeGoal,
  onLogout,
  onUpdateUser,
  onDeleteAccount,
  onToggleAccountType
}: ProfileScreenProps) {
  const [currentView, setCurrentView] = useState<'profile' | 'settings' | 'edit' | 'delete' | 'help' | 'feedback'>('profile');

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  const handleDeleteAccount = (feedback: any) => {
    onDeleteAccount(feedback);
    setCurrentView('profile');
  };

  const handleSaveProfile = (updatedUser: Partial<User>) => {
    onUpdateUser(updatedUser);
    setCurrentView('profile');
  };

  if (currentView === 'settings') {
    return (
      <SettingsScreen
        user={user}
        onBack={() => setCurrentView('profile')}
        onEditProfile={() => setCurrentView('edit')}
        onToggleAccountType={onToggleAccountType}
        onDeleteAccount={() => setCurrentView('delete')}
        onLogout={onLogout}
        onHelpCenter={() => setCurrentView('help')}
        onSendFeedback={() => setCurrentView('feedback')}
      />
    );
  }

  if (currentView === 'edit') {
    return (
      <EditProfileScreen
        user={user}
        onBack={() => setCurrentView('profile')}
        onSave={handleSaveProfile}
      />
    );
  }

  if (currentView === 'delete') {
    return (
      <AccountDeletionScreen
        onBack={() => setCurrentView('profile')}
        onConfirmDeletion={handleDeleteAccount}
      />
    );
  }

  if (currentView === 'help') {
    return (
      <HelpCenterScreen
        onBack={() => setCurrentView('profile')}
      />
    );
  }

  if (currentView === 'feedback') {
    return (
      <SendFeedbackScreen
        onBack={() => setCurrentView('profile')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Logo size="small" showBackground={false} />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableOpacity onPress={() => setCurrentView('settings')}>
          <MaterialIcons name="settings" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user.photos[0] }} 
            style={styles.profileImage}
          />
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <View style={styles.verificationContainer}>
            <VerificationBadge 
              status={user.verified}
              idVerified={user.idVerified}
              backgroundCheck={user.backgroundCheckPassed}
              size="large"
            />
          </View>
        </View>

        {user.verified !== 'verified' && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={onVerification}
          >
            <MaterialIcons name="verified-user" size={24} color="#fff" />
            <Text style={styles.verifyButtonText}>Complete Verification</Text>
          </TouchableOpacity>
        )}

        {/* HomeGoal Section */}
        {user.userType === 'tenant' && onHomeGoal && (
          <TouchableOpacity 
            style={styles.homeGoalButton}
            onPress={onHomeGoal}
          >
            <MaterialIcons name="savings" size={24} color="#fff" />
            <Text style={styles.homeGoalButtonText}>HomeGoal</Text>
            <Text style={styles.homeGoalButtonSubtext}>Risparmia per la tua prima casa</Text>
          </TouchableOpacity>
        )}

        {/* Homeowner Listings Section */}
        {user.userType === 'homeowner' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>I Miei Annunci</Text>
              {onCreateListing && (
                <TouchableOpacity 
                  style={styles.addListingButton}
                  onPress={onCreateListing}
                >
                  <MaterialIcons name="add" size={20} color="#fff" />
                  <Text style={styles.addListingButtonText}>Nuovo</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {properties.length === 0 ? (
              <View style={styles.emptyListings}>
                <MaterialIcons name="home-work" size={48} color="#CCC" />
                <Text style={styles.emptyListingsText}>Nessun annuncio ancora</Text>
                <Text style={styles.emptyListingsSubtext}>
                  Crea il tuo primo annuncio per iniziare a trovare inquilini
                </Text>
                {onCreateListing && (
                  <TouchableOpacity 
                    style={styles.createFirstListingButton}
                    onPress={onCreateListing}
                  >
                    <MaterialIcons name="add-home" size={24} color="#fff" />
                    <Text style={styles.createFirstListingButtonText}>Crea Annuncio</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.listingsGrid}>
                {properties.map((property) => (
                  <View key={property.id} style={styles.listingCard}>
                    <Image 
                      source={{ uri: property.photos[0] }} 
                      style={styles.listingImage}
                    />
                    <View style={styles.listingInfo}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {property.title}
                      </Text>
                      <Text style={styles.listingPrice}>€{property.rent}/mese</Text>
                      <View style={styles.listingDetails}>
                        <View style={styles.listingDetail}>
                          <MaterialIcons name="bed" size={14} color="#666" />
                          <Text style={styles.listingDetailText}>{property.bedrooms}</Text>
                        </View>
                        <View style={styles.listingDetail}>
                          <MaterialIcons name="bathtub" size={14} color="#666" />
                          <Text style={styles.listingDetailText}>{property.bathrooms}</Text>
                        </View>
                        <View style={styles.listingDetail}>
                          <MaterialIcons name="square-foot" size={14} color="#666" />
                          <Text style={styles.listingDetailText}>{property.squareMeters}m²</Text>
                        </View>
                      </View>
                      <View style={styles.listingStatus}>
                        <View style={[
                          styles.statusBadge,
                          property.available ? styles.statusAvailable : styles.statusUnavailable
                        ]}>
                          <Text style={styles.statusText}>
                            {property.available ? 'Disponibile' : 'Non Disponibile'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color="#2196F3" />
              <Text style={styles.infoLabel}>User Type:</Text>
              <Text style={styles.infoValue}>
                {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color="#2196F3" />
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{user.location}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <View style={styles.infoCard}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  verificationContainer: {
    marginTop: 8,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  homeGoalButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeGoalButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    flex: 1,
  },
  homeGoalButtonSubtext: {
    color: '#E3F2FD',
    fontSize: 14,
    marginLeft: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addListingButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  addListingButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyListings: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyListingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyListingsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  createFirstListingButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  createFirstListingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingsGrid: {
    gap: 16,
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingImage: {
    width: '100%',
    height: 180,
  },
  listingInfo: {
    padding: 16,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  listingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 12,
  },
  listingDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  listingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listingDetailText: {
    fontSize: 14,
    color: '#666',
  },
  listingStatus: {
    marginTop: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusAvailable: {
    backgroundColor: '#E8F9F7',
  },
  statusUnavailable: {
    backgroundColor: '#FFE8E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 'auto',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#F44336',
    fontSize: 16,
    fontWeight: '600',
  },
});
