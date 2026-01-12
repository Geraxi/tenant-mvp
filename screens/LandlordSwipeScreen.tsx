import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import SwipeCard from '../components/SwipeCard';
import TenantDetailModal from '../components/TenantDetailModal';
import NoMoreListingsScreen from '../components/NoMoreListingsScreen';
import { User, Property } from '../types';
import { MatchingService } from '../src/services/matchingService';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

import { logger } from '../src/utils/logger';

interface LandlordSwipeScreenProps {
  onNavigateToMatches: () => void;
  onNavigateToProfile: () => void;
  onNavigateToPreferences: () => void;
  onNavigateToFilters: () => void;
  onNavigateToOnboarding?: (role: 'tenant' | 'landlord') => void;
  onNavigateToDiscover?: () => void;
  onRoleSwitch?: (newRole: 'tenant' | 'landlord') => void;
}

// PRODUCTION NOTE: Replace with real tenant data from Supabase
// This mock data is for development/demo only
// TODO: Connect to Supabase to fetch real tenants
const MOCK_TENANTS: User[] = [
  {
    id: 'tenant1',
    name: 'Marco',
    email: 'marco.rossi@gmail.com',
    age: 28,
    dateOfBirth: '1995-03-15',
    bio: 'Sono un giovane professionista che cerca un appartamento moderno nel centro di Milano. Amo viaggiare e cucinare.',
    photos: ['https://randomuser.me/api/portraits/men/1.jpg'],
    location: 'Milano',
    userType: 'tenant',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: { 
      budget: 1200, 
      minBudget: 800, 
      maxBudget: 1500,
      bedrooms: 1,
      bathrooms: 1,
      minSquareMeters: 40,
      maxSquareMeters: 80,
      petFriendly: false,
      smoking: false,
      furnished: true
    },
    createdAt: Date.now(),
  },
  {
    id: 'tenant2',
    name: 'Sofia',
    email: 'sofia.bianchi@gmail.com',
    age: 25,
    dateOfBirth: '1998-07-22',
    bio: 'Architetta appassionata di design e arte. Cerco un appartamento luminoso con balcone per le mie piante.',
    photos: ['https://randomuser.me/api/portraits/women/2.jpg'],
    location: 'Milano',
    userType: 'tenant',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: { 
      budget: 1000, 
      minBudget: 700, 
      maxBudget: 1300,
      bedrooms: 1,
      bathrooms: 1,
      minSquareMeters: 35,
      maxSquareMeters: 70,
      petFriendly: true,
      smoking: false,
      furnished: false,
      balconyOrTerrace: true
    },
    createdAt: Date.now(),
  },
  {
    id: 'tenant3',
    name: 'Alessandro',
    email: 'alessandro.verdi@gmail.com',
    age: 30,
    dateOfBirth: '1993-11-08',
    bio: 'Ingegnere informatico che lavora da remoto. Cerco un appartamento silenzioso con buona connessione internet.',
    photos: ['https://randomuser.me/api/portraits/men/3.jpg'],
    location: 'Milano',
    userType: 'tenant',
    verified: 'pending',
    idVerified: false,
    backgroundCheckPassed: false,
    preferences: { 
      budget: 1400, 
      minBudget: 1000, 
      maxBudget: 1800,
      bedrooms: 2,
      bathrooms: 1,
      minSquareMeters: 60,
      maxSquareMeters: 100,
      petFriendly: false,
      smoking: false,
      furnished: true
    },
    createdAt: Date.now(),
  },
  {
    id: 'tenant4',
    name: 'Giulia',
    email: 'giulia.neri@gmail.com',
    age: 27,
    dateOfBirth: '1996-05-14',
    bio: 'Marketing manager dinamica e socievole. Amo organizzare cene con gli amici e cerco un appartamento accogliente.',
    photos: ['https://randomuser.me/api/portraits/women/4.jpg'],
    location: 'Milano',
    userType: 'tenant',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: { 
      budget: 1100, 
      minBudget: 800, 
      maxBudget: 1400,
      bedrooms: 1,
      bathrooms: 1,
      minSquareMeters: 45,
      maxSquareMeters: 75,
      petFriendly: true,
      smoking: false,
      furnished: true
    },
    createdAt: Date.now(),
  },
  {
    id: 'tenant5',
    name: 'Luca',
    email: 'luca.ferrari@gmail.com',
    age: 24,
    dateOfBirth: '1999-09-30',
    bio: 'Studente universitario di economia. Cerco una stanza o un piccolo appartamento vicino all\'università.',
    photos: ['https://randomuser.me/api/portraits/men/5.jpg'],
    location: 'Milano',
    userType: 'tenant',
    verified: 'verified',
    idVerified: true,
    backgroundCheckPassed: true,
    preferences: { 
      budget: 600, 
      minBudget: 400, 
      maxBudget: 800,
      bedrooms: 1,
      bathrooms: 1,
      minSquareMeters: 25,
      maxSquareMeters: 50,
      petFriendly: false,
      smoking: false,
      furnished: true
    },
    createdAt: Date.now(),
  },
];

