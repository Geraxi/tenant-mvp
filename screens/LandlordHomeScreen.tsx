import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { FadeIn, ScaleIn, GradientCard } from '../components/AnimatedComponents';
import { getUserProperties } from '../utils/supabaseProperties';

const { width, height } = Dimensions.get('window');

interface LandlordHomeScreenProps {
  onNavigateToBills: () => void;
  onNavigateToPayments: () => void;
  onNavigateToProfile: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToHelp: () => void;
  onNavigateToContracts: () => void;
  onNavigateToContractSignature: () => void;
  onNavigateToProperties: () => void;
  onNavigateToTenants: () => void;
  onNavigateToIncome: () => void;
}

export default function LandlordHomeScreen({ 
  onNavigateToBills,
  onNavigateToPayments,
  onNavigateToProfile,
  onNavigateToNotifications,
  onNavigateToHelp,
  onNavigateToContracts,
  onNavigateToContractSignature,
  onNavigateToProperties,
  onNavigateToTenants,
  onNavigateToIncome,
}: LandlordHomeScreenProps) {
  const { user } = useSupabaseAuth();
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [sideMenuAnimation] = useState(new Animated.Value(-width * 0.8));
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProperties();
    }
  }, [user?.id]);

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true);
      const userProperties = await getUserProperties(user.id);
      
      // PRODUCTION NOTE: In production, don't show mock data - only show empty state
      // Mock data is only for demo/development purposes
      if (userProperties.length === 0) {
        // TODO: Remove mock data before production release
        setProperties([]); // In production, show empty state instead
        return;
        const mockProperties = [
          {
            id: '1',
            title: 'Villa Moderna',
            location: 'Milano Centro',
            rent: 2500,
            images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
            available: true,
          },
          {
            id: '2',
            title: 'Appartamento A',
            location: 'Roma Trastevere',
            rent: 1800,
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
            available: false,
          },
          {
            id: '3',
            title: 'Casa con Giardino',
            location: 'Firenze Centro',
            rent: 2200,
            images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400'],
            available: true,
          },
        ];
        setProperties(mockProperties);
      } else {
        setProperties(userProperties);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      // Show mock data on error - this handles network failures gracefully
      const mockProperties = [
        {
          id: '1',
          title: 'Villa Moderna',
          location: 'Milano Centro',
          rent: 2500,
          images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
          available: true,
        },
        {
          id: '2',
          title: 'Appartamento A',
          location: 'Roma Trastevere',
          rent: 1800,
          images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400'],
          available: false,
        },
        {
          id: '3',
          title: 'Casa con Giardino',
          location: 'Firenze Centro',
          rent: 2200,
          images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400'],
          available: true,
        },
      ];
      setProperties(mockProperties);
    } finally {
      setLoadingProperties(false);
    }
  };

  const sideMenuItems = [
    { id: 'home', icon: 'home', label: 'Home', onPress: () => setSideMenuVisible(false) },
    { id: 'income', icon: 'receipt', label: 'Entrate', onPress: onNavigateToIncome || (() => console.log('onNavigateToIncome not available')) },
    { id: 'contracts', icon: 'description', label: 'Contratti', onPress: onNavigateToContracts || (() => console.log('onNavigateToContracts not available')) },
    { id: 'rents', icon: 'home', label: 'Affitti', onPress: onNavigateToBills || (() => console.log('onNavigateToBills not available')) },
    { id: 'tenants', icon: 'people', label: 'Inquilini', onPress: onNavigateToTenants || (() => console.log('onNavigateToTenants not available')) },
    { id: 'properties', icon: 'business', label: 'Proprietà', onPress: onNavigateToProperties || (() => console.log('onNavigateToProperties not available')) },
  ];

  useEffect(() => {
    if (sideMenuVisible) {
      Animated.timing(sideMenuAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(sideMenuAnimation, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [sideMenuVisible]);

  const toggleSideMenu = () => {
    setSideMenuVisible(!sideMenuVisible);
  };

  const closeSideMenu = () => {
    setSideMenuVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSideMenu} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Buongiorno {user?.nome || 'Umberto'}
          </Text>
        </View>

        <Text style={styles.overviewTitle}>Panoramica</Text>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Affitti Card */}
          <View style={[styles.affittiCard, styles.blueHighlightCard]}>
            <Text style={styles.cardTitle}>Affitti</Text>
            <View style={styles.affittiContent}>
              <View style={styles.donutChartContainer}>
                <View style={styles.donutChartWrapper}>
                  <Svg width={140} height={140} style={styles.donutChartSvg}>
                    {/* Background circle for unpaid portion (35%) */}
                    <Circle
                      cx={70}
                      cy={70}
                      r={60}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth={20}
                      strokeDasharray={`${2 * Math.PI * 60 * 0.35} ${2 * Math.PI * 60}`}
                      strokeDashoffset={0}
                      transform="rotate(-90 70 70)"
                    />
                    {/* Paid portion (65%) */}
                    <Circle
                      cx={70}
                      cy={70}
                      r={60}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth={20}
                      strokeDasharray={`${2 * Math.PI * 60 * 0.65} ${2 * Math.PI * 60}`}
                      strokeDashoffset={`${2 * Math.PI * 60 * 0.35}`}
                      transform="rotate(-90 70 70)"
                    />
                  </Svg>
                  <View style={styles.donutChartInner}>
                    <Text style={styles.chartCenterText}>€ 850</Text>
                    <Text style={styles.chartCenterSubtext}>di € 1300</Text>
                  </View>
                </View>
                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                    <Text style={styles.legendText}>Pagato</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                    <Text style={styles.legendText}>Non pagato</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Spese Card */}
          <View style={styles.speseCard}>
            <Text style={styles.cardTitle}>Spese</Text>
            <View style={styles.speseContent}>
              <View style={styles.barChartContainer}>
                <View style={styles.barChartBars}>
                  <View style={[styles.bar, { height: 60, backgroundColor: '#3B82F6' }]} />
                  <View style={[styles.bar, { height: 45, backgroundColor: '#EF4444' }]} />
                  <View style={[styles.bar, { height: 30, backgroundColor: '#F59E0B' }]} />
                  <View style={[styles.bar, { height: 20, backgroundColor: '#8B5CF6' }]} />
                </View>
                <View style={styles.barChartLabels}>
                  <View style={styles.iconGroup}>
                    <MaterialIcons name="water-drop" size={20} color="#3B82F6" />
                    <Text style={styles.iconLabel}>acqua</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <MaterialIcons name="local-fire-department" size={20} color="#EF4444" />
                    <Text style={styles.iconLabel}>gas</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <MaterialIcons name="flash-on" size={20} color="#F59E0B" />
                    <Text style={styles.iconLabel}>elettricità</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <MaterialIcons name="business" size={20} color="#8B5CF6" />
                    <Text style={styles.iconLabel}>condominio</Text>
                  </View>
                </View>
              </View>
              <View style={styles.speseInfo}>
                <View style={styles.speseInfoItem}>
                  <MaterialIcons name="trending-up" size={16} color="#EF4444" />
                  <Text style={styles.speseText}>25% aumento spese</Text>
                </View>
                <View style={styles.speseInfoItem}>
                  <MaterialIcons name="schedule" size={16} color="#6B7280" />
                  <Text style={styles.speseText}>72 nuove scadenze</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Contratti Section */}
          <View style={[styles.contrattiCard, styles.blueHighlightCard]}>
            <Text style={styles.cardTitle}>Contratti</Text>
            <View style={styles.contractsList}>
              <View style={styles.contractItem}>
                <View style={styles.contractInfo}>
                  <MaterialIcons name="apartment" size={24} color="#6B7280" />
                  <View style={styles.contractDetails}>
                    <Text style={styles.contractName}>Appartamento A</Text>
                    <Text style={styles.contractAddress}>Via Roma 15, Milano</Text>
                  </View>
                </View>
                <View style={styles.statusBadgeGreen}>
                  <MaterialIcons name="check-circle" size={12} color="#059669" />
                  <Text style={styles.statusTextGreen}>Firmato</Text>
                </View>
              </View>
              <View style={styles.contractItem}>
                <View style={styles.contractInfo}>
                  <MaterialIcons name="home" size={24} color="#6B7280" />
                  <View style={styles.contractDetails}>
                    <Text style={styles.contractName}>Villa</Text>
                    <Text style={styles.contractAddress}>Via Garibaldi 8, Firenze</Text>
                  </View>
                </View>
                <View style={styles.statusBadgeYellow}>
                  <MaterialIcons name="schedule" size={12} color="#D97706" />
                  <Text style={styles.statusTextYellow}>In attesa</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Le tue Proprietà Section */}
          <View style={styles.propertiesCard}>
            <Text style={styles.cardTitle}>Le tue Proprietà</Text>
            {loadingProperties ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Caricamento proprietà...</Text>
              </View>
            ) : properties.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                style={styles.propertiesScroll}
                contentContainerStyle={styles.propertiesScrollContent}
              >
                {properties.map((property, index) => (
                  <TouchableOpacity 
                    key={property.id} 
                    style={styles.propertyCard} 
                    onPress={onNavigateToProperties}
                  >
                    <View style={styles.propertyImageContainer}>
                      {property.images && property.images.length > 0 ? (
                        <Image 
                          source={{ uri: property.images[0] }} 
                          style={styles.propertyImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.propertyImagePlaceholder}>
                          <MaterialIcons name="home" size={32} color="#2196F3" />
                        </View>
                      )}
                      <View style={styles.propertyStatusBadge}>
                        <Text style={styles.propertyStatusText}>
                          {property.available ? 'Disponibile' : 'Occupato'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.propertyInfo}>
                      <Text style={styles.propertyTitle} numberOfLines={1}>
                        {property.title || 'Proprietà'}
                      </Text>
                      <Text style={styles.propertyLocation} numberOfLines={1}>
                        {property.location || 'Nessuna posizione'}
                      </Text>
                      <Text style={styles.propertyRent}>
                        €{property.rent || 0}/mese
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyPropertiesContainer}>
                <MaterialIcons name="home" size={48} color="#ccc" />
                <Text style={styles.emptyPropertiesText}>Nessuna proprietà</Text>
                <TouchableOpacity style={styles.addPropertyButton} onPress={onNavigateToProperties}>
                  <Text style={styles.addPropertyButtonText}>Aggiungi proprietà</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Side Menu - Disappearing */}
      <Animated.View 
        style={[
          styles.sideMenu,
          {
            transform: [{ translateX: sideMenuAnimation }]
          }
        ]}
      >
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          style={styles.sideMenuGradient}
        >
          <View style={styles.sideMenuHeader}>
            <Text style={styles.sideMenuTitle}>Menu</Text>
            <TouchableOpacity onPress={closeSideMenu} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sideMenuItems}>
            {sideMenuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.sideMenuItem, item.id === 'home' && styles.sideMenuItemActive]}
                onPress={() => {
                  if (item.onPress && typeof item.onPress === 'function') {
                    item.onPress();
                  }
                  setSideMenuVisible(false);
                }}
              >
                <MaterialIcons name={item.icon as any} size={24} color="white" />
                <Text style={styles.sideMenuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Overlay */}
      {sideMenuVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={closeSideMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mainContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  menuButton: {
    padding: 8,
    marginRight: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginLeft: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  affittiCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  affittiContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  donutChartWrapper: {
    position: 'relative',
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutChartSvg: {
    position: 'absolute',
  },
  speseCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  speseContent: {
    alignItems: 'center',
  },
  contrattiCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propertiesCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  donutChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutChartInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 10,
    top: 30,
    left: 30,
  },
  chartCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  chartCenterSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    marginLeft: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  barChartContainer: {
    marginBottom: 20,
    width: '100%',
  },
  barChartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  bar: {
    width: 24,
    borderRadius: 12,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  barChartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  iconGroup: {
    alignItems: 'center',
    flex: 1,
  },
  iconLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  speseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  speseInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  speseText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  contractsList: {
    gap: 12,
  },
  contractItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contractInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contractDetails: {
    marginLeft: 12,
    flex: 1,
  },
  contractName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  contractAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextGreen: {
    fontSize: 10,
    color: '#059669',
    marginLeft: 4,
    fontWeight: '600',
  },
  statusBadgeYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTextYellow: {
    fontSize: 10,
    color: '#D97706',
    marginLeft: 4,
    fontWeight: '600',
  },
  propertiesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  propertiesScroll: {
    marginTop: 16,
  },
  propertiesScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 8,
  },
  propertyCard: {
    width: width * 0.45, // Show 2 cards at a time with some margin
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  propertyImageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#f0f4f8',
  },
  propertyImage: {
    width: '100%',
    height: '100%',
  },
  propertyImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  propertyStatusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  propertyStatusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  propertyInfo: {
    padding: 12,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  propertyRent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyPropertiesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPropertiesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  addPropertyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addPropertyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.8,
    height: height,
    zIndex: 1000,
  },
  sideMenuGradient: {
    flex: 1,
    paddingTop: 60,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sideMenuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  sideMenuItems: {
    paddingHorizontal: 20,
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sideMenuItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  sideMenuItemText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 16,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  blueHighlightCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
});
