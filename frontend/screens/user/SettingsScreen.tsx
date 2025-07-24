// Add new imports
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Button,
  Switch,
  Divider,
  List,
  Card,
  RadioButton,
} from 'react-native-paper';
// Removed TabView import
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../theme';

type Route = { key: string; title: string };
type ThemeContextType = {
  theme: { colors: { primary: string; accent: string; text: string; background: string; tabInactive: string } };
  toggleTheme: () => void;
  isDark: boolean;
};

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
  const [language, setLanguage] = useState('en');
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const NotificationSettings = useCallback(() => (
    <ScrollView style={styles.sceneContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notification Settings</Text>
      <Divider style={styles.divider} />

      <SectionWrapper>
        <List.Item
          title="Auto-Accept Rescues"
          left={() => <Ionicons name="notifications-outline" size={24} color="#8B4513" />}
          right={() => (
            <Switch
              value={autoAcceptRescues}
              onValueChange={setAutoAcceptRescues}
              thumbColor={autoAcceptRescues ? '#8B4513' : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: '#8B451380' }}
            />
          )}
        />
        <List.Item
          title="Emergency Mode"
          left={() => <Ionicons name="alert-circle-outline" size={24} color="#FF4444" />}
          right={() => (
            <Switch
              value={emergencyMode}
              onValueChange={setEmergencyMode}
              thumbColor={emergencyMode ? '#FF4444' : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: '#FF444480' }}
            />
          )}
        />
        <List.Item
          title="Email Notifications"
          left={() => <Ionicons name="mail-outline" size={24} color="#2563EB" />}
          right={() => (
            <Switch
              value={emailNotif}
              onValueChange={setEmailNotif}
              thumbColor={emailNotif ? '#2563EB' : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: '#2563EB80' }}
            />
          )}
        />
        <List.Item
          title="SMS Notifications"
          left={() => <Ionicons name="chatbubble-ellipses-outline" size={24} color="#0F766E" />}
          right={() => (
            <Switch
              value={smsNotif}
              onValueChange={setSmsNotif}
              thumbColor={smsNotif ? '#0F766E' : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: '#0F766E80' }}
            />
          )}
        />
      </SectionWrapper>
    </ScrollView>
  ), [autoAcceptRescues, emergencyMode, emailNotif, smsNotif]);

  const PersonalSettings = useCallback(() => (
    <ScrollView style={styles.sceneContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Personal Info</Text>
      <Divider style={styles.divider} />
      <SectionWrapper>
        <List.Item title="Email" description="john.doe@email.com" left={() => <Ionicons name="mail" size={22} color={theme.colors.primary} />} />
        <List.Item title="Phone" description="+91-9876543210" left={() => <Ionicons name="call" size={22} color={theme.colors.primary} />} />
        <List.Item title="Language" left={() => <Ionicons name="language-outline" size={22} color={theme.colors.primary} />} />
        <RadioButton.Group onValueChange={setLanguage} value={language}>
          <RadioButton.Item label="English" value="en" />
          <RadioButton.Item label="Hindi" value="hi" />
          <RadioButton.Item label="Spanish" value="es" />
        </RadioButton.Group>
      </SectionWrapper>
    </ScrollView>
  ), [language]);

  const AccessibilitySettings = useCallback(() => (
    <ScrollView style={styles.sceneContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Accessibility</Text>
      <Divider style={styles.divider} />
      <SectionWrapper>
        <List.Item
          title="Theme Mode"
          description={isDark ? 'Dark Mode' : 'Light Mode'}
          left={() => <Ionicons name={isDark ? 'moon' : 'sunny'} size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              thumbColor={isDark ? theme.colors.primary : theme.colors.accent}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '80' }}
            />
          )}
        />
        <List.Item
          title="Data Saver Mode"
          left={() => <Ionicons name="cloud-outline" size={22} color="#059669" />}
          right={() => (
            <Switch
              value={dataSaver}
              onValueChange={setDataSaver}
              thumbColor={dataSaver ? '#059669' : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: '#05966980' }}
            />
          )}
        />
      </SectionWrapper>
    </ScrollView>
  ), [isDark, dataSaver]);

  const PrivacySettings = useCallback(() => (
    <ScrollView style={styles.sceneContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Privacy & Security</Text>
      <Divider style={styles.divider} />
      <SectionWrapper>
        <List.Item
          title="Privacy Mode"
          description={isPrivate ? 'Enabled' : 'Disabled'}
          left={() => <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />}
          right={() => (
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              thumbColor={isPrivate ? theme.colors.primary : '#D1D5DB'}
              trackColor={{ false: '#E5E7EB', true: theme.colors.primary + '80' }}
            />
          )}
        />
      </SectionWrapper>
    </ScrollView>
  ), [isPrivate]);

  // Section definitions (must be after all component definitions)
  const sections = [
    { key: 'notifications', title: 'Notifications', content: NotificationSettings },
    { key: 'personal', title: 'Personal', content: PersonalSettings },
    { key: 'accessibility', title: 'Accessibility', content: AccessibilitySettings },
    { key: 'privacy', title: 'Privacy', content: PrivacySettings },
  ];

  const SectionWrapper = ({ children }: { children: React.ReactNode }) => (
    <Card style={styles.card}>
      <Card.Content>{children}</Card.Content>
    </Card>
  );

  const handleLogout = useCallback(() => {
    navigation.navigate('SignIn');
  }, [navigation]);

  return (
    <ErrorBoundary>
      <ScrollView style={[styles.container, { paddingTop: 1 }]}> 
        {sections.map(({ key, title, content: Content }) => (
          <Card key={key} style={styles.card}>
            <List.Accordion
              title={title}
              expanded={expanded === key}
              onPress={() => setExpanded(expanded === key ? null : key)}
              left={props => <Ionicons name={
                key === 'notifications' ? 'notifications-outline' :
                key === 'personal' ? 'person-outline' :
                key === 'accessibility' ? 'eye-outline' :
                'lock-closed-outline'
              } size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />}
            >
              <Content />
            </List.Accordion>
          </Card>
        ))}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          labelStyle={styles.logoutButtonText}
          contentStyle={styles.logoutButtonContent}
        >
          Log Out
        </Button>
      </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 32,
  },
  sceneContainer: {
    paddingHorizontal: 15,
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255,0,0,0.1)', // Temporary to inspect padding areas
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  divider: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginBottom: 12,
  },
  tabBar: {
    backgroundColor: '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  card: {
    marginVertical: 12,
    borderRadius: 12,
    elevation: 2,
    // backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 12,
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
    paddingVertical: 10,
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
