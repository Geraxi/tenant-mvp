import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '../types';
import VerificationBadge from './VerificationBadge';
import { t } from '../utils/translations';

const { width, height } = Dimensions.get('window');

interface CardDetailModalProps {
  visible: boolean;
  user: User;
  onClose: () => void;
}

export default function CardDetailModal({ visible, user, onClose }: CardDetailModalProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const translateY = new Animated.Value(0);

  // Pan responder for swipe-down to close
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      // Only respond to vertical swipes
      return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150) {
        // Swipe down threshold reached, close modal
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          translateY.setValue(0);
          onClose();
        });
      } else {
        // Return to original position
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { transform: [{ translateY }] }
        ]}
      >
        <SafeAreaView style={styles.container}>
          {/* Swipe indicator */}
          <View style={styles.swipeIndicatorContainer} {...panResponder.panHandlers}>
            <View style={styles.swipeIndicator} />
          </View>

          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('viewProfile')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="keyboard-arrow-down" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.photosContainer}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentPhotoIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {user.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.photoIndicators}>
                {user.photos.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.indicator,
                      index === currentPhotoIndex && styles.indicatorActive,
                    ]}
                  />
                ))}
              </View>
              {/* Close hint overlay */}
              <View style={styles.closeHintOverlay}>
                <MaterialIcons name="keyboard-arrow-down" size={32} color="rgba(255,255,255,0.8)" />
                <Text style={styles.closeHintText}>Scorri per vedere più foto</Text>
              </View>
              
              {/* Close button overlay */}
              <TouchableOpacity 
                style={styles.closeOverlayButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="rgba(255,255,255,0.9)" />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{user.name}, {user.age}</Text>
                <VerificationBadge
                  status={user.verified}
                  idVerified={user.idVerified}
                  backgroundCheck={user.backgroundCheckPassed}
                  size="large"
                />
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={20} color="#666" />
                <Text style={styles.infoText}>{user.location}</Text>
              </View>

              <View style={styles.infoRow}>
                <MaterialIcons
                  name={user.userType === 'homeowner' ? 'home' : user.userType === 'tenant' ? 'person' : 'people'}
                  size={20}
                  color="#666"
                />
                <Text style={styles.infoText}>
                  {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                </Text>
              </View>

              {user.employmentStatus && (
                <View style={styles.infoRow}>
                  <MaterialIcons name="work" size={20} color="#666" />
                  <Text style={styles.infoText}>
                    {t(user.employmentStatus as any)}
                    {user.jobType && ` - ${t(user.jobType as any)}`}
                  </Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('about')}</Text>
                <Text style={styles.bio}>{user.bio}</Text>
              </View>

              {user.userType === 'homeowner' && user.preferences.rent && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('propertyInfo')}</Text>
                  <View style={styles.propertyGrid}>
                    <View style={styles.propertyItem}>
                      <MaterialIcons name="attach-money" size={24} color="#2196F3" />
                      <Text style={styles.propertyValue}>€{user.preferences.rent}</Text>
                      <Text style={styles.propertyLabel}>{t('perMonth')}</Text>
                    </View>
                    {user.preferences.bedrooms && (
                      <View style={styles.propertyItem}>
                        <MaterialIcons name="bed" size={24} color="#2196F3" />
                        <Text style={styles.propertyValue}>{user.preferences.bedrooms}</Text>
                        <Text style={styles.propertyLabel}>{t('bedrooms')}</Text>
                      </View>
                    )}
                    {user.preferences.bathrooms && (
                      <View style={styles.propertyItem}>
                        <MaterialIcons name="bathtub" size={24} color="#2196F3" />
                        <Text style={styles.propertyValue}>{user.preferences.bathrooms}</Text>
                        <Text style={styles.propertyLabel}>{t('bathrooms')}</Text>
                      </View>
                    )}
                    {user.preferences.squareMeters && (
                      <View style={styles.propertyItem}>
                        <MaterialIcons name="square-foot" size={24} color="#2196F3" />
                        <Text style={styles.propertyValue}>{user.preferences.squareMeters}</Text>
                        <Text style={styles.propertyLabel}>{t('squareMeters')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {user.preferences.amenities && user.preferences.amenities.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>{t('amenities')}</Text>
                  <View style={styles.amenitiesContainer}>
                    {user.preferences.amenities.map((amenity, index) => (
                      <View key={index} style={styles.amenityChip}>
                        <MaterialIcons name="check-circle" size={16} color="#2196F3" />
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  swipeIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CCC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  photosContainer: {
    height: 400,
    position: 'relative',
  },
  photo: {
    width: width,
    height: 400,
  },
  photoIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#fff',
    width: 24,
  },
  closeHintOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.7,
  },
  closeHintText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  closeOverlayButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  propertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  propertyItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  propertyValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  propertyLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  amenityText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});
