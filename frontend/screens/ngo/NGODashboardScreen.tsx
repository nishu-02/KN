import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  List,
  FAB,
  IconButton,
  Surface,
  Badge,
  ProgressBar,
  Searchbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeContext } from '../../theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import components
import NGOProfile from './components/NGOProfile';
import AssignedReports from './components/AssignedReports';
import DashboardStats from './components/DashboardStats';
import ReportTimeline from './components/ReportTimeline';
import VolunteerRequests from './components/VolunteerRequests';
import SideNavigation from './components/SideNavigation';

const { width, height } = Dimensions.get('window');

// Enhanced Material Design 3 theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6366F1', // Indigo
    secondary: '#8B5CF6', // Violet
    surface: '#FFFFFF',
    background: '#F8FAFC', // Slate 50
    onSurface: '#1E293B', // Slate 800
    onBackground: '#334155', // Slate 700
    surfaceVariant: '#F1F5F9', // Slate 100
    outline: '#CBD5E1', // Slate 300
    error: '#EF4444', // Red 500
    success: '#10B981', // Emerald 500
    warning: '#F59E0B', // Amber 500
    info: '#3B82F6', // Blue 500
  },
};

const NGOAdminDashboard = () => {
  const { theme: appTheme } = useThemeContext();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(2);
  const [animatedValue] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <NGOProfile />;
      case 'reports':
        return <AssignedReports />;
      case 'stats':
        return <DashboardStats />;
      case 'timeline':
        return <ReportTimeline />;
      case 'volunteers':
        return <VolunteerRequests />;
      default:
        return <NGOProfile />;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        {/* Enhanced Header with proper height */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={28} color={theme.colors.onSurface} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>NGO Dashboard</Text>
              <Text style={styles.headerSubtitle}>Animal Rescue Network</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.notificationButton}>
                <Ionicons name="notifications-outline" size={28} color={theme.colors.onSurface} />
                {notifications > 0 && (
                  <Badge style={styles.notificationBadge}>{notifications}</Badge>
                )}
              </TouchableOpacity>
              <Avatar.Image
                size={44}
                source={{
                  uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center',
                }}
                style={styles.headerAvatar}
              />
            </View>
          </View>
        </Surface>
        
        <View style={styles.main}>
          {sidebarOpen && <SideNavigation activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />}
          <Animated.View
            style={[
              styles.contentContainer,
              {
                transform: [
                  {
                    translateX: sidebarOpen ? 280 : 0,
                  },
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            {renderContent()}
          </Animated.View>
        </View>
        
        {/* Enhanced Floating Action Button */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => Alert.alert('Quick Action', 'What would you like to add?')}
        />
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,

  },
  header: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 20,
    minHeight: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  menuButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.onBackground,
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceVariant,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.error,
    fontSize: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  headerAvatar: {
    borderWidth: 2,
    borderColor: theme.colors.outline,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 8,
    width: '100%',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: theme.colors.primary,
    elevation: 6,
  },
});

export default NGOAdminDashboard;