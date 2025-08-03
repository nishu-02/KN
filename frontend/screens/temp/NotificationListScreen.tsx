import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, IconButton, Badge } from 'react-native-paper';
import { notificationApi } from '../../api/notificationApi';
import { useNavigation } from '@react-navigation/native';

export default function NotificationListScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getNotificationHistory();
      setNotifications(data.notifications || []);
    } catch (e) {
      setNotifications([]);
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id);
    fetchNotifications();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Title
                title={item.title}
                subtitle={item.body}
                right={props => !item.is_read ? <Badge style={styles.badge}>New</Badge> : null}
              />
              <Card.Content>
                <Text>{item.data?.type}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
                {!item.is_read && (
                  <IconButton icon="check" onPress={() => markAsRead(item.id)} />
                )}
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 2 },
  badge: { alignSelf: 'center', backgroundColor: '#ff9800', color: '#fff' },
  date: { color: '#888', marginTop: 4 },
});
