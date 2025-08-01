import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
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
import { useThemeContext } from '../../../theme';

const NGOProfile: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const ngoData = {
    id: 'ngo_001',
    name: 'Animal Rescue Network',
    email: 'rescue@animalngo.org',
    phone: '+1-555-RESCUE',
    address: '123 Animal Street, New York, NY 10001',
    description: 'Dedicated to rescuing and rehabilitating animals in need across the city. We provide emergency response, medical care, and long-term rehabilitation for injured and abandoned animals.',
    established: '2020',
    verified: true,
    totalReports: 147,
    activeReports: 5,
    volunteers: 23,
    successRate: 94,
    totalDonations: 15420,
    thisMonth: 3200,
  };

  const renderStatCard = (title: string, value: string | number, subtitle: string, icon: string, color: string, delay: number = 0) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [30 + delay, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.statHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statTitle}>{title}</Text>
              <Text style={styles.statSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <Animated.View
        style={[
          styles.headerSection,
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
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerCardContent}>
            <View style={styles.profileHeader}>
              <Avatar.Image
                size={100}
                source={{
                  uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100&fit=crop&crop=center',
                }}
                style={styles.profileAvatar}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.ngoName}>{ngoData.name}</Text>
                <Text style={styles.ngoEmail}>{ngoData.email}</Text>
                <View style={styles.verificationRow}>
                  <Chip mode="flat" style={styles.verifiedChip} textStyle={styles.verifiedText}>
                    Verified NGO
                  </Chip>
                  <Text style={styles.establishedText}>Est. {ngoData.established}</Text>
                </View>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.description}>{ngoData.description}</Text>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={18} color="#64748B" />
                <Text style={styles.contactText}>{ngoData.phone}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="location" size={18} color="#64748B" />
                <Text style={styles.contactText}>{ngoData.address}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Stats Section */}
      <Animated.View
        style={[
          styles.statsSection,
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
        <Text style={styles.sectionTitle}>Key Statistics</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            ngoData.totalReports.toString(),
            'Total Reports',
            'All time',
            'document-text',
            '#6366F1',
            0
          )}
          {renderStatCard(
            ngoData.activeReports.toString(),
            'Active Reports',
            'Currently assigned',
            'time',
            '#F59E0B',
            100
          )}
          {renderStatCard(
            ngoData.successRate + '%',
            'Success Rate',
            'Completed successfully',
            'checkmark-circle',
            '#10B981',
            200
          )}
          {renderStatCard(
            ngoData.volunteers.toString(),
            'Volunteers',
            'Active members',
            'people',
            '#3B82F6',
            300
          )}
        </View>
      </Animated.View>

      {/* Financial Section */}
      <Animated.View
        style={[
          styles.financialSection,
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
        <Card style={styles.financialCard}>
          <Card.Content style={styles.financialContent}>
            <Text style={styles.financialTitle}>Financial Overview</Text>
            
            <View style={styles.financialStats}>
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>Total Donations</Text>
                <Text style={styles.financialValue}>${ngoData.totalDonations.toLocaleString()}</Text>
                <Text style={styles.financialSubtitle}>All time</Text>
              </View>
              
              <Divider style={styles.verticalDivider} />
              
              <View style={styles.financialItem}>
                <Text style={styles.financialLabel}>This Month</Text>
                <Text style={styles.financialValue}>${ngoData.thisMonth.toLocaleString()}</Text>
                <Text style={styles.financialSubtitle}>Current month</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View
        style={[
          styles.actionsSection,
          {
            opacity: animatedValue,
            transform: [
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={32} color="#6366F1" />
            </View>
            <Text style={styles.actionTitle}>New Report</Text>
            <Text style={styles.actionSubtitle}>Create rescue report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="people" size={32} color="#10B981" />
            </View>
            <Text style={styles.actionTitle}>Manage Volunteers</Text>
            <Text style={styles.actionSubtitle}>View applications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="stats-chart" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.actionTitle}>View Analytics</Text>
            <Text style={styles.actionSubtitle}>Performance metrics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings" size={32} color="#64748B" />
            </View>
            <Text style={styles.actionTitle}>Settings</Text>
            <Text style={styles.actionSubtitle}>Organization settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerSection: {
    padding: 24,
    paddingBottom: 16,
  },
  headerCard: {
    borderRadius: 20,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  headerCardContent: {
    padding: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  profileAvatar: {
    marginRight: 20,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  ngoName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  ngoEmail: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 12,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verifiedChip: {
    backgroundColor: '#10B981',
    height: 32,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  establishedText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E2E8F0',
  },
  description: {
    fontSize: 16,
    color: '#334155',
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
    color: '#64748B',
    marginLeft: 12,
  },
  statsSection: {
    padding: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '100%',
  },
  card: {
    elevation: 3,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    padding: 20,
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
    color: '#1E293B',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  financialSection: {
    padding: 24,
    paddingTop: 8,
  },
  financialCard: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  financialContent: {
    padding: 24,
  },
  financialTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
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
    color: '#64748B',
    marginBottom: 8,
  },
  financialValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  financialSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  verticalDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 24,
  },
  actionsSection: {
    padding: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  actionsGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  actionIcon: {
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default NGOProfile; 