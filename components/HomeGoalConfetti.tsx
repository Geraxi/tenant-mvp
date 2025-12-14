import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
}

interface HomeGoalConfettiProps {
  visible: boolean;
  onComplete?: () => void;
  type?: 'milestone' | 'cashback' | 'bonus';
}

export const HomeGoalConfetti: React.FC<HomeGoalConfettiProps> = ({
  visible,
  onComplete,
  type = 'milestone',
}) => {
  const particles = useRef<ConfettiParticle[]>([]);
  const animations = useRef<Animated.Value[]>([]);

  const colors = {
    milestone: ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'],
    cashback: ['#4CAF50', '#8BC34A', '#CDDC39'],
    bonus: ['#FF9800', '#FFC107', '#FFEB3B'],
  };

  const shapes = ['circle', 'square', 'triangle'] as const;

  useEffect(() => {
    if (visible) {
      createParticles();
      animateParticles();
    }
  }, [visible]);

  const createParticles = () => {
    const particleCount = type === 'milestone' ? 50 : 30;
    particles.current = [];
    animations.current = [];

    for (let i = 0; i < particleCount; i++) {
      const particle: ConfettiParticle = {
        id: i,
        x: Math.random() * width,
        y: -50,
        rotation: Math.random() * 360,
        scale: Math.random() * 0.8 + 0.2,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };

      particles.current.push(particle);
      animations.current.push(new Animated.Value(0));
    }
  };

  const animateParticles = () => {
    const animationPromises = particles.current.map((particle, index) => {
      const animation = animations.current[index];
      
      return new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(animation, {
            toValue: 1,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(animation, {
            toValue: 0,
            duration: 1000,
            delay: 2000 + Math.random() * 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          resolve();
        });
      });
    });

    Promise.all(animationPromises).then(() => {
      if (onComplete) {
        onComplete();
      }
    });
  };

  const renderParticle = (particle: ConfettiParticle, index: number) => {
    const animation = animations.current[index];
    
    if (!animation) return null;

    const translateY = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [particle.y, height + 100],
    });

    const translateX = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [particle.x, particle.x + (Math.random() - 0.5) * 200],
    });

    const rotate = animation.interpolate({
      inputRange: [0, 1],
      outputRange: [particle.rotation, particle.rotation + 360 * (2 + Math.random() * 3)],
    });

    const scale = animation.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, particle.scale, particle.scale, 0],
    });

    const opacity = animation.interpolate({
      inputRange: [0, 0.1, 0.9, 1],
      outputRange: [0, 1, 1, 0],
    });

  const renderShape = () => {
    const size = 10;
    const style = {
      width: size,
      height: size,
      backgroundColor: particle.color,
      borderRadius: particle.shape === 'circle' ? size / 2 : 2,
      transform: [{ rotate: `${particle.rotation}deg` }],
      shadowColor: particle.color,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.6,
      shadowRadius: 2,
      elevation: 2,
    };

    if (particle.shape === 'triangle') {
      return (
        <View
          style={[
            style,
            {
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: size / 2,
              borderRightWidth: size / 2,
              borderBottomWidth: size,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: particle.color,
              borderRadius: 0,
            },
          ]}
        />
      );
    }

    if (particle.shape === 'square') {
      return (
        <View
          style={[
            style,
            {
              borderRadius: 2,
            },
          ]}
        />
      );
    }

    return <View style={style} />;
  };

    return (
      <Animated.View
        key={particle.id}
        style={{
          position: 'absolute',
          transform: [
            { translateX },
            { translateY },
            { rotate },
            { scale },
          ],
          opacity,
        }}
      >
        {renderShape()}
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      {particles.current.map((particle, index) => renderParticle(particle, index))}
    </View>
  );
};
