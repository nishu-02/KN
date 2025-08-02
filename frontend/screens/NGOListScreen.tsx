import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Searchbar, Avatar } from 'react-native-paper';
import { ngoApi } from '../../api/ngoApi';
import { useNavigation } from '@react-navigation/native';

export default function NGOListScreen() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async (query = '') => {
    setLoading(true);
    try {
      const data = await ngoApi.listNGOs(query ? { search: query } : {});
      setNgos(data.results || []);
    } catch (e) {
      setNgos([]);
    }
    setLoading(false);
  };

  const onSearch = () => fetchNGOs(search);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search NGOs"
        value={search}
        onChangeText={setSearch}
        onIconPress={onSearch}
        style={styles.searchbar}
      />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={ngos}
          keyExtractor={item => item.ngo_id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('NGODetail', { id: item.ngo_id || item.id })}>
              <Card style={styles.card}>
                <Card.Title
                  title={item.name}
                  subtitle={item.category}
                  left={props => <Avatar.Text {...props} label={item.name?.[0] || '?'} />}
                />
                <Card.Content>
                  <Text>{item.description}</Text>
                  <Text style={styles.location}>{item.location}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  searchbar: { marginBottom: 10 },
  card: { marginBottom: 12, borderRadius: 16, elevation: 2 },
  location: { color: '#888', marginTop: 4 },
});
