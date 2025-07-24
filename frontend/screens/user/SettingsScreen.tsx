import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Button, Switch, Divider } from 'react-native-paper';
import { TabView, SceneMap, TabBar, TabBarProps } from 'react-native-tab-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../theme';

// Define types for better type safety
type Route = { key: string; title: string };
type ThemeContextType = {
  theme: { colors: { primary: string; accent: string; text: string; background: string; tabInactive: string } };
  toggleTheme: () => void;
  isDark: boolean;
};

// Error Boundary Component
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Something went wrong: {error}</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const { theme, toggleTheme, isDark } = useThemeContext() as ThemeContextType;
  const [autoAcceptRescues, setAutoAcceptRescues] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const routes = useMemo<Route[]>(
    () => [
      { key: 'notifications', title: 'Notifications' },
      { key: 'personal', title: 'Personal' },
      { key: 'accessibility', title: 'Accessibility' },
      { key: 'privacy', title: 'Privacy & Security' },
    ],
    []
  );

  // Notification Settings Scene
  const NotificationSettings = useCallback(
    () => (
      <View style={styles.sceneContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notification Settings</Text>
        <Divider style={styles.divider} />
        {[
          {
            icon: 'notifications-outline',
            label: 'Auto-Accept Rescues',
            value: autoAcceptRescues,
            onChange: setAutoAcceptRescues,
            thumbColor: '#8B4513',
            accessibilityLabel: 'Toggle auto-accept rescues',
          },
          {
            icon: 'alert-circle-outline',
            label: 'Emergency Mode',
            value: emergencyMode,
            onChange: setEmergencyMode,
            thumbColor: '#FF4444',
            accessibilityLabel: 'Toggle emergency mode',
          },
          {
            icon: 'eye-off-outline',
            label: 'Privacy Mode',
            value: isPrivate,
            onChange: setIsPrivate,
            thumbColor: '#8B4513',
            accessibilityLabel: 'Toggle privacy mode',
          },
        ].map(({ icon, label, value, onChange, thumbColor, accessibilityLabel }, index) => (
          <View key={index} style={styles.settingRow}>
            <Ionicons name={icon as any} size={24} color={thumbColor} style={styles.icon} />
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>{label}</Text>
            <Switch
              value={value}
              onValueChange={onChange}
              thumbColor={value ? thumbColor : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: thumbColor + '80' }}
              style={styles.switch}
              accessibilityLabel={accessibilityLabel}
            />
          </View>
        ))}
      </View>
    ),
    [autoAcceptRescues, emergencyMode, isPrivate, theme.colors.text]
  );

  // Personal Settings Scene
  const PersonalSettings = useCallback(
    () => (
      <View style={styles.sceneContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Personal Settings</Text>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <Ionicons name="mail-outline" size={24} color={theme.colors.primary} style={styles.icon} />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Email</Text>
          <Text style={[styles.settingValue, { color: theme.colors.text }]}>john.doe@email.com</Text>
        </View>
        <View style={styles.settingRow}>
          <Ionicons name="call-outline" size={24} color={theme.colors.primary} style={styles.icon} />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Phone</Text>
          <Text style={[styles.settingValue, { color: theme.colors.text }]}>+91-9876543210</Text>
        </View>
      </View>
    ),
    [theme.colors.text, theme.colors.primary]
  );

  // Accessibility Settings Scene
  const AccessibilitySettings = useCallback(
    () => (
      <View style={styles.sceneContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accessibility Settings</Text>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={24}
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            thumbColor={isDark ? theme.colors.primary : theme.colors.accent}
            trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '80' }}
            style={styles.switch}
            accessibilityLabel="Toggle theme"
          />
        </View>
      </View>
    ),
    [isDark, toggleTheme, theme.colors.primary, theme.colors.accent, theme.colors.text]
  );

  // Privacy Settings Scene
  const PrivacySettings = useCallback(
    () => (
      <View style={styles.sceneContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacy & Security</Text>
        <Divider style={styles.divider} />
        <View style={styles.settingRow}>
          <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} style={styles.icon} />
          <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Privacy Mode</Text>
          <Text style={[styles.settingValue, { color: theme.colors.text }]}>
            {isPrivate ? 'On' : 'Off'}
          </Text>
        </View>
      </View>
    ),
    [isPrivate, theme.colors.text, theme.colors.primary]
  );

  const renderScene = SceneMap({
    notifications: NotificationSettings,
    personal: PersonalSettings,
    accessibility: AccessibilitySettings,
    privacy: PrivacySettings,
  });

  const renderTabBar = useCallback(
    (props: TabBarProps<Route>) => (
      <TabBar
        {...props}
        indicatorStyle={[styles.tabIndicator, { backgroundColor: theme.colors.primary }]}
        style={styles.tabBar}
        renderLabel={({ route, focused }: { route: Route; focused: boolean }) => (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? theme.colors.primary : theme.colors.tabInactive },
            ]}
          >
            {route.title}
          </Text>
        )}
      />
    ),
    [theme.colors.primary, theme.colors.tabInactive]
  );

  const handleLogout = useCallback(() => {
    // Implement logout logic here (e.g., dispatch logout action, navigate to login)
    navigation.navigate('SignIn');
  }, [navigation]);

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <TabView
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={{ width: Dimensions.get('window').width }}
          renderTabBar={renderTabBar}
        />
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
          contentStyle={styles.logoutButtonContent}
          accessibilityLabel="Log out"
        >
          Log Out
        </Button>
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 32,
  },
  sceneWrapper: {
    flex: 1,
  },
  sceneContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  icon: {
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '400',
  },
  switch: {
    marginLeft: 8,
  },
  tabBar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabIndicator: {
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  logoutButton: {
    margin: 24,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#DC2626',
    textAlign: 'center',
    fontWeight: '500',
  },
});