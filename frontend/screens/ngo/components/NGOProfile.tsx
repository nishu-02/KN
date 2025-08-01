import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
  const [animatedValue] = useState(0);

  useEffect(() => {
    // Animation handled by components
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
    <View
      style={[
        styles(theme).statCard,
        {
          opacity: animatedValue,
        },
      ]}
    >
      <Card style={styles(theme).card}>
        <Card.Content style={styles(theme).cardContent}>
          <View style={styles(theme).statHeader}>
            <View style={[styles(theme).iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View style={styles(theme).statInfo}>
              <Text style={styles(theme).statValue}>{value}</Text>
              <Text style={styles(theme).statTitle}>{title}</Text>
              <Text style={styles(theme).statSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );

  return (
    <ScrollView style={styles(theme).container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
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

      {/* Stats Section */}
      <View style={styles(theme).statsSection}>
        <Text style={styles(theme).sectionTitle}>Key Statistics</Text>
        <View style={styles(theme).statsGrid}>
          {renderStatCard(
            ngoData.totalReports.toString(),
            'Total Reports',
            'All time',
            'document-text',
            theme.colors.primary,
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
            ngoData.successRate + '%',
            'Success Rate',
            'Completed successfully',
            'checkmark-circle',
            theme.colors.tertiary,
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

      {/* Financial Section */}
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

      {/* Quick Actions */}
      <View style={styles(theme).actionsSection}>
        <Text style={styles(theme).sectionTitle}>Quick Actions</Text>
        <View style={styles(theme).actionsGrid}>
          <TouchableOpacity style={styles(theme).actionCard}>
            <View style={styles(theme).actionIcon}>
              <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles(theme).actionTitle}>New Report</Text>
            <Text style={styles(theme).actionSubtitle}>Create rescue report</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles(theme).actionCard}>
            <View style={styles(theme).actionIcon}>
              <Ionicons name="people" size={32} color={theme.colors.tertiary} />
            </View>
            <Text style={styles(theme).actionTitle}>Manage Volunteers</Text>
            <Text style={styles(theme).actionSubtitle}>View applications</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles(theme).actionCard}>
            <View style={styles(theme).actionIcon}>
              <Ionicons name="stats-chart" size={32} color={theme.colors.secondary} />
            </View>
            <Text style={styles(theme).actionTitle}>View Analytics</Text>
            <Text style={styles(theme).actionSubtitle}>Performance metrics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles(theme).actionCard}>
            <View style={styles(theme).actionIcon}>
              <Ionicons name="settings" size={32} color={theme.colors.subtext} />
            </View>
            <Text style={styles(theme).actionTitle}>Settings</Text>
            <Text style={styles(theme).actionSubtitle}>Organization settings</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  statsSection: {
    margin: theme.spacing.margin,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '48%',
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
});

export default NGOProfile; 