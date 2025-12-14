import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MotiView, MotiText, useAnimationState } from 'moti';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  from?: 'top' | 'bottom' | 'left' | 'right' | 'none';
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, from = 'none' }) => {
  const getInitialState = () => {
    switch (from) {
      case 'top': return { opacity: 0, translateY: -20 };
      case 'bottom': return { opacity: 0, translateY: 20 };
      case 'left': return { opacity: 0, translateX: -20 };
      case 'right': return { opacity: 0, translateX: 20 };
      case 'none':
      default: return { opacity: 0 };
    }
  };

  const getAnimateState = () => {
    switch (from) {
      case 'top':
      case 'bottom':
      case 'left':
      case 'right': return { opacity: 1, translateY: 0, translateX: 0 };
      case 'none':
      default: return { opacity: 1 };
    }
  };

  return (
    <MotiView
      from={getInitialState()}
      animate={getAnimateState()}
      transition={{
        type: 'timing',
        duration: 500,
        delay,
      }}
    >
      {children}
    </MotiView>
  );
};

interface ScaleInProps {
  children: React.ReactNode;
  delay?: number;
}

export const ScaleIn: React.FC<ScaleInProps> = ({ children, delay = 0 }) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'timing',
        duration: 500,
        delay,
      }}
    >
      {children}
    </MotiView>
  );
};

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  textStyle?: any;
  icon?: React.ReactNode;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonState = useAnimationState({
    from: {
      scale: 1,
      opacity: 1,
    },
    pressed: {
      scale: 0.95,
      opacity: 0.8,
    },
  });

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return 'rgba(255, 255, 255, 0.2)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.15)';
      case 'tertiary':
        return 'transparent';
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'tertiary':
        return '#4A90E2';
      default:
        return '#FFFFFF';
    }
  };

  return (
    <MotiView
      state={buttonState}
      transition={{
        type: 'timing',
        duration: 150,
      }}
      style={[styles.buttonContainer, style]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.cleanButton,
          { backgroundColor: getBackgroundColor() },
          { opacity: disabled ? 0.6 : 1 }
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <View style={styles.buttonContent}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </MotiView>
  );
};

interface GradientCardProps {
  children: React.ReactNode;
  style?: any;
  colors?: [string, string];
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  style, 
  colors = ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'] as [string, string]
}) => {
  return (
    <View style={[styles.gradientCard, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  cleanButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 50,
    width: 280,
    shadowOpacity: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    borderWidth: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  gradientCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOpacity: 0,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
});