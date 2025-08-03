import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Snackbar, 
  SegmentedButtons,
  Card,
  Surface,
  useTheme
} from 'react-native-paper';
import { useSelector } from 'react-redux';
import { loginUser, resetError, createUserAccount } from '../../core/redux/slices/authSlice';
import { useAppDispatch } from '../../core/redux/store';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ImageBackground } from 'react-native';
import AuthService from '../../api/authService';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const theme = useTheme();
  const { loading, error, authenticated, user, accountType } = useSelector((state: any) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'user' | 'ngo'>('user');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [userFormData, setUserFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [ngoFormData, setNgoFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);

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

  // Handle authentication success and navigation
  useEffect(() => {
    if (authenticated && user && accountType) {
      console.log('Authentication successful:', { accountType, user });
      
      if (accountType === 'ngo') {
        showSnackbar('Welcome, NGO!');
        navigation.navigate('NGOAdminDashboard');
      } else if (accountType === 'user') {
        showSnackbar(`Hello, ${user.name}!`);
        navigation.navigate('UserHome');
      } else if (accountType === 'new') {
        showSnackbar('Welcome! Please complete your profile.');
        navigation.navigate('UserHome'); // or a profile setup screen
      }
    }
  }, [authenticated, user, accountType, navigation]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      handleLoginError(error);
      dispatch(resetError());
    }
  }, [error, dispatch]);

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

  const getCurrentFormData = () => {
    return activeTab === 'user' ? userFormData : ngoFormData;
  };

  const setCurrentFormData = (data: FormData) => {
    if (activeTab === 'user') {
      setUserFormData(data);
    } else {
      setNgoFormData(data);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const currentData = getCurrentFormData();
    const updatedData = { ...currentData, [field]: value };
    setCurrentFormData(updatedData);
  };

  const isFormValid = () => {
    const data = getCurrentFormData();
    
    if (isLoginMode) {
      // For login, only check email and password
      return data.email.includes('@') && data.password.length >= 6;
    } else {
      // For registration, check all fields
      return data.email.includes('@') && 
             data.password.length >= 6 && 
             data.name.trim() &&
             data.confirmPassword === data.password && 
             data.confirmPassword.length >= 6;
    }
  };

  /**
   * Handle user login using Redux action that wraps Appwrite authentication
   */
  const handleLogin = async () => {
    if (loginAttempts >= 3) {
      showSnackbar('Too many attempts. Please wait 5 minutes before trying again.');
      return;
    }

    const data = getCurrentFormData();
    if (!data.email.trim() || !data.password.trim()) {
      showSnackbar('Please enter both email and password.');
      return;
    }

    setLoginAttempts(prev => prev + 1);

    if (loginAttempts > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      // Use Redux action for login which handles Appwrite auth + Django account type lookup
      await dispatch(loginUser({ email: data.email, password: data.password })).unwrap();
      
      setLoginAttempts(0); // Reset attempts on successful login
      showSnackbar('Login successful! Welcome back.');
      
      // Navigation will be handled by useEffect watching authenticated state
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. ';
      if (error?.includes('invalid credentials') || error?.includes('invalid_credentials')) {
        errorMessage += 'Invalid email or password. Please check your credentials.';
      } else if (error?.includes('session is active')) {
        errorMessage += 'Already logged in. Refreshing...';
      } else {
        errorMessage += error || 'Please try again.';
      }
      
      showSnackbar(errorMessage);
    }
  };

  /**
   * Handle user registration using Redux action that wraps Appwrite + Django
   */
  const handleRegister = async () => {
    const data = getCurrentFormData();
    
    if (!isFormValid()) {
      showSnackbar('Please fill all fields correctly.');
      return;
    }

    try {
      // Use Redux action for registration which handles Appwrite account creation + Django profile
      await dispatch(createUserAccount({
        email: data.email,
        password: data.password,
        name: data.name,
        accountType: activeTab, // 'user' or 'ngo'
      })).unwrap();

      showSnackbar('Registration successful! Welcome to KarunaNidhan.');
      
      // Clear form data
      setCurrentFormData({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
      });
      
      // Navigation will be handled by useEffect watching authenticated state
      
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. ';
      
      if (error?.includes('already exists') || error?.includes('user_already_exists')) {
        errorMessage += 'Account already exists. Please try logging in.';
      } else if (error?.includes('rate limit') || error?.includes('too many requests')) {
        errorMessage += 'Too many requests. Please wait a moment.';
      } else if (error?.includes('password')) {
        errorMessage += 'Password must be at least 8 characters long.';
      } else if (error?.includes('email')) {
        errorMessage += 'Please enter a valid email address.';
      } else {
        errorMessage += error || 'Unknown error occurred.';
      }
      
      showSnackbar(errorMessage);
    }
  };

  const resetAttempts = () => {
    setLoginAttempts(0);
    showSnackbar('You can try logging in again now.');
  };

  return (
    <ImageBackground
      source={require('../assets/realistic-squirrel-natural-setting.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)']}
        style={styles.gradientOverlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, width: '100%' }}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text variant="headlineLarge" style={styles.title}>
                Welcome to KarunaNidhan
              </Text>
              <Text style={styles.subtitle}>
                Join us in making a difference for animals in need
              </Text>
            </View>

            {/* User Type Tabs */}
            <Surface style={styles.tabContainer} elevation={4}>
              <SegmentedButtons
                value={activeTab}
                onValueChange={value => setActiveTab(value as 'user' | 'ngo')}
                buttons={[
                  { value: 'user', label: 'User', icon: 'account' },
                  { value: 'ngo', label: 'NGO', icon: 'office-building' },
                ]}
                style={styles.segmentedButtons}
              />
            </Surface>

            {/* Login/Register Toggle */}
            <Surface style={styles.modeContainer} elevation={2}>
              <SegmentedButtons
                value={isLoginMode ? 'login' : 'register'}
                onValueChange={value => setIsLoginMode(value === 'login')}
                buttons={[
                  { value: 'login', label: 'Login' },
                  { value: 'register', label: 'Register' },
                ]}
                style={styles.modeButtons}
              />
            </Surface>

            {/* Form Card */}
            <Card style={styles.formCard} mode="elevated">
              <Card.Content>
                <Text variant="titleMedium" style={styles.formTitle}>
                  {isLoginMode ? 'Login' : 'Register'} as {activeTab === 'user' ? 'User' : 'NGO'}
                </Text>

                {/* Name Field (only for registration) */}
                {!isLoginMode && (
                  <TextInput
                    label="Full Name"
                    value={getCurrentFormData().name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    style={styles.input}
                    mode="outlined"
                    left={<TextInput.Icon icon="account" />}
                    disabled={loading}
                  />
                )}

                {/* Email Field */}
                <TextInput
                  label="Email"
                  value={getCurrentFormData().email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  style={styles.input}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email" />}
                  disabled={loading}
                />

                {/* Password Field */}
                <TextInput
                  label="Password"
                  value={getCurrentFormData().password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                  left={<TextInput.Icon icon="lock" />}
                  disabled={loading}
                />

                {/* Confirm Password Field (only for registration) */}
                {!isLoginMode && (
                  <TextInput
                    label="Confirm Password"
                    value={getCurrentFormData().confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry
                    left={<TextInput.Icon icon="lock-check" />}
                    disabled={loading}
                    error={getCurrentFormData().confirmPassword &&
                           getCurrentFormData().password !== getCurrentFormData().confirmPassword}
                  />
                )}

                {/* Action Button */}
                <Button
                  mode="contained"
                  onPress={isLoginMode ? handleLogin : handleRegister}
                  loading={loading}
                  disabled={!isFormValid() || loading || loginAttempts >= 3}
                  style={styles.actionButton}
                  contentStyle={styles.buttonContent}
                >
                  {loading
                    ? 'Processing...'
                    : (isLoginMode ? 'Login' : 'Register')
                  }
                </Button>

                {/* Reset Attempts Button */}
                {loginAttempts >= 3 && (
                  <Button
                    mode="text"
                    onPress={resetAttempts}
                    style={styles.resetButton}
                  >
                    Reset and Try Again
                  </Button>
                )}
              </Card.Content>
            </Card>
          </ScrollView>

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
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  gradientOverlay: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  segmentedButtons: {
    margin: 8,
  },
  modeContainer: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  modeButtons: {
    margin: 8,
  },
  formCard: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  resetButton: {
    marginTop: 8,
  },
});