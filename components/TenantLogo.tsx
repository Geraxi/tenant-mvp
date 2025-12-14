import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

interface TenantLogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export default function TenantLogo({ size = 'medium', showText = true }: TenantLogoProps) {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { logo: 40, text: 16, icon: 20 };
      case 'large':
        return { logo: 100, text: 24, icon: 40 };
      default:
        return { logo: 60, text: 20, icon: 30 };
    }
  };

  const { logo, text, icon } = getSize();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00D4FF', '#4ECDC4', '#45B7D1']}
        style={[styles.logo, { width: logo, height: logo, borderRadius: logo / 2 }]}
      >
        <MaterialIcons name="home" size={icon} color="white" />
      </LinearGradient>
      {showText && (
        <Text style={[styles.text, { fontSize: text }]}>Tenant</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, y: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 8,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
