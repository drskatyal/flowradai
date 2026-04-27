import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = { isActive: boolean; barCount?: number; color?: string };

export function WaveformBars({ isActive, barCount = 24, color = colors.primaryLight }: Props) {
  const anims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.25)),
  ).current;

  useEffect(() => {
    if (!isActive) {
      anims.forEach((a) => Animated.timing(a, { toValue: 0.25, duration: 300, useNativeDriver: false }).start());
      return;
    }
    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 40),
          Animated.timing(a, {
            toValue: 0.25 + Math.random() * 0.75,
            duration: 250 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(a, {
            toValue: 0.2 + Math.random() * 0.3,
            duration: 200 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isActive]);

  return (
    <View style={styles.container}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: a.interpolate({ inputRange: [0, 1], outputRange: [4, 44] }),
              opacity: isActive ? 1 : 0.25,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 48,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
