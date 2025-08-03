import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed

import NGODashboardScreen from "../ngo/NGODashboardScreen";
import NGOListScreen from "../NGOListScreen";
import ReportListScreen from "../temp/ReportListScreen";
import NotificationListScreen from "../temp/NotificationListScreen";
import UserProfileScreen from "../user/UserProfileScreen";

export default function NGOBottomTabs() {
  const [index, setIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  const routes: { key: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { key: "dashboard", icon: "grid-outline", label: "Dashboard" },
    { key: "reports", icon: "document-text-outline", label: "Reports" },
    { key: "ngos", icon: "people-outline", label: "NGOs" },
    { key: "notifications", icon: "notifications-outline", label: "Alerts" },
    { key: "profile", icon: "person-outline", label: "Profile" },
  ];

  const renderScene = useMemo(() => {
    try {
      switch (index) {
        case 0:
          return <NGODashboardScreen />;
        case 1:
          return <ReportListScreen />;
        case 2:
          return <NGOListScreen />;
        case 3:
          return <NotificationListScreen />;
        case 4:
          return <UserProfileScreen />;
        default:
          return <NGODashboardScreen />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.error }}>Failed to load screen. Please try again.</Text>
        </View>
      );
    }
  }, [index, theme.colors.error]);

  if (isOffline) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorContainer}>
            <Text style={{ color: theme.colors.error }}>No internet connection. Please check your network.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScene}</View>
      <Surface style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]} elevation={4}>
        {routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            style={[styles.tabButton, index === i && styles.activeTab]}
            onPress={() => setIndex(i)}
            accessibilityLabel={route.label}
            accessibilityRole="tab"
          >
            <Ionicons
              name={route.icon}
              size={24}
              color={index === i ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: index === i ? theme.colors.primary : theme.colors.onSurfaceVariant }
              ]}
            >
              {route.label}
            </Text>
          </TouchableOpacity>
        ))}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  bottomBar: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: 'currentColor', // Uses primary color for active highlight
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
