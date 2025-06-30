import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { TextInput, Button, Text, ActivityIndicator } from "react-native-paper";
import { useDispatch, useSelector } from "react-redux";
import * as Location from "expo-location";
import { createUserAccount, loginUser, resetError } from "../core/redux/slices/authSlice";
import { RootState } from "../core/redux/store";

export default function RegisterNGOScreen({ navigation }: any) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    ngoName: "",
    ngoDescription: "",
    ngoCategory: "",
    ngoContactEmail: "",
    ngoContactPhone: "",
    ngoLatitude: "",
    ngoLongitude: "",
  });
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(resetError());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      setLocationStatus("pending");
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationStatus("error");
          return;
        }

        let loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
        });
        
        setFormData((prev) => ({
          ...prev,
          ngoLatitude: loc.coords.latitude.toString(),
          ngoLongitude: loc.coords.longitude.toString(),
        }));
        setLocationStatus("success");
      } catch (error) {
        console.error('Location error:', error);
        setLocationStatus("error");
      }
    })();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return (
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.email.includes("@") &&
      formData.phoneNumber.length >= 10 &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.dateOfBirth.trim() &&
      formData.ngoName.trim() &&
      formData.ngoDescription.trim() &&
      formData.ngoCategory.trim() &&
      formData.ngoContactEmail.includes("@") &&
      formData.ngoContactPhone.length >= 10 &&
      formData.ngoLatitude &&
      formData.ngoLongitude
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

      console.log('Account created successfully:', accountResult);

      // Step 2: Login to get session and JWT
      const loginResult = await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      console.log('Login successful:', loginResult);

      // Step 3: Register NGO with backend
      const jwt = loginResult.jwt || loginResult.token;
      if (!jwt) {
        throw new Error('Authentication failed. Please try logging in manually.');
      }

      try {
        const response = await fetch("http://192.168.29.139:8000/ngo/register/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            name: formData.ngoName,
            description: formData.ngoDescription,
            location: formData.ngoContactEmail, // Consider using actual address
            category: formData.ngoCategory,
            contact_email: formData.ngoContactEmail,
            contact_phone: formData.ngoContactPhone,
            latitude: parseFloat(formData.ngoLatitude || "0"),
            longitude: parseFloat(formData.ngoLongitude || "0"),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: Registration failed`);
        }

        console.log('NGO registration successful');
        alert("NGO Registration successful! You can now access your dashboard.");
        
        // Navigation will be handled automatically by Redux state change
        
      } catch (backendError: any) {
        console.error('Backend registration error:', backendError);
        alert(`NGO registration failed: ${backendError.message}`);
      }

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
        }
      } else if (error.message?.includes('rate limit')) {
        errorMessage += 'Too many requests. Please wait a moment and try again.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage += 'Network error. Please check your connection.';
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
        Register as NGO
      </Text>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
      
      <TextInput
        label="First Name"
        value={formData.firstName}
        onChangeText={(t) => handleInputChange("firstName", t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Last Name"
        value={formData.lastName}
        onChangeText={(t) => handleInputChange("lastName", t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Email"
        value={formData.email}
        onChangeText={(t) => handleInputChange("email", t)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
      />
      
      <TextInput
        label="Phone Number"
        value={formData.phoneNumber}
        onChangeText={(t) => handleInputChange("phoneNumber", t)}
        style={styles.input}
        keyboardType="phone-pad"
        disabled={isLoading}
      />
      
      <TextInput
        label="Date of Birth (DD/MM/YYYY)"
        value={formData.dateOfBirth}
        onChangeText={(t) => handleInputChange("dateOfBirth", t)}
        style={styles.input}
        keyboardType="numeric"
        disabled={isLoading}
      />
      
      <TextInput
        label="Password"
        value={formData.password}
        onChangeText={(t) => handleInputChange("password", t)}
        style={styles.input}
        secureTextEntry
        disabled={isLoading}
      />
      
      <TextInput
        label="Confirm Password"
        value={formData.confirmPassword}
        onChangeText={(t) => handleInputChange("confirmPassword", t)}
        style={styles.input}
        secureTextEntry
        disabled={isLoading}
      />
      
      <TextInput
        label="NGO Name"
        value={formData.ngoName}
        onChangeText={(t) => handleInputChange("ngoName", t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Description"
        value={formData.ngoDescription}
        onChangeText={(t) => handleInputChange("ngoDescription", t)}
        style={styles.input}
        multiline
        numberOfLines={3}
        disabled={isLoading}
      />
      
      <TextInput
        label="Category"
        value={formData.ngoCategory}
        onChangeText={(t) => handleInputChange("ngoCategory", t)}
        style={styles.input}
        disabled={isLoading}
      />
      
      <TextInput
        label="Contact Email"
        value={formData.ngoContactEmail}
        onChangeText={(t) => handleInputChange("ngoContactEmail", t)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={isLoading}
      />
      
      <TextInput
        label="Contact Phone"
        value={formData.ngoContactPhone}
        onChangeText={(t) => handleInputChange("ngoContactPhone", t)}
        style={styles.input}
        keyboardType="phone-pad"
        disabled={isLoading}
      />

      {locationStatus === "pending" && (
        <View style={styles.locationContainer}>
          <ActivityIndicator animating size="small" />
          <Text>Detecting location...</Text>
        </View>
      )}
      
      {locationStatus === "success" && (
        <Text style={styles.locationSuccess}>
          ✓ Location detected automatically!
        </Text>
      )}
      
      {locationStatus === "error" && (
        <Text style={styles.locationError}>
          ⚠ Unable to detect location. Please enable location permissions and restart the app.
        </Text>
      )}

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={isLoading}
        disabled={!isFormValid() || isLoading || locationStatus !== "success"}
        style={styles.button}
      >
        {isLoading ? "Creating Account..." : "Create NGO Account"}
      </Button>
      
      <Button
        mode="text"
        onPress={() => navigation.navigate("SignIn")}
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
    justifyContent: "center", 
    padding: 20 
  },
  input: { 
    marginBottom: 16 
  },
  title: { 
    marginBottom: 32, 
    textAlign: "center" 
  },
  button: { 
    marginTop: 8 
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  locationSuccess: {
    color: 'green',
    marginBottom: 16,
    textAlign: 'center',
  },
  locationError: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
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