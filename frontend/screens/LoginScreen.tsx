import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Text, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetError } from '../core/redux/slices/authSlice';
import AppwriteService from '../appwrite/service';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error, authenticated, user } = useSelector((state: any) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [checkingNGO, setCheckingNGO] = useState(false);

  // Reset login attempts every 5 minutes
  useEffect(() => {
    if (loginAttempts >= 3) {
      const timer = setTimeout(() => {
        setLoginAttempts(0);
        showSnackbar('You can try logging in again now.');
      }, 300000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  // Handle authentication success
  useEffect(() => {
    if (authenticated && user) {
      checkUserType();
    }
  }, [authenticated, user]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      handleLoginError(error);
      dispatch(resetError());
    }
  }, [error]);

  const showSnackbar = (msg: string) => {
    setSnackbarMsg(msg);
    setSnackbarVisible(true);
  };

  const handleLoginError = (errorMessage: string) => {
    if (errorMessage?.includes('rate limit')) {
      showSnackbar('Too many requests. Please wait a moment and try again.');
    } else if (errorMessage?.includes('Invalid credentials') || 
               errorMessage?.includes('user') || 
               errorMessage?.includes('email') ||
               errorMessage?.includes('password')) {
      showSnackbar('Invalid email or password. Please check your credentials.');
    } else if (errorMessage?.includes('session is active')) {
      showSnackbar('Already logged in. Refreshing...');
    } else {
      showSnackbar('Login failed. Please try again.');
    }
  };

  const checkUserType = async () => {
    if (!user || !AppwriteService.jwtToken) return;

    setCheckingNGO(true);
    try {
      const ngoResponse = await fetch(`http://127.0.0.1:8000/ngo/profile/${user.$id}/`, {
        headers: {
          'Authorization': `Bearer ${AppwriteService.jwtToken}`,
        },
      });
      
      if (ngoResponse.ok) {
        // User is NGO
        showSnackbar('Welcome, NGO!');
        // navigation.navigate('NGODashboard');
      } else {
        // User is normal user
        showSnackbar(`Hello, ${user.name}!`);
        // navigation.navigate('UserDashboard');
      }
    } catch (ngoError) {
      console.warn('Could not check NGO status:', ngoError);
      showSnackbar(`Welcome, ${user.name}!`);
    } finally {
      setCheckingNGO(false);
    }
  };

  const handleLogin = async () => {
    // Prevent rapid successive attempts
    if (loginAttempts >= 3) {
      showSnackbar('Too many attempts. Please wait 5 minutes before trying again.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      showSnackbar('Please enter both email and password.');
      return;
    }

    setLoginAttempts(prev => prev + 1);

    // Add a small delay to prevent rate limiting
    if (loginAttempts > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    dispatch(loginUser({ email, password }));
  };

  const resetAttempts = () => {
    setLoginAttempts(0);
    showSnackbar('You can try logging in again now.');
  };

  const isLoading = loading || checkingNGO;

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Welcome to KarunaNidhan
      </Text>
      
      <Text style={styles.subtitle}>
        Log in to continue helping our furry friends.{'\n'}
        Already have an account? Great! If not, create one below.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
        error={!!error && error.includes('email')}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        disabled={isLoading}
        error={!!error && error.includes('password')}
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={isLoading}
        disabled={isLoading || !email.trim() || !password.trim() || loginAttempts >= 3}
        style={styles.button}
      >
        {checkingNGO ? 'Checking user type...' : 'Login as User'}
      </Button>

      {loginAttempts >= 3 && (
        <Button
          mode="text"
          onPress={resetAttempts}
          style={styles.button}
        >
          Reset and Try Again
        </Button>
      )}

      <Button
        mode="text"
        onPress={() => navigation.navigate('Register' as never)}
        style={styles.button}
        disabled={isLoading}
      >
        Don't have an account?
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
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
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});