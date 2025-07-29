import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Card,
  Switch,
  List,
  Button,
  Divider,
  IconButton,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from "../../theme";

export default function SettingsScreen() {
  const { theme, toggleTheme, isDark } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const NotificationSettings = () => (
    <Card style={[styles(theme).sectionCard, theme.cardShadow, { backgroundColor: theme.colors.card }]} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={[styles(theme).sectionTitle, { color: theme.colors.primary }]}>
          Notifications
        </Text>
        <List.Item
          title="Push Notifications"
          description="Receive alerts for nearby rescue cases"
          left={() => <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Sound Alerts"
          description="Play sound for notifications"
          left={() => <Ionicons name="volume-high-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Vibration"
          description="Vibrate on notifications"
          left={() => <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              color={theme.colors.primary}
            />
          )}
        />
      </Card.Content>
    </Card>
  );

  const PersonalSettings = () => (
    <Card style={[styles(theme).sectionCard, theme.cardShadow, { backgroundColor: theme.colors.card }]} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={[styles(theme).sectionTitle, { color: theme.colors.primary }]}>
          Personal
        </Text>
        <List.Item
          title="Edit Profile"
          description="Update your personal information"
          left={() => <Ionicons name="person-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
        <List.Item
          title="Change Password"
          description="Update your account password"
          left={() => <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
        <List.Item
          title="Privacy Settings"
          description="Manage your privacy preferences"
          left={() => <Ionicons name="shield-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
      </Card.Content>
    </Card>
  );

  const AccessibilitySettings = () => (
    <Card style={[styles(theme).sectionCard, theme.cardShadow, { backgroundColor: theme.colors.card }]} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={[styles(theme).sectionTitle, { color: theme.colors.primary }]}>
          Accessibility
        </Text>
        <List.Item
          title="Theme Mode"
          description={isDark ? "Dark Mode" : "Light Mode"}
          left={() => <Ionicons name="color-palette-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Location Services"
          description="Allow access to your location"
          left={() => <Ionicons name="location-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={locationEnabled}
              onValueChange={setLocationEnabled}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Large Text"
          description="Increase text size for better readability"
          left={() => <Ionicons name="text-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
      </Card.Content>
    </Card>
  );

  const PrivacySecuritySettings = () => (
    <Card style={[styles(theme).sectionCard, theme.cardShadow, { backgroundColor: theme.colors.card }]} mode="elevated">
      <Card.Content>
        <Text variant="titleMedium" style={[styles(theme).sectionTitle, { color: theme.colors.primary }]}>
          Privacy & Security
        </Text>
        <List.Item
          title="Data Usage"
          description="Manage how your data is used"
          left={() => <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
        <List.Item
          title="App Permissions"
          description="Manage app permissions"
          left={() => <Ionicons name="settings-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
        <List.Item
          title="Two-Factor Authentication"
          description="Add extra security to your account"
          left={() => <Ionicons name="key-outline" size={24} color={theme.colors.primary} />}
          right={() => <Ionicons name="chevron-forward" size={24} color={theme.colors.subtext} />}
        />
      </Card.Content>
    </Card>
  );



  const sections = [
    { title: "Notifications", component: NotificationSettings },
    { title: "Personal", component: PersonalSettings },
    { title: "Accessibility", component: AccessibilitySettings },
    { title: "Privacy & Security", component: PrivacySecuritySettings },
  ];

  return (
    <View style={[styles(theme).container, { backgroundColor: theme.colors.background }]}>
      {/* Settings Content */}
      <ScrollView style={styles(theme).content} showsVerticalScrollIndicator={false}>
        {sections.map((section, index) => (
          <View key={index}>
            {section.component()}
            {index < sections.length - 1 && <View style={styles(theme).sectionSpacing} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: theme.spacing.margin * 2,
  },
  header: {
    paddingHorizontal: theme.spacing.padding,
    paddingTop: 40,
    paddingBottom: theme.spacing.padding,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    elevation: 8,
    zIndex: 10,
    backgroundColor: theme.colors.tabBackground1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  karunaTitle: {
    fontWeight: "bold",
    fontSize: 28,
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    padding: theme.spacing.padding,
  },
  sectionCard: {
    borderRadius: theme.spacing.radius,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: "bold",
  },
  sectionSpacing: {
    height: 16,
  },
});
