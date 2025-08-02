import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { Text, Card, Searchbar, Chip, ActivityIndicator, FAB } from 'react-native-paper';
import { Animated } from 'react-native';
import { ngoApi } from '../../api/ngoApi';

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
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [filteredNgos, setFilteredNgos] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    fetchNGOs();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    filterNGOs();
  }, [searchQuery, ngos]);

  const fetchNGOs = async () => {
    try {
      const response = await ngoApi.listNGOs();
      if (response.ngos) {
        setNgos(response.ngos);
      }
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterNGOs = () => {
    if (!searchQuery.trim()) {
      setFilteredNgos(ngos);
      return;
    }

    const filtered = ngos.filter(ngo =>
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredNgos(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNGOs();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading NGOs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <Text variant="headlineMedium" style={styles.title}>NGO Directory</Text>
        <Searchbar
          placeholder="Search NGOs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
      />
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
