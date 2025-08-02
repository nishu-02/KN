import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Card, Text, Button, Avatar, TextInput, HelperText } from 'react-native-paper';
import { usersApi } from '../../api/usersApi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const API_BASE_URL = 'http://147.93.97.50/users/profile/me/';

      // Retrieve the token dynamically (replace with your actual logic)
      const token = await AsyncStorage.getItem('appwrite_jwt');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error fetching profile:', error);
        setProfile(null);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Profile data:', data);
      setProfile(data);
      setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '' });
    } catch (e) {
      console.error('Error fetching profile:', e);
      setProfile(null);
    }
    setLoading(false);
  };

  const handleChange = (key, value) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    setError('');
    setSuccess(false);
    try {
      const res = await usersApi.updateProfile(form);
      if (res.name) {
        setSuccess(true);
        setEditMode(false);
        fetchProfile();
      } else {
        setError(res.error || 'Update failed');
      }
    } catch (e) {
      setError('Update failed');
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;
  if (!profile) return <Text style={{ margin: 20 }}>Profile not found.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={profile.name}
          subtitle={profile.email}
          left={props => <Avatar.Text {...props} label={profile.name?.[0] || '?'} />}
        />
        <Card.Content>
          {editMode ? (
            <>
              <TextInput label="Name" value={form.name} onChangeText={v => handleChange('name', v)} style={styles.input} />
              <TextInput label="Email" value={form.email} onChangeText={v => handleChange('email', v)} style={styles.input} />
              <TextInput label="Phone" value={form.phone} onChangeText={v => handleChange('phone', v)} style={styles.input} />
              {error ? <HelperText type="error">{error}</HelperText> : null}
              {success ? <HelperText type="info">Profile updated!</HelperText> : null}
              <Button mode="contained" onPress={handleSave} style={styles.button}>Save</Button>
              <Button onPress={() => setEditMode(false)} style={styles.button}>Cancel</Button>
            </>
          ) : (
            <>
              <Text>Name: {profile.name}</Text>
              <Text>Email: {profile.email}</Text>
              <Text>Phone: {profile.phone}</Text>
              <Button mode="outlined" onPress={() => setEditMode(true)} style={styles.button}>Edit Profile</Button>
            </>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  card: { margin: 16, borderRadius: 16, elevation: 2 },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
});
