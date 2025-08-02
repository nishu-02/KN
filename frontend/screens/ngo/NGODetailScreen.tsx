import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { Animated } from 'react-native';
import { ngoApi } from '../../api/ngoApi';
import { usersApi } from '../../api/usersApi';

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
  const [applying, setApplying] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchNGODetail();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchNGODetail = async () => {
    try {
      const response = await ngoApi.getNGODetail(ngoId);
      if (response.ngo) {
        setNgo(response.ngo);
      }
    } catch (error) {
      console.error('Error fetching NGO detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVolunteer = async () => {
    if (!ngo) return;
    
    setApplying(true);
    try {
      const response = await usersApi.applyVolunteer(ngo.id);
      if (response.success) {
        alert('Application submitted successfully!');
      } else {
        alert(response.error || 'Failed to submit application');
      }
    } catch (error) {
      alert('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading NGO details...</Text>
      </View>
    );
  }

  if (!ngo) {
    return (
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall">NGO not found</Text>
        <Button onPress={() => navigation.goBack()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
            
            <View style={styles.contactItem}>
              <IconButton icon="email" size={20} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {ngo.email}
              </Text>
            </View>
            
            <View style={styles.contactItem}>
              <IconButton icon="phone" size={20} />
              <Text variant="bodyMedium" style={styles.contactText}>
                {ngo.phone}
              </Text>
            </View>
            
            {ngo.website && (
              <View style={styles.contactItem}>
                <IconButton icon="web" size={20} />
                <Text variant="bodyMedium" style={styles.contactText}>
                  {ngo.website}
                </Text>
              </View>
            )}
            
            {ngo.registration_number && (
              <View style={styles.contactItem}>
                <IconButton icon="certificate" size={20} />
                <Text variant="bodyMedium" style={styles.contactText}>
                  Reg. No: {ngo.registration_number}
                </Text>
              </View>
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
            >
              Apply as Volunteer
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ContactNGO', { ngo })}
              style={styles.actionButton}
              icon="message"
            >
              Contact NGO
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('ReportList', { ngoId: ngo.id })}
              style={styles.actionButton}
              icon="file-document"
            >
              View Reports
            </Button>
          </Card.Content>
        </Card>
      </Animated.View>
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
