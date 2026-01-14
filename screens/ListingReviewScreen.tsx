import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Immobile } from '../src/types';

interface ListingReviewScreenProps {
  property: Partial<Immobile>;
  onBack: () => void;
  onEdit: () => void;
  onPublish: () => void;
}

export default function ListingReviewScreen({
  property,
  onBack,
  onEdit,
  onPublish,
}: ListingReviewScreenProps) {
  const mainPhoto =
    (property as any)?.photos?.[0] ||
    property?.foto?.[0] ||
    property?.immagini?.[0];
  const address = property?.indirizzo || property?.address || '-';
  const rent =
    (property as any)?.prezzo_affitto ??
    (property as any)?.rent ??
    (property as any)?.canone ??
    '-';
  const rooms = (property as any)?.locali ?? (property as any)?.bedrooms ?? '-';
  const baths = (property as any)?.bagni ?? (property as any)?.bathrooms ?? '-';
  const sqm =
    (property as any)?.superficie ?? (property as any)?.squareMeters ?? '-';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialIcons name="arrow-back" size={24} color="#1B1B1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Riepilogo e Pubblica</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.stepRow}>
        <Text style={styles.stepTitle}>Passaggio 4 di 4</Text>
        <View style={styles.dots}>
          <View style={styles.dotInactive} />
          <View style={styles.dotInactive} />
          <View style={styles.dotInactive} />
          <View style={styles.dotActive} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Dati Principali</Text>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={16} color="#1E88E5" />
              <Text style={styles.editText}>Modifica</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>Indirizzo: {address}</Text>
          <Text style={styles.cardText}>Tipo di proprieta: Appartamento</Text>
          <Text style={styles.cardText}>Canone di affitto: €{rent}/mese</Text>
          <Text style={styles.cardText}>
            Stanze: {rooms} | Bagni: {baths} | Superficie: {sqm} m²
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dettagli e Servizi</Text>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={16} color="#1E88E5" />
              <Text style={styles.editText}>Modifica</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.cardText}>
            {(property as any)?.descrizione ||
              (property as any)?.description ||
              'Aggiungi una descrizione per la tua proprieta.'}
          </Text>
          <Text style={styles.cardText}>
            Servizi: {(property as any)?.amenities?.join(', ') || 'Wi-Fi, Lavatrice, Aria Condizionata'}
          </Text>
          <Text style={styles.cardText}>
            Regole della casa: {(property as any)?.regole || 'Non fumatori, Animali non ammessi'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Foto e Media</Text>
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <MaterialIcons name="edit" size={16} color="#1E88E5" />
              <Text style={styles.editText}>Modifica</Text>
            </TouchableOpacity>
          </View>
          {mainPhoto ? (
            <Image source={{ uri: mainPhoto }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="photo" size={32} color="#A0A0A7" />
              <Text style={styles.photoPlaceholderText}>Nessuna foto</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.publishButton} onPress={onPublish}>
          <Text style={styles.publishText}>Pubblica Annuncio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1F',
  },
  headerSpacer: {
    width: 32,
  },
  stepRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 12,
    color: '#6B6B76',
    marginBottom: 6,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D7D9DE',
  },
  dotActive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E88E5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1B1B1F',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
  },
  editText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '600',
  },
  cardText: {
    fontSize: 13,
    color: '#4C4C55',
    marginTop: 6,
  },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 8,
  },
  photoPlaceholder: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#EEF1F6',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#7A7A85',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F4F6F9',
  },
  publishButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 14,
    borderRadius: 28,
    alignItems: 'center',
  },
  publishText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
