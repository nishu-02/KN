import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  TouchableOpacity,
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
import { useThemeContext } from '../../../theme';

const VolunteerRequests: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const volunteerData = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1-555-0123',
      status: 'pending',
      specialization: 'Large Animal Rescue',
      experience: '3 years',
      location: 'Brooklyn, NY',
      availability: 'Weekends',
      submitted: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=center',
    },
    {
      id: '2',
      name: 'Mike Wilson',
      email: 'mike.w@email.com',
      phone: '+1-555-0124',
      status: 'approved',
      specialization: 'Emergency Response',
      experience: '5 years',
      location: 'Manhattan, NY',
      availability: 'Full-time',
      submitted: '1 week ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center',
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'emily.d@email.com',
      phone: '+1-555-0125',
      status: 'rejected',
      specialization: 'Small Animal Care',
      experience: '1 year',
      location: 'Queens, NY',
      availability: 'Evenings',
      submitted: '3 days ago',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=center',
    },
    {
      id: '4',
      name: 'David Brown',
      email: 'david.b@email.com',
      phone: '+1-555-0126',
      status: 'pending',
      specialization: 'Wildlife Rescue',
      experience: '7 years',
      location: 'Bronx, NY',
      availability: 'Flexible',
      submitted: '1 day ago',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=center',
    },
  ];

  const getStatusColor = (status: string) => {
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
  };

  const getStatusText = (status: string) => {
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
  };

  const handleApprove = (id: string) => {
    // Handle approval logic
    console.log('Approved volunteer:', id);
  };

  const handleReject = (id: string) => {
    // Handle rejection logic
    console.log('Rejected volunteer:', id);
  };

  const renderVolunteerCard = (volunteer: any, index: number) => (
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
              >
                Approve
              </Button>
              <Button
                mode="outlined"
                style={styles.rejectButton}
                textColor="#EF4444"
                onPress={() => handleReject(volunteer.id)}
              >
                Reject
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const filteredVolunteers = volunteerData.filter(volunteer => {
    const matchesSearch = volunteer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         volunteer.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || volunteer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
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
        {filteredVolunteers.map((volunteer, index) => renderVolunteerCard(volunteer, index))}
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
});

export default VolunteerRequests; 