import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { reportsApi } from '../../api/reportsApi';

export default function ReportCreateScreen() {
  const [form, setForm] = useState({ title: '', description: '', species: '', location: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await reportsApi.createReport(form);
      if (res.report_id) {
        setSuccess(true);
        setForm({ title: '', description: '', species: '', location: '', image_url: '' });
      } else {
        setError(res.error || 'Report creation failed');
      }
    } catch (e) {
      setError('Report creation failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Report Animal Rescue</Text>
      <TextInput label="Title" value={form.title} onChangeText={v => handleChange('title', v)} style={styles.input} />
      <TextInput label="Description" value={form.description} onChangeText={v => handleChange('description', v)} style={styles.input} multiline />
      <TextInput label="Species" value={form.species} onChangeText={v => handleChange('species', v)} style={styles.input} />
      <TextInput label="Location" value={form.location} onChangeText={v => handleChange('location', v)} style={styles.input} />
      <TextInput label="Image URL" value={form.image_url} onChangeText={v => handleChange('image_url', v)} style={styles.input} />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">Report created successfully!</HelperText> : null}
      <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.button}>Submit</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 16 },
});
