import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { reportsApi } from '../../api/reportsApi';
import { useRoute } from '@react-navigation/native';

export default function ReportDetailScreen() {
  const route = useRoute();
  const { id } = route.params || {};
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await reportsApi.getReportDetail(id);
      setReport(data);
    } catch (e) {
      setReport(null);
    }
    setLoading(false);
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (!report) return <Text style={{ margin: 20 }}>Report not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={report.title || 'Animal Rescue Report'}
          subtitle={report.species || 'Unknown Species'}
          left={props => <Avatar.Text {...props} label={report.species?.[0] || '?'} />}
        />
        <Card.Content>
          <Text variant="titleMedium">{report.description}</Text>
          <Text style={styles.location}>{report.location}</Text>
          {report.image_url ? (
            <Image source={{ uri: report.image_url }} style={styles.image} />
          ) : null}
          <Text style={styles.sectionTitle}>Status: {report.status}</Text>
          <Text>Reported by: {report.user_id}</Text>
        </Card.Content>
      </Card>
      {/* Add more details, actions, and comments here as needed */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
  location: { color: '#888', marginTop: 8 },
  sectionTitle: { marginTop: 16, fontWeight: 'bold' },
  image: { width: '100%', height: 220, borderRadius: 12, marginTop: 12 },
});