// PRODUCTION NOTE: Replace with real property data from Supabase
// This mock data is for development/demo only
// TODO: Connect to Supabase to fetch real properties
const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop1',
    owner_id: 'landlord1',
    title: 'Appartamento Moderno in Centro',
    description: 'Spazioso appartamento con 2 camere da letto, luminoso e ben collegato.',
    indirizzo: 'Via Roma 10, Milano',
    location: 'Milano',
    rent: 1200,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 80,
    photos: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBpbiUyMG1pbGFub3xlbnwwfHx8fDE3MDY3OTQ4NDd8MA&ixlib=rb-4.0.3&q=80&w=1080',
    ],
    amenities: ['Wi-Fi', 'Balcone', 'Aria Condizionata'],
    availableFrom: '2024-03-01',
    leaseType: 'long-term',
    deposit: 2400,
    energyClass: 'A',
    furnished: true,
    petFriendly: false,
    parking: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function LandlordSwipeScreen({ onNavigateToMatches, onNavigateToProfile, onNavigateToPreferences, onNavigateToFilters, onNavigateToOnboarding, onNavigateToDiscover, onRoleSwitch }: LandlordSwipeScreenProps) {
  logger.debug('👥 LandlordSwipeScreen - COMPONENT RENDERED!');
  logger.debug('👥 LandlordSwipeScreen - Props received:', { onNavigateToMatches: !!onNavigateToMatches, onNavigateToProfile: !!onNavigateToProfile, onRoleSwitch: !!onRoleSwitch });
  const { user, switchRole } = useSupabaseAuth();
  logger.debug('👥 LandlordSwipeScreen - Component rendered');
  logger.debug('👥 LandlordSwipeScreen - User role:', user?.ruolo);
  const [tenants, setTenants] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedTenants, setLikedTenants] = useState<User[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<User | null>(null);
  const [roleSwitchLoading, setRoleSwitchLoading] = useState(false);

  useEffect(() => {
    logger.debug('👥 LandlordSwipeScreen - Loading tenants for user:', user?.id);
    logger.debug('👥 LandlordSwipeScreen - User role:', user?.ruolo);
    logger.debug('👥 LandlordSwipeScreen - Mock tenants:', MOCK_TENANTS);
    setLoading(true);
    
    // Simulate API call with role-based filtering
    setTimeout(() => {
      setTenants(MOCK_TENANTS);
      setCurrentIndex(0);
      setLoading(false);
      logger.debug('👥 LandlordSwipeScreen - Tenants loaded:', MOCK_TENANTS.length);
    }, 1000);
  }, [user?.id, user?.ruolo]); // Re-fetch when user or role changes

  const currentTenant = tenants[currentIndex];
  const nextTenant = tenants[currentIndex + 1];

  const handleSwipeLeft = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleSwipeRight = async () => {
    if (currentTenant && user) {
      try {
        // Use the first property for now (in real app, landlord would select which property)
        const propertyId = MOCK_PROPERTIES[0].id;
        
        const result = await MatchingService.likeTenant(user.id, currentTenant.id, propertyId);
        
        if (result.success) {
          if (result.match) {
            // It's a match! Show celebration
            setLikedTenants((prev) => [...prev, currentTenant]);
            Alert.alert(
              '🎉 È un Match!',
              `Hai trovato un match con ${currentTenant.name}! Potete iniziare a comunicare.`,
              [{ text: 'Fantastico!' }]
            );
          } else {
            // Just liked, no popup - silent like
            // The like is recorded but no alert is shown
          }
        } else {
          Alert.alert('Errore', 'Impossibile inviare il like. Riprova.');
        }
      } catch (error) {
        console.error('Error liking tenant:', error);
        Alert.alert('Errore', 'Si è verificato un errore. Riprova.');
      }
    }
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleCardPress = () => {
    if (currentTenant) {
      setSelectedTenant(currentTenant);
      setShowDetailModal(true);
    }
  };

  const handleRoleSwitch = async () => {
    if (!user) {
      Alert.alert('Errore', 'Utente non trovato. Effettua il login prima di cambiare ruolo.');
      return;
    }
    
    const currentRole = user.userType || user.ruolo;
    const newRole = currentRole === 'tenant' ? 'landlord' : 'tenant';
    logger.debug('🔄 LandlordSwipeScreen - Current role:', currentRole);
    logger.debug('🔄 LandlordSwipeScreen - Switching to:', newRole);
    
    if (onRoleSwitch) {
      onRoleSwitch(newRole);
    } else {
      Alert.alert('Errore', 'Funzione di cambio ruolo non disponibile');
    }
  };

  if (loading) {
    logger.debug('👥 LandlordSwipeScreen - Showing loading screen');
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento inquilini...</Text>
        <Text style={{ fontSize: 14, color: '#666', marginTop: 10 }}>
          Tenants count: {tenants.length}
        </Text>
        <Text style={{ fontSize: 14, color: '#666' }}>
          Loading: {loading ? 'true' : 'false'}
        </Text>
      </SafeAreaView>
    );
  }

  if (currentIndex >= tenants.length) {
    // Create a mock user object for the NoMoreListingsScreen
    const mockUser = {
      id: user?.id || 'current-landlord',
      name: user?.nome || 'Proprietario',
      email: user?.email || 'proprietario@example.com',
      age: 35,
      location: 'Milano',
      bio: 'Proprietario di immobili',
      photos: [],
      userType: 'homeowner',
      verified: true,
      idVerified: true,
      backgroundCheckPassed: true,
      preferences: { rent: 1200 },
      dateOfBirth: '1985-01-01',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return (
      <SafeAreaView style={styles.container}>
        <NoMoreListingsScreen
          currentUser={mockUser}
          onEditPreferences={onNavigateToPreferences}
          onEditFilters={onNavigateToFilters}
          onRefresh={() => {
            setCurrentIndex(0);
            setLikedTenants([]);
          }}
          onViewMatches={onNavigateToMatches}
          onViewProfile={onNavigateToProfile}
        />
      </SafeAreaView>
    );
  }

  logger.debug('👥 LandlordSwipeScreen - RENDERED!');
  logger.debug('👥 LandlordSwipeScreen - Current tenant:', tenants[currentIndex]);
  logger.debug('👥 LandlordSwipeScreen - Tenants count:', tenants.length);
  logger.debug('👥 LandlordSwipeScreen - Current index:', currentIndex);
  logger.debug('👥 LandlordSwipeScreen - Loading state:', loading);
  logger.debug('👥 LandlordSwipeScreen - About to return main render');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trova Inquilini</Text>
        <TouchableOpacity onPress={onNavigateToMatches} style={styles.matchesButton}>
          <MaterialIcons name="favorite" size={28} color="#F44336" />
          {likedTenants.length > 0 && (
            <View style={styles.matchesBadge}>
              <Text style={styles.matchesBadgeText}>{likedTenants.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${((currentIndex + 1) / tenants.length) * 100}%` }]} />
      </View>

      <View style={styles.cardStack}>
        {logger.debug('👥 LandlordSwipeScreen - Card stack render:', { 
          tenantsLength: tenants.length, 
          currentIndex, 
          currentTenant: currentTenant?.name, 
          nextTenant: nextTenant?.name 
        })}
        {nextTenant && (
          <SwipeCard
            key={nextTenant.id}
            item={nextTenant}
            isPropertyView={false}
            onSwipeLeft={() => {}}
            onSwipeRight={() => {}}
            onPress={() => {}}
            isFirst={false}
          />
        )}
        {currentTenant ? (
          <>
            {logger.debug('👥 LandlordSwipeScreen - Rendering current tenant card:', currentTenant.name, 'isPropertyView: false')}
            <SwipeCard
              key={currentTenant.id}
              item={currentTenant}
              isPropertyView={false}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onPress={handleCardPress}
              isFirst={true}
            />
          </>
        ) : (
          <View style={styles.noCardContainer}>
            <Text style={styles.noCardText}>Nessuna carta disponibile</Text>
            <Text style={styles.noCardSubtext}>Ricarica per vedere più inquilini</Text>
          </View>
        )}
      </View>

      {/* Tenant Detail Modal */}
      <TenantDetailModal
        visible={showDetailModal}
        tenant={selectedTenant}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTenant(null);
        }}
      />

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSwipeLeft}>
          <MaterialIcons name="close" size={36} color="#F44336" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleSwipeRight}>
          <MaterialIcons name="favorite" size={36} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Role Switch Button */}
       <View style={styles.roleSwitchContainer}>
         <TouchableOpacity
           style={[styles.roleSwitchButton, (!user || roleSwitchLoading) && styles.roleSwitchButtonDisabled]}
           onPress={handleRoleSwitch}
           disabled={!user || roleSwitchLoading}
         >
           <MaterialIcons
             name={(user?.userType || user?.ruolo) === 'tenant' ? 'business' : 'home'}
             size={16}
             color="#2196F3"
           />
           <Text style={styles.roleSwitchText}>
             {roleSwitchLoading ? '...' :
              (user?.userType || user?.ruolo) === 'tenant' ? 'Proprietario' : 'Inquilino'}
           </Text>
         </TouchableOpacity>
       </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  noMoreCardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  matchesButton: {
    padding: 8,
    position: 'relative',
  },
  matchesBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchesBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '90%',
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  cardStack: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    paddingTop: 40,
    paddingBottom: 120, // Add bottom padding to prevent overlap
    position: 'relative',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginHorizontal: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 20,
    borderRadius: 30,
  },
  actionButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleSwitchContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  roleSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleSwitchText: {
    color: '#2196F3',
    fontSize: 12,
    fontWeight: '600',
  },
  roleSwitchButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  noCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noCardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  noCardSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
