import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { ngoApi } from '../../api/ngoApi';

export default function NGORegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', category: '', description: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await ngoApi.registerNGO(form);
      if (res.ngo_id) {
        setSuccess(true);
        setForm({ name: '', email: '', category: '', description: '', location: '' });
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (e) {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Register Your NGO</Text>
      <TextInput label="Name" value={form.name} onChangeText={v => handleChange('name', v)} style={styles.input} />
      <TextInput label="Email" value={form.email} onChangeText={v => handleChange('email', v)} style={styles.input} />
      <TextInput label="Category" value={form.category} onChangeText={v => handleChange('category', v)} style={styles.input} />
      <TextInput label="Description" value={form.description} onChangeText={v => handleChange('description', v)} style={styles.input} multiline />
      <TextInput label="Location" value={form.location} onChangeText={v => handleChange('location', v)} style={styles.input} />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">NGO registered successfully!</HelperText> : null}
      <Button mode="contained" onPress={handleSubmit} loading={loading} style={styles.button}>Register</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { marginBottom: 24, textAlign: 'center' },
  input: { marginBottom: 16 },
  button: { marginTop: 16 },
});
