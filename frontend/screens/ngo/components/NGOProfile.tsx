import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Animated,
  Text as RNText,
} from 'react-native';
import {
  Surface,
  Text,
  Button,
  Chip,
  Avatar,
  Divider,
  Card,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import { useThemeContext } from '../../../theme';
import { ngoApi } from '../../../api/ngoApi';
import AuthService from '../../../api/authService';

const screenWidth = Dimensions.get('window').width;

interface NGOData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  established: string;
  verified: boolean;
  totalReports: number;
  activeReports: number;
  volunteers: number;
  successRate: number;
  totalDonations: number;
  thisMonth: number;
  // Add more fields as per your API response
}

interface ChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

const NGOProfile: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));
  const [ngoData, setNgoData] = useState<NGOData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchNGOProfile();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNGOProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ngoApi.getNGOProfile(); // Assume this returns NGOData
      setNgoData(response);
    } catch (err: any) {
      console.error('Failed to fetch NGO profile:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await ngoApi.getNGOProfile();
            setNgoData(retryResponse);
            handled = true;
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setError('Failed to load NGO profile. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNGOProfile();
  };

  // Memoized chart data
  const pieChartData = useMemo<ChartData[]>(() => ngoData ? [
    {
      name: 'Completed Reports',
      population: ngoData.totalReports - ngoData.activeReports,
      color: theme.colors.tertiary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Active Reports',
      population: ngoData.activeReports,
      color: theme.colors.secondary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Pending Reports',
      population: ngoData.totalReports - (ngoData.totalReports - ngoData.activeReports) - ngoData.activeReports, // Adjust based on actual data
      color: '#F59E0B',
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ] : [], [ngoData, theme]);

  const volunteerChartData = useMemo<ChartData[]>(() => ngoData ? [
    {
      name: 'Active Volunteers',
      population: ngoData.volunteers - 5, // Example calculation; adjust
      color: theme.colors.primary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'New Volunteers',
      population: 5, // Example
      color: theme.colors.secondary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ] : [], [ngoData, theme]);

  const financialChartData = useMemo<ChartData[]>(() => ngoData ? [
    {
      name: 'Total Donations',
      population: ngoData.totalDonations,
      color: theme.colors.tertiary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
    {
      name: 'This Month',
      population: ngoData.thisMonth,
      color: theme.colors.primary,
      legendFontColor: theme.colors.text,
      legendFontSize: 12,
    },
  ] : [], [ngoData, theme]);

  const renderStatCard = useMemo(() => (title: string, value: string | number, subtitle: string, icon: keyof typeof Ionicons.glyphMap, color: string, delay: number = 0) => (
    <Animated.View
      style={{
        opacity: animatedValue,
        transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20 + delay, 0] }) }],
      }}
    >
      <Card style={styles(theme).card}>
        <Card.Content style={styles(theme).cardContent}>
          <View style={styles(theme).statHeader}>
            <View style={[styles(theme).iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles(theme).statInfo}>
              <Text style={styles(theme).statValue}>{value}</Text>
              <Text style={styles(theme).statTitle}>{title}</Text>
              <Text style={styles(theme).statSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  ), [animatedValue, theme]);

  if (isOffline) {
    return (
      <View style={styles(theme).errorContainer}>
        <Text style={{ color: theme.colors.error }}>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles(theme).errorContainer}>
        <Text>Loading NGO profile...</Text>
      </View>
    );
  }

  if (error || !ngoData) {
    return (
      <View style={styles(theme).errorContainer}>
        <Text style={{ color: theme.colors.error }}>{error || 'Failed to load profile.'}</Text>
        <Button onPress={fetchNGOProfile} accessibilityLabel="Retry loading profile" accessibilityRole="button">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles(theme).container} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Section */}
      <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <View style={styles(theme).headerSection}>
          <Card style={styles(theme).headerCard}>
            <Card.Content style={styles(theme).headerCardContent}>
              <View style={styles(theme).profileHeader}>
                <Avatar.Image
                  size={100}
                  source={{
                    uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center',
                  }}
                  style={styles(theme).profileAvatar}
                  accessibilityLabel={`${ngoData.name} avatar`}
                />
                <View style={styles(theme).profileInfo}>
                  <Text style={styles(theme).ngoName}>{ngoData.name}</Text>
                  <Text style={styles(theme).ngoEmail}>{ngoData.email}</Text>
                  <View style={styles(theme).verificationRow}>
                    <Chip mode="flat" style={styles(theme).verifiedChip} textStyle={styles(theme).verifiedText}>
                      Verified NGO
                    </Chip>
                    <Text style={styles(theme).establishedText}>Est. {ngoData.established}</Text>
                  </View>
                </View>
              </View>
              
              <Divider style={styles(theme).divider} />
              
              <Text style={styles(theme).description}>{ngoData.description}</Text>
              
              <View style={styles(theme).contactInfo}>
                <View style={styles(theme).contactRow}>
                  <Ionicons name="call" size={18} color={theme.colors.subtext} />
                  <Text style={styles(theme).contactText}>{ngoData.phone}</Text>
                </View>
                <View style={styles(theme).contactRow}>
                  <Ionicons name="location" size={18} color={theme.colors.subtext} />
                  <Text style={styles(theme).contactText}>{ngoData.address}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Animated.View>

      {/* Comprehensive Pie Charts Section */}
      <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
        <View style={styles(theme).chartsSection}>
          <Text style={styles(theme).sectionTitle}>Key Statistics Overview</Text>
          
          {/* Reports Distribution Chart */}
          <Card style={styles(theme).chartCard}>
            <Card.Content style={styles(theme).chartCardContent}>
              <Text style={styles(theme).chartTitle}>Reports Distribution</Text>
              <Text style={styles(theme).chartSubtitle}>Total: {ngoData.totalReports} reports</Text>
              <PieChart
                data={pieChartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={true}
                center={[0, 0]}
                absolute={false}
              />
            </Card.Content>
          </Card>

          {/* Volunteer Distribution Chart */}
          <Card style={styles(theme).chartCard}>
            <Card.Content style={styles(theme).chartCardContent}>
              <Text style={styles(theme).chartTitle}>Volunteer Distribution</Text>
              <Text style={styles(theme).chartSubtitle}>Total: {ngoData.volunteers} volunteers</Text>
              <PieChart
                data={volunteerChartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card.Content>
          </Card>

          {/* Financial Overview Chart */}
          <Card style={styles(theme).chartCard}>
            <Card.Content style={styles(theme).chartCardContent}>
              <Text style={styles(theme).chartTitle}>Financial Overview</Text>
              <Text style={styles(theme).chartSubtitle}>Total: ${ngoData.totalDonations.toLocaleString()}</Text>
              <PieChart
                data={financialChartData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: theme.colors.card,
                  backgroundGradientFrom: theme.colors.card,
                  backgroundGradientTo: theme.colors.card,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card.Content>
          </Card>
        </View>
      </Animated.View>

      {/* Quick Stats Cards */}
      <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }] }}>
        <View style={styles(theme).quickStatsSection}>
          <Text style={styles(theme).sectionTitle}>Quick Metrics</Text>
          <View style={styles(theme).statsGrid}>
            {renderStatCard(
              ngoData.successRate + '%',
              'Success Rate',
              'Completed successfully',
              'checkmark-circle',
              theme.colors.tertiary,
              0
            )}
            {renderStatCard(
              ngoData.activeReports.toString(),
              'Active Reports',
              'Currently assigned',
              'time',
              theme.colors.secondary,
              100
            )}
            {renderStatCard(
              ngoData.totalReports.toString(),
              'Total Reports',
              'All time',
              'document-text',
              theme.colors.primary,
              200
            )}
            {renderStatCard(
              ngoData.volunteers.toString(),
              'Volunteers',
              'Active members',
              'people',
              theme.colors.primary,
              300
            )}
          </View>
        </View>
      </Animated.View>

      {/* Financial Section */}
      <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }}>
        <View style={styles(theme).financialSection}>
          <Card style={styles(theme).financialCard}>
            <Card.Content style={styles(theme).financialContent}>
              <Text style={styles(theme).financialTitle}>Financial Overview</Text>
              
              <View style={styles(theme).financialStats}>
                <View style={styles(theme).financialItem}>
                  <Text style={styles(theme).financialLabel}>Total Donations</Text>
                  <Text style={styles(theme).financialValue}>${ngoData.totalDonations.toLocaleString()}</Text>
                  <Text style={styles(theme).financialSubtitle}>All time</Text>
                </View>
                
                <Divider style={styles(theme).verticalDivider} />
                
                <View style={styles(theme).financialItem}>
                  <Text style={styles(theme).financialLabel}>This Month</Text>
                  <Text style={styles(theme).financialValue}>${ngoData.thisMonth.toLocaleString()}</Text>
                  <Text style={styles(theme).financialSubtitle}>Current month</Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }] }}>
        <View style={styles(theme).actionsSection}>
          <Text style={styles(theme).sectionTitle}>Quick Actions</Text>
          <View style={styles(theme).actionsGrid}>
            <TouchableOpacity style={styles(theme).actionCard} accessibilityLabel="Create new report" accessibilityRole="button">
              <View style={styles(theme).actionIcon}>
                <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles(theme).actionTitle}>New Report</Text>
              <Text style={styles(theme).actionSubtitle}>Create rescue report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles(theme).actionCard} accessibilityLabel="Manage volunteers" accessibilityRole="button">
              <View style={styles(theme).actionIcon}>
                <Ionicons name="people" size={32} color={theme.colors.tertiary} />
              </View>
              <Text style={styles(theme).actionTitle}>Manage Volunteers</Text>
              <Text style={styles(theme).actionSubtitle}>View applications</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles(theme).actionCard} accessibilityLabel="View analytics" accessibilityRole="button">
              <View style={styles(theme).actionIcon}>
                <Ionicons name="stats-chart" size={32} color={theme.colors.secondary} />
              </View>
              <Text style={styles(theme).actionTitle}>View Analytics</Text>
              <Text style={styles(theme).actionSubtitle}>Performance metrics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles(theme).actionCard} accessibilityLabel="Organization settings" accessibilityRole="button">
              <View style={styles(theme).actionIcon}>
                <Ionicons name="settings" size={32} color={theme.colors.subtext} />
              </View>
              <Text style={styles(theme).actionTitle}>Settings</Text>
              <Text style={styles(theme).actionSubtitle}>Organization settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    margin: theme.spacing.margin,
  },
  headerCard: {
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  headerCardContent: {
    padding: theme.spacing.padding,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 20,
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ngoName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  ngoEmail: {
    fontSize: 16,
    color: theme.colors.subtext,
    marginBottom: 12,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedChip: {
    backgroundColor: theme.colors.tertiary,
    height: 32,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  establishedText: {
    fontSize: 14,
    color: theme.colors.subtext,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: theme.colors.accent,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  contactInfo: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 15,
    color: theme.colors.subtext,
    marginLeft: 12,
  },
  chartsSection: {
    margin: theme.spacing.margin,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  chartCard: {
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 16,
  },
  chartCardContent: {
    padding: theme.spacing.padding,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 16,
    textAlign: 'center',
  },
  quickStatsSection: {
    margin: theme.spacing.margin,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '100%',
    marginBottom: 8,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  cardContent: {
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  financialSection: {
    margin: theme.spacing.margin,
  },
  financialCard: {
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  financialContent: {
    padding: theme.spacing.padding,
  },
  financialTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  financialStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  financialItem: {
    flex: 1,
    alignItems: 'center',
  },
  financialLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginBottom: 8,
  },
  financialValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  financialSubtitle: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  verticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.accent,
    marginHorizontal: 24,
  },
  actionsSection: {
    margin: theme.spacing.margin,
    marginBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default NGOProfile;
