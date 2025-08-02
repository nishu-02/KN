import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { notificationApi } from '../../api/notificationApi';

export default function SendAnnouncementScreen() {
  const [form, setForm] = useState({ title: '', body: '', data: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await notificationApi.sendAnnouncement({
        title: form.title,
        body: form.body,
        data: form.data ? JSON.parse(form.data) : {},
      });
      if (res.message) {
        setSuccess(true);
        setForm({ title: '', body: '', data: '' });
      } else {
        setError(res.error || 'Announcement failed');
      }
    } catch (e) {
      setError('Announcement failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Send Announcement</Text>
      <TextInput label="Title" value={form.title} onChangeText={v => handleChange('title', v)} style={styles.input} />
      <TextInput label="Body" value={form.body} onChangeText={v => handleChange('body', v)} style={styles.input} multiline />
      <TextInput label="Data (JSON)" value={form.data} onChangeText={v => handleChange('data', v)} style={styles.input} />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">Announcement sent successfully!</HelperText> : null}
      <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.button}>Send</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 16 },
});
