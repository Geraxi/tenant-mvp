import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface SwipeCardProps {
  item: any;
  isPropertyView: boolean;
  propertyOwner?: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onPress: () => void;
  isFirst: boolean;
}

export default function EnhancedSwipeCard({
  item,
  isPropertyView,
  propertyOwner,
  onSwipeLeft,
  onSwipeRight,
  onPress,
  isFirst,
}: SwipeCardProps) {
  // This component is temporarily disabled due to reanimated dependencies
  // Fallback to basic SwipeCard functionality
  return (
    <View style={styles.container}>
      <Text>Enhanced SwipeCard temporarily disabled</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});