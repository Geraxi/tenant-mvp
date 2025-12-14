import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface VerificationScreenProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function VerificationScreen({ onBack, onComplete }: VerificationScreenProps) {
  const [idVerified, setIdVerified] = useState(false);
  const [backgroundCheck, setBackgroundCheck] = useState(false);

  const handleIdVerification = () => {
    Alert.alert(
      'ID Verification',
      'This will open a secure verification flow. For demo purposes, we\'ll mark it as complete.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            setIdVerified(true);
            Alert.alert('Success', 'ID verification completed!');
          }
        },
      ]
    );
  };

  const handleBackgroundCheck = () => {
    Alert.alert(
      'Background Check',
      'This will initiate a background check. For demo purposes, we\'ll mark it as complete.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Continue', 
          onPress: () => {
            setBackgroundCheck(true);
            Alert.alert('Success', 'Background check completed!');
          }
        },
      ]
    );
  };

  const handleComplete = () => {
    if (idVerified && backgroundCheck) {
      onComplete();
    } else {
      Alert.alert(
        'Incomplete Verification',
        'Please complete all verification steps to continue.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <MaterialIcons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.introSection}>
          <MaterialIcons name="security" size={64} color="#2196F3" />
          <Text style={styles.introTitle}>Stay Safe & Verified</Text>
          <Text style={styles.introText}>
            Complete these verification steps to build trust and ensure a scam-free experience for everyone.
          </Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <MaterialIcons 
                name={idVerified ? "check-circle" : "badge"} 
                size={32} 
                color={idVerified ? "#2196F3" : "#2196F3"} 
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>ID Verification</Text>
              <Text style={styles.stepDescription}>
                Verify your identity with a government-issued ID
              </Text>
            </View>
          </View>
          {!idVerified ? (
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleIdVerification}
            >
              <Text style={styles.verifyButtonText}>Verify ID</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check" size={20} color="#2196F3" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepIconContainer}>
              <MaterialIcons 
                name={backgroundCheck ? "check-circle" : "verified-user"} 
                size={32} 
                color={backgroundCheck ? "#2196F3" : "#2196F3"} 
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Background Check</Text>
              <Text style={styles.stepDescription}>
                Complete a background check for added security
              </Text>
            </View>
          </View>
          {!backgroundCheck ? (
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleBackgroundCheck}
            >
              <Text style={styles.verifyButtonText}>Start Check</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check" size={20} color="#2196F3" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Benefits of Verification</Text>
          <View style={styles.benefit}>
            <MaterialIcons name="shield" size={24} color="#2196F3" />
            <Text style={styles.benefitText}>Increased trust from other users</Text>
          </View>
          <View style={styles.benefit}>
            <MaterialIcons name="trending-up" size={24} color="#2196F3" />
            <Text style={styles.benefitText}>Higher match rate</Text>
          </View>
          <View style={styles.benefit}>
            <MaterialIcons name="security" size={24} color="#2196F3" />
            <Text style={styles.benefitText}>Scam-free environment</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.completeButton,
            (!idVerified || !backgroundCheck) && styles.completeButtonDisabled
          ]}
          onPress={handleComplete}
          disabled={!idVerified || !backgroundCheck}
        >
          <Text style={styles.completeButtonText}>Complete Verification</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepIconContainer: {
    marginRight: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  completedText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
  },
  completeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#CCC',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});