import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Property, User } from '../types';

const { width, height } = Dimensions.get('window');

interface PropertyDetailModalProps {
  visible: boolean;
  property: Property | null;
  owner: User | null;
  onClose: () => void;
}

export default function PropertyDetailModal({ visible, property, owner, onClose }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!property) return null;

  const nextImage = () => {
    if (property.photos && currentImageIndex < property.photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dettagli Proprietà</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Image Gallery */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: property.photos[currentImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
            
            {/* Image Navigation */}
            {property.photos && property.photos.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.prevButton]}
                  onPress={prevImage}
                  disabled={currentImageIndex === 0}
                >
                  <MaterialIcons 
                    name="chevron-left" 
                    size={24} 
                    color={currentImageIndex === 0 ? '#ccc' : '#333'} 
                  />
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.imageNavButton, styles.nextButton]}
                  onPress={nextImage}
                  disabled={currentImageIndex === property.photos.length - 1}
                >
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={currentImageIndex === property.photos.length - 1 ? '#ccc' : '#333'} 
                  />
                </TouchableOpacity>
                
                {/* Image Counter */}
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1} / {property.photos.length}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Property Info */}
          <View style={styles.content}>
            {/* Title and Price */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{property.title}</Text>
              <Text style={styles.price}>€{property.rent}/mese</Text>
            </View>

            {/* Location */}
            <View style={styles.locationSection}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.location}>{property.location}</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descrizione</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>

            {/* Property Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dettagli</Text>
              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="bed" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Camere</Text>
                  <Text style={styles.detailValue}>{property.bedrooms}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="bathtub" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Bagni</Text>
                  <Text style={styles.detailValue}>{property.bathrooms}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="square-foot" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Metratura</Text>
                  <Text style={styles.detailValue}>{property.squareMeters}m²</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="home" size={20} color="#4A90E2" />
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>Appartamento</Text>
                </View>
              </View>
            </View>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Servizi</Text>
                <View style={styles.amenitiesContainer}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <MaterialIcons name="check" size={16} color="#4CAF50" />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Owner Info */}
            {owner && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Proprietario</Text>
                <View style={styles.ownerInfo}>
                  <Image
                    source={{ uri: owner.photo || 'https://via.placeholder.com/50' }}
                    style={styles.ownerAvatar}
                  />
                  <View style={styles.ownerDetails}>
                    <Text style={styles.ownerName}>{owner.name}</Text>
                    <Text style={styles.ownerEmail}>{owner.email}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Additional Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informazioni Aggiuntive</Text>
              <View style={styles.additionalInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Disponibile dal:</Text>
                  <Text style={styles.infoValue}>
                    {property.availableFrom ? new Date(property.availableFrom).toLocaleDateString('it-IT') : 'Immediatamente'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tipo contratto:</Text>
                  <Text style={styles.infoValue}>
                    {property.leaseType === 'long-term' ? 'Lungo termine' : 'Breve termine'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Deposito cauzionale:</Text>
                  <Text style={styles.infoValue}>€{property.deposit || 'Non specificato'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Classe energetica:</Text>
                  <Text style={styles.infoValue}>{property.energyClass || 'Non specificata'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Arredato:</Text>
                  <Text style={styles.infoValue}>{property.furnished ? 'Sì' : 'No'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Animali ammessi:</Text>
                  <Text style={styles.infoValue}>{property.petFriendly ? 'Sì' : 'No'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Parcheggio:</Text>
                  <Text style={styles.infoValue}>{property.parking ? 'Disponibile' : 'Non disponibile'}</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: height * 0.4,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  prevButton: {
    left: 15,
  },
  nextButton: {
    right: 15,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  ownerEmail: {
    fontSize: 14,
    color: '#666',
  },
  additionalInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'right',
  },
});