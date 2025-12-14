import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { logger } from '../src/utils/logger';

const { width, height } = Dimensions.get('window');

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  type: 'house' | 'house2' | 'house3';
  color: string;
  size: number;
}

interface MatchAnimationProps {
  onComplete?: () => void;
}

export default function MatchAnimation({ onComplete }: MatchAnimationProps) {
  const particles = useRef<Particle[]>([]);
  const matchTextOpacity = useRef(new Animated.Value(0)).current;
  const matchTextScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Create 50 particles for more dramatic effect
    const particleCount = 50;
    const newParticles: Particle[] = [];

    const houseTypes = ['house', 'house2', 'house3'] as const;
    const colors = ['#FF6B6B', '#2196F3', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    
    for (let i = 0; i < particleCount; i++) {
      const particle: Particle = {
        x: new Animated.Value(width / 2),
        y: new Animated.Value(height / 2),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1), // Start visible
        opacity: new Animated.Value(1), // Start visible
        type: houseTypes[i % houseTypes.length],
        color: colors[i % colors.length],
        size: 30 + Math.random() * 40, // Even larger houses
      };
      newParticles.push(particle);
    }

    particles.current = newParticles;
    if (__DEV__) {
      logger.debug('Created', newParticles.length, 'house particles for match animation');
    }

    // Create multiple waves of animation for more dynamic effect
    const createWave = (startDelay: number, particleIndices: number[]) => {
      const animations = particleIndices.map((index) => {
        const particle = newParticles[index];
        const angle = (index / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const velocity = 400 + Math.random() * 600; // Increased velocity
        const endX = width / 2 + Math.cos(angle) * velocity + (Math.random() - 0.5) * 300;
        const endY = height / 2 + Math.sin(angle) * velocity - 200 + Math.random() * 400;

        return Animated.parallel([
          Animated.delay(startDelay),
          Animated.timing(particle.x, {
            toValue: endX,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: endY,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 720 - 360,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]);
      });
      return animations;
    };

    // Create all particles at once for immediate visibility
    const allAnimations = createWave(0, Array.from({ length: particleCount }, (_, i) => i));
    
    if (__DEV__) {
      logger.debug('Created', newParticles.length, 'house particles for match animation');
    }

    // Animate MATCH text
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(matchTextOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(matchTextScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2000),
      Animated.timing(matchTextOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel(allAnimations).start(() => {
      if (__DEV__) {
        logger.debug('House animation completed');
      }
      if (onComplete) {
        setTimeout(onComplete, 500);
      }
    });
  }, []);

  const renderHouse = (particle: Particle) => {
    const houseStyle = {
      width: particle.size,
      height: particle.size,
    };
    
    if (__DEV__) {
      logger.debug('Rendering house:', particle.type, 'size:', particle.size, 'color:', particle.color);
    }

    switch (particle.type) {
      case 'house':
        return (
          <View style={[styles.house, houseStyle]}>
            <View style={[styles.roof, { borderBottomColor: particle.color }]} />
            <View style={[styles.houseBody, { backgroundColor: particle.color }]} />
          </View>
        );
      case 'house2':
        return (
          <View style={[styles.house2, houseStyle]}>
            <View style={[styles.roof2, { borderBottomColor: particle.color }]} />
            <View style={[styles.houseBody2, { backgroundColor: particle.color }]} />
            <View style={[styles.door, { backgroundColor: '#8B4513' }]} />
          </View>
        );
      case 'house3':
        return (
          <View style={[styles.house3, houseStyle]}>
            <View style={[styles.roof3, { borderBottomColor: particle.color }]} />
            <View style={[styles.houseBody3, { backgroundColor: particle.color }]} />
            <View style={[styles.window, { backgroundColor: '#87CEEB' }]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {/* MATCH text overlay */}
      <Animated.View
        style={[
          styles.matchTextContainer,
          {
            opacity: matchTextOpacity,
            transform: [{ scale: matchTextScale }],
          },
        ]}
      >
        <Text style={styles.matchText}>MATCH!</Text>
        <Text style={styles.matchSubtext}>Hai trovato una corrispondenza perfetta!</Text>
      </Animated.View>

      {/* House particles */}
      {particles.current.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { 
                  rotate: particle.rotation.interpolate({
                    inputRange: [-540, 540],
                    outputRange: ['-540deg', '540deg'],
                  }),
                },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        >
          {renderHouse(particle)}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  matchTextContainer: {
    position: 'absolute',
    top: height * 0.3,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF6B6B',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 4,
  },
  matchSubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  particle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // Add a visible background for debugging
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 5,
  },
  // House Type 1 - Simple house
  house: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  houseBody: {
    width: 12,
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  // House Type 2 - House with door
  house2: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roof2: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  houseBody2: {
    width: 16,
    height: 12,
    borderRadius: 2,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  door: {
    position: 'absolute',
    bottom: 0,
    left: 2,
    width: 3,
    height: 8,
    borderRadius: 1,
  },
  // House Type 3 - House with window
  house3: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  roof3: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  houseBody3: {
    width: 14,
    height: 11,
    borderRadius: 1,
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
  },
  window: {
    position: 'absolute',
    top: 2,
    left: 3,
    width: 4,
    height: 4,
    borderRadius: 1,
  },
});