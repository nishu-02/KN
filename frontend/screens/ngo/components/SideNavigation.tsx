import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
  useWindowDimensions,
} from 'react-native';
import {
  Surface,
  Text,
  Avatar,
  Chip,
  List,
  Badge,
  Button,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../../theme';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../../core/redux/store'; // Proper import
import { logoutUser } from '../../../core/redux/slices/authSlice'; // Proper import
import AsyncStorage from '@react-native-async-storage/async-storage'; // For clearing data; install if needed

interface SideNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

interface NavItem {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge: string | null;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ activeTab, setActiveTab, setSidebarOpen }) => {
  const { theme } = useThemeContext();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const dimensions = useWindowDimensions();
  const sidebarWidth = Math.min(280, dimensions.width * 0.8); // Responsive width
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigationItems: NavItem[] = [
    { key: 'profile', title: 'Profile', icon: 'person', badge: null },
    { key: 'reports', title: 'Assigned Reports', icon: 'document-text', badge: '5' },
    { key: 'stats', title: 'Dashboard Stats', icon: 'stats-chart', badge: null },
    { key: 'timeline', title: 'Report Timeline', icon: 'time', badge: null },
    { key: 'volunteers', title: 'Volunteer Requests', icon: 'people', badge: '3' },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear(); // Clear local storage/cache
              dispatch(logoutUser());
              navigation.navigate('Auth'); // Navigate to auth screen
            } catch (error) {
              console.error('Logout failed:', error);
            }
          },
        },
      ]
    );
  };

  const handleNavPress = (key: string) => {
    setActiveTab(key);
    navigation.navigate(key.charAt(0).toUpperCase() + key.slice(1)); // e.g., 'profile' -> 'Profile'
    setSidebarOpen(false);
  };

  const renderNavItem = useMemo(() => (item: NavItem, index: number) => (
    <List.Item
      key={item.key}
      title={item.title}
      left={(props) => (
        <Ionicons 
          name={item.icon} 
          size={20} 
          color={activeTab === item.key ? theme.colors.primary : theme.colors.onSurface} 
        />
      )}
      right={() => item.badge ? (
        <Badge style={styles.navBadge} accessibilityLabel={`Badge: ${item.badge}`}>{item.badge}</Badge>
      ) : null}
      onPress={() => handleNavPress(item.key)}
      style={[
        styles.navItem,
        activeTab === item.key && styles.activeNavItem
      ]}
      titleStyle={[
        styles.navItemText,
        activeTab === item.key && styles.activeNavItemText
      ]}
      accessibilityLabel={item.title}
      accessibilityRole="menuitem"
    />
  ), [activeTab, theme, handleNavPress]);

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          width: sidebarWidth,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-sidebarWidth, 0],
              }),
            },
          ],
        },
      ]}
      accessibilityLabel="Sidebar navigation"
      accessibilityRole="navigation"
    >
      <Surface style={styles.sidebarContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={80}
              source={{
                uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center',
              }}
              style={styles.profileAvatar}
              accessibilityLabel="Profile avatar"
            />
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.profileName}>
            Animal Rescue Network
          </Text>
          <Text style={styles.profileEmail}>
            rescue@animalngo.org
          </Text>
          <Chip mode="flat" style={styles.verifiedChip} textStyle={styles.verifiedText}>
            Verified NGO
          </Chip>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Section style={styles.navigationSection}>
          {navigationItems.map((item, index) => renderNavItem(item, index))}
        </List.Section>
        
        <View style={styles.sidebarFooter}>
          <Surface style={styles.quickStats}>
            <Text style={styles.quickStatsTitle}>Quick Stats</Text>
            <Text style={styles.quickStatsText}>Active Reports: 5</Text>
            <Text style={styles.quickStatsText}>Pending Volunteers: 3</Text>
          </Surface>
          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            accessibilityLabel="Logout button"
            accessibilityRole="button"
          >
            Logout
          </Button>
        </View>
      </Surface>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  sidebarContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  profileSection: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  avatarContainer: {
    position: 'relative',
  },
  profileAvatar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    marginTop: 12,
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  profileEmail: {
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    fontSize: 12,
  },
  verifiedChip: {
    marginTop: 8,
    backgroundColor: '#10B98120',
    height: 32,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  navigationSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  navItem: {
    borderRadius: 12,
    marginVertical: 2,
  },
  activeNavItem: {
    backgroundColor: '#F1F5F9',
  },
  navItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  activeNavItemText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  navBadge: {
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: 12,
  },
  sidebarFooter: {
    padding: 16,
    paddingBottom: 44,
    gap: 16,
  },
  quickStats: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickStatsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  quickStatsText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  logoutButton: {
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SideNavigation;
