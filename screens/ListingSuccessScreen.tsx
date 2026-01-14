import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ListingSuccessScreenProps {
  onExploreMatches: () => void;
  onViewListing: () => void;
  onGoToTenantPreferences: () => void;
  onGoToDashboard: () => void;
}

export default function ListingSuccessScreen({
  onExploreMatches,
  onViewListing,
  onGoToTenantPreferences,
  onGoToDashboard,
}: ListingSuccessScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Image
            source={require('../assets/images/tenant-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Congratulazioni!</Text>
        <Text style={styles.subtitle}>Annuncio pubblicato con successo!</Text>
        <Text style={styles.description}>
          Il tuo annuncio e ora visibile. A breve inizierai a ricevere le prime
          richieste e a scoprire potenziali coinquilini compatibili.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onExploreMatches}>
          <Text style={styles.primaryButtonText}>Esplora i Match</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={onViewListing}>
          <Text style={styles.secondaryButtonText}>Visualizza il mio annuncio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tertiaryButton} onPress={onGoToTenantPreferences}>
          <Text style={styles.tertiaryButtonText}>Vai alle preferenze inquilino</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dashboardButton} onPress={onGoToDashboard}>
          <Text style={styles.dashboardText}>Vai alla Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1B1B1F',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#6B6B76',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 28,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: '#D9EEF8',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#1E88E5',
    fontSize: 15,
    fontWeight: '600',
  },
  tertiaryButton: {
    paddingVertical: 6,
  },
  tertiaryButtonText: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },
  dashboardButton: {
    marginTop: 24,
  },
  dashboardText: {
    color: '#1E88E5',
    fontSize: 13,
    fontWeight: '600',
  },
});
