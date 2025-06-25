import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createUserAccount, loginUser, resetError } from '../core/redux/slices/authSlice';
import { RootState } from '../core/redux/store';

export default function RegisterIndividualScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(resetError());
  }, [dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.includes('@') &&
      formData.phoneNumber.length >= 10 &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.dateOfBirth.trim()
    );
  };

  const handleRegister = async () => {
    setRegistrationLoading(true);
    
    try {
      // Step 1: Create account with Redux
      const accountResult = await dispatch(createUserAccount({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
      })).unwrap();

      console.log('Individual account created successfully:', accountResult);

      // Step 2: Login to get session and JWT
      const loginResult = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      console.log('Login successful for individual user:', loginResult);
      
      alert('Registration successful! Welcome to the app.');
      
      // Navigation will be handled automatically by Redux state change
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. ';
      
      if (error.message?.includes('already exists') || error.message?.includes('already')) {
        // Try to login if account already exists
        try {
          await dispatch(loginUser({
            email: formData.email,
            password: formData.password,
          })).unwrap();
          
          alert('Account already exists. Logged in successfully!');
          return;
        } catch (loginError) {
          errorMessage += 'Account exists but login failed. Please try logging in manually.';
          navigation.navigate('SignIn');
          return;
        }
      } else if (error.message?.includes('rate limit')) {
        errorMessage += 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection.';
      } else if (error.message?.includes('email')) {
        errorMessage += 'Email is already registered or invalid.';
      } else if (error.message?.includes('password')) {
        errorMessage += 'Password requirements not met.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }
      
      alert(errorMessage);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const isLoading = loading || registrationLoading;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Register as Individual
      </Text>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      <TextInput
        label="First Name"
        value={formData.firstName}
        onChangeText={t => handleInputChange('firstName', t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Last Name"
        value={formData.lastName}
        onChangeText={t => handleInputChange('lastName', t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={t => handleInputChange('email', t)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
      />
      
      <TextInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={t => handleInputChange('phoneNumber', t)}
        style={styles.input}
        keyboardType="phone-pad"
        disabled={isLoading}
      />
      
      <TextInput
        label="Date of Birth (DD/MM/YYYY)"
        value={formData.dateOfBirth}
        onChangeText={t => handleInputChange('dateOfBirth', t)}
        style={styles.input}
        keyboardType="numeric"
        placeholder="DD/MM/YYYY"
        disabled={isLoading}
      />
      
      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={t => handleInputChange('password', t)}
        style={styles.input}
        secureTextEntry
        disabled={isLoading}
        helperText="Minimum 6 characters"
      />
      
      <TextInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={t => handleInputChange('confirmPassword', t)}
        style={styles.input}
        secureTextEntry
        disabled={isLoading}
        error={formData.confirmPassword && formData.password !== formData.confirmPassword}
        helperText={
          formData.confirmPassword && formData.password !== formData.confirmPassword
            ? "Passwords don't match"
            : ""
        }
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isLoading}
        disabled={!isFormValid() || isLoading}
        style={styles.button}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      
      <Button
        mode="text"
        onPress={() => navigation.navigate('SignIn')}
        style={styles.button}
        disabled={isLoading}
      >
        Already have an account? Login
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 20 
  },
  input: { 
    marginBottom: 16 
  },
  title: { 
    marginBottom: 32, 
    textAlign: 'center' 
  },
  button: { 
    marginTop: 8 
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
  },
});