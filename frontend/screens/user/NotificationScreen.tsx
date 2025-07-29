import * as React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  List,
  IconButton,
  Surface,
  Badge,
  Chip,
  FAB,
  Portal,
  Modal,
  TextInput,
  Switch,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useThemeContext } from '../../theme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { notificationApi } from '../../api/karunaApi';
import * as Notifications from 'expo-notifications';

const screenWidth = Dimensions.get('window').width;

// Types
interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationScreenProps {
  navigation: any;
}

// Animated Touchable Component
const AnimatedTouchable: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
}> = ({ children, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => (scale.value = 0.95)}
      onPressOut={() => (scale.value = 1)}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

// Notification Card Component
const NotificationCard: React.FC<{
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  theme: any;
  themedStyles: any;
}> = ({ notification, onMarkAsRead, theme, themedStyles }) => {
  const [expanded, setExpanded] = React.useState(false);
  const formattedDate = new Date(notification.created_at).toLocaleString();

  const getNotificationIcon = (title: string) => {
    if (title.toLowerCase().includes('injury') || title.toLowerCase().includes('rescue')) {
      return 'medical-outline';
    } else if (title.toLowerCase().includes('volunteer')) {
      return 'people-outline';
    } else if (title.toLowerCase().includes('emergency')) {
      return 'warning-outline';
    } else if (title.toLowerCase().includes('test')) {
      return 'checkmark-circle-outline';
    }
    return 'notifications-outline';
  };

  const getNotificationColor = (title: string) => {
    if (title.toLowerCase().includes('emergency') || title.toLowerCase().includes('critical')) {
      return theme.colors.critical;
    } else if (title.toLowerCase().includes('test')) {
      return theme.colors.low;
    }
    return theme.colors.primary;
  };

  return (
    <Card
      style={[
        themedStyles.notificationCard,
        !notification.is_read && themedStyles.unreadCard,
      ]}
      elevation={2}
    >
      <Card.Content>
        <View style={themedStyles.notificationHeader}>
          <View style={themedStyles.notificationIconContainer}>
            <Ionicons
              name={getNotificationIcon(notification.title) as any}
              size={24}
              color={getNotificationColor(notification.title)}
            />
            {!notification.is_read && (
              <View style={[themedStyles.unreadDot, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
          <View style={themedStyles.notificationContent}>
            <Text style={themedStyles.notificationTitle}>{notification.title}</Text>
            <Text style={themedStyles.notificationTime}>{formattedDate}</Text>
          </View>
          <View style={themedStyles.notificationActions}>
            {!notification.is_read && (
              <IconButton
                icon="check"
                size={20}
                onPress={() => onMarkAsRead(notification.id)}
                iconColor={theme.colors.primary}
              />
            )}
            <IconButton
              icon={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              onPress={() => setExpanded(!expanded)}
              iconColor={theme.colors.subtext}
            />
          </View>
        </View>
        
        <Text
          style={themedStyles.notificationBody}
          numberOfLines={expanded ? undefined : 2}
        >
          {notification.body}
        </Text>

        {expanded && notification.data && (
          <View style={themedStyles.notificationData}>
            <Text style={themedStyles.dataTitle}>Additional Data:</Text>
            <Text style={themedStyles.dataContent}>
              {JSON.stringify(notification.data, null, 2)}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

// Announcement Modal Component
const AnnouncementModal: React.FC<{
  visible: boolean;
  onDismiss: () => void;
  onSend: (title: string, body: string, topic: string) => void;
  theme: any;
  themedStyles: any;
}> = ({ visible, onDismiss, onSend, theme, themedStyles }) => {
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [topic, setTopic] = React.useState('general');

  const handleSend = () => {
    if (title.trim() && body.trim()) {
      onSend(title.trim(), body.trim(), topic);
      setTitle('');
      setBody('');
      setTopic('general');
      onDismiss();
    } else {
      Alert.alert('Error', 'Please fill in both title and body');
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={themedStyles.modalContainer}
      >
        <Text style={themedStyles.modalTitle}>Send Announcement</Text>
        
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          style={themedStyles.modalInput}
          mode="outlined"
        />
        
        <TextInput
          label="Message"
          value={body}
          onChangeText={setBody}
          style={themedStyles.modalInput}
          mode="outlined"
          multiline
          numberOfLines={4}
        />
        
        <TextInput
          label="Topic"
          value={topic}
          onChangeText={setTopic}
          style={themedStyles.modalInput}
          mode="outlined"
        />
        
        <View style={themedStyles.modalActions}>
          <Button mode="outlined" onPress={onDismiss} style={themedStyles.modalButton}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSend} style={themedStyles.modalButton}>
            Send
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

export default function NotificationScreen({ navigation }: NotificationScreenProps) {
  const { theme } = useThemeContext();
  const themedStyles = styles(theme);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [announcementModalVisible, setAnnouncementModalVisible] = React.useState(false);
  const [pushToken, setPushToken] = React.useState<string | null>(null);
  const [isRegistered, setIsRegistered] = React.useState(false);

  // Load notifications on focus
  useFocusEffect(
    React.useCallback(() => {
      loadNotifications();
      checkPushTokenRegistration();
    }, [])
  );

  // Check and register push token
  const checkPushTokenRegistration = async () => {
    try {
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'fb1290ad-0546-493d-a247-1fd3205e7f99',
      });
      setPushToken(token.data);
      
      // Check if already registered (you might want to store this in AsyncStorage)
      // For now, we'll assume not registered
      setIsRegistered(false);
    } catch (error) {
      console.error('Error getting push token:', error);
      
      // Handle Expo Go limitations
      if (error instanceof Error && error.message.includes('Expo Go')) {
        console.warn('Push notifications not available in Expo Go. Use development build for full functionality.');
        setPushToken(null);
        setIsRegistered(false);
        return;
      }
      
      // Handle project ID errors
      if (error instanceof Error && error.message.includes('projectId')) {
        console.error('Invalid project ID configuration');
        setPushToken(null);
        setIsRegistered(false);
        return;
      }
      
      setPushToken(null);
      setIsRegistered(false);
    }
  };

  // Register device for push notifications
  const registerDevice = async () => {
    if (!pushToken) {
      Alert.alert(
        'Development Build Required', 
        'Push notifications are not supported in Expo Go. Please use a development build for full functionality.',
        [
          { text: 'OK' },
          { text: 'Learn More', onPress: () => {
            // You can add navigation to a help screen here
            console.log('Navigate to help screen');
          }}
        ]
      );
      return;
    }

    try {
      await notificationApi.registerDevice(pushToken, ['general', 'emergency', 'rescue']);
      setIsRegistered(true);
      Alert.alert('Success', 'Device registered for push notifications');
    } catch (error) {
      console.error('Error registering device:', error);
      Alert.alert('Error', 'Failed to register device for notifications');
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationApi.getNotificationHistory();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      await notificationApi.sendTestNotification();
      Alert.alert('Success', 'Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  // Send announcement
  const sendAnnouncement = async (title: string, body: string, topic: string) => {
    try {
      await notificationApi.sendAnnouncement(title, body, topic);
      Alert.alert('Success', 'Announcement sent successfully');
    } catch (error) {
      console.error('Error sending announcement:', error);
      Alert.alert('Error', 'Failed to send announcement');
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={themedStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.tabBackground1, theme.colors.tabBackground2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={themedStyles.header}
      >
        <View style={themedStyles.headerContent}>
          <View style={themedStyles.headerLeft}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => navigation.goBack()}
              iconColor={theme.colors.text}
            />
            <View>
              <Text style={themedStyles.headerTitle}>Notifications</Text>
              <Text style={themedStyles.headerSubtitle}>
                {unreadCount} unread • {notifications.length} total
              </Text>
            </View>
          </View>
          <View style={themedStyles.headerRight}>
            <AnimatedTouchable onPress={sendTestNotification}>
              <IconButton
                icon="bell-ring"
                size={24}
                iconColor={theme.colors.primary}
              />
            </AnimatedTouchable>
          </View>
        </View>
      </LinearGradient>

      {/* Push Token Registration */}
      {!isRegistered && pushToken && (
        <Surface style={themedStyles.registrationCard} elevation={2}>
          <View style={themedStyles.registrationContent}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
            <View style={themedStyles.registrationText}>
              <Text style={themedStyles.registrationTitle}>Enable Push Notifications</Text>
              <Text style={themedStyles.registrationSubtitle}>
                Get real-time updates about rescue cases and emergencies
              </Text>
            </View>
          </View>
          <Button mode="contained" onPress={registerDevice} style={themedStyles.registerButton}>
            Enable
          </Button>
        </Surface>
      )}

      {/* Expo Go Limitation Notice */}
      {!pushToken && (
        <Surface style={[themedStyles.registrationCard, themedStyles.expoGoCard]} elevation={2}>
          <View style={themedStyles.registrationContent}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.high} />
            <View style={themedStyles.registrationText}>
              <Text style={themedStyles.registrationTitle}>Development Build Required</Text>
              <Text style={themedStyles.registrationSubtitle}>
                Push notifications are not supported in Expo Go. Use a development build for full functionality.
              </Text>
            </View>
          </View>
          <Button mode="outlined" onPress={() => {}} style={themedStyles.registerButton}>
            Learn More
          </Button>
        </Surface>
      )}

      {/* Notifications List */}
      <ScrollView
        style={themedStyles.scrollView}
        contentContainerStyle={themedStyles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={themedStyles.loadingContainer}>
            <Text style={themedStyles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={themedStyles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color={theme.colors.subtext} />
            <Text style={themedStyles.emptyTitle}>No notifications yet</Text>
            <Text style={themedStyles.emptySubtitle}>
              You'll see notifications here when there are new rescue cases or updates
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              theme={theme}
              themedStyles={themedStyles}
            />
          ))
        )}
      </ScrollView>

      {/* FAB for sending announcements */}
      <FAB
        icon="plus"
        style={themedStyles.fab}
        onPress={() => setAnnouncementModalVisible(true)}
        label="Send Announcement"
      />

      {/* Announcement Modal */}
      <AnnouncementModal
        visible={announcementModalVisible}
        onDismiss={() => setAnnouncementModalVisible(false)}
        onSend={sendAnnouncement}
        theme={theme}
        themedStyles={themedStyles}
      />
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registrationCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  registrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  registrationText: {
    flex: 1,
    marginLeft: 12,
  },
  registrationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  registrationSubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  registerButton: {
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.subtext,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  notificationCard: {
    marginBottom: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    backgroundColor: theme.colors.card + '20',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  notificationData: {
    marginTop: 12,
    padding: 12,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },
  dataTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.subtext,
    marginBottom: 4,
  },
  dataContent: {
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  modalContainer: {
    backgroundColor: theme.colors.card,
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    minWidth: 80,
  },
  expoGoCard: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.high,
  },
});
