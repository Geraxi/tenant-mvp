import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
// Temporarily disabled reanimated imports
// import {
//   useSharedValue,
//   useAnimatedStyle,
//   useAnimatedGestureHandler,
//   withSpring,
//   withTiming,
//   runOnJS,
//   interpolate,
//   Extrapolate,
// } from 'react-native-reanimated';
// Temporarily disabled gesture handler imports
// import {
//   PanGestureHandler,
//   TapGestureHandler,
//   State,
// } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { User, Property } from '../types';
import { Utente } from '../src/types';
import VerificationBadge from './VerificationBadge';
import { t } from '../utils/translations';
import { LinearGradient } from 'expo-linear-gradient';
import ExpandableCardModal from './ExpandableCardModal';

import { logger } from '../src/utils/logger';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.2;
const SWIPE_OUT_DURATION = 200;

interface SwipeCardProps {
  item: User | Property | Utente;
  isPropertyView: boolean;
  propertyOwner?: User;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress: () => void;
  isFirst: boolean;
}

export default function SwipeCard({ item, isPropertyView, propertyOwner, onSwipeLeft, onSwipeRight, onPress, isFirst }: SwipeCardProps) {
  logger.debug('🃏 SwipeCard - Rendering card with:', {
    itemType: item ? (item as any).ruolo || (item as any).userType || 'property' : 'null',
    itemName: item ? (item as any).nome || (item as any).name || (item as any).title : 'null',
    isPropertyView,
    isFirst
  });
  
  // Early return if item is undefined or null
  if (!item) {
    return null;
  }
  
  const [showModal, setShowModal] = useState(false);
  const pan = useRef(new Animated.ValueXY()).current;

  // Reset pan values when component mounts or item changes
  useEffect(() => {
    // Always reset when item changes to ensure clean state
    pan.setValue({ x: 0, y: 0 });
    pan.setOffset({ x: 0, y: 0 });
  }, [item.id]);
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const likeScale = pan.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0.5, 1],
    extrapolate: 'clamp',
  });

  const nopeScale = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        // Don't capture initially - let buttons handle their touches
        // We'll capture on move if it's a swipe
        if (!isFirst) return false;
        
        // Check if touch is in the bottom area where buttons are (bottom 20% of screen)
        const { pageY } = evt.nativeEvent;
        const screenHeight = height;
        const buttonAreaStart = screenHeight * 0.8; // Bottom 20% of screen
        
        // Don't capture if touch is in button area
        if (pageY > buttonAreaStart) {
          return false;
        }
        
        return false; // Always return false initially, let onMoveShouldSetPanResponder handle it
      },
      onMoveShouldSetPanResponder: (evt, gesture) => {
        // Only capture if it's a clear swipe gesture (not a tap)
        if (!isFirst) return false;
        
        // Check if touch started in button area
        const { pageY } = evt.nativeEvent;
        const screenHeight = height;
        const buttonAreaStart = screenHeight * 0.8; // Bottom 20% of screen
        
        // Don't capture if touch is in button area
        if (pageY > buttonAreaStart) {
          return false;
        }
        
        // Require significant movement to distinguish from button taps
        return Math.abs(gesture.dx) > 15 || Math.abs(gesture.dy) > 20;
      },
      onPanResponderGrant: () => {
        logger.debug('onPanResponderGrant called');
        // Store current position as offset
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        // Reset value to 0 for clean gesture tracking
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gesture) => {
        const { dx, dy, vx } = gesture;
        // Only trigger swipe if there was significant movement
        // This prevents accidental swipes when trying to tap buttons
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
          // Small movement, likely a tap - don't swipe
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            pan.setOffset({ x: 0, y: 0 });
          });
          return;
        }
        
        const isSwipeRight = dx > SWIPE_THRESHOLD || (dx > 0 && vx > 0.5);
        const isSwipeLeft = dx < -SWIPE_THRESHOLD || (dx < 0 && vx < -0.5);
        
        if (isSwipeRight) {
          // Swipe right - like
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Flatten offset to get absolute position
          pan.flattenOffset();
          Animated.timing(pan, {
            toValue: { x: width + 100, y: dy * 0.3 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
          });
        } else if (isSwipeLeft) {
          // Swipe left - pass
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Flatten offset to get absolute position
          pan.flattenOffset();
          Animated.timing(pan, {
            toValue: { x: -width - 100, y: dy * 0.3 },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
          });
        } else {
          // Return to center - use spring animation
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            tension: 120,
            friction: 8,
            useNativeDriver: true,
          }).start(() => {
            // Reset to clean state after spring completes
            pan.setValue({ x: 0, y: 0 });
            pan.setOffset({ x: 0, y: 0 });
          });
        }
      },
    })
  ).current;

  const handleCardPress = () => {
    logger.debug('Card pressed! - TouchableOpacity triggered');
    logger.debug('Current showModal state:', showModal);
    // Don't reset pan values here - let the gesture continue naturally
    setShowModal(true);
    logger.debug('Setting showModal to true');
    onPress();
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Don't reset pan values here - let the gesture continue naturally
  };

  const handleModalSwipeLeft = () => {
    setShowModal(false);
    onSwipeLeft();
  };

  const handleModalSwipeRight = () => {
    setShowModal(false);
    onSwipeRight();
  };

  // Reset pan values when modal closes
  React.useEffect(() => {
    if (!showModal) {
      // Small delay to ensure modal animation completes
      setTimeout(() => {
        pan.setValue({ x: 0, y: 0 });
        pan.setOffset({ x: 0, y: 0 });
        logger.debug('Pan values reset after modal close');
      }, 100);
    }
  }, [showModal]);

  if (!isFirst) {
    return (
      <View style={styles.nextCard} pointerEvents="none">
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: isPropertyView 
                ? (item as Property)?.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                : (item as User | Utente)?.foto || (item as User | Utente)?.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500'
            }} 
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
        <View style={styles.infoContainer}>
          {isPropertyView ? (
            // Property view
            <>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{(item as Property).title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>€{(item as Property).price}</Text>
                  <Text style={styles.priceUnit}>/mese</Text>
                </View>
              </View>
              
              <View style={styles.typeRow}>
                <MaterialIcons name="home" size={16} color="#666" />
                <Text style={styles.userType}>Proprietà</Text>
              </View>
              
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.location}>{(item as Property).location}</Text>
              </View>
              
              <Text style={styles.bio} numberOfLines={3}>
                {(item as Property).description}
              </Text>
              
              <View style={styles.propertyDetails}>
                <View style={styles.propertyDetail}>
                  <MaterialIcons name="bed" size={14} color="#2196F3" />
                  <Text style={styles.propertyDetailText}>{(item as Property).bedrooms} camere</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <MaterialIcons name="square-foot" size={14} color="#2196F3" />
                  <Text style={styles.propertyDetailText}>{(item as Property).squareMeters}m²</Text>
                </View>
              </View>
              
              {propertyOwner && (
                <View style={styles.ownerRow}>
                  <Image
                    source={{ uri: propertyOwner?.foto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500' }}
                    style={styles.ownerPhoto}
                  />
                  <Text style={styles.ownerName}>{propertyOwner.name}</Text>
                </View>
              )}
            </>
          ) : (
            // User view
            <>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{(item as User | Utente).nome || (item as User | Utente).name || 'Nome non disponibile'}</Text>
                <VerificationBadge 
                  status={(item as User | Utente).verificato || false}
                  idVerified={(item as User | Utente).verificato || false}
                  backgroundCheck={(item as User | Utente).verificato || false}
                />
              </View>
              
              <View style={styles.typeRow}>
                <MaterialIcons 
                  name={((item as User | Utente).ruolo === 'landlord' || (item as User | Utente).userType === 'homeowner') ? 'home' : 'person'} 
                  size={16} 
                  color="#666" 
                />
                <Text style={styles.userType}>
                  {(item as User | Utente).ruolo?.charAt(0).toUpperCase() + (item as User | Utente).ruolo?.slice(1) || 'Utente'}
                </Text>
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.location}>{(item as User | Utente).indirizzo || (item as User | Utente).location || 'Indirizzo non disponibile'}</Text>
              </View>

              <Text style={styles.bio} numberOfLines={3}>{(item as User | Utente).bio || 'Nessuna descrizione disponibile'}</Text>

              {((item as User | Utente).ruolo === 'landlord' || (item as User | Utente).userType === 'homeowner') && (item as User | Utente).preferences?.rent ? (
                <View style={styles.rentRow}>
                  <MaterialIcons name="attach-money" size={20} color="#2196F3" />
                  <Text style={styles.rent}>€{(item as User | Utente).preferences.rent}/mese</Text>
                </View>
              ) : (
                <View style={styles.rentRowPlaceholder} />
              )}
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          },
        ]}
        {...(isFirst ? panResponder.panHandlers : {})}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: isPropertyView 
                ? (item as Property)?.photos?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'
                : (item as User | Utente)?.foto || (item as User | Utente)?.photos?.[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500'
            }} 
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.tapHint}
            onPress={handleCardPress}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="touch-app" size={24} color="#fff" />
            <Text style={styles.tapHintText}>Tocca per vedere di più</Text>
          </TouchableOpacity>
        </View>
      
          <Animated.View style={[
            styles.likeLabel, 
            { 
              opacity: likeOpacity,
              transform: [{ scale: likeScale }]
            }
          ]}>
            <Text style={[styles.labelText, { color: '#2196F3' }]}>LIKE</Text>
          </Animated.View>
          
          <Animated.View style={[
            styles.nopeLabel, 
            { 
              opacity: nopeOpacity,
              transform: [{ scale: nopeScale }]
            }
          ]}>
            <Text style={[styles.labelText, { color: '#F44336' }]}>NOPE</Text>
          </Animated.View>

        <TouchableOpacity 
          style={styles.infoContainer}
          onPress={handleCardPress}
          activeOpacity={0.95}
        >
          {isPropertyView ? (
            // Property view
            <>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{(item as Property).title}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>€{(item as Property).price}</Text>
                  <Text style={styles.priceUnit}>/mese</Text>
                </View>
              </View>
              
              <View style={styles.typeRow}>
                <MaterialIcons name="home" size={16} color="#666" />
                <Text style={styles.userType}>Proprietà</Text>
              </View>
              
              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.location}>{(item as Property).location}</Text>
              </View>
              
              <Text style={styles.bio} numberOfLines={3}>
                {(item as Property).description}
              </Text>
              
              <View style={styles.propertyDetails}>
                <View style={styles.propertyDetail}>
                  <MaterialIcons name="bed" size={14} color="#2196F3" />
                  <Text style={styles.propertyDetailText}>{(item as Property).bedrooms} camere</Text>
                </View>
                <View style={styles.propertyDetail}>
                  <MaterialIcons name="square-foot" size={14} color="#2196F3" />
                  <Text style={styles.propertyDetailText}>{(item as Property).squareMeters}m²</Text>
                </View>
              </View>
              
              {propertyOwner && (
                <View style={styles.ownerRow}>
                  <Image
                    source={{ uri: propertyOwner?.foto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500' }}
                    style={styles.ownerPhoto}
                  />
                  <Text style={styles.ownerName}>{propertyOwner.name}</Text>
                </View>
              )}
            </>
          ) : (
            // User view
            <>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{(item as User | Utente).nome || (item as User | Utente).name || 'Nome non disponibile'}</Text>
                <VerificationBadge 
                  status={(item as User | Utente).verificato || false}
                  idVerified={(item as User | Utente).verificato || false}
                  backgroundCheck={(item as User | Utente).verificato || false}
                />
              </View>
              
              <View style={styles.typeRow}>
                  <MaterialIcons 
                    name={((item as User | Utente).ruolo === 'landlord' || (item as User | Utente).userType === 'homeowner') ? 'home' : 'person'} 
                    size={16} 
                    color="#666" 
                  />
                  <Text style={styles.userType}>
                    {((item as User | Utente).ruolo || (item as User | Utente).userType)?.charAt(0).toUpperCase() + ((item as User | Utente).ruolo || (item as User | Utente).userType)?.slice(1) || 'Utente'}
                  </Text>
              </View>

              <View style={styles.locationRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.location}>{(item as User | Utente).indirizzo || (item as User | Utente).location || 'Indirizzo non disponibile'}</Text>
              </View>

              <Text style={styles.bio} numberOfLines={3}>{(item as User | Utente).bio || 'Nessuna descrizione disponibile'}</Text>

              {((item as User | Utente).ruolo === 'landlord' || (item as User | Utente).userType === 'homeowner') && (item as User | Utente).preferences?.rent ? (
                <View style={styles.rentRow}>
                  <MaterialIcons name="attach-money" size={20} color="#2196F3" />
                  <Text style={styles.rent}>€{(item as User | Utente).preferences.rent}/mese</Text>
                </View>
              ) : (
                <View style={styles.rentRowPlaceholder} />
              )}
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      <ExpandableCardModal
        visible={showModal}
        item={item}
        isPropertyView={isPropertyView}
        onClose={handleModalClose}
        onSwipeLeft={handleModalSwipeLeft}
        onSwipeRight={handleModalSwipeRight}
      />
      {logger.debug('Rendering modal with visible:', showModal)}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: width - 40,
    height: height * 0.58, // Fixed height that leaves room for buttons
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
    alignSelf: 'center',
    zIndex: 1, // Lower than buttons
  },
  nextCard: {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 1,
    zIndex: -1,
    height: height * 0.58, // Fixed height to match main card
    width: width - 40,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.58 * 0.55, // 55% of card height (adjusted for new card height)
    overflow: 'hidden',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tapHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 10,
    maxWidth: '100%',
    elevation: 10,
  },
  tapHintText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    minHeight: height * 0.58 * 0.45, // 45% of card height (adjusted for new card height)
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: 'flex-start',
    overflow: 'visible',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
    minHeight: 32,
    gap: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    flexShrink: 1,
    marginRight: 0,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    height: 20,
  },
  userType: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
    height: 20,
  },
  location: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
    // Ensure consistent bio height - reduced to make room for property details
    height: 48, // Fixed height for ~2.5 lines (18 * 2.5)
    overflow: 'hidden',
  },
  rentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F9F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    height: 32,
  },
  rent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
  },
  rentRowPlaceholder: {
    height: 32,
  },
  likeLabel: {
    position: 'absolute',
    top: 60,
    right: 30,
    borderWidth: 6,
    borderColor: '#2196F3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    transform: [{ rotate: '25deg' }],
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    zIndex: 10,
  },
  nopeLabel: {
    position: 'absolute',
    top: 60,
    left: 30,
    borderWidth: 6,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    transform: [{ rotate: '-25deg' }],
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    zIndex: 10,
  },
  labelText: {
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
    minWidth: 80,
    maxWidth: 100,
    paddingLeft: 0,
    flexShrink: 0,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    flexShrink: 0,
    lineHeight: 24,
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginTop: -2,
    flexShrink: 0,
    lineHeight: 14,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    marginBottom: 0,
    height: 24,
    alignItems: 'center',
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
  },
  propertyDetailText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
    lineHeight: 24,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  ownerPhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  ownerName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
