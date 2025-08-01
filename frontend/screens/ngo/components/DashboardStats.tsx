import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  ProgressBar,
  Chip,
  Divider,
  Button,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../../../theme';

const DashboardStats: React.FC = () => {
  const { theme } = useThemeContext();
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  const statsData = {
    totalReports: 147,
    activeReports: 5,
    completedReports: 142,
    successRate: 94,
    volunteers: 23,
    avgResponseTime: '2.3 hours',
    monthlyGrowth: 12,
    totalDonations: 15420,
    thisMonth: 3200,
    // Enhanced detailed stats
    reportsByType: {
      emergency: 45,
      medical: 38,
      rescue: 32,
      rehabilitation: 20,
      adoption: 12,
    },
    reportsByPriority: {
      critical: 8,
      high: 15,
      medium: 67,
      low: 57,
    },
    volunteerStats: {
      active: 23,
      inactive: 7,
      newThisMonth: 4,
      avgExperience: '2.8 years',
    },
    financialStats: {
      totalDonations: 15420,
      thisMonth: 3200,
      lastMonth: 2800,
      avgDonation: 125,
      recurringDonors: 18,
    },
    performanceMetrics: {
      avgResponseTime: '2.3 hours',
      avgResolutionTime: '4.7 days',
      customerSatisfaction: 4.8,
      repeatReporters: 34,
    },
    locationStats: {
      centralPark: 28,
      brooklyn: 45,
      manhattan: 32,
      queens: 25,
      bronx: 17,
    },
  };

  const renderMetricCard = (title: string, value: string | number, subtitle: string, icon: string, color: string, delay: number = 0) => (
    <Animated.View
      style={[
        styles.metricCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20 + delay, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.metricHeader}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>
            <View style={styles.metricInfo}>
              <Text style={styles.metricValue}>{value}</Text>
              <Text style={styles.metricTitle}>{title}</Text>
              <Text style={styles.metricSubtitle}>{subtitle}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );

  const renderDetailedCard = (title: string, data: any, type: string, delay: number = 0) => (
    <Animated.View
      style={[
        styles.detailedCard,
        {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20 + delay, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.detailedTitle}>{title}</Text>
            <Button mode="text" compact>View Details</Button>
          </View>
          
          {type === 'reports' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Emergency Cases</Text>
                  <Text style={styles.statSubtext}>Life-threatening situations</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.emergency}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.emergency / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#EF4444' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Medical Care</Text>
                  <Text style={styles.statSubtext}>Treatment and recovery</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.medical}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.medical / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Rescue Operations</Text>
                  <Text style={styles.statSubtext}>Trapped animals</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.rescue}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.rescue / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Rehabilitation</Text>
                  <Text style={styles.statSubtext}>Long-term care</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.rehabilitation}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.rehabilitation / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Adoption Services</Text>
                  <Text style={styles.statSubtext}>Finding homes</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.adoption}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.adoption / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>
          )}

          {type === 'priority' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Critical Priority</Text>
                  <Text style={styles.statSubtext}>Immediate attention required</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.critical}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.critical / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#EF4444' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>High Priority</Text>
                  <Text style={styles.statSubtext}>Urgent but not life-threatening</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.high}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.high / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Medium Priority</Text>
                  <Text style={styles.statSubtext}>Standard response time</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.medium}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.medium / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Low Priority</Text>
                  <Text style={styles.statSubtext}>Non-urgent cases</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.low}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.low / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
            </View>
          )}

          {type === 'volunteers' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Active Volunteers</Text>
                  <Text style={styles.statSubtext}>Currently working</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.active}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.active / (data.active + data.inactive)) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Inactive Volunteers</Text>
                  <Text style={styles.statSubtext}>On break or unavailable</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.inactive}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.inactive / (data.active + data.inactive)) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#64748B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>New This Month</Text>
                  <Text style={styles.statSubtext}>Recent joiners</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.newThisMonth}</Text>
                  <Text style={styles.statPercentage}>+{Math.round((data.newThisMonth / data.active) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Avg Experience</Text>
                  <Text style={styles.statSubtext}>Team expertise level</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.avgExperience}</Text>
                  <Text style={styles.statPercentage}>Team avg</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
            </View>
          )}

          {type === 'financial' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Total Donations</Text>
                  <Text style={styles.statSubtext}>All time contributions</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>${data.totalDonations.toLocaleString()}</Text>
                  <Text style={styles.statPercentage}>100%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>This Month</Text>
                  <Text style={styles.statSubtext}>Current month donations</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>${data.thisMonth.toLocaleString()}</Text>
                  <Text style={styles.statPercentage}>+{Math.round(((data.thisMonth - data.lastMonth) / data.lastMonth) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Avg Donation</Text>
                  <Text style={styles.statSubtext}>Per donor contribution</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>${data.avgDonation}</Text>
                  <Text style={styles.statPercentage}>Per donor</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Recurring Donors</Text>
                  <Text style={styles.statSubtext}>Monthly supporters</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.recurringDonors}</Text>
                  <Text style={styles.statPercentage}>Loyal donors</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>
          )}

          {type === 'performance' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Avg Response Time</Text>
                  <Text style={styles.statSubtext}>Emergency call response</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.avgResponseTime}</Text>
                  <Text style={styles.statPercentage}>Target: 2h</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Avg Resolution Time</Text>
                  <Text style={styles.statSubtext}>Case completion time</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.avgResolutionTime}</Text>
                  <Text style={styles.statPercentage}>Target: 5d</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Satisfaction Rating</Text>
                  <Text style={styles.statSubtext}>User feedback score</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.customerSatisfaction}/5.0</Text>
                  <Text style={styles.statPercentage}>Excellent</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Repeat Reporters</Text>
                  <Text style={styles.statSubtext}>Loyal community members</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.repeatReporters}</Text>
                  <Text style={styles.statPercentage}>Trusted users</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#8B5CF6' }]} />
              </View>
            </View>
          )}

          {type === 'location' && (
            <View style={styles.detailedStats}>
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Central Park</Text>
                  <Text style={styles.statSubtext}>Most active area</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.centralPark}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.centralPark / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#10B981' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Brooklyn</Text>
                  <Text style={styles.statSubtext}>High density area</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.brooklyn}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.brooklyn / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#3B82F6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Manhattan</Text>
                  <Text style={styles.statSubtext}>Urban cases</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.manhattan}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.manhattan / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#F59E0B' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Queens</Text>
                  <Text style={styles.statSubtext}>Residential area</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.queens}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.queens / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#8B5CF6' }]} />
              </View>
              
              <View style={styles.statRow}>
                <View style={styles.statInfo}>
                  <Text style={styles.statLabel}>Bronx</Text>
                  <Text style={styles.statSubtext}>Growing area</Text>
                </View>
                <View style={styles.statValues}>
                  <Text style={styles.statValue}>{data.bronx}</Text>
                  <Text style={styles.statPercentage}>{Math.round((data.bronx / statsData.totalReports) * 100)}%</Text>
                </View>
                <View style={[styles.statIndicator, { backgroundColor: '#64748B' }]} />
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );

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
        <Text style={styles.headerTitle}>Dashboard Statistics</Text>
        <Text style={styles.headerSubtitle}>Comprehensive performance metrics and analytics</Text>
      </Animated.View>

      {/* Key Metrics Grid */}
      <View style={styles.metricsGrid}>
        {renderMetricCard(
          statsData.totalReports.toString(),
          'Total Reports',
          'All time',
          'document-text',
          '#6366F1',
          0
        )}
        {renderMetricCard(
          statsData.activeReports.toString(),
          'Active Reports',
          'Currently assigned',
          'time',
          '#F59E0B',
          100
        )}
        {renderMetricCard(
          statsData.successRate + '%',
          'Success Rate',
          'Completed successfully',
          'checkmark-circle',
          '#10B981',
          200
        )}
        {renderMetricCard(
          statsData.volunteers.toString(),
          'Volunteers',
          'Active members',
          'people',
          '#3B82F6',
          300
        )}
      </View>

      {/* Detailed Analytics */}
      <View style={styles.detailedSection}>
        <Text style={styles.sectionTitle}>Detailed Analytics</Text>
        
        <View style={styles.detailedGrid}>
          {renderDetailedCard('Reports by Type', statsData.reportsByType, 'reports', 0)}
          {renderDetailedCard('Priority Distribution', statsData.reportsByPriority, 'priority', 100)}
          {renderDetailedCard('Volunteer Overview', statsData.volunteerStats, 'volunteers', 200)}
          {renderDetailedCard('Financial Performance', statsData.financialStats, 'financial', 300)}
          {renderDetailedCard('Performance Metrics', statsData.performanceMetrics, 'performance', 400)}
          {renderDetailedCard('Location Breakdown', statsData.locationStats, 'location', 500)}
        </View>
      </View>

      {/* Progress Section */}
      <Animated.View
        style={[
          styles.progressSection,
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
        <Surface style={styles.progressCard}>
          <Text style={styles.progressTitle}>Report Completion Progress</Text>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Completed Reports</Text>
              <Text style={styles.progressValue}>{statsData.completedReports}/{statsData.totalReports}</Text>
            </View>
            <ProgressBar
              progress={statsData.completedReports / statsData.totalReports}
              color="#10B981"
              style={styles.progressBar}
            />
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Active Reports</Text>
              <Text style={styles.progressValue}>{statsData.activeReports}</Text>
            </View>
            <ProgressBar
              progress={statsData.activeReports / statsData.totalReports}
              color="#F59E0B"
              style={styles.progressBar}
            />
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 16,
  },
  metricCard: {
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
  metricHeader: {
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
  metricInfo: {
    flex: 1,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  detailedSection: {
    padding: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  detailedGrid: {
    gap: 20,
  },
  detailedCard: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailedTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  detailedStats: {
    gap: 16,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  statInfo: {
    flex: 2,
  },
  statLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statValues: {
    flex: 1,
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 12,
    color: '#64748B',
  },
  statIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  progressSection: {
    padding: 24,
    paddingTop: 16,
  },
  progressCard: {
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 20,
  },
  progressItem: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: '#334155',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1E293B',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: '#E2E8F0',
  },
});

export default DashboardStats; 