import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Provider as PaperProvider,
  MD3LightTheme,
  Appbar,
  Card,
  Text,
  Button,
  Chip,
  Avatar,
  List,
  FAB,
  IconButton,
  Surface,
  Divider,
  Badge,
  ProgressBar,
  DataTable,
  Menu,
  Portal,
  Modal,
  TextInput,
  Switch,
} from 'react-native-paper';

const { width } = Dimensions.get('window');

// Custom theme with cream and brown colors
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8B4513', // Saddle Brown
    secondary: '#D2B48C', // Tan
    tertiary: '#A0522D', // Sienna
    surface: '#FFF8DC', // Cornsilk
    background: '#FFFDD0', // Cream
    onSurface: '#5D4037', // Brown
    onBackground: '#5D4037',
    surfaceVariant: '#F5DEB3', // Wheat
    outline: '#8B7355',
    primaryContainer: '#DDBEA9',
    secondaryContainer: '#F4E5D3',
    error: '#B71C1C',
    onError: '#FFFFFF',
  },
};

// Mock data
const mockCases = [
  {
    id: 1,
    title: 'Animal Rescue - Injured Dog',
    location: 'Central Park, NY',
    urgency: 'High',
    status: 'Active',
    timestamp: '2 hours ago',
    contact: '+1-555-0123',
    lat: 40.7831,
    lng: -73.9712,
  },
  {
    id: 2,
    title: 'Cat Stuck in Tree',
    location: 'Brooklyn Bridge, NY',
    urgency: 'Medium',
    status: 'Assigned',
    timestamp: '4 hours ago',
    contact: '+1-555-0456',
    lat: 40.7061,
    lng: -73.9969,
  },
  {
    id: 3,
    title: 'Stray Dog Feeding',
    location: 'Times Square, NY',
    urgency: 'Low',
    status: 'Resolved',
    timestamp: '1 day ago',
    contact: '+1-555-0789',
    lat: 40.7580,
    lng: -73.9855,
  },
];

const mockVolunteers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@email.com',
    phone: '+1-555-0101',
    area: 'Manhattan',
    status: 'Active',
    casesHandled: 15,
    joinDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike@email.com',
    phone: '+1-555-0202',
    area: 'Brooklyn',
    status: 'Pending',
    casesHandled: 0,
    joinDate: '2024-07-01',
  },
];

const mockDonations = [
  {
    id: 1,
    donor: 'Animal Lovers Foundation',
    amount: 5000,
    date: '2024-07-01',
    purpose: 'Medical supplies',
  },
  {
    id: 2,
    donor: 'John Doe',
    amount: 250,
    date: '2024-06-28',
    purpose: 'General fund',
  },
];

const NGOAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [newFundraiser, setNewFundraiser] = useState({
    title: '',
    target: '',
    description: '',
  });

  const SideNavigation = () => (
    <Surface style={styles.sidebar}>
      <View style={styles.profileSection}>
        <Avatar.Image
          size={80}
          source={{
            uri: 'https://via.placeholder.com/80x80/8B4513/FFFFFF?text=NGO',
          }}
        />
        <Text variant="titleMedium" style={styles.profileName}>
          Animal Rescue NGO
        </Text>
        <Text variant="bodySmall" style={styles.profileEmail}>
          rescue@animalngo.org
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <List.Section>
        <List.Item
          title="Map Dashboard"
          left={(props) => <List.Icon {...props} icon="map" />}
          onPress={() => setActiveTab('map')}
          style={activeTab === 'map' ? styles.activeNavItem : styles.navItem}
        />
        <List.Item
          title="Volunteer Management"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          onPress={() => setActiveTab('volunteers')}
          style={activeTab === 'volunteers' ? styles.activeNavItem : styles.navItem}
        />
        <List.Item
          title="Donations Panel"
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          onPress={() => setActiveTab('donations')}
          style={activeTab === 'donations' ? styles.activeNavItem : styles.navItem}
        />
        <List.Item
          title="Reports & Analytics"
          left={(props) => <List.Icon {...props} icon="chart-line" />}
          onPress={() => setActiveTab('reports')}
          style={activeTab === 'reports' ? styles.activeNavItem : styles.navItem}
        />
        <List.Item
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog" />}
          onPress={() => setActiveTab('settings')}
          style={activeTab === 'settings' ? styles.activeNavItem : styles.navItem}
        />
      </List.Section>
      
      <View style={styles.sidebarFooter}>
        <Button
          mode="outlined"
          onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?')}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
    </Surface>
  );

  const MapDashboard = () => (
    <ScrollView style={styles.content}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Active Rescue Cases
      </Text>
      
      <Surface style={styles.mapPlaceholder}>
        <Text variant="bodyLarge" style={styles.mapText}>
          🗺️ Interactive Map View
        </Text>
        <Text variant="bodySmall" style={styles.mapSubtext}>
          Map integration would show pins for active cases
        </Text>
      </Surface>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Recent Cases
      </Text>
      
      {mockCases.map((case_) => (
        <Card key={case_.id} style={styles.caseCard}>
          <Card.Content>
            <View style={styles.caseHeader}>
              <Text variant="titleMedium">{case_.title}</Text>
              <Chip
                mode="flat"
                style={[
                  styles.urgencyChip,
                  {
                    backgroundColor:
                      case_.urgency === 'High'
                        ? theme.colors.error
                        : case_.urgency === 'Medium'
                        ? '#FF9800'
                        : theme.colors.primary,
                  },
                ]}
                textStyle={{ color: 'white' }}
              >
                {case_.urgency}
              </Chip>
            </View>
            
            <Text variant="bodyMedium" style={styles.caseLocation}>
              📍 {case_.location}
            </Text>
            <Text variant="bodySmall" style={styles.caseTime}>
              ⏰ {case_.timestamp}
            </Text>
            <Text variant="bodySmall" style={styles.caseContact}>
              📞 {case_.contact}
            </Text>
          </Card.Content>
          
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => Alert.alert('Case Accepted', `Case ${case_.id} accepted`)}
              disabled={case_.status === 'Resolved'}
            >
              {case_.status === 'Active' ? 'Accept' : case_.status}
            </Button>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('Assign Volunteer', 'Select volunteer to assign')}
            >
              Assign
            </Button>
            {case_.status !== 'Resolved' && (
              <Button
                mode="text"
                onPress={() => Alert.alert('Mark Resolved', `Mark case ${case_.id} as resolved?`)}
              >
                Resolve
              </Button>
            )}
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );

  const VolunteerManagement = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerActions}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Volunteer Management
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => Alert.alert('Add Volunteer', 'Add new volunteer form')}
        >
          Add Volunteer
        </Button>
      </View>
      
      {mockVolunteers.map((volunteer) => (
        <Card key={volunteer.id} style={styles.volunteerCard}>
          <Card.Content>
            <View style={styles.volunteerHeader}>
              <Avatar.Text
                size={50}
                label={volunteer.name.split(' ').map(n => n[0]).join('')}
                style={styles.volunteerAvatar}
              />
              <View style={styles.volunteerInfo}>
                <Text variant="titleMedium">{volunteer.name}</Text>
                <Text variant="bodySmall">{volunteer.email}</Text>
                <Text variant="bodySmall">{volunteer.phone}</Text>
                <Text variant="bodySmall">Area: {volunteer.area}</Text>
              </View>
              <View style={styles.volunteerStats}>
                <Chip
                  mode="flat"
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        volunteer.status === 'Active'
                          ? theme.colors.primary
                          : '#FF9800',
                    },
                  ]}
                  textStyle={{ color: 'white' }}
                >
                  {volunteer.status}
                </Chip>
                <Text variant="bodySmall" style={styles.statText}>
                  Cases: {volunteer.casesHandled}
                </Text>
              </View>
            </View>
          </Card.Content>
          
          <Card.Actions>
            <Button
              mode="outlined"
              onPress={() => Alert.alert('View Details', `Details for ${volunteer.name}`)}
            >
              View Details
            </Button>
            {volunteer.status === 'Pending' && (
              <>
                <Button
                  mode="contained"
                  onPress={() => Alert.alert('Accept', `Accept ${volunteer.name}?`)}
                >
                  Accept
                </Button>
                <Button
                  mode="text"
                  onPress={() => Alert.alert('Reject', `Reject ${volunteer.name}?`)}
                >
                  Reject
                </Button>
              </>
            )}
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );

  const DonationsPanel = () => (
    <ScrollView style={styles.content}>
      <View style={styles.headerActions}>
        <Text variant="headlineSmall" style={styles.sectionTitle}>
          Donations & Fundraising
        </Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => setModalVisible(true)}
        >
          New Fundraiser
        </Button>
      </View>
      
      <View style={styles.donationStats}>
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statNumber}>
              $25,750
            </Text>
            <Text variant="bodyMedium">Total Raised</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.statNumber}>
              156
            </Text>
            <Text variant="bodyMedium">Donors</Text>
          </Card.Content>
        </Card>
      </View>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Active Fundraisers
      </Text>
      
      <Card style={styles.fundraiserCard}>
        <Card.Content>
          <Text variant="titleMedium">Emergency Medical Fund</Text>
          <Text variant="bodySmall" style={styles.fundraiserDesc}>
            Urgent medical supplies for rescued animals
          </Text>
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={0.65}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text variant="bodySmall">$6,500 / $10,000 (65%)</Text>
          </View>
        </Card.Content>
      </Card>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Recent Donations
      </Text>
      
      {mockDonations.map((donation) => (
        <Card key={donation.id} style={styles.donationCard}>
          <Card.Content>
            <View style={styles.donationHeader}>
              <View>
                <Text variant="titleMedium">{donation.donor}</Text>
                <Text variant="bodySmall">{donation.date}</Text>
                <Text variant="bodySmall">Purpose: {donation.purpose}</Text>
              </View>
              <Text variant="titleLarge" style={styles.donationAmount}>
                ${donation.amount}
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );

  const ReportsAnalytics = () => (
    <ScrollView style={styles.content}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Reports & Analytics
      </Text>
      
      <View style={styles.analyticsGrid}>
        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.analyticsNumber}>
              142
            </Text>
            <Text variant="bodyMedium">Total Cases</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.analyticsNumber}>
              89%
            </Text>
            <Text variant="bodyMedium">Success Rate</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.analyticsNumber}>
              2.3h
            </Text>
            <Text variant="bodyMedium">Avg Response</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.analyticsCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.analyticsNumber}>
              23
            </Text>
            <Text variant="bodyMedium">Active Volunteers</Text>
          </Card.Content>
        </Card>
      </View>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Monthly Reports
      </Text>
      
      <Card style={styles.reportCard}>
        <Card.Content>
          <Text variant="titleMedium">June 2024 Report</Text>
          <Text variant="bodySmall" style={styles.reportDate}>
            Generated on July 1, 2024
          </Text>
          <View style={styles.reportStats}>
            <Text variant="bodySmall">• 35 cases handled</Text>
            <Text variant="bodySmall">• 31 successful rescues</Text>
            <Text variant="bodySmall">• $3,450 donations received</Text>
            <Text variant="bodySmall">• 4 new volunteers joined</Text>
          </View>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Download', 'PDF report downloaded')}
          >
            Download PDF
          </Button>
          <Button
            mode="text"
            onPress={() => Alert.alert('Share', 'Share report options')}
          >
            Share
          </Button>
        </Card.Actions>
      </Card>
      
      <Button
        mode="contained"
        icon="export"
        onPress={() => Alert.alert('Export Data', 'Export data for grants/government')}
        style={styles.exportButton}
      >
        Export All Data
      </Button>
    </ScrollView>
  );

  const Settings = () => (
    <ScrollView style={styles.content}>
      <Text variant="headlineSmall" style={styles.sectionTitle}>
        Settings
      </Text>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        NGO Details
      </Text>
      
      <Card style={styles.settingsCard}>
        <Card.Content>
          <TextInput
            label="NGO Name"
            value="Animal Rescue NGO"
            mode="outlined"
            style={styles.settingsInput}
          />
          <TextInput
            label="Email"
            value="rescue@animalngo.org"
            mode="outlined"
            style={styles.settingsInput}
          />
          <TextInput
            label="Phone"
            value="+1-555-RESCUE"
            mode="outlined"
            style={styles.settingsInput}
          />
          <TextInput
            label="Address"
            value="123 Animal Street, NY 10001"
            mode="outlined"
            multiline
            style={styles.settingsInput}
          />
        </Card.Content>
      </Card>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Team Permissions
      </Text>
      
      <Card style={styles.settingsCard}>
        <List.Item
          title="Admin Access"
          description="Full system access"
          left={(props) => <List.Icon {...props} icon="shield-account" />}
          right={() => <Switch value={true} />}
        />
        <List.Item
          title="Volunteer Coordinator"
          description="Manage volunteers and assignments"
          left={(props) => <List.Icon {...props} icon="account-group" />}
          right={() => <Switch value={true} />}
        />
        <List.Item
          title="Financial Manager"
          description="Handle donations and expenses"
          left={(props) => <List.Icon {...props} icon="currency-usd" />}
          right={() => <Switch value={false} />}
        />
      </Card>
      
      <Text variant="titleMedium" style={styles.subsectionTitle}>
        Payment Integration
      </Text>
      
      <Card style={styles.settingsCard}>
        <List.Item
          title="Bank Account"
          description="Connect your bank account"
          left={(props) => <List.Icon {...props} icon="bank" />}
          right={() => <Button mode="outlined">Connect</Button>}
        />
        <List.Item
          title="UPI Integration"
          description="Enable UPI payments"
          left={(props) => <List.Icon {...props} icon="qrcode" />}
          right={() => <Button mode="outlined">Setup</Button>}
        />
      </Card>
      
      <Button
        mode="contained"
        icon="content-save"
        onPress={() => Alert.alert('Settings', 'Settings saved successfully')}
        style={styles.saveButton}
      >
        Save Settings
      </Button>
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <MapDashboard />;
      case 'volunteers':
        return <VolunteerManagement />;
      case 'donations':
        return <DonationsPanel />;
      case 'reports':
        return <ReportsAnalytics />;
      case 'settings':
        return <Settings />;
      default:
        return <MapDashboard />;
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.Action
            icon="menu"
            onPress={() => setSidebarOpen(!sidebarOpen)}
          />
          <Appbar.Content title="NGO Admin Dashboard" />
          <Appbar.Action
            icon="bell"
            onPress={() => Alert.alert('Notifications', 'No new notifications')}
          />
        </Appbar.Header>
        
        <View style={styles.main}>
          {sidebarOpen && <SideNavigation />}
          <View style={[styles.contentContainer, { marginLeft: sidebarOpen ? 280 : 0 }]}>
            {renderContent()}
          </View>
        </View>
        
        <Portal>
          <Modal
            visible={modalVisible}
            onDismiss={() => setModalVisible(false)}
            contentContainerStyle={styles.modalContainer}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Create New Fundraiser
            </Text>
            <TextInput
              label="Fundraiser Title"
              value={newFundraiser.title}
              onChangeText={(text) => setNewFundraiser({...newFundraiser, title: text})}
              mode="outlined"
              style={styles.modalInput}
            />
            <TextInput
              label="Target Amount ($)"
              value={newFundraiser.target}
              onChangeText={(text) => setNewFundraiser({...newFundraiser, target: text})}
              mode="outlined"
              keyboardType="numeric"
              style={styles.modalInput}
            />
            <TextInput
              label="Description"
              value={newFundraiser.description}
              onChangeText={(text) => setNewFundraiser({...newFundraiser, description: text})}
              mode="outlined"
              multiline
              style={styles.modalInput}
            />
            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setModalVisible(false)}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={() => {
                  Alert.alert('Success', 'Fundraiser created successfully');
                  setModalVisible(false);
                  setNewFundraiser({title: '', target: '', description: ''});
                }}
              >
                Create
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDD0',
  },
  header: {
    backgroundColor: '#8B4513',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: '#FFF8DC',
    elevation: 4,
    zIndex: 1000,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F5DEB3',
  },
  profileName: {
    marginTop: 10,
    color: '#5D4037',
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#8B7355',
    marginTop: 4,
  },
  divider: {
    backgroundColor: '#8B7355',
    height: 1,
    marginVertical: 10,
  },
  navItem: {
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#DDBEA9',
    paddingVertical: 8,
  },
  sidebarFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  logoutButton: {
    borderColor: '#8B4513',
  },
  contentContainer: {
    flex: 1,
    transition: 'margin-left 0.3s ease',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#5D4037',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  subsectionTitle: {
    color: '#5D4037',
    marginTop: 20,
    marginBottom: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F5DEB3',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  mapText: {
    color: '#5D4037',
    fontSize: 24,
    marginBottom: 8,
  },
  mapSubtext: {
    color: '#8B7355',
  },
  caseCard: {
    marginBottom: 12,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgencyChip: {
    height: 28,
  },
  caseLocation: {
    marginBottom: 4,
    color: '#5D4037',
  },
  caseTime: {
    marginBottom: 4,
    color: '#8B7355',
  },
  caseContact: {
    color: '#8B7355',
  },
  volunteerCard: {
    marginBottom: 12,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  volunteerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volunteerAvatar: {
    marginRight: 16,
    backgroundColor: '#8B4513',
  },
  volunteerInfo: {
    flex: 1,
  },
  volunteerStats: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 28,
    marginBottom: 4,
  },
  statText: {
    color: '#8B7355',
  },
  donationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 8,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  statNumber: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  fundraiserCard: {
    marginBottom: 20,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  fundraiserDesc: {
    marginBottom: 12,
    color: '#8B7355',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  donationCard: {
    marginBottom: 12,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  donationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  donationAmount: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  analyticsCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  analyticsNumber: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  reportCard: {
    marginBottom: 20,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  reportDate: {
    color: '#8B7355',
    marginBottom: 12,
  },
  reportStats: {
    marginTop: 8,
  },
  exportButton: {
    marginTop: 20,
  },
  settingsCard: {
    marginBottom: 20,
    backgroundColor: '#FFF8DC',
    elevation: 2,
  },
  settingsInput: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 20,
  },
  modalContainer: {
    backgroundColor: '#FFF8DC',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    color: '#5D4037',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default NGOAdminDashboard;