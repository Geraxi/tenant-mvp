import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Immobile } from '../src/types';

interface PropertyDetailsScreenProps {
  immobile: Immobile | null;
  onBack: () => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });
};

export default function PropertyDetailsScreen({ immobile, onBack }: PropertyDetailsScreenProps) {
  if (!immobile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dettagli Immobile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Immobile non trovato.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusText = immobile.disponibile ? 'Pubblicato' : 'In revisione';
  const statusColor = immobile.disponibile ? '#4CAF50' : '#FF9800';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dettagli Immobile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: immobile.foto[0] || 'https://via.placeholder.com/300x200' }}
            style={styles.image}
          />
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{immobile.indirizzo}</Text>
          <Text style={styles.description}>{immobile.descrizione}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dettagli</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo</Text>
              <Text style={styles.detailValue}>
                {immobile.tipo.charAt(0).toUpperCase() + immobile.tipo.slice(1)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Superficie</Text>
              <Text style={styles.detailValue}>{immobile.superficie} m²</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Locali</Text>
              <Text style={styles.detailValue}>{immobile.locali}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Piano</Text>
              <Text style={styles.detailValue}>
                {immobile.piano !== undefined ? immobile.piano : 'Piano terra'}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Servizi</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ascensore</Text>
              <Text style={styles.detailValue}>{immobile.ascensore ? 'Sì' : 'No'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Balcone</Text>
              <Text style={styles.detailValue}>{immobile.balcone ? 'Sì' : 'No'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Giardino</Text>
              <Text style={styles.detailValue}>{immobile.giardino ? 'Sì' : 'No'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Garage</Text>
              <Text style={styles.detailValue}>{immobile.garage ? 'Sì' : 'No'}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Costi</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Canone mensile</Text>
              <Text style={styles.detailValue}>{formatCurrency(immobile.canone_mensile)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Spese condominiali</Text>
              <Text style={styles.detailValue}>{formatCurrency(immobile.spese_condominiali)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Deposito cauzionale</Text>
              <Text style={styles.detailValue}>{formatCurrency(immobile.deposito_cauzionale)}</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  statusBadge: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
