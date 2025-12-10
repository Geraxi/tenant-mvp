import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Property, Utente } from '../types';
import { MatchingService, Match } from '../src/services/matchingService';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';

import { logger } from '../src/utils/logger';

const { width } = Dimensions.get('window');

interface MatchesScreenProps {
  onNavigateBack?: () => void;
  onNavigateToDetail?: (match: MatchWithDetails) => void;
  onNavigateToMessages?: (userId: string, userName: string) => void;
}

export interface MatchWithDetails {
  match: Match;
  tenant: Utente;
  landlord: Utente;
  property: Property;
}

type TabType = 'properties' | 'roommates';

export default function MatchesScreen({ onNavigateBack, onNavigateToDetail, onNavigateToMessages }: MatchesScreenProps) {
  const { user } = useSupabaseAuth();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  
  // Determine user role
  const userRole = user?.ruolo || user?.userType || 'tenant';
  const isLandlord = userRole === 'landlord' || userRole === 'homeowner';

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (user) {
      setLoading(true);
      logger.debug('🔍 MatchesScreen - Loading matches for user:', user.id, 'role:', user.ruolo);
      try {
        const userMatches = await MatchingService.getMatches(user.id, user.ruolo);
        logger.debug('🔍 MatchesScreen - Found matches:', userMatches.length);
        
        // If no matches found, show some sample matches for demo purposes
        if (userMatches.length === 0) {
          logger.debug('🔍 MatchesScreen - No matches found, showing sample matches');
          const sampleMatches = await MatchingService.getMatches('test_user_1', 'tenant');
          logger.debug('🔍 MatchesScreen - Sample matches:', sampleMatches.length);
          
          const sampleMatchesWithDetails = await Promise.all(
            sampleMatches.map(async (match) => {
              logger.debug('🔍 MatchesScreen - Getting details for sample match:', match.id);
              const details = await MatchingService.getMatchDetails(match.id);
              logger.debug('🔍 MatchesScreen - Sample match details:', details);
              return details;
            })
          );
          
          const validSampleMatches = sampleMatchesWithDetails.filter(Boolean) as MatchWithDetails[];
          logger.debug('🔍 MatchesScreen - Valid sample matches:', validSampleMatches.length);
          setMatches(validSampleMatches);
        } else {
          // Get detailed information for each match
          const matchesWithDetails = await Promise.all(
            userMatches.map(async (match) => {
              logger.debug('🔍 MatchesScreen - Getting details for match:', match.id);
              const details = await MatchingService.getMatchDetails(match.id);
              logger.debug('🔍 MatchesScreen - Match details:', details);
              return details;
            })
          );
          
          const validMatches = matchesWithDetails.filter(Boolean) as MatchWithDetails[];
          logger.debug('🔍 MatchesScreen - Valid matches:', validMatches.length);
          setMatches(validMatches);
        }
      } catch (error) {
        console.error('Error loading matches:', error);
        Alert.alert('Errore', 'Impossibile caricare i match');
      } finally {
        setLoading(false);
      }
    } else {
      logger.debug('🔍 MatchesScreen - No user found');
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (property: Property): string => {
    // Generate property type label based on bedrooms and location
    const bedrooms = property.bedrooms || 1;
    const location = property.location || '';
    
    if (bedrooms === 1) {
      return `Monolocale${location.includes('Centro') || location.includes('centro') ? ' in Centro' : location.includes('Vista') || location.includes('vista') ? ' con Vista' : ''}`;
    } else if (bedrooms === 2) {
      return `Bilocale${location.includes('Centro') || location.includes('centro') ? ' in Centro' : ''}`;
    } else if (bedrooms === 3) {
      return `Trilocale${location.includes('Centro') || location.includes('centro') ? ' in Centro' : ''}`;
    } else {
      return `Appartamento${location.includes('Centro') || location.includes('centro') ? ' in Centro' : ''}`;
    }
  };

  const handlePropertyPress = (match: MatchWithDetails) => {
    if (onNavigateToDetail) {
      onNavigateToDetail(match);
    } else {
      Alert.alert('Info', `Visualizza dettagli di ${match.property.title}`);
    }
  };

  const handleContact = (otherUserId: string, otherUserName: string) => {
    if (onNavigateToMessages) {
      onNavigateToMessages(otherUserId, otherUserName);
    } else {
      Alert.alert('Contatta', `Vuoi contattare ${otherUserName}?`);
    }
  };

  const renderPropertyCard = ({ item }: { item: MatchWithDetails }) => {
    // For landlords, show the tenant instead of the property
    if (isLandlord) {
      const tenant = item.tenant;
      const imageUri = tenant.foto || tenant.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500';
      
      return (
        <TouchableOpacity 
          style={styles.propertyCard}
          onPress={() => handlePropertyPress(item)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: imageUri }} 
            style={styles.propertyImage} 
            resizeMode="cover"
          />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyType}>{tenant.nome}</Text>
            <Text style={styles.propertyAddress}>{tenant.indirizzo || tenant.preferences?.location || 'Indirizzo non disponibile'}</Text>
            <Text style={styles.propertyPrice}>Inquilino</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#999" style={styles.arrowIcon} />
        </TouchableOpacity>
      );
    }
    
    // For tenants, show the property
    const property = item.property;
    const propertyType = getPropertyTypeLabel(property);
    const imageUri = property.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500';

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.propertyImage} 
          resizeMode="cover"
        />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyType}>{propertyType}</Text>
          <Text style={styles.propertyAddress}>{property.location}</Text>
          <Text style={styles.propertyPrice}>€{property.rent}/mese</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#999" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };

  const renderRoommateCard = ({ item }: { item: MatchWithDetails }) => {
    // For roommates, show the tenant/landlord info
    const otherPerson = user?.ruolo === 'tenant' ? item.landlord : item.tenant;
    const imageUri = otherPerson.foto || otherPerson.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500';

    return (
      <TouchableOpacity 
        style={styles.propertyCard}
        onPress={() => handlePropertyPress(item)}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: imageUri }} 
          style={styles.propertyImage} 
          resizeMode="cover"
        />
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyType}>{otherPerson.nome}</Text>
          <Text style={styles.propertyAddress}>{otherPerson.indirizzo || otherPerson.preferences?.location || 'Indirizzo non disponibile'}</Text>
          <Text style={styles.propertyPrice}>Coinquilino</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#999" style={styles.arrowIcon} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Caricamento match...</Text>
      </SafeAreaView>
    );
  }

  const propertiesMatches = matches.filter(m => m.property);
  const roommatesMatches = matches; // For now, show all matches as potential roommates

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Le Mie Corrispondenze</Text>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'properties' && styles.tabActive]}
          onPress={() => setActiveTab('properties')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
            {isLandlord ? 'Inquilini' : 'Proprietà'}
          </Text>
        </TouchableOpacity>
        {!isLandlord && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'roommates' && styles.tabActive]}
            onPress={() => setActiveTab('roommates')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'roommates' && styles.tabTextActive]}>
              Coinquilini
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      {activeTab === 'properties' ? (
        propertiesMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name={isLandlord ? "people" : "home"} size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>
              {isLandlord ? 'Nessun inquilino corrispondente' : 'Nessuna proprietà corrispondente'}
            </Text>
            <Text style={styles.emptyDescription}>
              {isLandlord 
                ? 'Continua a fare swipe per trovare inquilini interessati!'
                : 'Continua a fare swipe per trovare la tua casa perfetta!'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={propertiesMatches}
            renderItem={renderPropertyCard}
            keyExtractor={(item) => item.match.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        roommatesMatches.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="people" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Nessun coinquilino corrispondente</Text>
            <Text style={styles.emptyDescription}>
              Continua a fare swipe per trovare il coinquilino perfetto!
            </Text>
          </View>
        ) : (
          <FlatList
            data={roommatesMatches}
            renderItem={renderRoommateCard}
            keyExtractor={(item) => item.match.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 20,
    paddingTop: 16,
  },
  propertyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  propertyInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  propertyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});
