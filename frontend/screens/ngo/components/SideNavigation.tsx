import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Animated,
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

interface SideNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ activeTab, setActiveTab, setSidebarOpen }) => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigationItems = [
    { key: 'profile', title: 'Profile', icon: 'person', badge: null },
    { key: 'reports', title: 'Assigned Reports', icon: 'document-text', badge: '5' },
    { key: 'stats', title: 'Dashboard Stats', icon: 'stats-chart', badge: null },
    { key: 'timeline', title: 'Report Timeline', icon: 'time', badge: null },
    { key: 'volunteers', title: 'Volunteer Requests', icon: 'people', badge: '3' },
  ];

  return (
    <Animated.View
      style={[
        styles.sidebar,
        {
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-280, 0],
              }),
            },
          ],
        },
      ]}
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
          {navigationItems.map((item, index) => (
            <List.Item
              key={item.key}
              title={item.title}
              left={(props) => (
                <Ionicons 
                  name={item.icon as any} 
                  size={20} 
                  color={activeTab === item.key ? theme.colors.primary : theme.colors.onSurface} 
                />
              )}
              right={() => item.badge ? (
                <Badge style={styles.navBadge}>{item.badge}</Badge>
              ) : null}
              onPress={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
              style={[
                styles.navItem,
                activeTab === item.key && styles.activeNavItem
              ]}
              titleStyle={[
                styles.navItemText,
                activeTab === item.key && styles.activeNavItemText
              ]}
            />
          ))}
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
            onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
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
    width: 280,
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
    fontSize: 11,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    height: 1,
    marginVertical: 8,
  },
  navigationSection: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navItem: {
    borderRadius: 12,
    marginVertical: 2,
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#6366F115',
    borderRadius: 12,
  },
  navItemText: {
    color: '#1E293B',
    fontWeight: '500',
    fontSize: 14,
  },
  activeNavItemText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  navBadge: {
    backgroundColor: '#EF4444',
    color: 'white',
    fontSize: 10,
  },
  sidebarFooter: {
    padding: 16,
  },
  quickStats: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  quickStatsTitle: {
    fontWeight: '600',
    marginBottom: 4,
    color: '#1E293B',
    fontSize: 12,
  },
  quickStatsText: {
    color: '#64748B',
    fontSize: 11,
  },
  logoutButton: {
    borderColor: '#EF4444',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#EF4444',
  },
});

export default SideNavigation; 