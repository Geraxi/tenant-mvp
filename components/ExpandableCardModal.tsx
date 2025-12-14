import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  PanResponder,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Utente } from '../src/types';
import { Property } from '../types';

import { logger } from '../src/utils/logger';

interface ExpandableCardModalProps {
  visible: boolean;
  item: Utente | Property;
  isPropertyView: boolean;
  onClose: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ExpandableCardModal({
  visible,
  item,
  isPropertyView,
  onClose,
  onSwipeLeft,
  onSwipeRight,
}: ExpandableCardModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    logger.debug('ExpandableCardModal visible changed to:', visible);
    if (visible) {
      logger.debug('Starting modal open animation');
      // Reset values first
      translateY.setValue(screenHeight);
      opacity.setValue(0);
      
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      logger.debug('Starting modal close animation');
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getImages = () => {
    if (isPropertyView) {
      const property = item as Property;
      return property.photos || [];
    } else {
      const user = item as Utente;
      // Use photos array if available, otherwise fall back to single foto
      return user.photos || (user.foto ? [user.foto] : []);
    }
  };

  const images = getImages();

  const renderImageCarousel = () => {
    if (images.length === 0) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500' }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="start"
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
          style={styles.imageScrollView}
        >
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        
        {images.length > 1 && (
          <View style={styles.imageIndicator}>
            <Text style={styles.imageIndicatorText}>
              {currentImageIndex + 1} / {images.length}
            </Text>
          </View>
        )}
        
        {/* Photo dots indicator */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPropertyContent = () => {
    const property = item as Property;
    logger.debug('ExpandableCardModal - Property data:', property);
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{property.title}</Text>
          <Text style={styles.price}>€{property.rent}/mese</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="location-on" size={20} color="#666" />
            <Text style={styles.detailText}>{property.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="straighten" size={20} color="#666" />
            <Text style={styles.detailText}>{property.squareMeters} m²</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="meeting-room" size={20} color="#666" />
            <Text style={styles.detailText}>{property.bedrooms} camere</Text>
          </View>

          {property.bathrooms && (
            <View style={styles.detailRow}>
              <MaterialIcons name="bathtub" size={20} color="#666" />
              <Text style={styles.detailText}>{property.bathrooms} bagni</Text>
            </View>
          )}
        </View>

        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Caratteristiche</Text>
          <View style={styles.featureGrid}>
            {property.amenities && property.amenities.map((amenity, index) => (
              <View key={index} style={styles.featureItem}>
                <MaterialIcons name="check" size={20} color="#4CAF50" />
                <Text style={styles.featureText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>

        {property.description && (
          <View style={styles.description}>
            <Text style={styles.sectionTitle}>Descrizione</Text>
            <Text style={styles.descriptionText}>{property.description}</Text>
          </View>
        )}

        <View style={styles.costs}>
          <Text style={styles.sectionTitle}>Costi</Text>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Affitto</Text>
            <Text style={styles.costValue}>€{property.rent}/mese</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderUserContent = () => {
    const user = item as Utente;
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{user.nome}</Text>
          <Text style={styles.age}>Inquilino</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MaterialIcons name="email" size={20} color="#666" />
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          {user.telefono && (
            <View style={styles.detailRow}>
              <MaterialIcons name="phone" size={20} color="#666" />
              <Text style={styles.detailText}>{user.telefono}</Text>
            </View>
          )}

          {user.indirizzo && (
            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#666" />
              <Text style={styles.detailText}>{user.indirizzo}</Text>
            </View>
          )}
        </View>

        <View style={styles.verification}>
          <Text style={styles.sectionTitle}>Verifiche</Text>
          <View style={styles.verificationItem}>
            <MaterialIcons 
              name={user.verificato ? "check-circle" : "cancel"} 
              size={20} 
              color={user.verificato ? "#4CAF50" : "#F44336"} 
            />
            <Text style={styles.verificationText}>
              {user.verificato ? "Profilo verificato" : "Profilo non verificato"}
            </Text>
          </View>
        </View>

        <View style={styles.preferences}>
          <Text style={styles.sectionTitle}>Preferenze</Text>
          <Text style={styles.preferencesText}>
            Informazioni dettagliate sulle preferenze dell'inquilino saranno disponibili dopo il match.
          </Text>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {}}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View style={[styles.modal, { transform: [{ translateY }] }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              {onSwipeLeft && (
                <TouchableOpacity style={styles.actionButton} onPress={onSwipeLeft}>
                  <MaterialIcons name="close" size={24} color="#F44336" />
                </TouchableOpacity>
              )}
              {onSwipeRight && (
                <TouchableOpacity style={styles.actionButton} onPress={onSwipeRight}>
                  <MaterialIcons name="favorite" size={24} color="#4CAF50" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Image Carousel */}
          {renderImageCarousel()}

          {/* Content */}
          {isPropertyView ? renderPropertyContent() : renderUserContent()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
  },
  imageContainer: {
    height: screenHeight * 0.5,
    width: screenWidth,
    position: 'relative',
  },
  imageScrollView: {
    flex: 1,
  },
  imageWrapper: {
    width: screenWidth,
    height: screenHeight * 0.5,
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.5,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2196F3',
  },
  age: {
    fontSize: 16,
    color: '#666',
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  features: {
    marginBottom: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  description: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  costs: {
    marginBottom: 20,
  },
  costItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  costLabel: {
    fontSize: 16,
    color: '#666',
  },
  costValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  verification: {
    marginBottom: 20,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  preferences: {
    marginBottom: 20,
  },
  preferencesText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
