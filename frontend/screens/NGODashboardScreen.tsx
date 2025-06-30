import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, Card, Button, List, Divider } from 'react-native-paper';

export default function NGODashboardScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>
        NGO Dashboard
      </Text>

      <Card style={styles.card}>
        <Card.Title title="📍 Rescue Case Manager" />
        <Card.Content>
          <Text>
            View and assign active rescue cases in your operational zone.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained-tonal" onPress={() => {}}>
            Manage Cases
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="👥 Volunteer Panel" />
        <Card.Content>
          <Text>
            Review applications, assign cases, and track volunteer activity.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained-tonal" onPress={() => {}}>
            View Volunteers
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="💰 Donations" />
        <Card.Content>
          <Text>
            Launch fundraisers, track donations, and generate transparency reports.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained-tonal" onPress={() => {}}>
            Manage Fundraisers
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="📊 Reports & Analytics" />
        <Card.Content>
          <Text>
            View performance insights and export monthly impact reports.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained-tonal" onPress={() => {}}>
            View Reports
          </Button>
        </Card.Actions>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="⚙️ Settings & NGO Info" />
        <Card.Content>
          <Text>
            Update your NGO profile, manage teams, and configure location radius.
          </Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained-tonal" onPress={() => {}}>
            NGO Settings
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
  },
});
