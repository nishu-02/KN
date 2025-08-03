import React, { useState, useEffect } from 'react';
import { View, Animated, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, List, Chip, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsApi } from '../../api/notificationsApi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function NotificationListScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
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
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(notificationsResponse.notifications || []);
      setUnreadCount(unreadResponse.unread_count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
  };

  const markAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'report_status':
        return 'bell-alert';
      case 'volunteer_accepted':
        return 'checkmark-circle';
      case 'new_assignment':
        return 'briefcase';
      case 'message':
        return 'message';
      default:
        return 'bell';
    }
  };

  const getColor = (type) => {
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
      <View style={styles.loadingContainer} accessibilityLabel="Loading notifications">
        <ActivityIndicator size="large" />
        <Text>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.headerRow}>
            <Chip style={styles.chip} accessibilityLabel={`${unreadCount} unread notifications`}>{unreadCount} unread</Chip>
            <Button onPress={markAllAsRead} compact accessibilityLabel="Mark all notifications as read">Mark all read</Button>
          </View>
        )}
      </Animated.View>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} accessibilityLabel="Pull to refresh notifications" />}
      >
        {notifications.length === 0 ? (
          <Card style={styles.emptyCard} accessibilityLabel="No notifications">
            <Card.Content>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text>You're all caught up!</Text>
            </Card.Content>
          </Card>
        ) : (
          notifications.map((notif, index) => (
            <Animated.View
              key={notif.id}
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }],
              }}
            >
              <Card
                style={[styles.notificationCard, !notif.read && styles.unreadCard]}
                onPress={() => !notif.read && markAsRead(notif.id)}
                accessibilityRole="button"
                accessibilityLabel={`${notif.title}, ${notif.read ? 'read' : 'unread'}`}
              >
                <List.Item
                  title={notif.title}
                  description={notif.message}
                  left={(props) => <List.Icon {...props} icon={getIcon(notif.type)} color={getColor(notif.type)} />}
                  right={() => (
                    <View style={styles.rightContent}>
                      <Text style={styles.timeText}>{formatDate(notif.created_at)}</Text>
                      {!notif.read && <View style={styles.unreadDot} />}
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
        style={styles.fab}
        icon="bell"
        label="Settings"
        onPress={() => navigation.navigate('NotificationSettings')}
        accessibilityLabel="Notification settings"
      />
    </View>
  );
}

const styles = {
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
    fontSize: 24,
    marginBottom: 12,
    color: '#333',
  },
  chip: {
    backgroundColor: '#FF6B6B',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  notificationCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#6C5CE7',
    backgroundColor: '#e0e0ff',
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
};
