import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { setUser } from '../core/redux/slices/authSlice';
import AppwriteService from '../appwrite/service';

export default function LoginScreen() {
  const dispatch = useDispatch();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  const showSnackbar = (msg: string) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log('Logging in...');
      await AppwriteService.login({ email, password });

      console.log('Fetching user...');
      const user = await AppwriteService.getCurrentUser();

      console.log('User:', user);
      dispatch(setUser(user));
      showSnackbar(`Hello, ${user.name}`);
    } catch (err: any) {
      console.error('Login error:', err.message);
      showSnackbar(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Login</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      <Button
        mode="contained"
        onPress={handleLogin}
        disabled={loading}
        style={styles.button}
      >
        {loading ? <ActivityIndicator animating color="#fff" /> : 'Login'}
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Close',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMsg}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
  },
});
