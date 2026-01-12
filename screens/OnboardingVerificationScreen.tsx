import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumTheme } from '../styles/premiumTheme';

interface OnboardingVerificationScreenProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  step: number;
  totalSteps: number;
}

export default function OnboardingVerificationScreen({
  onNext,
  onBack,
  onSkip,
  step,
  totalSteps,
}: OnboardingVerificationScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={22} color={premiumTheme.colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verifica Profilo</Text>
        <TouchableOpacity onPress={onSkip}>
          <Text style={styles.skipText}>Salta</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Costruisci Fiducia con la Verifica</Text>
        <Text style={styles.subtitle}>
          Un piccolo passo per la tua sicurezza e per trovare il match perfetto.
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: premiumTheme.colors.sky }]}>
              <MaterialIcons name="security" size={28} color={premiumTheme.colors.navy} />
            </View>
            <Text style={styles.benefitTitle}>Maggiore Sicurezza</Text>
            <Text style={styles.benefitText}>
              Verifica la tua identità per creare un ambiente più sicuro per tutti
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: premiumTheme.colors.mint }]}>
              <MaterialIcons name="verified-user" size={28} color="#1B998B" />
            </View>
            <Text style={styles.benefitTitle}>Affidabilità Garantita</Text>
            <Text style={styles.benefitText}>
              Crea una community di persone verificate e affidabili
            </Text>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.benefitIcon, { backgroundColor: premiumTheme.colors.accentSoft }]}>
              <MaterialIcons name="favorite" size={28} color={premiumTheme.colors.accentDark} />
            </View>
            <Text style={styles.benefitTitle}>Match Migliori</Text>
            <Text style={styles.benefitText}>
              I profili verificati ricevono più attenzione e match di qualità
            </Text>
          </View>
        </View>

        {/* Verification Steps */}
        <View style={styles.stepsContainer}>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Verifica ID</Text>
              <Text style={styles.stepText}>
                Carica un documento di identità valido (carta d'identità, passaporto)
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Controllo Background</Text>
              <Text style={styles.stepText}>
                Un controllo non invasivo su credito e storia di affitti
              </Text>
            </View>
          </View>
        </View>

        {/* Privacy Note */}
        <View style={styles.privacyNote}>
          <MaterialIcons name="lock" size={20} color="#1B998B" />
          <Text style={styles.privacyText}>
            I tuoi dati sono crittografati e protetti.
          </Text>
        </View>

        {/* CTA Button */}
        <TouchableOpacity style={styles.verifyButton} onPress={onNext}>
          <LinearGradient
            colors={premiumTheme.gradients.cta}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Inizia la Verifica</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onSkip} style={styles.skipLink}>
          <Text style={styles.skipLinkText}>Salta per ora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumTheme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: premiumTheme.colors.background,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumTheme.colors.ink,
    fontFamily: premiumTheme.typography.display,
  },
  skipText: {
    fontSize: 14,
    color: premiumTheme.colors.accent,
    fontWeight: '600',
    fontFamily: premiumTheme.typography.body,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: premiumTheme.colors.ink,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: premiumTheme.typography.display,
  },
  subtitle: {
    fontSize: 16,
    color: premiumTheme.colors.inkMuted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontFamily: premiumTheme.typography.body,
  },
  benefitsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  benefitCard: {
    backgroundColor: premiumTheme.colors.surface,
    borderRadius: premiumTheme.radii.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
    ...premiumTheme.shadows.card,
  },
  benefitIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumTheme.colors.ink,
    marginBottom: 4,
    flex: 1,
    fontFamily: premiumTheme.typography.display,
  },
  benefitText: {
    fontSize: 14,
    color: premiumTheme.colors.inkMuted,
    lineHeight: 20,
    flex: 1,
    fontFamily: premiumTheme.typography.body,
  },
  stepsContainer: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: premiumTheme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: premiumTheme.typography.display,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: premiumTheme.colors.ink,
    marginBottom: 4,
    fontFamily: premiumTheme.typography.display,
  },
  stepText: {
    fontSize: 14,
    color: premiumTheme.colors.inkMuted,
    lineHeight: 20,
    fontFamily: premiumTheme.typography.body,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 14,
    color: '#1B998B',
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: premiumTheme.typography.body,
  },
  verifyButton: {
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
    marginBottom: 16,
    ...premiumTheme.shadows.lift,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: premiumTheme.typography.body,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipLinkText: {
    fontSize: 14,
    color: premiumTheme.colors.inkMuted,
    fontFamily: premiumTheme.typography.body,
  },
});
