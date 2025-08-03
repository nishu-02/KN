import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl, Text as RNText } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import Toast from 'react-native-toast-message'; // For toasts; install via npm/yarn if needed
import { ngoApi } from '../../api/ngoApi';
import { usersApi } from '../../api/usersApi';
import AuthService from '../../api/authService';

const { width } = Dimensions.get('window');

interface NGO {
  id: number;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  is_verified: boolean;
  specialization?: string;
  website?: string;
  registration_number?: string;
}

export default function NGODetailScreen({ route, navigation }: any) {
  const { ngoId } = route.params;
  const [ngo, setNgo] = useState<NGO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchNGODetail();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNGODetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ngoApi.getNGODetail(ngoId);
      if (response.ngo) {
        setNgo(response.ngo);
      } else {
        setError('NGO details not found.');
      }
    } catch (err: any) {
      console.error('Error fetching NGO detail:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await ngoApi.getNGODetail(ngoId);
            if (retryResponse.ngo) {
              setNgo(retryResponse.ngo);
              handled = true;
            }
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setError('Failed to load NGO details. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ngoId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNGODetail();
  };

  const handleApplyVolunteer = useCallback(async () => {
    if (!ngo) return;
    
    setApplying(true);
    try {
      const response = await usersApi.applyVolunteer(ngo.id);
      if (response.success) {
        Toast.show({ type: 'success', text1: 'Application submitted successfully!' });
      } else {
        Toast.show({ type: 'error', text1: response.error || 'Failed to submit application' });
      }
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Failed to submit application' });
    } finally {
      setApplying(false);
    }
  }, [ngo]);

  const renderContactItem = useMemo(() => (icon: keyof typeof Ionicons.glyphMap, text: string, label: string) => (
    <View style={styles.contactItem}>
      <IconButton icon={icon} size={20} accessibilityLabel={label} />
      <Text variant="bodyMedium" style={styles.contactText}>
        {text}
      </Text>
    </View>
  ), []);

  if (isOffline) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">No internet connection</Text>
        <Text>Please check your network and try again.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" accessibilityLabel="Loading NGO details" />
        <Text>Loading NGO details...</Text>
      </View>
    );
  }

  if (error || !ngo) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">{error || 'NGO not found'}</Text>
        <Button onPress={fetchNGODetail} accessibilityLabel="Retry loading NGO details" accessibilityRole="button">
          Retry
        </Button>
        <Button onPress={() => navigation.goBack()} accessibilityLabel="Go back" accessibilityRole="button">
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.titleSection}>
                <Text variant="headlineMedium" style={styles.ngoName}>
                  {ngo.name}
                </Text>
                {ngo.is_verified && (
                  <Chip icon="check-circle" mode="flat" style={styles.verifiedChip}>
                    Verified NGO
                  </Chip>
                )}
              </View>
            </View>
            
            <View style={styles.locationRow}>
              <Text variant="titleMedium" style={styles.location}>
                📍 {ngo.address}, {ngo.city}, {ngo.state}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>About</Text>
            <Text variant="bodyLarge" style={styles.description}>
              {ngo.description}
            </Text>
            {ngo.specialization && (
              <View style={styles.specializationRow}>
                <Text variant="labelMedium">Specialization: </Text>
                <Chip mode="outlined">{ngo.specialization}</Chip>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Contact Information */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Contact Information</Text>
            
            {renderContactItem("email", ngo.email, "Email")}
            {renderContactItem("phone", ngo.phone, "Phone")}
            
            {ngo.website && (
              renderContactItem("web", ngo.website, "Website")
            )}
            
            {ngo.registration_number && (
              renderContactItem("certificate", `Reg. No: ${ngo.registration_number}`, "Registration number")
            )}
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <Card style={styles.actionCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.sectionTitle}>Get Involved</Text>
            
            <Button
              mode="contained"
              onPress={handleApplyVolunteer}
              loading={applying}
              style={styles.actionButton}
              icon="account-plus"
              accessibilityLabel="Apply as volunteer"
              accessibilityRole="button"
            >
              Apply as Volunteer
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ContactNGO', { ngo })}
              style={styles.actionButton}
              icon="message"
              accessibilityLabel="Contact NGO"
              accessibilityRole="button"
            >
              Contact NGO
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ReportList', { ngoId: ngo.id })}
              style={styles.actionButton}
              icon="file-document"
              accessibilityLabel="View reports"
              accessibilityRole="button"
            >
              View Reports
            </Button>
          </Card.Content>
        </Card>
      </Animated.View>
      <Toast /> {/* Add at root level in your app if not already */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  ngoName: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  verifiedChip: {
    backgroundColor: '#4ECDC4',
    alignSelf: 'flex-start',
  },
  locationRow: {
    marginTop: 8,
  },
  location: {
    color: '#666',
  },
  sectionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    color: '#333',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  specializationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    flex: 1,
    color: '#666',
  },
  actionCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 32,
    elevation: 2,
  },
  actionButton: {
    marginBottom: 12,
  },
});
