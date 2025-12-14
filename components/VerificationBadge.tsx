import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VerificationStatus } from '../types';

interface VerificationBadgeProps {
  status: VerificationStatus;
  idVerified?: boolean;
  backgroundCheck?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function VerificationBadge({ 
  status, 
  idVerified, 
  backgroundCheck,
  size = 'medium' 
}: VerificationBadgeProps) {
  const iconSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  const fontSize = size === 'small' ? 10 : size === 'medium' ? 12 : 14;

  if (status !== 'verified') return null;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, styles[`badge_${size}`]]}>
        <MaterialIcons name="verified" size={iconSize} color="#2196F3" />
        <Text style={[styles.text, { fontSize }]}>Verified</Text>
      </View>
      {idVerified && (
        <View style={[styles.badge, styles[`badge_${size}`], styles.subBadge]}>
          <MaterialIcons name="badge" size={iconSize - 2} color="#2196F3" />
        </View>
      )}
      {backgroundCheck && (
        <View style={[styles.badge, styles[`badge_${size}`], styles.subBadge]}>
          <MaterialIcons name="security" size={iconSize - 2} color="#FF9800" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  badge_small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badge_medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badge_large: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  subBadge: {
    paddingHorizontal: 6,
  },
  text: {
    color: '#2196F3',
    fontWeight: '600',
  },
});