import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { t } from '../utils/translations';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

interface HomeGoalOnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: t('homeGoalTitle'),
    subtitle: t('homeGoalSubtitle'),
    cta: t('startSavingNow'),
    icon: '🏠',
    backgroundColor: '#E3F2FD',
    iconColor: '#2196F3',
  },
  {
    id: 2,
    title: t('setHomeGoal'),
    subtitle: 'Imposta il tuo obiettivo deposito casa e inizia a risparmiare automaticamente',
    cta: t('confirmGoal'),
    icon: '🎯',
    backgroundColor: '#E8F5E9',
    iconColor: '#4CAF50',
  },
  {
    id: 3,
    title: t('howItWorks'),
    subtitle: 'Scopri come funziona il sistema di risparmio automatico',
    cta: t('startEarningCashback'),
    icon: '⚙️',
    backgroundColor: '#FFF3E0',
    iconColor: '#FF9800',
  },
  {
    id: 4,
    title: t('yourHomeGoalDashboard'),
    subtitle: 'Monitora i tuoi progressi e gestisci il tuo obiettivo',
    cta: t('goToMyHomeGoal'),
    icon: '📊',
    backgroundColor: '#F3E5F5',
    iconColor: '#9C27B0',
  },
  {
    id: 5,
    title: t('inviteFriendsTitle'),
    subtitle: t('inviteDescription'),
    cta: t('inviteFriendsCTA'),
    icon: '👥',
    backgroundColor: '#E0F2F1',
    iconColor: '#00BCD4',
  },
];

export const HomeGoalOnboardingScreen: React.FC<HomeGoalOnboardingScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef<any>(null);
  const [slideAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(1));

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep + 1) * width,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentStep - 1) * width,
        animated: true,
      });
    }
  };

  const skipOnboarding = () => {
    onSkip();
  };

  const renderStep = (step: typeof ONBOARDING_STEPS[0], index: number) => {
    const isActive = index === currentStep;
    
    return (
      <Animated.View
        key={step.id}
        style={[
          styles.stepContainer,
          {
            backgroundColor: step.backgroundColor,
            transform: [{
              scale: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            }],
            opacity: fadeAnimation,
          },
        ]}
      >
        <View style={styles.stepContent}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
            <Text style={styles.skipButtonText}>Salta</Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="large" showBackground={false} />
          </View>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: step.iconColor + '20' }]}>
            <Text style={styles.iconText}>{step.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.stepTitle}>{step.title}</Text>

          {/* Subtitle */}
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>

          {/* Features for step 3 */}
          {step.id === 3 && (
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <MaterialIcons name="money" size={24} color="#4CAF50" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('cashbackFromRent')}</Text>
                  <Text style={styles.featureDescription}>{t('cashbackDescription')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="account-balance-wallet" size={24} color="#2196F3" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('manualDeposit')}</Text>
                  <Text style={styles.featureDescription}>{t('manualDepositDescription')}</Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="card-giftcard" size={24} color="#FF9800" />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{t('bonusesAndStreaks')}</Text>
                  <Text style={styles.featureDescription}>{t('bonusesDescription')}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Dashboard Preview for step 4 */}
          {step.id === 4 && (
            <View style={styles.dashboardPreview}>
              <View style={styles.previewCard}>
                <Text style={styles.previewTitle}>Il tuo HomeGoal</Text>
                <Text style={styles.previewAmount}>€50.000</Text>
                <View style={styles.previewProgress}>
                  <View style={styles.previewProgressBar}>
                    <View style={[styles.previewProgressFill, { width: '25%' }]} />
                  </View>
                  <Text style={styles.previewProgressText}>25% completato</Text>
                </View>
                <View style={styles.previewStats}>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatValue}>€12.500</Text>
                    <Text style={styles.previewStatLabel}>Risparmiato</Text>
                  </View>
                  <View style={styles.previewStat}>
                    <Text style={styles.previewStatValue}>18</Text>
                    <Text style={styles.previewStatLabel}>Mesi</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Referral Benefits for step 5 */}
          {step.id === 5 && (
            <View style={styles.referralContainer}>
              <View style={styles.referralCard}>
                <MaterialIcons name="group-add" size={48} color="#00BCD4" />
                <Text style={styles.referralTitle}>Invita Amici</Text>
                <Text style={styles.referralDescription}>
                  Per ogni amico che si iscrive e paga l'affitto tramite Tenant, 
                  ricevi €10 bonus nel tuo HomeGoal Wallet!
                </Text>
                <View style={styles.referralBenefits}>
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="check" size={20} color="#4CAF50" />
                    <Text style={styles.benefitText}>€10 bonus per ogni referral</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="check" size={20} color="#4CAF50" />
                    <Text style={styles.benefitText}>I tuoi amici guadagnano cashback</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <MaterialIcons name="check" size={20} color="#4CAF50" />
                    <Text style={styles.benefitText}>Nessun limite al numero di referral</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* CTA Button */}
          <TouchableOpacity style={styles.ctaButton} onPress={nextStep}>
            <Text style={styles.ctaButtonText}>{step.cta}</Text>
            <MaterialIcons name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Progress Dots */}
        <View style={styles.progressDots}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContainer}>
        {ONBOARDING_STEPS.map((step, index) => renderStep(step, index))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  stepContainer: {
    width,
    height: height - 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  logoContainer: {
    marginBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconText: {
    fontSize: 60,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 36,
  },
  stepSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureContent: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  dashboardPreview: {
    width: '100%',
    marginBottom: 40,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  previewAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 15,
  },
  previewProgress: {
    marginBottom: 20,
  },
  previewProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  previewProgressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  previewProgressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  previewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  previewStat: {
    alignItems: 'center',
  },
  previewStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  previewStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  referralContainer: {
    width: '100%',
    marginBottom: 40,
  },
  referralCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  referralDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  referralBenefits: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  ctaButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 20,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#2196F3',
    width: 24,
  },
});
