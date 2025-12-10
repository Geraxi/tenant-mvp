import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface RoommateSelectionScreenProps {
  onNext: (wantsRoommate: boolean) => void;
  onBack: () => void;
  initialData?: any;
}

export default function RoommateSelectionScreen({
  onNext,
  onBack,
  initialData = {},
}: RoommateSelectionScreenProps) {
  const [wantsRoommate, setWantsRoommate] = useState<boolean | null>(initialData.wantsRoommate ?? null);

  const handleNext = () => {
    if (wantsRoommate !== null) {
      onNext(wantsRoommate);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferenze Chiave: Coinquilino</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>
          Vuoi aggiungere un coinquilino alla tua ricerca di una casa?
        </Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionCard, wantsRoommate === true && styles.optionCardActive]}
            onPress={() => setWantsRoommate(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, wantsRoommate === true && styles.optionIconActive]}>
              <MaterialIcons name="person-add" size={32} color={wantsRoommate === true ? '#FFFFFF' : '#2196F3'} />
            </View>
            <Text style={[styles.optionTitle, wantsRoommate === true && styles.optionTitleActive]}>
              Sì, anche un coinquilino
            </Text>
            <Text style={[styles.optionSubtitle, wantsRoommate === true && styles.optionSubtitleActive]}>
              Trova la persona giusta con cui condividere la casa.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionCard, wantsRoommate === false && styles.optionCardActive]}
            onPress={() => setWantsRoommate(false)}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIcon, wantsRoommate === false && styles.optionIconActive]}>
              <MaterialIcons name="home" size={32} color={wantsRoommate === false ? '#FFFFFF' : '#2196F3'} />
            </View>
            <Text style={[styles.optionTitle, wantsRoommate === false && styles.optionTitleActive]}>
              No, solo una casa
            </Text>
            <Text style={[styles.optionSubtitle, wantsRoommate === false && styles.optionSubtitleActive]}>
              Mi concentrerò solo sulla ricerca dell'alloggio.
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.continueButton, wantsRoommate === null && styles.continueButtonDisabled]} 
          onPress={handleNext}
          disabled={wantsRoommate === null}
        >
          <LinearGradient
            colors={wantsRoommate === null ? ['#CCCCCC', '#AAAAAA'] : ['#2196F3', '#1976D2']}
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
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionCardActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionIconActive: {
    backgroundColor: '#2196F3',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  optionTitleActive: {
    color: '#2196F3',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  optionSubtitleActive: {
    color: '#1976D2',
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
  continueButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
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

