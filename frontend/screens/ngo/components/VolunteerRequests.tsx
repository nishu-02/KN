import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Text as RNText,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Chip,
  Button,
  Avatar,
  Searchbar,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import debounce from 'lodash.debounce'; // For search debounce; install via npm/yarn if needed
import Toast from 'react-native-toast-message'; // For toasts; install via npm/yarn if needed
import { useThemeContext } from '../../../theme';
// import { volunteersApi } from '../../../api/volunteersApi'; // Uncomment and create if needed
import AuthService from '../../../api/authService';

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  specialization: string;
  experience: string;
  location: string;
  availability: string;
  submitted: string;
  avatar: string;
}

const VolunteerRequests: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [volunteerData, setVolunteerData] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchVolunteers();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await volunteersApi.getRequests(); // Assume returns Volunteer[]
      setVolunteerData(response);
    } catch (err: any) {
      console.error('Failed to fetch volunteers:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await volunteersApi.getRequests();
            setVolunteerData(retryResponse);
            handled = true;
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setError('Failed to load volunteer requests. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVolunteers();
  };

  const handleApprove = async (id: string) => {
    const volunteerIndex = volunteerData.findIndex(v => v.id === id);
    if (volunteerIndex === -1) return;

    // Optimistic update
    const updatedData = [...volunteerData];
    updatedData[volunteerIndex] = { ...updatedData[volunteerIndex], status: 'approved' };
    setVolunteerData(updatedData);

    try {
      await volunteersApi.updateStatus(id, 'approved');
      Toast.show({ type: 'success', text1: 'Volunteer approved successfully' });
    } catch (err) {
      // Rollback
      updatedData[volunteerIndex] = { ...updatedData[volunteerIndex], status: 'pending' };
      setVolunteerData(updatedData);
      Toast.show({ type: 'error', text1: 'Failed to approve volunteer' });
      console.error('Approve failed:', err);
    }
  };

  const handleReject = async (id: string) => {
    const volunteerIndex = volunteerData.findIndex(v => v.id === id);
    if (volunteerIndex === -1) return;

    // Optimistic update
    const updatedData = [...volunteerData];
    updatedData[volunteerIndex] = { ...updatedData[volunteerIndex], status: 'rejected' };
    setVolunteerData(updatedData);

    try {
      await volunteersApi.updateStatus(id, 'rejected');
      Toast.show({ type: 'success', text1: 'Volunteer rejected successfully' });
    } catch (err) {
      // Rollback
      updatedData[volunteerIndex] = { ...updatedData[volunteerIndex], status: 'pending' };
      setVolunteerData(updatedData);
      Toast.show({ type: 'error', text1: 'Failed to reject volunteer' });
      console.error('Reject failed:', err);
    }
  };

  // Debounced search handler
  const debouncedSetSearch = useMemo(() => debounce((query: string) => setSearchQuery(query), 300), []);

  const getStatusColor = useMemo(() => (status: Volunteer['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'approved':
        return '#10B981';
      case 'rejected':
        return '#EF4444';
      default:
        return '#64748B';
    }
  }, []);

  const getStatusText = useMemo(() => (status: Volunteer['status']) => {
    switch (status) {
      case 'pending':
        return 'PENDING';
      case 'approved':
        return 'APPROVED';
      case 'rejected':
        return 'REJECTED';
      default:
        return 'UNKNOWN';
    }
  }, []);

  const filteredVolunteers = useMemo(() => volunteerData.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || volunteer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  }), [volunteerData, searchQuery, selectedFilter]);

  const renderVolunteerCard = useMemo(() => (volunteer: Volunteer, index: number) => (
    <Animated.View
      key={volunteer.id}
      style={[
        styles.volunteerCard,
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
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.volunteerHeader}>
            <View style={styles.volunteerInfo}>
              <Avatar.Image
                size={50}
                source={{ uri: volunteer.avatar }}
                style={styles.avatar}
                accessibilityLabel={`${volunteer.name}'s avatar`}
              />
              <View style={styles.volunteerDetails}>
                <Text style={styles.volunteerName}>{volunteer.name}</Text>
                <Text style={styles.volunteerEmail}>{volunteer.email}</Text>
                <Text style={styles.volunteerPhone}>{volunteer.phone}</Text>
              </View>
            </View>
            <Chip
              mode="flat"
              style={[styles.statusChip, { backgroundColor: getStatusColor(volunteer.status) + '20' }]}
              textStyle={[styles.statusText, { color: getStatusColor(volunteer.status) }]}
            >
              {getStatusText(volunteer.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.volunteerSpecs}>
            <View style={styles.specItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.specText}>{volunteer.specialization}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="time" size={16} color="#3B82F6" />
              <Text style={styles.specText}>{volunteer.experience} experience</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="location" size={16} color="#10B981" />
              <Text style={styles.specText}>{volunteer.location}</Text>
            </View>
            <View style={styles.specItem}>
              <Ionicons name="calendar" size={16} color="#8B5CF6" />
              <Text style={styles.specText}>{volunteer.availability}</Text>
            </View>
          </View>

          <Text style={styles.submittedText}>Submitted {volunteer.submitted}</Text>

          {volunteer.status === 'pending' && (
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                style={[styles.approveButton, { backgroundColor: '#10B981' }]}
                onPress={() => handleApprove(volunteer.id)}
                accessibilityLabel={`Approve ${volunteer.name}`}
                accessibilityRole="button"
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                style={styles.rejectButton}
                textColor="#EF4444"
                onPress={() => handleReject(volunteer.id)}
                accessibilityLabel={`Reject ${volunteer.name}`}
                accessibilityRole="button"
              >
                Reject
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  ), [animatedValue, getStatusColor, getStatusText, handleApprove, handleReject]);

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
        <Text>Loading volunteer requests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
        <Button onPress={fetchVolunteers} accessibilityLabel="Retry loading requests" accessibilityRole="button">
          Retry
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
        <Text style={styles.headerTitle}>Volunteer Requests</Text>
        <Text style={styles.headerSubtitle}>Manage volunteer applications</Text>
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
          placeholder="Search volunteers..."
          onChangeText={debouncedSetSearch}
          value={searchQuery}
          style={styles.searchBar}
          accessibilityLabel="Search volunteers"
        />
        
        <View style={styles.filterContainer}>
          {['all', 'pending', 'approved', 'rejected'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
              accessibilityLabel={`Filter by ${filter}`}
              accessibilityRole="button"
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.filterTextActive,
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Volunteer Cards */}
      <View style={styles.volunteersContainer}>
        {filteredVolunteers.length === 0 ? (
          <Text style={styles.noResults}>No volunteers match your search/filter.</Text>
        ) : (
          filteredVolunteers.map((volunteer, index) => renderVolunteerCard(volunteer, index))
        )}
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
          <Text style={styles.summaryTitle}>Application Summary</Text>
          <View style={styles.summaryStats}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{volunteerData.length}</Text>
              <Text style={styles.summaryLabel}>Total</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {volunteerData.filter(v => v.status === 'pending').length}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>
                {volunteerData.filter(v => v.status === 'approved').length}
              </Text>
              <Text style={styles.summaryLabel}>Approved</Text>
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
  searchSection: {
    padding: 20,
    paddingTop: 10,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  filterChipActive: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  volunteersContainer: {
    paddingHorizontal: 20,
  },
  volunteerCard: {
    marginBottom: 16,
  },
  card: {
    elevation: 2,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  volunteerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  volunteerInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  volunteerDetails: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  volunteerEmail: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 2,
  },
  volunteerPhone: {
    fontSize: 13,
    color: '#64748B',
  },
  statusChip: {
    height: 32,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  volunteerSpecs: {
    marginBottom: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  specText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
  },
  submittedText: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    borderRadius: 8,
  },
  rejectButton: {
    flex: 1,
    borderRadius: 8,
    borderColor: '#EF4444',
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
  noResults: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    margin: 20,
  },
});

export default VolunteerRequests;
