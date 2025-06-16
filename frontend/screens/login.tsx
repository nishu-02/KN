import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { registerUser, getCurrentUser, loginUser, logout } from '../appwrite/auth';
import { getReports, Report } from '../appwrite/services';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    try {
      setLoading(true);
      await registerUser(email, password);
      setMessage('User registered successfully!');
    } catch (err: any) {
      setMessage('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Try to get the current user session
      try {
        await getCurrentUser();
        // If session exists, log out first
        await logout();
        console.log('Existing session removed');
      } catch {
        // No active session — do nothing
      }

      // Now create session safely
      await loginUser(email, password);
      setLoggedIn(true);
      const data = await getReports();
      setReports(data);
      setMessage(null);
    } catch (err: any) {
      setMessage('Error: ' + err.message);
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
    <ImageBackground
      source={require('../assets/realistic-squirrel-natural-setting.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Dark overlay for better text readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          {!loggedIn ? (
            <View style={styles.loginContainer}>
              {/* Logo/Title Section */}
              <View style={styles.titleContainer}>
                <Text style={styles.title}>Karuna Nidhan</Text>
                <Text style={styles.subtitle}>Sign in to your account</Text>
              </View>

              {/* Form Section */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.8)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.8)" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={20}
                      color="rgba(255,255,255,0.8)"
                    />
                  </TouchableOpacity>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.loginButtonGradient}
                  >
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Register Button */}
                <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                  <LinearGradient
                    colors={['rgba(108,99,255,0.3)', 'rgba(108,99,255,0.2)']}
                    style={styles.registerButtonGradient}
                  >
                    <Text style={styles.registerButtonText}>Register</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Social Login */}
                <View style={styles.socialContainer}>
                  <Text style={styles.orText}>or continue with</Text>
                  <View style={styles.socialButtonsContainer}>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-google" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialButton}>
                      <Ionicons name="logo-facebook" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loggedInContainer}>
              {/* Header */}
              <View style={styles.headerContainer}>
                <Text style={styles.welcomeText}>Welcome to Karuna Nidhan</Text>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>

              {/* Reports List */}
              <View style={styles.reportsContainer}>
                <FlatList
                  data={reports}
                  keyExtractor={(item) => item.$id}
                  renderItem={({ item }) => (
                    <View style={styles.reportCard}>
                      <Text style={styles.reportJson}>{JSON.stringify(item, null, 2)}</Text>
                    </View>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </View>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white" />
            </View>
          )}

          {/* Message */}
          {message && (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: width,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 46,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'times new roman',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: 'white',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  registerButton: {
    width: '100%',
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.5)',
  },
  registerButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  orText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  // Logged In Styles
  loggedInContainer: {
    flex: 1,
    width: '100%',
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportsContainer: {
    flex: 1,
    width: '100%',
  },
  reportCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 18,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 6,
    borderLeftColor: 'rgba(108,99,255,0.8)',
  },
  reportJson: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  // Loading and Message Styles
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  messageContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});