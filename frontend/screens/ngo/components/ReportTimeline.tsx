import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  RefreshControl,
  Text as RNText,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import { formatDistanceToNow } from 'date-fns'; // For relative time; install via npm/yarn
import { useThemeContext } from '../../../theme';
import { reportsApi } from '../../../api/reportsApi';
import AuthService from '../../../api/authService';

interface TimelineItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string; // ISO string or timestamp from API
  status: string;
  location?: string;
  reporter?: string;
  volunteer?: string;
  eta?: string;
  outcome?: string;
  amount?: string;
  donor?: string;
  specialization?: string;
}

const ReportTimeline: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchTimeline();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchTimeline = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsApi.getTimeline(); // Assume returns TimelineItem[]
      // Format times to relative (e.g., "2 hours ago")
      const formattedData = response.map(item => ({
        ...item,
        time: formatDistanceToNow(new Date(item.time), { addSuffix: true }),
      }));
      setTimelineData(formattedData);
    } catch (err: any) {
      console.error('Failed to fetch timeline:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await reportsApi.getTimeline();
            const formattedData = retryResponse.map(item => ({
              ...item,
              time: formatDistanceToNow(new Date(item.time), { addSuffix: true }),
            }));
            setTimelineData(formattedData);
            handled = true;
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setError('Failed to load timeline. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimeline();
  };

  const getStatusColor = useMemo(() => (status: string) => {
    switch (status) {
      case 'active':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      default:
        return '#64748B';
    }
  }, []);

  const getStatusIcon = useMemo(() => (type: string) => {
    switch (type) {
      case 'report_assigned':
        return 'document-text';
      case 'volunteer_dispatched':
        return 'people';
      case 'report_completed':
        return 'checkmark-circle';
      case 'donation_received':
        return 'card';
      case 'volunteer_joined':
        return 'person-add';
      default:
        return 'time';
    }
  }, []);

  const renderTimelineItem = useMemo(() => (item: TimelineItem, index: number) => (
    <Animated.View
      key={item.id}
      style={[
        styles.timelineItem,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30 + (index * 20), 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.timelineRow}>
        <View style={styles.timelineDot}>
          <View style={[styles.dot, { backgroundColor: getStatusColor(item.status) }]} />
          {index < timelineData.length - 1 && (
            <View style={[styles.timelineLine, { backgroundColor: getStatusColor(item.status) }]} />
          )}
        </View>
        
        <Card style={styles.timelineCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.timelineHeader}>
              <View style={styles.timelineInfo}>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineTime}>{item.time}</Text>
              </View>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {item.status.replace('_', ' ').toUpperCase()}
              </Chip>
            </View>
            
            <Text style={styles.timelineDescription}>{item.description}</Text>
            
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#64748B" />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
            
            {item.reporter && (
              <View style={styles.detailRow}>
                <Ionicons name="person" size={16} color="#64748B" />
                <Text style={styles.detailText}>Reported by {item.reporter}</Text>
              </View>
            )}
            
            {item.volunteer && (
              <View style={styles.detailRow}>
                <Ionicons name="people" size={16} color="#64748B" />
                <Text style={styles.detailText}>{item.volunteer}</Text>
                {item.eta && <Text style={styles.etaText}>ETA: {item.eta}</Text>}
              </View>
            )}
            
            {item.outcome && (
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.detailText}>{item.outcome}</Text>
              </View>
            )}
            
            {item.amount && (
              <View style={styles.detailRow}>
                <Ionicons name="card" size={16} color="#10B981" />
                <Text style={styles.detailText}>{item.amount} from {item.donor}</Text>
              </View>
            )}
            
            {item.specialization && (
              <View style={styles.detailRow}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.detailText}>{item.specialization}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </View>
    </Animated.View>
  ), [animatedValue, timelineData.length, getStatusColor]);

  if (isOffline) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <Text>Loading timeline...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
        <Button onPress={fetchTimeline} accessibilityLabel="Retry loading timeline" accessibilityRole="button">
          Retry
        </Button>
      </View>
    );
  }

  if (timelineData.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text>No timeline events available.</Text>
        <Button onPress={fetchTimeline} accessibilityLabel="Refresh timeline" accessibilityRole="button">
          Refresh
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.headerTitle}>Report Timeline</Text>
        <Text style={styles.headerSubtitle}>Recent activities and updates</Text>
      </Animated.View>

      {/* Timeline */}
      <View style={styles.timelineContainer}>
        {timelineData.map((item, index) => renderTimelineItem(item, index))}
      </View>

      {/* Summary */}
      <Animated.View
        style={[
          styles.summarySection,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Surface style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Timeline Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{timelineData.length}</Text>
              <Text style={styles.summaryLabel}>Activities Today</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{timelineData.filter(i => i.status === 'active').length}</Text>
              <Text style={styles.summaryLabel}>Active Reports</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{timelineData.filter(i => i.status === 'completed').length}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>
        </Surface>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  timelineContainer: {
    paddingHorizontal: 20,
  },
  timelineItem: {
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineDot: {
    alignItems: 'center',
    marginRight: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  timelineLine: {
    width: 2,
    height: 60,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: '#64748B',
  },
  statusChip: {
    height: 32,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    flex: 1,
  },
  etaText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 8,
  },
  summarySection: {
    padding: 20,
    paddingTop: 10,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default ReportTimeline;
