import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { logger } from '../src/utils/logger';

type NavScreen = 'discover' | 'properties' | 'matches' | 'messages' | 'profilo';

interface BottomNavigationProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  showContracts: boolean;
  userRole?: 'tenant' | 'landlord';
}

export default function BottomNavigation({ 
  currentScreen, 
  onNavigate,
  showContracts,
  userRole = 'tenant'
}: BottomNavigationProps) {
  logger.debug('🔵 BottomNavigation - Rendering with:', { currentScreen, showContracts, userRole });
  logger.debug('🔵 BottomNavigation - Component is being rendered!');
  const navItems: { screen: NavScreen; icon: string; label: string }[] = [
    { screen: 'discover', icon: 'search', label: userRole === 'landlord' ? 'Browse' : 'Scopri' },
    ...(userRole === 'landlord'
      ? [{ screen: 'properties', icon: 'business', label: 'Immobili' as const }]
      : []),
    { screen: 'matches', icon: 'favorite', label: userRole === 'landlord' ? 'Matches' : 'Match' },
    { screen: 'messages', icon: 'message', label: userRole === 'landlord' ? 'Messages' : 'Messaggi' },
    { screen: 'profilo', icon: 'person', label: userRole === 'landlord' ? 'Profile' : 'Profilo' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => {
        const isActive = currentScreen === item.screen;
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => {
              logger.debug('🔘 BottomNavigation - Button pressed:', item.screen);
              logger.debug('🔘 BottomNavigation - Calling onNavigate with:', item.screen);
              logger.debug('🔘 BottomNavigation - onNavigate function exists:', !!onNavigate);
              if (onNavigate) {
                onNavigate(item.screen);
                logger.debug('🔘 BottomNavigation - onNavigate called successfully');
              } else {
                logger.debug('🔘 BottomNavigation - onNavigate is null/undefined');
              }
            }}
          >
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={isActive ? '#2196F3' : '#999'}
            />
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
