import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, RefreshControl, Text as RNText } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { Animated } from 'react-native';
import debounce from 'lodash.debounce'; // Install via npm/yarn if needed
import Toast from 'react-native-toast-message'; // Install via npm/yarn if needed
import NetInfo from '@react-native-community/netinfo'; // Install via npm/yarn if needed
import { ngoApi } from '../../api/ngoApi';
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
}

export default function NGOListScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchNGOs();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => unsubscribe();
  }, []);

  const fetchNGOs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ngoApi.listNGOs();
      if (response.ngos) {
        setNgos(response.ngos);
      } else {
        setError('No NGOs found.');
      }
    } catch (err: any) {
      console.error('Error fetching NGOs:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await ngoApi.listNGOs();
            if (retryResponse.ngos) {
              setNgos(retryResponse.ngos);
              handled = true;
            }
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setError('Failed to load NGOs. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNGOs();
  };

  // Debounced search handler
  const debouncedSetSearch = useMemo(() => debounce((query: string) => setSearchQuery(query), 300), []);

  const filteredNgos = useMemo(() => {
    if (!searchQuery.trim()) return ngos;
    const lowerQuery = searchQuery.toLowerCase();
    return ngos.filter(ngo =>
      ngo.name.toLowerCase().includes(lowerQuery) ||
      ngo.city.toLowerCase().includes(lowerQuery) ||
      (ngo.specialization && ngo.specialization.toLowerCase().includes(lowerQuery))
    );
  }, [ngos, searchQuery]);

  if (isOffline) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" accessibilityLabel="Loading NGOs" />
        <Text>Loading NGOs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <Button onPress={fetchNGOs} accessibilityLabel="Retry loading NGOs" accessibilityRole="button">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text variant="headlineMedium" style={styles.title}>NGO Directory</Text>
        <Searchbar
          placeholder="Search NGOs..."
          onChangeText={debouncedSetSearch}
          value={searchQuery}
          style={styles.searchBar}
          accessibilityLabel="Search NGOs by name, city, or specialization"
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredNgos.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                {searchQuery ? 'No NGOs found' : 'No NGOs available'}
              </Text>
              <Text>
                {searchQuery 
                  ? 'Try adjusting your search terms.' 
                  : 'Check back later for registered NGOs.'
                }
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredNgos.map((ngo, index) => (
            <Animated.View
              key={ngo.id}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              }}
            >
              <Card 
                style={styles.ngoCard}
                onPress={() => navigation.navigate('NGODetail', { ngoId: ngo.id })}
                accessibilityLabel={`View details for ${ngo.name}`}
                accessibilityRole="button"
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text variant="titleLarge" style={styles.ngoName}>
                      {ngo.name}
                    </Text>
                    {ngo.is_verified && (
                      <Chip icon="check-circle" mode="flat" style={styles.verifiedChip}>
                        Verified
                      </Chip>
                    )}
                  </View>
                  
                  <Text variant="bodyMedium" style={styles.description} numberOfLines={3}>
                    {ngo.description}
                  </Text>
                  
                  <View style={styles.locationRow}>
                    <Text variant="labelMedium" style={styles.location}>
                      📍 {ngo.city}, {ngo.state}
                    </Text>
                    {ngo.specialization && (
                      <Chip mode="outlined" compact style={styles.specializationChip}>
                        {ngo.specialization}
                      </Chip>
                    )}
                  </View>
                  
                  <View style={styles.contactRow}>
                    <Text variant="labelSmall" style={styles.contact}>
                      📧 {ngo.email}
                    </Text>
                    <Text variant="labelSmall" style={styles.contact}>
                      📞 {ngo.phone}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </Animated.View>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('RegisterNGO')}
        label="Register NGO"
        accessibilityLabel="Register a new NGO"
        accessibilityRole="button"
      />
      <Toast />
    </View>
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    marginBottom: 16,
    color: '#333',
  },
  searchBar: {
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  ngoCard: {
    marginBottom: 16,
    elevation: 3,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ngoName: {
    flex: 1,
    color: '#333',
    fontWeight: 'bold',
  },
  verifiedChip: {
    backgroundColor: '#4ECDC4',
  },
  description: {
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    color: '#666',
  },
  specializationChip: {
    borderColor: '#6C5CE7',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  contact: {
    color: '#999',
  },
  emptyCard: {
    marginTop: 50,
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6C5CE7',
  },
});
