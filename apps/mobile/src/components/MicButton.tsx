import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';

type Props = {
  isRecording: boolean;
  onPress: () => void;
  size?: number;
};

export function MicButton({ isRecording, onPress, size = 80 }: Props) {
  const pulse1 = useRef(new Animated.Value(1)).current;
  const pulse2 = useRef(new Animated.Value(1)).current;
  const pulse3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      const anim = (val: Animated.Value, delay: number, toValue: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(val, { toValue, duration: 900, useNativeDriver: true }),
            Animated.timing(val, { toValue: 1, duration: 900, useNativeDriver: true }),
          ]),
        );
      const a1 = anim(pulse1, 0, 1.35);
      const a2 = anim(pulse2, 300, 1.55);
      const a3 = anim(pulse3, 600, 1.8);
      a1.start(); a2.start(); a3.start();
      return () => { a1.stop(); a2.stop(); a3.stop(); };
    } else {
      pulse1.setValue(1); pulse2.setValue(1); pulse3.setValue(1);
    }
  }, [isRecording]);

  const iconSize = size * 0.42;

  return (
    <View style={styles.wrapper}>
      {/* Pulse rings — only visible while recording */}
      {isRecording && (
        <>
          <Animated.View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{ scale: pulse3 }],
                opacity: pulse3.interpolate({ inputRange: [1, 1.8], outputRange: [0.15, 0] }),
                backgroundColor: colors.mic,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{ scale: pulse2 }],
                opacity: pulse2.interpolate({ inputRange: [1, 1.55], outputRange: [0.25, 0] }),
                backgroundColor: colors.mic,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{ scale: pulse1 }],
                opacity: pulse1.interpolate({ inputRange: [1, 1.35], outputRange: [0.4, 0] }),
                backgroundColor: colors.mic,
              },
            ]}
          />
        </>
      )}

      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isRecording ? colors.micDark : colors.primary,
          },
          isRecording ? shadows.glow(colors.micGlow) : shadows.glow(colors.primaryGlow),
        ]}
      >
        <Ionicons
          name={isRecording ? 'stop' : 'mic'}
          size={iconSize}
          color={colors.white}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
