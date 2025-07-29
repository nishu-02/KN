import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Text as RNText } from "react-native";
import { useThemeContext } from '../../theme';

export default function SplashScreen({ onFinish }: { onFinish?: () => void }) {
  const { theme } = useThemeContext();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onFinish) {
        setTimeout(onFinish, 1200);
      }
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: '#E2CEB1' }]}> 
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <RNText style={[styles.title, { color: theme.colors.tabActive }]}>Karuna</RNText>
        <RNText style={[styles.title, styles.nidhan, { color: theme.colors.tabInactive }]}>Nidhan</RNText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
    letterSpacing: 2,
    fontFamily: "serif",
    textAlign: "center",
    textShadowColor: "rgba(139, 69, 19, 0.12)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  nidhan: {
    fontSize: 44,
    fontWeight: "600",
    marginTop: -8,
    fontFamily: "cursive",
    letterSpacing: 4,
  },
}); 