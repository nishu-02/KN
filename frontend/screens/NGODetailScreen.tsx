import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { ngoApi } from '../../api/ngoApi';
import { useRoute } from '@react-navigation/native';

export default function NGODetailScreen() {
  const route = useRoute();
  const { id } = route.params || {};
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNGO();
  }, [id]);

  const fetchNGO = async () => {
    setLoading(true);
    try {
      const data = await ngoApi.getNGODetail(id);
      setNgo(data);
    } catch (e) {
      setNgo(null);
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (!ngo) return <Text style={{ margin: 20 }}>NGO not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={ngo.name}
          subtitle={ngo.category}
          left={props => <Avatar.Text {...props} label={ngo.name?.[0] || '?'} />}
        />
        <Card.Content>
          <Text variant="titleMedium">{ngo.description}</Text>
          <Text style={styles.location}>{ngo.location}</Text>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text>{ngo.email}</Text>
          <Text>{ngo.phone}</Text>
        </Card.Content>
      </Card>
      {/* Add more details, reports, and actions here as needed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
  location: { color: '#888', marginTop: 8 },
  sectionTitle: { marginTop: 16, fontWeight: 'bold' },
});
