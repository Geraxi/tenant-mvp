import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ListingPublishedScreenProps {
  onGoToTenantPreferences: () => void;
  onBack: () => void;
}

export default function ListingPublishedScreen({
  onGoToTenantPreferences,
  onBack,
}: ListingPublishedScreenProps) {
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
          Il tuo annuncio ora e visibile. Imposta le preferenze per trovare
          inquilini compatibili.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onGoToTenantPreferences}>
          <Text style={styles.primaryButtonText}>Vai alle preferenze inquilino</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Torna ai miei annunci</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B1B1F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1F',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    color: '#5A5A63',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#1B1B1F',
    fontSize: 14,
    fontWeight: '600',
  },
});
