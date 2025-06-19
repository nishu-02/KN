import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AppwriteService from '../appwrite/service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Logging in...');
      await AppwriteService.login({ email, password });

      console.log('Fetching user...');
      const user = await AppwriteService.getCurrentUser();

      console.log('User:', user);
      Alert.alert('Login Successful', `Hello, ${user.name}`);
    } catch (err: any) {
      console.error('Login error:', err.message);
      Alert.alert('Login Failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff' }}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
