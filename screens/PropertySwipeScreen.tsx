import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import SwipeCard from '../components/SwipeCard';
import PropertyDetailModal from '../components/PropertyDetailModal';
import NoMoreListingsScreen from '../components/NoMoreListingsScreen';
import { Property, User } from '../types';
import { MatchingService } from '../src/services/matchingService';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

import { logger } from '../src/utils/logger';

const { width, height } = Dimensions.get('window');

interface PropertySwipeScreenProps {
  onNavigateToMatches: () => void;
  onNavigateToProfile: () => void;
  onNavigateToPreferences: () => void;
  onNavigateToFilters: () => void;
  onNavigateToOnboarding?: (role: 'tenant' | 'landlord') => void;
  onNavigateToDiscover?: () => void;
  onRoleSwitch?: (newRole: 'tenant' | 'landlord') => void;
}

export default function PropertySwipeScreen({ onNavigateToMatches, onNavigateToProfile, onNavigateToPreferences, onNavigateToFilters, onNavigateToOnboarding, onNavigateToDiscover, onRoleSwitch }: PropertySwipeScreenProps) {
  logger.debug('🏠 PropertySwipeScreen - Component rendered');
  logger.debug('🏠 PropertySwipeScreen - Props received:', { 
    onNavigateToMatches: !!onNavigateToMatches, 
    onNavigateToProfile: !!onNavigateToProfile,
    onNavigateToDiscover: !!onNavigateToDiscover,
    onRoleSwitch: !!onRoleSwitch
  });
  
  const { user } = useSupabaseAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [likedProperties, setLikedProperties] = useState<Property[]>([]);

  // PRODUCTION NOTE: Replace with real data from Supabase
  // This mock data is for development/demo only
  // TODO: Remove mock data or switch to Supabase properties
  const MOCK_PROPERTIES: Property[] = [
    {
      id: '1',
      title: 'Appartamento Moderno',
      description: 'Appartamento moderno nel centro di Milano',
      price: 1200,
      location: 'Milano, MI',
      photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'],
      bedrooms: 2,
      bathrooms: 1,
      squareMeters: 80,
      furnished: true,
      petFriendly: false,
      parkingAvailable: true,
      balconyOrTerrace: true,
      smoking: false,
      childFriendly: true,
      speseCondominiali: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Casa con Giardino',
      description: 'Casa indipendente con giardino privato',
      price: 1800,
      location: 'Roma, RM',
      photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500'],
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 120,
      furnished: false,
      petFriendly: true,
      parkingAvailable: true,
      balconyOrTerrace: true,
      smoking: false,
      childFriendly: true,
      speseCondominiali: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Loft Industriale',
      description: 'Loft ristrutturato in zona trendy',
      price: 1500,
      location: 'Torino, TO',
      photos: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500'],
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 60,
      furnished: true,
      petFriendly: true,
      parkingAvailable: false,
      balconyOrTerrace: false,
      smoking: true,
      childFriendly: false,
      speseCondominiali: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  // Load properties when component mounts or user changes
  useEffect(() => {
    logger.debug('🏠 PropertySwipeScreen - Loading properties for user:', user?.id);
    logger.debug('🏠 PropertySwipeScreen - User role:', user?.ruolo || user?.userType);
    setLoading(true);
    
    // Simulate API call with role-based filtering
    setTimeout(() => {
      setProperties(MOCK_PROPERTIES);
      setCurrentIndex(0);
      setLoading(false);
      logger.debug('🏠 PropertySwipeScreen - Properties loaded:', MOCK_PROPERTIES.length);
    }, 1000);
  }, [user?.id, user?.ruolo, user?.userType]); // Re-fetch when user or role changes

  const handleSwipeLeft = () => {
    logger.debug('🏠 PropertySwipeScreen - X button pressed, swiping left on property:', properties[currentIndex]?.title);
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // If no more properties, show no more listings screen
      logger.debug('🏠 PropertySwipeScreen - No more properties to show');
    }
  };

  const handleSwipeRight = () => {
    logger.debug('🏠 PropertySwipeScreen - Swiped right on property:', properties[currentIndex]?.title);
    const currentProperty = properties[currentIndex];
    if (currentProperty) {
      setLikedProperties([...likedProperties, currentProperty]);
    }
    if (currentIndex < properties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleCardPress = () => {
    logger.debug('🏠 PropertySwipeScreen - Card pressed:', properties[currentIndex]?.title);
    setSelectedProperty(properties[currentIndex]);
  };

  const handleRoleSwitch = async () => {
    if (!user) {
      Alert.alert('Errore', 'Utente non trovato. Effettua il login prima di cambiare ruolo.');
      return;
    }
    
    const currentRole = user.userType || user.ruolo;
    const newRole = currentRole === 'tenant' ? 'landlord' : 'tenant';
    logger.debug('🔄 PropertySwipeScreen - Current role:', currentRole);
    logger.debug('🔄 PropertySwipeScreen - Switching to:', newRole);
    
    if (onRoleSwitch) {
      onRoleSwitch(newRole);
    } else {
      Alert.alert('Errore', 'Funzione di cambio ruolo non disponibile');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento proprietà...</Text>
      </SafeAreaView>
    );
  }

  if (properties.length === 0) {
    return (
      <NoMoreListingsScreen
        onBack={() => onNavigateToProfile()}
        onRefresh={() => {
          setCurrentIndex(0);
          setLikedProperties([]);
        }}
      />
    );
  }

  if (currentIndex >= properties.length) {
    return (
      <NoMoreListingsScreen
        onBack={() => onNavigateToProfile()}
        onRefresh={() => {
          setCurrentIndex(0);
          setLikedProperties([]);
        }}
        onPreferences={() => onNavigateToPreferences()}
        onFilters={() => onNavigateToFilters()}
      />
    );
  }

  const currentProperty = properties[currentIndex];
  const nextProperty = properties[currentIndex + 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRoleSwitch} style={styles.roleSwitchButton}>
          <MaterialIcons name="swap-horiz" size={24} color="#2196F3" />
          <Text style={styles.roleSwitchText}>Cambia Ruolo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onNavigateToFilters} style={styles.filterButton}>
          <MaterialIcons name="tune" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.cardContainer} pointerEvents="box-none">
          <SwipeCard
            item={currentProperty}
            isPropertyView={true}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={handleCardPress}
            isFirst={true}
          />
          
          {nextProperty && (
            <SwipeCard
              item={nextProperty}
              isPropertyView={true}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onPress={handleCardPress}
              isFirst={false}
            />
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.rejectButton} 
            onPress={() => {
              console.log('X button pressed!');
              handleSwipeLeft();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={32} color="#f44336" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={() => {
              console.log('Heart button pressed!');
              handleSwipeRight();
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="favorite" size={32} color="#4caf50" />
          </TouchableOpacity>
        </View>
      </View>

      <PropertyDetailModal
        property={selectedProperty}
        visible={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onLike={() => {
          if (selectedProperty) {
            setLikedProperties([...likedProperties, selectedProperty]);
            setSelectedProperty(null);
            handleSwipeRight();
          }
        }}
        onReject={() => {
          setSelectedProperty(null);
          handleSwipeLeft();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  roleSwitchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
  },
  roleSwitchText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    minHeight: 0, // Allow flex to work properly
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 25,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    minHeight: 100,
    zIndex: 1000,
    elevation: 10,
  },
  rejectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 11,
    zIndex: 1001,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 11,
    zIndex: 1001,
  },
});