import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MotiView, MotiText, useAnimationState } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { premiumTheme } from '../styles/premiumTheme';

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
  backgroundColor?: string;
  gradientColors?: [string, string];
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
  backgroundColor,
  gradientColors,
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
        return premiumTheme.colors.accent;
      case 'secondary':
        return premiumTheme.colors.surface;
      case 'tertiary':
        return 'transparent';
      default:
        return premiumTheme.colors.accent;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return '#FFFFFF';
      case 'secondary':
        return premiumTheme.colors.ink;
      case 'tertiary':
        return premiumTheme.colors.accent;
      default:
        return '#FFFFFF';
    }
  };

  const content = loading ? (
    <ActivityIndicator color={getTextColor()} />
  ) : (
    <View style={styles.buttonContent}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={[styles.buttonText, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </View>
  );

  const useGradient = variant === 'primary' && !backgroundColor;
  const resolvedBackground = backgroundColor ?? getBackgroundColor();

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
        style={[styles.touchable, { opacity: disabled ? 0.6 : 1 }]}
      >
        {useGradient ? (
          <LinearGradient colors={gradientColors ?? premiumTheme.gradients.cta} style={styles.primaryButton}>
            {content}
          </LinearGradient>
        ) : (
          <View style={[styles.cleanButton, { backgroundColor: resolvedBackground }]}>
            {content}
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
  colors = [premiumTheme.colors.surface, premiumTheme.colors.surfaceMuted] as [string, string]
}) => {
  return (
    <LinearGradient colors={colors} style={[styles.gradientCard, style]}>
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
  },
  touchable: {
    borderRadius: premiumTheme.radii.button,
    overflow: 'hidden',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: premiumTheme.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  cleanButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: premiumTheme.radii.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 54,
    borderWidth: 1,
    borderColor: premiumTheme.colors.border,
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
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: premiumTheme.typography.body,
  },
  gradientCard: {
    borderRadius: premiumTheme.radii.card,
    padding: 18,
    ...premiumTheme.shadows.card,
  },
});
