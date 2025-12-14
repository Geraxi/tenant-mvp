import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

interface HomeGoalOnboardingWelcomeScreenProps {
  onNext: () => void;
}

export default function HomeGoalOnboardingWelcomeScreen({
  onNext,
}: HomeGoalOnboardingWelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2196F3', '#64B5F6', '#90CAF9']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Logo size="large" showBackground={true} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.emoji}>🏠</Text>
            <Text style={styles.headline}>
              Trasforma il tuo affitto nella tua prima casa
            </Text>
            <Text style={styles.subtitle}>
              Inizia a risparmiare per la tua casa ideale con cashback, depositi e bonus
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>💸</Text>
              <Text style={styles.featureText}>Cashback automatico</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>💰</Text>
              <Text style={styles.featureText}>Depositi manuali</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🎁</Text>
              <Text style={styles.featureText}>Bonus e ricompense</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.ctaButton} onPress={onNext}>
            <Text style={styles.ctaButtonText}>Inizia a Risparmiare Ora</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 26,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});
