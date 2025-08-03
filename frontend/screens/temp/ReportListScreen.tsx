import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card, Text, Button, Avatar, Searchbar } from 'react-native-paper';
import { reportsApi } from '../../api/reportsApi';
import { useNavigation } from '@react-navigation/native';

export default function ReportListScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async (query = '') => {
    setLoading(true);
    try {
      const data = await reportsApi.listReports(query ? { search: query } : {});
      setReports(data.results || []);
    } catch (e) {
      setReports([]);
    }
    setLoading(false);
  };

  const onSearch = () => fetchReports(search);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Reports"
        value={search}
        onChangeText={setSearch}
        onIconPress={onSearch}
        style={styles.searchbar}
      />
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={item => item.report_id || item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate('ReportDetail', { id: item.report_id || item.id })}>
              <Card style={styles.card}>
                <Card.Title
                  title={item.title || 'Animal Rescue Report'}
                  subtitle={item.species || 'Unknown Species'}
                  left={props => <Avatar.Text {...props} label={item.species?.[0] || '?'} />}
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
