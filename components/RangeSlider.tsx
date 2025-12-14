import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Pressable,
} from 'react-native';

interface RangeSliderProps {
  label: string;
  minValue: number;
  maxValue: number;
  currentMin: number;
  currentMax: number;
  step?: number;
  unit?: string;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

const RANGE_HANDLE_SIZE = 32;
const PRIMARY_COLOR = '#1e88e5';

export default function RangeSlider({
  label,
  minValue,
  maxValue,
  currentMin,
  currentMax,
  step = 1,
  unit = '',
  onMinChange,
  onMaxChange,
}: RangeSliderProps) {
  const roundToStep = (val: number) => {
    if (maxValue <= minValue) {
      return minValue;
    }
    const clamped = Math.max(minValue, Math.min(maxValue, val));
    const steps = Math.round((clamped - minValue) / step);
    const stepped = minValue + steps * step;
    return Math.max(minValue, Math.min(maxValue, stepped));
  };

  const [trackWidth, setTrackWidth] = useState(0);
  const trackWidthRef = useRef(0);

  const [minSelected, setMinSelected] = useState(() => roundToStep(currentMin));
  const minSelectedRef = useRef(minSelected);

  const [maxSelected, setMaxSelected] = useState(() => roundToStep(currentMax));
  const maxSelectedRef = useRef(maxSelected);

  const [minHandlePosition, setMinHandlePosition] = useState(0);
  const minHandlePositionRef = useRef(0);

  const [maxHandlePosition, setMaxHandlePosition] = useState(0);
  const maxHandlePositionRef = useRef(0);

  const isMinDragging = useRef(false);
  const isMaxDragging = useRef(false);
  const minPanStart = useRef(0);
  const maxPanStart = useRef(0);

  const range = maxValue - minValue;

  const valueToPosition = (val: number, width = trackWidthRef.current) => {
    if (width <= 0 || range === 0) {
      return 0;
    }
    const ratio = (val - minValue) / range;
    const boundedRatio = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
    return boundedRatio * width;
  };

  const syncMinHandle = (val: number, width = trackWidthRef.current) => {
    const position = valueToPosition(val, width);
    minHandlePositionRef.current = position;
    setMinHandlePosition(position);
  };

  const syncMaxHandle = (val: number, width = trackWidthRef.current) => {
    const position = valueToPosition(val, width);
    maxHandlePositionRef.current = position;
    setMaxHandlePosition(position);
  };

  const setMinValue = (val: number, emitChange: boolean) => {
    let finalValue = roundToStep(val);
    finalValue = Math.min(finalValue, maxSelectedRef.current);
    finalValue = Math.max(minValue, finalValue);

    if (finalValue !== minSelectedRef.current) {
      minSelectedRef.current = finalValue;
      setMinSelected(finalValue);
      if (emitChange) {
        onMinChange(finalValue);
      }
    } else if (emitChange) {
      onMinChange(finalValue);
    }

    syncMinHandle(finalValue);
  };

  const setMaxValue = (val: number, emitChange: boolean) => {
    let finalValue = roundToStep(val);
    finalValue = Math.max(finalValue, minSelectedRef.current);
    finalValue = Math.min(maxValue, finalValue);

    if (finalValue !== maxSelectedRef.current) {
      maxSelectedRef.current = finalValue;
      setMaxSelected(finalValue);
      if (emitChange) {
        onMaxChange(finalValue);
      }
    } else if (emitChange) {
      onMaxChange(finalValue);
    }

    syncMaxHandle(finalValue);
  };

  useEffect(() => {
    minSelectedRef.current = minSelected;
  }, [minSelected]);

  useEffect(() => {
    maxSelectedRef.current = maxSelected;
  }, [maxSelected]);

  useEffect(() => {
    setMinValue(currentMin, false);
    setMaxValue(currentMax, false);
  }, [currentMin, currentMax]);

  useEffect(() => {
    syncMinHandle(minSelectedRef.current);
    syncMaxHandle(maxSelectedRef.current);
  }, [trackWidth]);

  const positionToValue = (position: number) => {
    const width = trackWidthRef.current;
    if (width <= 0 || range === 0) {
      return minValue;
    }
    const boundedPosition = Math.max(0, Math.min(width, position));
    const ratio = boundedPosition / width;
    const rawValue = minValue + ratio * range;
    return roundToStep(rawValue);
  };

  const updateMinFromPositionRef = useRef<(position: number, emit: boolean) => void>(() => {});
  const updateMaxFromPositionRef = useRef<(position: number, emit: boolean) => void>(() => {});

  const updateMinFromPosition = (position: number, emitChange: boolean) => {
    const nextValue = positionToValue(position);
    setMinValue(nextValue, emitChange);
  };

  const updateMaxFromPosition = (position: number, emitChange: boolean) => {
    const nextValue = positionToValue(position);
    setMaxValue(nextValue, emitChange);
  };

  updateMinFromPositionRef.current = updateMinFromPosition;
  updateMaxFromPositionRef.current = updateMaxFromPosition;

  const minPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (_event: GestureResponderEvent) => {
        isMinDragging.current = true;
        minPanStart.current = minHandlePositionRef.current;
      },
      onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (trackWidthRef.current <= 0) return;
        updateMinFromPositionRef.current(minPanStart.current + gesture.dx, true);
      },
      onPanResponderRelease: () => {
        isMinDragging.current = false;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        isMinDragging.current = false;
      },
    }),
  ).current;

  const maxPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_evt, gesture) =>
        Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onPanResponderGrant: (_event: GestureResponderEvent) => {
        isMaxDragging.current = true;
        maxPanStart.current = maxHandlePositionRef.current;
      },
      onPanResponderMove: (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
        if (trackWidthRef.current <= 0) return;
        updateMaxFromPositionRef.current(maxPanStart.current + gesture.dx, true);
      },
      onPanResponderRelease: () => {
        isMaxDragging.current = false;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        isMaxDragging.current = false;
      },
    }),
  ).current;

  const handleTrackLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width !== trackWidthRef.current) {
      trackWidthRef.current = width;
      setTrackWidth(width);
      syncMinHandle(minSelectedRef.current, width);
      syncMaxHandle(maxSelectedRef.current, width);
    }
  };

  const handleTrackPress = (event: GestureResponderEvent) => {
    if (trackWidthRef.current <= 0) return;
    const locationX = Math.max(0, Math.min(trackWidthRef.current, event.nativeEvent.locationX));
    const distanceToMin = Math.abs(locationX - minHandlePositionRef.current);
    const distanceToMax = Math.abs(locationX - maxHandlePositionRef.current);

    if (distanceToMin <= distanceToMax) {
      updateMinFromPositionRef.current(locationX, true);
    } else {
      updateMaxFromPositionRef.current(locationX, true);
    }
  };

  const formatValue = (val: number) => {
    if (!unit) return `${val}`;
    if (unit.startsWith(' ')) {
      return `${val}${unit}`;
    }
    return `${val} ${unit}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.card}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryValue}>
            {formatValue(minSelected)} - {formatValue(maxSelected)}
          </Text>
        </View>

        <Pressable onPressIn={handleTrackPress} style={styles.trackTapArea}>
          <View style={styles.track} onLayout={handleTrackLayout}>
            <View
              style={[
                styles.rangeFill,
                {
                  left: Math.min(minHandlePosition, maxHandlePosition),
                  width: Math.max(
                    0,
                    Math.min(
                      trackWidthRef.current,
                      Math.abs(maxHandlePosition - minHandlePosition),
                    ),
                  ),
                },
              ]}
            />
            <View
              style={[
                styles.handleWrapper,
                { transform: [{ translateX: minHandlePositionRef.current - RANGE_HANDLE_SIZE / 2 }] },
              ]}
              {...minPanResponder.panHandlers}
            >
              <View style={styles.handleShadow}>
                <View style={styles.handle} />
              </View>
            </View>
            <View
              style={[
                styles.handleWrapper,
                { transform: [{ translateX: maxHandlePositionRef.current - RANGE_HANDLE_SIZE / 2 }] },
              ]}
              {...maxPanResponder.panHandlers}
            >
              <View style={styles.handleShadow}>
                <View style={styles.handle} />
              </View>
            </View>
          </View>
        </Pressable>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryValue: {
    fontSize: 21,
    fontWeight: '700',
    color: '#111',
  },
  trackTapArea: {
    paddingVertical: 12,
  },
  track: {
    height: 6,
    backgroundColor: '#ebebeb',
    borderRadius: 3,
    position: 'relative',
  },
  rangeFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
  handleWrapper: {
    position: 'absolute',
    top: -RANGE_HANDLE_SIZE / 2,
    width: RANGE_HANDLE_SIZE,
    height: RANGE_HANDLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleShadow: {
    width: RANGE_HANDLE_SIZE,
    height: RANGE_HANDLE_SIZE,
    borderRadius: RANGE_HANDLE_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  handle: {
    width: RANGE_HANDLE_SIZE - 10,
    height: RANGE_HANDLE_SIZE - 10,
    borderRadius: (RANGE_HANDLE_SIZE - 10) / 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
  },
});
