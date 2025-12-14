import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

interface SliderProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

const HANDLE_SIZE = 28;
const PRIMARY_COLOR = '#1e88e5';
const TRACK_BACKGROUND = '#d6d9df';

export default function Slider({
  label,
  value,
  minValue,
  maxValue,
  step = 1,
  unit = '',
  onValueChange,
}: SliderProps) {
  const clampToRange = useCallback(
    (val: number) => {
      if (maxValue <= minValue) {
        return minValue;
      }
      const clamped = Math.max(minValue, Math.min(maxValue, val));
      const safeStep = step > 0 ? step : (maxValue - minValue) / 100;
      const steps = Math.round((clamped - minValue) / safeStep);
      return Math.max(minValue, Math.min(maxValue, minValue + steps * safeStep));
    },
    [minValue, maxValue, step],
  );

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);

  const clampedValue = useMemo(() => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return minValue;
    }
    return clampToRange(value);
  }, [value, clampToRange, minValue]);

  const [internalValue, setInternalValue] = useState(clampedValue);
  const internalValueRef = useRef(clampedValue);

  const [handlePosition, setHandlePosition] = useState(0);
  const handlePositionRef = useRef(0);

  const panStartRef = useRef(0);
  const isDraggingRef = useRef(false);

  const range = maxValue - minValue;

  const valueToPosition = useCallback(
    (val: number) => {
      if (trackWidthRef.current <= 0 || range === 0) {
        return 0;
      }
      const ratio = (val - minValue) / range;
      return Math.max(0, Math.min(trackWidthRef.current, ratio * trackWidthRef.current));
    },
    [minValue, range],
  );

  const positionToValue = useCallback(
    (position: number) => {
      if (trackWidthRef.current <= 0 || range === 0) {
        return minValue;
      }
      const boundedPosition = Math.max(0, Math.min(trackWidthRef.current, position));
      const ratio = boundedPosition / trackWidthRef.current;
      return clampToRange(minValue + ratio * range);
    },
    [clampToRange, minValue, range],
  );

  const updateFromPosition = useCallback(
    (position: number, emitChange: boolean) => {
      const nextValue = positionToValue(position);
      const nextPosition = valueToPosition(nextValue);

      handlePositionRef.current = nextPosition;
      setHandlePosition(nextPosition);

      if (nextValue !== internalValueRef.current) {
        internalValueRef.current = nextValue;
        setInternalValue(nextValue);
        if (emitChange) {
          onValueChange(nextValue);
        }
      } else if (emitChange) {
        onValueChange(nextValue);
      }
    },
    [onValueChange, positionToValue, valueToPosition],
  );

  useEffect(() => {
    internalValueRef.current = clampedValue;
    setInternalValue(clampedValue);
    const nextPosition = valueToPosition(clampedValue);
    handlePositionRef.current = nextPosition;
    setHandlePosition(nextPosition);
  }, [clampedValue, valueToPosition]);

  useEffect(() => {
    const nextPosition = valueToPosition(internalValueRef.current);
    handlePositionRef.current = nextPosition;
    setHandlePosition(nextPosition);
  }, [trackWidth, valueToPosition]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderGrant: (event: GestureResponderEvent) => {
        isDraggingRef.current = true;
        const initialPosition = Math.max(
          0,
          Math.min(trackWidthRef.current, event.nativeEvent.locationX),
        );
        panStartRef.current = initialPosition;
        updateFromPosition(initialPosition, true);
        panStartRef.current = handlePositionRef.current;
      },
      onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (trackWidthRef.current <= 0) return;
        updateFromPosition(panStartRef.current + gesture.dx, true);
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        isDraggingRef.current = false;
      },
    }),
  ).current;

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== trackWidthRef.current) {
      trackWidthRef.current = width;
      setTrackWidth(width);
    }
  };

  const formatValue = useCallback(
    (val: number) => {
      if (!unit) return `${val}`;
      if (unit.startsWith(' ')) {
        return `${val}${unit}`;
      }
      return `${val} ${unit}`;
    },
    [unit],
  );

  const displayFill = handlePositionRef.current;
  const handleTranslateX = handlePositionRef.current - HANDLE_SIZE / 2;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.valueWrapper}>
        <Text style={styles.valueText}>{formatValue(internalValue)}</Text>
      </View>

      <View style={styles.trackWrapper} {...panResponder.panHandlers} onLayout={handleTrackLayout}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: displayFill,
              },
            ]}
          />
          <View
            style={[
              styles.handle,
              {
                transform: [{ translateX: handleTranslateX }],
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.rangeRow}>
        <Text style={styles.rangeLabel}>{formatValue(minValue)}</Text>
        <Text style={styles.rangeLabel}>{formatValue(maxValue)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d2d2d',
    marginBottom: 10,
  },
  valueWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  trackWrapper: {
    width: '100%',
    paddingVertical: 12,
  },
  track: {
    height: 6,
    backgroundColor: TRACK_BACKGROUND,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: PRIMARY_COLOR,
  },
  handle: {
    position: 'absolute',
    top: -(HANDLE_SIZE - 6) / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});
