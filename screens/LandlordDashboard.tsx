import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupabaseAuth } from '../src/hooks/useSupabaseAuth';
import { FadeIn, ScaleIn, GradientCard } from '../components/AnimatedComponents';

const { width, height } = Dimensions.get('window');

const LandlordDashboard = () => {
  const { user } = useSupabaseAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState('home');
  const [sideMenuAnimation] = useState(new Animated.Value(-width * 0.8));

  const userName = user?.nome || "Umberto";

  const menuItems = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'entrate', label: 'Entrate', icon: 'receipt' },
    { id: 'contratti', label: 'Contratti', icon: 'description' },
    { id: 'affitti', label: 'Affitti', icon: 'home' },
    { id: 'inquilini', label: 'Inquilini', icon: 'people' },
    { id: 'proprieta', label: 'Proprietà', icon: 'business' }
  ];

  const contrattiData = [
    { name: 'Appartamento A', status: 'Firmato', icon: '🏠' },
    { name: 'Villa', status: 'In attesa', icon: '🏡' },
    { name: 'Appartamento B', status: 'Firmato', icon: '🏢' }
  ];

  const propertiesData = [
    { name: 'Villa', icon: '🏡' },
    { name: 'Appartamento A', icon: '🏠' },
    { name: 'Appartamento B', icon: '🏢' }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSideMenu = () => {
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    if (sidebarOpen) {
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
  }, [sidebarOpen]);

  const getStatusBadge = (status: string) => {
    if (status === 'Firmato') {
      return (
        <View style={styles.statusBadgeGreen}>
          <MaterialIcons name="check-circle" size={12} color="#059669" />
          <Text style={styles.statusTextGreen}>Firmato</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.statusBadgeYellow}>
          <MaterialIcons name="schedule" size={12} color="#D97706" />
          <Text style={styles.statusTextYellow}>In attesa</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Content */}
      <SafeAreaView style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Buongiorno, {userName}
          </Text>
        </View>

        <Text style={styles.overviewTitle}>Panoramica</Text>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Affitti Card */}
          <FadeIn delay={200} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.affittiCard}
            >
              <Text style={styles.cardTitle}>Affitti</Text>
              <View style={styles.affittiContent}>
                <View style={styles.donutChart}>
                  <View style={styles.donutChartInner}>
                    <Text style={styles.chartCenterText}>€850</Text>
                    <Text style={styles.chartCenterSubtext}>€1300</Text>
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
            </GradientCard>
          </FadeIn>

          {/* Spese Card */}
          <FadeIn delay={400} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.speseCard}
            >
              <Text style={styles.cardTitle}>Spese</Text>
              <View style={styles.speseContent}>
                <View style={styles.barChartContainer}>
                  <View style={[styles.bar, { height: 60 }]} />
                  <View style={[styles.bar, { height: 45 }]} />
                  <View style={[styles.bar, { height: 30 }]} />
                  <View style={[styles.bar, { height: 20 }]} />
                </View>
                <View style={styles.barIcons}>
                  <View style={styles.iconGroup}>
                    <Text style={styles.iconEmoji}>💧</Text>
                    <Text style={styles.iconLabel}>acqua</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <Text style={styles.iconEmoji}>🔥</Text>
                    <Text style={styles.iconLabel}>gas</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <Text style={styles.iconEmoji}>⚡</Text>
                    <Text style={styles.iconLabel}>elettricità</Text>
                  </View>
                  <View style={styles.iconGroup}>
                    <Text style={styles.iconEmoji}>🏢</Text>
                    <Text style={styles.iconLabel}>condominio</Text>
                  </View>
                </View>
                <View style={styles.speseInfo}>
                  <Text style={styles.speseText}>25% aumento spese</Text>
                  <Text style={styles.speseText}>72 nuove scadenze</Text>
                </View>
              </View>
            </GradientCard>
          </FadeIn>

          {/* Contratti Section */}
          <FadeIn delay={600} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.contrattiCard}
            >
              <Text style={styles.cardTitle}>Contratti</Text>
              <View style={styles.contractsList}>
                {contrattiData.map((contratto, index) => (
                  <View key={index} style={styles.contractItem}>
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractIcon}>{contratto.icon}</Text>
                      <Text style={styles.contractName}>{contratto.name}</Text>
                    </View>
                    {getStatusBadge(contratto.status)}
                  </View>
                ))}
              </View>
            </GradientCard>
          </FadeIn>

          {/* Le tue Proprietà Section */}
          <FadeIn delay={800} from="bottom">
            <GradientCard 
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
              style={styles.propertiesCard}
            >
              <Text style={styles.cardTitle}>Le tue Proprietà</Text>
              <View style={styles.propertiesGrid}>
                {propertiesData.map((property, index) => (
                  <TouchableOpacity key={index} style={styles.propertyCard}>
                    <Text style={styles.propertyIcon}>{property.icon}</Text>
                    <Text style={styles.propertyName}>{property.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GradientCard>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>

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
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.sideMenuItem, item.id === 'home' && styles.sideMenuItemActive]}
                onPress={() => {
                  setActiveMenuItem(item.id);
                  closeSideMenu();
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
      {sidebarOpen && (
        <TouchableOpacity 
          style={styles.overlay}
          onPress={closeSideMenu}
          activeOpacity={1}
        />
      )}
    </View>
  );
};

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
    paddingTop: 10,
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  affittiCard: {
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
    justifyContent: 'space-between',
  },
  speseCard: {
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutChartInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartCenterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  chartCenterSubtext: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 60,
    marginBottom: 16,
    justifyContent: 'center',
    gap: 12,
  },
  bar: {
    width: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  barIcons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 10,
  },
  iconGroup: {
    alignItems: 'center',
    flex: 1,
  },
  iconEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  iconLabel: {
    fontSize: 10,
    color: '#666',
  },
  speseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
  },
  speseText: {
    fontSize: 12,
    color: '#666',
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
  },
  contractIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  contractName: {
    fontSize: 16,
    color: '#333',
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
  propertyCard: {
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minHeight: 80,
    justifyContent: 'center',
  },
  propertyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  propertyName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
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
});

export default LandlordDashboard;
