import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Avatar, TextInput, HelperText } from 'react-native-paper';
import { usersApi } from '../../api/usersApi';

export default function VolunteerApplicationsScreen() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ motivation: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await usersApi.listVolunteerApplications();
      setApplications(data.results || []);
    } catch (e) {
      setApplications([]);
    }
    setLoading(false);
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleApply = async () => {
    setError('');
    setSuccess(false);
    try {
      const res = await usersApi.applyVolunteer(form);
      if (res.id) {
        setSuccess(true);
        setForm({ motivation: '' });
        fetchApplications();
      } else {
        setError(res.error || 'Application failed');
      }
    } catch (e) {
      setError('Application failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Volunteer Applications</Text>
      <TextInput label="Motivation" value={form.motivation} onChangeText={v => handleChange('motivation', v)} style={styles.input} multiline />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">Application submitted!</HelperText> : null}
      <Button mode="contained" onPress={handleApply} style={styles.button}>Apply</Button>
      <Text variant="titleMedium" style={styles.sectionTitle}>My Applications</Text>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : applications.length === 0 ? (
        <Text style={{ margin: 20 }}>No applications found.</Text>
      ) : (
        applications.map(app => (
          <Card key={app.id} style={styles.card}>
            <Card.Title
              title={`Application #${app.id}`}
              subtitle={app.status}
              left={props => <Avatar.Icon {...props} icon="account" />}
            />
            <Card.Content>
              <Text>Motivation: {app.motivation}</Text>
              <Text>Status: {app.status}</Text>
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
  sectionTitle: { margin: 16, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
});
