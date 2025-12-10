import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Property, Utente } from '../types';
import { Match } from '../src/services/matchingService';
import { MatchWithDetails } from './MatchesScreen';

const { width } = Dimensions.get('window');

interface MatchDetailScreenProps {
  match: MatchWithDetails;
  currentUserId: string;
  currentUserRole: 'tenant' | 'landlord';
  onBack: () => void;
  onContact: (otherUserId: string, otherUserName: string) => void;
}

export default function MatchDetailScreen({
  match,
  currentUserId,
  currentUserRole,
  onBack,
  onContact,
}: MatchDetailScreenProps) {
  const otherPerson = currentUserRole === 'tenant' ? match.landlord : match.tenant;
  const property = match.property;
  const isPropertyView = currentUserRole === 'tenant';

  const handleContact = () => {
    onContact(otherPerson.id, otherPerson.nome);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isPropertyView ? 'Dettagli Proprietà' : 'Dettagli Inquilino'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: isPropertyView
                ? property.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                : otherPerson.foto || otherPerson.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500'
            }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          {isPropertyView && property.photos && property.photos.length > 1 && (
            <View style={styles.imageCountBadge}>
              <MaterialIcons name="photo-library" size={16} color="#fff" />
              <Text style={styles.imageCountText}>{property.photos.length}</Text>
            </View>
          )}
        </View>

        {/* Title and Price */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            {isPropertyView ? property.title : otherPerson.nome}
          </Text>
          {isPropertyView ? (
            <Text style={styles.price}>€{property.rent}/mese</Text>
          ) : (
            <Text style={styles.price}>Inquilino Interessato</Text>
          )}
        </View>

        {/* Location */}
        <View style={styles.locationSection}>
          <MaterialIcons name="location-on" size={20} color="#2196F3" />
          <Text style={styles.locationText}>
            {isPropertyView 
              ? property.location 
              : (otherPerson.indirizzo || otherPerson.preferences?.location || 'Indirizzo non disponibile')
            }
          </Text>
        </View>

        {/* Description */}
        {isPropertyView && property.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>{property.description}</Text>
          </View>
        )}

        {!isPropertyView && (
          <View style={styles.descriptionSection}>
            {otherPerson.bio ? (
              <>
                <Text style={styles.sectionTitle}>Bio</Text>
                <Text style={styles.description}>{otherPerson.bio}</Text>
              </>
            ) : (
              <Text style={styles.description}>
                Questo inquilino è interessato alla tua proprietà: {property.title}
              </Text>
            )}
          </View>
        )}

        {/* Property Details - Only show for tenants viewing properties */}
        {isPropertyView && (
          <>
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Dettagli</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="bed" size={24} color="#2196F3" />
                  <Text style={styles.detailLabel}>Camere</Text>
                  <Text style={styles.detailValue}>{property.bedrooms}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="bathtub" size={24} color="#2196F3" />
                  <Text style={styles.detailLabel}>Bagni</Text>
                  <Text style={styles.detailValue}>{property.bathrooms}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="square-foot" size={24} color="#2196F3" />
                  <Text style={styles.detailLabel}>Superficie</Text>
                  <Text style={styles.detailValue}>{property.squareMeters}m²</Text>
                </View>
              </View>
            </View>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <View style={styles.amenitiesSection}>
                <Text style={styles.sectionTitle}>Caratteristiche</Text>
                <View style={styles.amenitiesList}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Property Info for Landlords - Show which property the tenant is interested in */}
        {!isPropertyView && (
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Proprietà di Interesse</Text>
            <View style={styles.propertyInfoCard}>
              <Text style={styles.propertyTitle}>{property.title}</Text>
              <Text style={styles.propertyLocation}>{property.location}</Text>
              <Text style={styles.propertyPrice}>€{property.rent}/mese</Text>
            </View>
          </View>
        )}

        {/* Owner/Tenant Info */}
        <View style={styles.personSection}>
          <Text style={styles.sectionTitle}>
            {isPropertyView ? 'Proprietario' : 'Inquilino'}
          </Text>
          <View style={styles.personCard}>
            <Image
              source={{
                uri: otherPerson.foto || otherPerson.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500'
              }}
              style={styles.personAvatar}
              resizeMode="cover"
            />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{otherPerson.nome}</Text>
              {otherPerson.verificato && (
                <View style={styles.verifiedBadge}>
                  <MaterialIcons name="verified" size={16} color="#4CAF50" />
                  <Text style={styles.verifiedText}>Verificato</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Contact Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContact}
          activeOpacity={0.8}
        >
          <MaterialIcons name="message" size={24} color="#fff" />
          <Text style={styles.contactButtonText}>
            {isPropertyView ? 'Contatta Proprietario' : 'Contatta Inquilino'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    backgroundColor: '#E0E0E0',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  imageCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  titleSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  descriptionSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  detailItem: {
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  amenitiesSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  amenityText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  personSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  personAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E0E0',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  propertyInfoCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  propertyPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

