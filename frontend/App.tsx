import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';

import { registerUser, loginUser, logout } from './appwrite/auth';
import { getReports, Report } from './appwrite/services';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerUser(email, password);
      setMessage('✅ User registered successfully!');
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await loginUser(email, password);
      setLoggedIn(true);
      const data = await getReports();
      setReports(data);
      setMessage(null);
    } catch (err: any) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLoggedIn(false);
    setReports([]);
    setEmail('');
    setPassword('');
    setMessage('Logged out.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>🚀 Appwrite Reports</Text>

      {!loggedIn ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
          <View style={styles.buttonRow}>
            <Button title="Register" onPress={handleRegister} />
            <Button title="Login" onPress={handleLogin} />
          </View>
        </>
      ) : (
        <>
          <Button title="Logout" onPress={handleLogout} />
          <FlatList
            data={reports}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.json}>{JSON.stringify(item, null, 2)}</Text>
              </View>
            )}
          />
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {message && <Text style={styles.message}>{message}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    gap: 10,
  },
  card: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    marginVertical: 6,
  },
  json: { fontFamily: 'Courier', fontSize: 12 },
  message: {
    marginTop: 15,
    color: '#333',
    fontSize: 14,
  },
});
