import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Avatar,
  Divider,
  IconButton,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AppwriteService from '../appwrite/service';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
}

interface NGOFormData extends FormData {
  isNGO: boolean;
  ngoName?: string;
  ngoDescription?: string;
  ngoCategory?: string;
  ngoContactEmail?: string;
  ngoContactPhone?: string;
  ngoLatitude?: string;
  ngoLongitude?: string;
}

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const [formData, setFormData] = useState<NGOFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    isNGO: false,
    ngoName: '',
    ngoDescription: '',
    ngoCategory: '',
    ngoContactEmail: '',
    ngoContactPhone: '',
    ngoLatitude: '',
    ngoLongitude: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof NGOFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    setLoading(true);
    try {
      // 1. Register with Appwrite
      await AppwriteService.createAccount({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
      });
      // 2. Login to get JWT
      await AppwriteService.login({
        email: formData.email,
        password: formData.password,
      });
      // 3. If NGO, register with Django backend
      if (formData.isNGO) {
        const jwt = AppwriteService.jwt;
        await fetch('http://127.0.0.1:8000/ngo/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            name: formData.ngoName,
            description: formData.ngoDescription,
            location: formData.ngoContactEmail, // or a location field
            category: formData.ngoCategory,
            contact_email: formData.ngoContactEmail,
            contact_phone: formData.ngoContactPhone,
            latitude: parseFloat(formData.ngoLatitude || '0'),
            longitude: parseFloat(formData.ngoLongitude || '0'),
          }),
        });
      }
      // 4. Save Expo push token (pseudo, replace with actual token logic)
      // await fetch('http://127.0.0.1:8000/reports/save-push-token/', { ... })
      // 5. Success UI/redirect
      alert('Registration successful!');
    } catch (e) {
      alert('Registration failed: ' + e.message);
    } finally {
      setLoading(false);
    }
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

  return (
    <ImageBackground
        source={require('../assets/realistic-squirrel-natural-setting.jpg')}

      style={styles.backgroundImage}
      resizeMode="cover"
    >
      {/* Animated Gradient Overlay */}
      
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Floating Header */}
            <View style={styles.header}>
              
              <Text variant="headlineLarge" style={styles.title}>
                Register with KarunaNidhan
              </Text>
              <Text style={{textAlign: 'center', marginBottom: 24}}>
                Join us as a passionate rescuer or just a caring human.{"\n"}
                Select the type of account you want to create.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('RegisterNGO' as never)}
                style={{ marginBottom: 16 }}
              >
                Register as NGO
              </Button>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('RegisterIndividual' as never)}
              >
                Register as Individual
              </Button>
            </View>

                {/* Name Fields */}
                <View style={styles.nameRow}>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="First Name"
                      value={formData.firstName}
                      onChangeText={(text) => handleInputChange('firstName', text)}
                      mode="outlined"
                      style={styles.transparentInput}
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: 'rgba(255, 255, 255, 0.8)',
                          onSurface: 'rgba(255, 255, 255, 0.9)',
                          outline: 'rgba(255, 255, 255, 0.5)',
                          background: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                      textColor="white"
                      left={<TextInput.Icon icon="account-outline" color="rgba(255, 255, 255, 0.7)" />}
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Last Name"
                      value={formData.lastName}
                      onChangeText={(text) => handleInputChange('lastName', text)}
                      mode="outlined"
                      style={styles.transparentInput}
                      outlineStyle={styles.inputOutline}
                      theme={{
                        colors: {
                          primary: 'rgba(255, 255, 255, 0.8)',
                          onSurface: 'rgba(255, 255, 255, 0.9)',
                          outline: 'rgba(255, 255, 255, 0.5)',
                          background: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                      textColor="white"
                      left={<TextInput.Icon icon="account-outline" color="rgba(255, 255, 255, 0.7)" />}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Email Address"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    mode="outlined"
                    style={styles.transparentInput}
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: 'rgba(255, 255, 255, 0.8)',
                        onSurface: 'rgba(255, 255, 255, 0.9)',
                        outline: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    textColor="white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    left={<TextInput.Icon icon="email-outline" color="rgba(255, 255, 255, 0.7)" />}
                  />
                </View>

                {/* Phone Number */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChangeText={(text) => handleInputChange('phoneNumber', text)}
                    mode="outlined"
                    style={styles.transparentInput}
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: 'rgba(255, 255, 255, 0.8)',
                        onSurface: 'rgba(255, 255, 255, 0.9)',
                        outline: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    textColor="white"
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone-outline" color="rgba(255, 255, 255, 0.7)" />}
                  />
                </View>

                {/* Date of Birth */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Date of Birth (DD/MM/YYYY)"
                    value={formData.dateOfBirth}
                    onChangeText={(text) => handleInputChange('dateOfBirth', text)}
                    mode="outlined"
                    style={styles.transparentInput}
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: 'rgba(255, 255, 255, 0.8)',
                        onSurface: 'rgba(255, 255, 255, 0.9)',
                        outline: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    textColor="white"
                    keyboardType="numeric"
                    left={<TextInput.Icon icon="calendar-outline" color="rgba(255, 255, 255, 0.7)" />}
                    placeholder="25/12/1990"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>

                {/* Glowing Divider */}
                <View style={styles.glowingDivider}>
                  <LinearGradient
                    colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.dividerGradient}
                  />
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Password"
                    value={formData.password}
                    onChangeText={(text) => handleInputChange('password', text)}
                    mode="outlined"
                    style={styles.transparentInput}
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: 'rgba(255, 255, 255, 0.8)',
                        onSurface: 'rgba(255, 255, 255, 0.9)',
                        outline: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    textColor="white"
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock-outline" color="rgba(255, 255, 255, 0.7)" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? "eye-off-outline" : "eye-outline"}
                        color="rgba(255, 255, 255, 0.7)"
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    mode="outlined"
                    style={styles.transparentInput}
                    outlineStyle={styles.inputOutline}
                    theme={{
                      colors: {
                        primary: 'rgba(255, 255, 255, 0.8)',
                        onSurface: 'rgba(255, 255, 255, 0.9)',
                        outline: 'rgba(255, 255, 255, 0.5)',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                    textColor="white"
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon="lock-check-outline" color="rgba(255, 255, 255, 0.7)" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                        color="rgba(255, 255, 255, 0.7)"
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                </View>

                {/* NGO Registration Toggle */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: 'white', marginRight: 8 }}>Registering as NGO?</Text>
                  <Button mode={formData.isNGO ? 'contained' : 'outlined'} onPress={() => setFormData(f => ({ ...f, isNGO: !f.isNGO }))}>
                    {formData.isNGO ? 'Yes' : 'No'}
                  </Button>
                </View>

                {/* NGO Fields */}
                {formData.isNGO && (
                  <>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="NGO Name"
                        value={formData.ngoName}
                        onChangeText={t => handleInputChange('ngoName', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Description"
                        value={formData.ngoDescription}
                        onChangeText={t => handleInputChange('ngoDescription', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Category"
                        value={formData.ngoCategory}
                        onChangeText={t => handleInputChange('ngoCategory', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Contact Email"
                        value={formData.ngoContactEmail}
                        onChangeText={t => handleInputChange('ngoContactEmail', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Contact Phone"
                        value={formData.ngoContactPhone}
                        onChangeText={t => handleInputChange('ngoContactPhone', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                        keyboardType="phone-pad"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Latitude"
                        value={formData.ngoLatitude}
                        onChangeText={t => handleInputChange('ngoLatitude', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputContainer}>
                      <TextInput
                        label="Longitude"
                        value={formData.ngoLongitude}
                        onChangeText={t => handleInputChange('ngoLongitude', t)}
                        mode="outlined"
                        style={styles.transparentInput}
                        outlineStyle={styles.inputOutline}
                        theme={{
                          colors: {
                            primary: 'rgba(255, 255, 255, 0.8)',
                            onSurface: 'rgba(255, 255, 255, 0.9)',
                            outline: 'rgba(255, 255, 255, 0.5)',
                            background: 'rgba(255, 255, 255, 0.1)',
                          }
                        }}
                        textColor="white"
                        keyboardType="numeric"
                      />
                    </View>
                  </>
                )}

                {/* Glowing Register Button */}
                <View style={styles.buttonContainer}>
                  <LinearGradient
                    colors={['#DF6702', '#C2D6D7', '#693720', '#8E5C3C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.gradientButton}
                  >
                    <Button
                      mode="contained"
                      onPress={handleRegister}
                      loading={loading}
                      disabled={!isFormValid() || loading}
                      style={styles.registerButton}
                      contentStyle={styles.buttonContent}
                      labelStyle={styles.buttonLabel}
                      buttonColor="transparent"
                    >
                      {loading ? 'Creating Your Magic...' : 'Create Account'}
                    </Button>
                  </LinearGradient>
                </View>

                {/* Elegant Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <View style={styles.orContainer}>
                    <Text variant="bodyMedium" style={styles.dividerText}>
                      OR
                    </Text>
                  </View>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Login Buttons */}
                <View style={styles.socialContainer}>
                  <View style={styles.socialButton}>
                    <IconButton
                      icon="google"
                      size={28}
                      iconColor="white"
                      onPress={() => console.log('Google login')}
                      style={styles.socialIconButton}
                    />
                  </View>
                  <View style={styles.socialButton}>
                    <IconButton
                      icon="facebook"
                      size={28}
                      iconColor="white"
                      onPress={() => console.log('Facebook login')}
                      style={styles.socialIconButton}
                    />
                  </View>
                  <View style={styles.socialButton}>
                    <IconButton
                      icon="apple"
                      size={28}
                      iconColor="white"
                      onPress={() => console.log('Apple login')}
                      style={styles.socialIconButton}
                    />
                  </View>
                </View>

                {/* Login Link */}
                <View style={styles.loginContainer}>
                  <Text variant="bodyLarge" style={styles.loginText}>
                    Already have an account? 
                  </Text>
                  <Button
                    mode="text"
                    onPress={() => navigation.navigate('SignIn' as never)}
                    compact
                    labelStyle={styles.loginButtonLabel}
                  >
                    Sign In
                  </Button>
                </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.8,
  },
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 0,
    shadowOpacity: 0,
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0  .5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  transparentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputOutline: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  glowingDivider: {
    marginVertical: 24,
    height: 2,
  },
  dividerGradient: {
    height: 2,
    borderRadius: 1,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 24,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  gradientButton: {
    borderRadius: 25,
  },
  registerButton: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 16,
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  socialButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  socialIconButton: {
    margin: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  loginButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;