import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
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
import { useThemeContext } from '../../theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

// Import components
import NGOProfile from './components/NGOProfile';
import AssignedReports from './components/AssignedReports';
import DashboardStats from './components/DashboardStats';
import ReportTimeline from './components/ReportTimeline';
import VolunteerRequests from './components/VolunteerRequests';
import SideNavigation from './components/SideNavigation';

const screenWidth = Dimensions.get('window').width;

const NGOAdminDashboard = () => {
  const { theme } = useThemeContext();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(2);
  const [animatedValue] = useState(0);
  const [fadeAnim] = useState(1);

  useEffect(() => {
    // Animation handled by components
  }, []);

  // Get header title and subtitle based on active tab
  const getHeaderInfo = () => {
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
  };

  const headerInfo = getHeaderInfo();

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
    <View style={styles(theme).container}>
      {/* Header Section - Dynamic based on active tab */}
      <Surface style={styles(theme).header}>
        <View style={styles(theme).headerRow}>
          {/* Sidebar Toggle Icon - Far Left */}
          <View style={{ marginRight: 12 }}>
            <TouchableOpacity
              onPress={() => setSidebarOpen(true)}
              style={styles(theme).iconSpacing}
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
            <TouchableOpacity style={styles(theme).iconSpacing}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              {notifications > 0 && (
                <Badge style={styles(theme).notifBadge}>{notifications}</Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Surface>
      <View style={styles(theme).main}>
        {sidebarOpen && <SideNavigation activeTab={activeTab} setActiveTab={setActiveTab} setSidebarOpen={setSidebarOpen} />}
        <View
          style={[
            styles(theme).contentContainer,
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
        </View>
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
});

export default NGOAdminDashboard;