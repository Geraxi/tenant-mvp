import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeGoalOnboardingInviteScreenProps {
  onComplete: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export default function HomeGoalOnboardingInviteScreen({
  onComplete,
  onSkip,
  onBack,
}: HomeGoalOnboardingInviteScreenProps) {
  const handleInviteFriends = async () => {
    try {
      const result = await Share.share({
        message: 'Ciao! Ho appena iniziato a risparmiare per la mia prima casa con Tenant. Unisciti a me e guadagna €10 di bonus! Scarica l\'app: https://tenant.app',
        title: 'Invita amici su Tenant',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert(
          'Invito Inviato!',
          'Grazie per aver condiviso Tenant con i tuoi amici. Riceverai €10 per ogni amico che si iscrive!',
          [{ text: 'OK', onPress: onComplete }]
        );
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile condividere al momento. Riprova più tardi.');
    }
  };

  const benefits = [
    {
      icon: 'euro',
      title: '€10 per amico',
      description: 'Ricevi €10 di bonus per ogni amico che si iscrive',
      color: '#4CAF50',
    },
    {
      icon: 'group',
      title: 'Risparmia insieme',
      description: 'Motivati a vicenda e raggiungi i vostri obiettivi',
      color: '#2196F3',
    },
    {
      icon: 'trending-up',
      title: 'Bonus speciali',
      description: 'Sblocca ricompense esclusive per i gruppi',
      color: '#FF9800',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invita Amici</Text>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Salta</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#4CAF50', '#66BB6A']}
              style={styles.iconGradient}
            >
              <MaterialIcons name="group-add" size={60} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Invita i tuoi amici</Text>
          <Text style={styles.subtitle}>
            Condividi Tenant con i tuoi amici e guadagna €10 per ogni iscrizione!
          </Text>

          <View style={styles.benefitsContainer}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitCard}>
                <View style={[styles.benefitIcon, { backgroundColor: benefit.color }]}>
                  <MaterialIcons name={benefit.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.referralCard}>
            <Text style={styles.referralTitle}>Come funziona:</Text>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Invita i tuoi amici tramite link o messaggio</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>I tuoi amici si iscrivono e creano il loro HomeGoal</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Ricevi €10 di bonus nel tuo HomeGoal!</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>€50</Text>
              <Text style={styles.statLabel}>Bonus potenziali</Text>
              <Text style={styles.statSubtext}>con 5 amici</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>€100</Text>
              <Text style={styles.statLabel}>Bonus potenziali</Text>
              <Text style={styles.statSubtext}>con 10 amici</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.inviteButton} onPress={handleInviteFriends}>
            <MaterialIcons name="share" size={24} color="#fff" />
            <Text style={styles.inviteButtonText}>Invita Amici</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.skipButtonBottom} onPress={onSkip}>
            <Text style={styles.skipButtonText}>Salta per ora</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: 30,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  benefitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  referralCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  referralTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flex: 1,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#666',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  inviteButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  skipButtonBottom: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#666',
  },
});
