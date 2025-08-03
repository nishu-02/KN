import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Text,
} from 'react-native';
import {
  Surface,
  Text as PaperText,
  Card,
  Chip,
  Button,
  Searchbar,
  Divider,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import { useThemeContext } from '../../../theme';
import { reportsApi } from '../../../api/reportsApi';
import AuthService from '../../../api/authService';

interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  location: string;
  reporter: string;
  reportedTime: string;
  assignedTo: string;
  eta: string;
  image?: string; // Optional, as not all may have images
}

const AssignedReports: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchReports();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsApi.getNgoSpecificReports();
      setReports(response); // Assuming response is an array of Report objects
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      if (err.message?.includes('401')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await reportsApi.getNgoSpecificReports();
            setReports(retryResponse);
            return;
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      setError('Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#3B82F6';
      case 'in_progress':
        return '#F59E0B';
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#64748B';
      default:
        return '#64748B';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F59E0B';
      case 'medium':
        return '#3B82F6';
      case 'low':
        return '#10B981';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'ACTIVE';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'completed':
        return 'COMPLETED';
      case 'pending':
        return 'PENDING';
      default:
        return 'UNKNOWN';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'CRITICAL';
      case 'high':
        return 'HIGH';
      case 'medium':
        return 'MEDIUM';
      case 'low':
        return 'LOW';
      default:
        return 'UNKNOWN';
    }
  };

  const handleAcceptReport = (id: string) => {
    console.log('Accepting report:', id);
    // TODO: Implement API call to accept report
  };

  const handleUpdateStatus = (id: string, status: string) => {
    console.log('Updating status:', id, status);
    // TODO: Implement API call to update status
  };

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            report.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || report.status === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchQuery, selectedFilter]);

  const renderReportCard = useMemo(() => (report: Report, index: number) => (
    <Animated.View
      key={report.id}
      style={[
        styles.reportCard,
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
      <Card style={styles.card} elevation={3}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.reportInfo}>
              <PaperText style={styles.reportTitle}>{report.title}</PaperText>
              <PaperText style={styles.reportDescription}>{report.description}</PaperText>
            </View>
            <View style={styles.statusContainer}>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: getStatusColor(report.status) + '20' }]}
                textStyle={[styles.statusText, { color: getStatusColor(report.status) }]}
                accessibilityLabel={`Status: ${getStatusText(report.status)}`}
                accessibilityRole="button"
              >
                {getStatusText(report.status)}
              </Chip>
              <Chip
                mode="flat"
                style={[styles.priorityChip, { backgroundColor: getPriorityColor(report.priority) + '20' }]}
                textStyle={[styles.priorityText, { color: getPriorityColor(report.priority) }]}
                accessibilityLabel={`Priority: ${getPriorityText(report.priority)}`}
                accessibilityRole="button"
              >
                {getPriorityText(report.priority)}
              </Chip>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.reportDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={18} color="#64748B" />
              <PaperText style={styles.detailText}>{report.location}</PaperText>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="person" size={18} color="#64748B" />
              <PaperText style={styles.detailText}>Reported by {report.reporter}</PaperText>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time" size={18} color="#64748B" />
              <PaperText style={styles.detailText}>{report.reportedTime}</PaperText>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="people" size={18} color="#64748B" />
              <PaperText style={styles.detailText}>Assigned to {report.assignedTo}</PaperText>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="timer" size={18} color="#F59E0B" />
              <PaperText style={styles.detailText}>ETA: {report.eta}</PaperText>
            </View>
          </View>

          {report.status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.acceptButton, { backgroundColor: '#10B981' }]}
                onPress={() => handleAcceptReport(report.id)}
                accessibilityLabel="Accept this report"
                accessibilityRole="button"
              >
                Accept Report
              </Button>
            </View>
          )}

          {report.status === 'active' && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.updateButton, { backgroundColor: '#3B82F6' }]}
                onPress={() => handleUpdateStatus(report.id, 'in_progress')}
                accessibilityLabel="Start progress on this report"
                accessibilityRole="button"
              >
                Start Progress
              </Button>
              <Button
                mode="outlined"
                style={styles.completeButton}
                textColor="#10B981"
                onPress={() => handleUpdateStatus(report.id, 'completed')}
                accessibilityLabel="Mark this report as complete"
                accessibilityRole="button"
              >
                Mark Complete
              </Button>
            </View>
          )}

          {report.status === 'in_progress' && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.completeButton, { backgroundColor: '#10B981' }]}
                onPress={() => handleUpdateStatus(report.id, 'completed')}
                accessibilityLabel="Mark this report as complete"
                accessibilityRole="button"
              >
                Mark Complete
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  ), [animatedValue]);

  if (isOffline) {
    return (
      <View style={styles.errorContainer}>
        <PaperText style={{ color: theme.colors.error }}>No internet connection. Please check your network.</PaperText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.errorContainer}>
        <PaperText>Loading reports...</PaperText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <PaperText style={{ color: theme.colors.error }}>{error}</PaperText>
        <Button onPress={fetchReports} accessibilityLabel="Retry loading reports" accessibilityRole="button">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
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
        <PaperText style={styles.headerTitle}>Assigned Reports</PaperText>
        <PaperText style={styles.headerSubtitle}>Manage rescue reports and assignments</PaperText>
      </Animated.View>

      {/* Search and Filter */}
      <Animated.View
        style={[
          styles.searchSection,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Searchbar
          placeholder="Search reports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          accessibilityLabel="Search for reports"
          accessibilityRole="search"
        />
        
        <View style={styles.filterContainer}>
          {['all', 'active', 'in_progress', 'completed', 'pending'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              accessibilityLabel={`Filter by ${filter}`}
              accessibilityRole="tab"
            >
              <PaperText style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')}
              </PaperText>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Reports List */}
      <View style={styles.reportsContainer}>
        {filteredReports.map((report, index) => renderReportCard(report, index))}
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
          <PaperText style={styles.summaryTitle}>Reports Summary</PaperText>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <PaperText style={styles.summaryValue}>{reports.length}</PaperText>
              <PaperText style={styles.summaryLabel}>Total</PaperText>
            </View>
            <View style={styles.summaryItem}>
              <PaperText style={styles.summaryValue}>
                {reports.filter(r => r.status === 'active').length}
              </PaperText>
              <PaperText style={styles.summaryLabel}>Active</PaperText>
            </View>
            <View style={styles.summaryItem}>
              <PaperText style={styles.summaryValue}>
                {reports.filter(r => r.status === 'completed').length}
              </PaperText>
              <PaperText style={styles.summaryLabel}>Completed</PaperText>
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
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 22,
  },
  searchSection: {
    padding: 24,
    paddingTop: 8,
  },
  searchBar: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    minWidth: 80,
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'center',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  reportsContainer: {
    paddingHorizontal: 24,
  },
  reportCard: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    marginBottom: 16,
  },
  reportInfo: {
    marginBottom: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 28,
  },
  reportDescription: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityChip: {
    height: 32,
    borderRadius: 16,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E2E8F0',
  },
  reportDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#64748B',
    marginLeft: 12,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  updateButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
  },
  completeButton: {
    flex: 1,
    borderRadius: 12,
    height: 48,
    borderColor: '#10B981',
  },
  summarySection: {
    padding: 24,
    paddingTop: 16,
  },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

export default AssignedReports;
