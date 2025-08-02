import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Avatar } from 'react-native-paper';
import { reportsApi } from '../../api/reportsApi';

export default function UserReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      // Assuming the backend provides a way to get current user's reports
      const data = await reportsApi.listReports({ own: true });
      setReports(data.results || []);
    } catch (e) {
      setReports([]);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>My Reports</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : reports.length === 0 ? (
        <Text style={{ margin: 20 }}>No reports found.</Text>
      ) : (
        reports.map(report => (
          <Card key={report.report_id || report.id} style={styles.card}>
            <Card.Title
              title={report.title || 'Animal Rescue Report'}
              subtitle={report.species || 'Unknown Species'}
              left={props => <Avatar.Text {...props} label={report.species?.[0] || '?'} />}
            />
            <Card.Content>
              <Text>{report.description}</Text>
              <Text style={styles.location}>{report.location}</Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { margin: 16, textAlign: 'center' },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
  location: { color: '#888', marginTop: 8 },
});
