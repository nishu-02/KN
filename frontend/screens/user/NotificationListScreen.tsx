import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, List, Chip, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { Animated } from 'react-native';
import { notificationsApi } from '../../api/notificationsApi';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export default function NotificationListScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchNotifications();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notificationsResponse, unreadResponse] = await Promise.all([
        notificationsApi.getNotifications(),
        notificationsApi.getUnreadCount()
      ]);
      
      setNotifications(notificationsResponse.notifications || []);
      setUnreadCount(unreadResponse.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'report_status':
        return 'bell-alert';
      case 'volunteer_accepted':
        return 'check-circle';
      case 'new_assignment':
        return 'briefcase';
      case 'message':
        return 'message';
      default:
        return 'bell';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'report_status':
        return '#FF6B6B';
      case 'volunteer_accepted':
        return '#4ECDC4';
      case 'new_assignment':
        return '#45B7D1';
      case 'message':
        return '#96CEB4';
      default:
        return '#6C5CE7';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text variant="headlineMedium" style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.headerRow}>
            <Chip icon="bell-badge" mode="flat" style={styles.unreadChip}>
              {unreadCount} unread
            </Chip>
            <Button mode="outlined" onPress={markAllAsRead} compact>
              Mark all read
            </Button>
          </View>
        )}
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>No notifications</Text>
              <Text>You're all caught up! Check back later for updates.</Text>
            </Card.Content>
          </Card>
        ) : (
          notifications.map((notification, index) => (
            <Animated.View
              key={notification.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              <Card 
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadCard
                ]}
                onPress={() => !notification.read && markAsRead(notification.id)}
              >
                <List.Item
                  title={notification.title}
                  description={notification.message}
                  left={(props) => (
                    <List.Icon 
                      {...props} 
                      icon={getNotificationIcon(notification.type)}
                      color={getNotificationColor(notification.type)}
                    />
                  )}
                  right={() => (
                    <View style={styles.rightContent}>
                      <Text variant="labelSmall" style={styles.timeText}>
                        {formatDate(notification.created_at)}
                      </Text>
                      {!notification.read && (
                        <View style={styles.unreadDot} />
                      )}
                    </View>
                  )}
                  titleNumberOfLines={2}
                  descriptionNumberOfLines={3}
                />
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <FAB
        icon="bell-ring"
        style={styles.fab}
        onPress={() => navigation.navigate('NotificationSettings')}
        label="Settings"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unreadChip: {
    backgroundColor: '#FF6B6B',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
    backgroundColor: '#f8f9ff',
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  timeText: {
    color: '#666',
    marginBottom: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C5CE7',
  },
  emptyCard: {
    marginTop: 50,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6C5CE7',
  },
});
