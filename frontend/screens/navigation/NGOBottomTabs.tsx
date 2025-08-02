import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { Surface, useTheme, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import NGODashboardScreen from "../ngo/NGODashboardScreen";
import NGOListScreen from "../NGOListScreen";
import ReportListScreen from "../ReportListScreen";
import NotificationListScreen from "../NotificationListScreen";
import UserProfileScreen from "../user/UserProfileScreen";

export default function NGOBottomTabs() {
  const [index, setIndex] = useState(0);
  const theme = useTheme();

  const routes = [
    { key: "dashboard", icon: "grid-outline", label: "Dashboard" },
    { key: "reports", icon: "document-text-outline", label: "Reports" },
    { key: "ngos", icon: "people-outline", label: "NGOs" },
    { key: "notifications", icon: "notifications-outline", label: "Alerts" },
    { key: "profile", icon: "person-outline", label: "Profile" },
  ];

  const renderScene = () => {
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>{renderScene()}</View>
      <Surface style={[styles.bottomBar, { backgroundColor: theme.colors.surface }]} elevation={4}>
        {routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            style={styles.tabButton}
            onPress={() => setIndex(i)}
          >
            <Ionicons
              name={route.icon as any}
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
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
