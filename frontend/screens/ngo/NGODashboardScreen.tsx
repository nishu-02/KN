import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  Text as RNText,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  Button,
  Divider,
  List,
  IconButton,
  Surface,
  Badge,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // For state persistence; install if needed
import { useThemeContext } from '../../theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../core/redux/store';
import { logoutUser } from '../../core/redux/slices/authSlice';

// Lazy-loaded components
const NGOProfile = React.lazy(() => import('./components/NGOProfile'));
const AssignedReports = React.lazy(() => import('./components/AssignedReports'));
const DashboardStats = React.lazy(() => import('./components/DashboardStats'));
const ReportTimeline = React.lazy(() => import('./components/ReportTimeline'));
const VolunteerRequests = React.lazy(() => import('./components/VolunteerRequests'));
const SideNavigation = React.lazy(() => import('./components/SideNavigation'));

const screenWidth = Dimensions.get('window').width;

const NGOAdminDashboard = () => {
  const { theme } = useThemeContext();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const dimensions = Dimensions.get('window');
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(2); // Dynamic now
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabFadeAnim] = useState(new Animated.Value(0));
  const [sidebarAnim] = useState(new Animated.Value(0));

  useFocusEffect(
    useCallback(() => {
      const loadPersistedTab = async () => {
        try {
          const savedTab = await AsyncStorage.getItem('activeTab');
          if (savedTab) setActiveTab(savedTab);
        } catch (err) {
          console.error('Failed to load persisted tab:', err);
        }
      };
      loadPersistedTab();
    }, [])
  );

  useEffect(() => {
    // Fetch dynamic notifications (adjust to your API)
    const fetchNotifications = async () => {
      try {
        // const response = await notificationsApi.getCount(); // Example
        // setNotifications(response.count);
        setLoading(false);
      } catch (err) {
        setError('Failed to load notifications.');
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    // Animate tab change
    tabFadeAnim.setValue(0);
    Animated.timing(tabFadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Persist active tab
    AsyncStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    // Animate sidebar
    Animated.timing(sidebarAnim, {
      toValue: sidebarOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sidebarOpen]);

  const getHeaderInfo = useCallback(() => {
    switch (activeTab) {
      case 'profile':
        return {
          title: 'NGO Dashboard',
          subtitle: 'Animal Rescue Network',
          stats: 'Active Reports: 5'
        };
      case 'reports':
        return {
          title: 'Assigned Reports',
          subtitle: 'Manage rescue cases',
          stats: '5 Active Cases'
        };
      case 'stats':
        return {
          title: 'Dashboard Stats',
          subtitle: 'Performance metrics',
          stats: '94% Success Rate'
        };
      case 'timeline':
        return {
          title: 'Report Timeline',
          subtitle: 'Activity history',
          stats: '12 Recent Activities'
        };
      case 'volunteers':
        return {
          title: 'Volunteer Requests',
          subtitle: 'Manage applications',
          stats: '3 Pending Requests'
        };
      default:
        return {
          title: 'NGO Dashboard',
          subtitle: 'Animal Rescue Network',
          stats: 'Active Reports: 5'
        };
    }
  }, [activeTab]);

  const renderContent = useCallback(() => {
    const components = {
      profile: NGOProfile,
      reports: AssignedReports,
      stats: DashboardStats,
      timeline: ReportTimeline,
      volunteers: () => <VolunteerRequests searchQuery={searchQuery} />,
    };
    const Component = components[activeTab] || NGOProfile;
    return (
      <Suspense fallback={<ProgressBar indeterminate />}>
        <Component />
      </Suspense>
    );
  }, [activeTab, searchQuery]);

  const headerInfo = getHeaderInfo();

  if (loading) {
    return (
      <View style={styles(theme).errorContainer}>
        <ProgressBar indeterminate />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles(theme).errorContainer}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles(theme).container}>
      {/* Header Section - Dynamic based on active tab */}
      <Surface style={styles(theme).header}>
        <View style={styles(theme).headerRow}>
          {/* Sidebar Toggle Icon - Far Left */}
          <View style={{ marginRight: 12 }}>
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              style={styles(theme).iconSpacing}
              accessibilityLabel="Open sidebar"
              accessibilityRole="button"
            >
              <Ionicons name="menu" size={28} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {/* NGO Info and Page Details */}
          <View style={[styles(theme).headerTextContainer, { flex: 1 }]}> 
            <Text style={styles(theme).greeting}>{headerInfo.title}</Text>
            <View style={styles(theme).headerSubRow}>
              <Text style={styles(theme).subText}>{headerInfo.subtitle}</Text>
              <View style={styles(theme).dot} />
              <Text style={styles(theme).subText}>{headerInfo.stats}</Text>
            </View>
          </View>
          {/* Notifications Icon - Right */}
          <View style={styles(theme).headerNotifContainer}>
            <TouchableOpacity 
              style={styles(theme).iconSpacing}
              onPress={() => navigation.navigate('Notifications')} // Navigate to Notifications screen
              accessibilityLabel={`Notifications, ${notifications} unread`}
              accessibilityRole="button"
            >
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              {notifications > 0 && (
                <Badge style={styles(theme).notifBadge}>{notifications}</Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
      <View style={styles(theme).main}>
        <Animated.View
          style={{
            transform: [
              {
                translateX: sidebarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-dimensions.width * 0.8, 0],
                }),
              },
            ],
            width: dimensions.width * 0.8, // Responsive width
          }}
        >
          {sidebarOpen && <SideNavigation activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />}
        </Animated.View>
        <Animated.View
          style={[
            styles(theme).contentContainer,
            {
              opacity: tabFadeAnim,
            },
          ]}
        >
          {renderContent()}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background 
  },
  header: {
    paddingTop: 40,
    paddingBottom: theme.spacing.padding,
    paddingHorizontal: theme.spacing.padding,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    backgroundColor: theme.colors.tabBackground1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: { 
    flex: 1, 
    flexWrap: 'wrap' 
  },
  greeting: {
    fontFamily: 'cursive',
    fontSize: (theme.spacing.fontLarge ? theme.spacing.fontLarge + 6 : 36),
    color: theme.colors.text,
    fontWeight: "600",
  },
  headerSubRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 6, 
    color: 'black' 
  },
  subText: {
    fontSize: 14,
    color: 'black',
    fontWeight: "500",
    flexWrap: 'wrap',
    paddingRight: 25,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 8,
  },
  iconSpacing: { 
    marginHorizontal: 2 
  },
  headerNotifContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.critical,
    color: theme.colors.text,
    fontSize: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.card,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NGOAdminDashboard;
