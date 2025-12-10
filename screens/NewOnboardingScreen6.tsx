import React, { useState } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';

interface NewOnboardingScreen6Props {
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
}

export default function NewOnboardingScreen6({
  onNext,
  onBack,
  step,
  totalSteps,
}: NewOnboardingScreen6Props) {
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [incomeDocument, setIncomeDocument] = useState<string | null>(null);

  // Screen 6 shows 6/7 in the design
  const displayStep = 6;
  const progressPercentage = (displayStep / totalSteps) * 100;

  const handlePickDocument = async (type: 'id' | 'income') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        if (type === 'id') {
          setIdDocument(result.assets[0].uri);
        } else {
          setIncomeDocument(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{displayStep}/{totalSteps}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Carica Documenti</Text>
        <Text style={styles.privacyNote}>
          La tua privacy è la nostra priorità. I documenti sono usati solo per la verifica.
        </Text>

        {/* ID Document */}
        <TouchableOpacity
          style={styles.documentCard}
          onPress={() => handlePickDocument('id')}
          activeOpacity={0.7}
        >
          <View style={styles.documentIcon}>
            <MaterialIcons name="description" size={32} color="#2196F3" />
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Documento d'Identità</Text>
            <Text style={styles.documentStatus}>
              {idDocument ? 'Caricato' : 'Non caricato'}
            </Text>
          </View>
          <MaterialIcons name="add-circle-outline" size={28} color="#999" />
        </TouchableOpacity>

        {/* Income Document */}
        <TouchableOpacity
          style={styles.documentCard}
          onPress={() => handlePickDocument('income')}
          activeOpacity={0.7}
        >
          <View style={styles.documentIcon}>
            <MaterialIcons name="description" size={32} color="#2196F3" />
          </View>
          <View style={styles.documentContent}>
            <Text style={styles.documentTitle}>Prova di Reddito</Text>
            <Text style={styles.documentStatus}>
              {incomeDocument ? 'Caricato' : 'Non caricato'}
            </Text>
          </View>
          <MaterialIcons name="add-circle-outline" size={28} color="#999" />
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <MaterialIcons name="lock" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            I tuoi documenti sono crittografati e conservati in modo sicuro. Non saranno mai condivisi con altri utenti.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button - Fixed at bottom */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={onNext}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Continua</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 2,
  },
  placeholder: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  privacyNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  documentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentContent: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  documentStatus: {
    fontSize: 14,
    color: '#999',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#F5F7FA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  continueButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

