import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import { t } from '../utils/translations';

interface NoMoreListingsScreenProps {
  onBack: () => void;
  onRefresh: () => void;
  onPreferences?: () => void;
  onFilters?: () => void;
}

export default function NoMoreListingsScreen({
  onBack,
  onRefresh,
  onPreferences,
  onFilters,
}: NoMoreListingsScreenProps) {
  const getEmptyStateText = () => {
    return {
      title: 'Nessuna Altra Proprietà',
      subtitle: 'Hai visto tutte le proprietà disponibili che corrispondono alle tue preferenze attuali.',
      suggestion: 'Prova ad aggiustare i tuoi filtri per vedere più opzioni!',
    };
  };

  const emptyState = getEmptyStateText();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={24} color="#2196F3" />
        <Text style={styles.backButtonText}>Indietro</Text>
      </TouchableOpacity>
      
      <View style={styles.iconContainer}>
        <MaterialIcons name="home-work" size={100} color="#2196F3" />
      </View>
      
      <Text style={styles.title}>{emptyState.title}</Text>
      <Text style={styles.subtitle}>{emptyState.subtitle}</Text>
      <Text style={styles.suggestion}>{emptyState.suggestion}</Text>

      <View style={styles.optionsContainer}>
        {onPreferences && (
          <TouchableOpacity style={styles.optionButton} onPress={onPreferences}>
            <View style={styles.optionIcon}>
              <MaterialIcons name="tune" size={24} color="#2196F3" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Modifica Preferenze</Text>
              <Text style={styles.optionDescription}>
                Aggiusta le tue preferenze per le proprietà (budget, posizione, servizi)
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        )}

        {onFilters && (
          <TouchableOpacity style={styles.optionButton} onPress={onFilters}>
            <View style={styles.optionIcon}>
              <MaterialIcons name="filter-list" size={24} color="#2196F3" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Modifica Filtri</Text>
              <Text style={styles.optionDescription}>
                Modifica i filtri di ricerca (distanza, tipo di proprietà, caratteristiche)
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.optionButton} onPress={onRefresh}>
          <View style={styles.optionIcon}>
            <MaterialIcons name="refresh" size={24} color="#2196F3" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Aggiorna Annunci</Text>
            <Text style={styles.optionDescription}>
              Controlla se sono stati aggiunti nuovi annunci
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.tipContainer}>
        <MaterialIcons name="lightbulb" size={20} color="#FFEAA7" />
        <Text style={styles.tipText}>
          Suggerimento: Prova ad espandere il raggio di ricerca o ad aggiustare la fascia di budget per trovare più proprietà!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 40,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F9F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  quickActions: {
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFEAA7',
  },
  tipText: {
    fontSize: 14,
    color: '#8B6914',
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
});
