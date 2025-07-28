import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Modal,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  Searchbar,
  IconButton,
  Divider,
  Badge,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from '../../theme';

const ngoData = [
  {
    id: "1",
    image: "https://give.do/blog/wp-content/uploads/2023/12/Healing-paws-the-mission-of-an-animal-NGO-in-India-to-rescue-stray-dogs-from-cruelty-Give-blog.png",
    name: "Paw Protectors NGO",
    description: "Dedicated to rescuing and rehabilitating stray animals with a focus on urban areas. We provide emergency medical care, shelter, and adoption services.",
    distance: "2.5 km",
    status: "Available",
    specialization: ["Dogs", "Medical", "Adoption"],
    responseTime: "15 mins",
    successRate: "90%",
    rating: 4.6,
    reviews: 32,
    contact: "+91 98765 43210",
    email: "info@pawprotectors.org",
    address: "123 Animal Care Lane, Delhi",
    operatingHours: "24/7 Emergency",
    teamSize: 15,
    certifications: ["ISO 9001", "Animal Welfare Board"],
    recentActivities: [
      "Rescued 25 dogs this month",
      "Completed vaccination drive",
      "Found homes for 12 puppies"
    ],
    stats: {
      animalsRescued: 1250,
      successfulAdoptions: 890,
      emergencyCalls: 45,
      volunteers: 25
    },
    urgent: false,
    verified: true,
  },
  {
    id: "2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkzs6FL_tjvAVoPzWvbuexa7Veicr4G-XqO28rzu-IlE8uiKA-lFC9ymbE03HbfSIzLRY",
    name: "Hope for Paws",
    description: "Focused on emergency rescues and sheltering animals in critical conditions. Specialized in trauma care and rehabilitation.",
    distance: "5.1 km",
    status: "Emergency-only",
    specialization: ["Cats", "Critical Care", "Trauma"],
    responseTime: "22 mins",
    successRate: "87%",
    rating: 4.8,
    reviews: 48,
    contact: "+91 98765 43211",
    email: "emergency@hopeforpaws.org",
    address: "456 Rescue Road, Mumbai",
    operatingHours: "24/7 Emergency",
    teamSize: 12,
    certifications: ["Emergency Response", "Veterinary Care"],
    recentActivities: [
      "Emergency surgery on injured cat",
      "Trauma care for hit-and-run victim",
      "Rehabilitation program success"
    ],
    stats: {
      animalsRescued: 890,
      successfulAdoptions: 567,
      emergencyCalls: 78,
      volunteers: 18
    },
    urgent: true,
    verified: true,
  },
  {
    id: "3",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfduRrwM-6wCp2z9LA_fTdF95v258HhdxaDzB44LHfnmrEFwlCwb61YL4mcEdRoycJ5ao",
    name: "Animal Aid Unlimited",
    description: "Providing veterinary aid and rescue services to birds and large animals. Specialized in wildlife rehabilitation and conservation.",
    distance: "7.8 km",
    status: "Busy",
    specialization: ["Birds", "Large Animals", "Medical", "Wildlife"],
    responseTime: "40 mins",
    successRate: "93%",
    rating: 4.9,
    reviews: 67,
    contact: "+91 98765 43212",
    email: "aid@animalaidunlimited.org",
    address: "789 Wildlife Way, Bangalore",
    operatingHours: "6 AM - 10 PM",
    teamSize: 20,
    certifications: ["Wildlife License", "Conservation Award"],
    recentActivities: [
      "Released 5 rehabilitated birds",
      "Treated injured cow",
      "Wildlife awareness program"
    ],
    stats: {
      animalsRescued: 2100,
      successfulAdoptions: 1200,
      emergencyCalls: 34,
      volunteers: 35
    },
    urgent: false,
    verified: true,
  },
  {
    id: "4",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-8XeubbWjvWPFpml9ElUu9H74aal0LBkpzICWcoX-l6Zs8vhy-fgkkJqsKVZVfru34Lc",
    name: "Street Animal Care",
    description: "Community-driven initiative focusing on street animals. Providing food, basic medical care, and sterilization programs.",
    distance: "1.2 km",
    status: "Available",
    specialization: ["Community Care", "Sterilization", "Feeding"],
    responseTime: "8 mins",
    successRate: "85%",
    rating: 4.4,
    reviews: 23,
    contact: "+91 98765 43213",
    email: "care@streetanimal.org",
    address: "321 Community Street, Chennai",
    operatingHours: "7 AM - 9 PM",
    teamSize: 8,
    certifications: ["Community Service"],
    recentActivities: [
      "Daily feeding program",
      "Sterilization drive completed",
      "Community awareness session"
    ],
    stats: {
      animalsRescued: 450,
      successfulAdoptions: 200,
      emergencyCalls: 12,
      volunteers: 15
    },
    urgent: false,
    verified: false,
  },
];

export default function NGOListScreen() {
  const { theme } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const availableFilters = ["Dogs", "Cats", "Birds", "Large Animals", "Medical", "Critical Care", "Adoption", "Wildlife"];
  
  
  const filteredNGOs = ngoData.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
  (selectedFilters.length === 0 || selectedFilters.every(filter => ngo.specialization.includes(filter)))
);


  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);


  const renderItem = ({ item }: { item: typeof ngoData[0] }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Card style={[styles(theme).card, theme.cardShadow, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]} mode="elevated">
            <View style={styles(theme).imageContainer}>
              <Card.Cover source={{ uri: item.image }} style={styles(theme).cardImage} />
              {item.urgent && (
                <View style={styles(theme).urgentBadge}>
                  <Text style={styles(theme).urgentText}>URGENT</Text>
                </View>
              )}
              {item.verified && (
                <View style={styles(theme).verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                </View>
              )}
            </View>
            
            <Card.Content>
              <View style={styles(theme).headerRow}>
                <Text variant="titleLarge" style={[styles(theme).title, { color: theme.colors.text }]}>{item.name}</Text>
                <View style={styles(theme).ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={[styles(theme).rating, { color: theme.colors.text }]}>{item.rating}</Text>
                </View>
              </View>
              
              <Text style={[styles(theme).description, { color: theme.colors.subtext }]}>{item.description}</Text>
              
              <View style={styles(theme).statsRow}>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{item.stats.animalsRescued}</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Rescued</Text>
                </View>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{item.stats.successfulAdoptions}</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Adopted</Text>
                </View>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{item.stats.volunteers}</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Volunteers</Text>
                </View>
              </View>
              
              <View style={styles(theme).rowSpaceBetween}>
                <View style={styles(theme).distanceContainer}>
                  <Ionicons name="location-outline" size={16} color={theme.colors.subtext} />
                  <Text style={[styles(theme).textMuted, { color: theme.colors.subtext }]}>{item.distance}</Text>
                </View>
                <Chip style={[styles(theme).statusChip, getStatusColor(item.status, theme)]} textStyle={{ color: theme.colors.text }}>{item.status}</Chip>
              </View>
              
              <View style={styles(theme).tagRow}>
                {item.specialization.map((tag, i) => (
                  <Chip key={i} style={[styles(theme).tag, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]} textStyle={[styles(theme).tagText, { color: theme.colors.primary }]}>{tag}</Chip>
                ))}
              </View>
              
              <Divider style={styles(theme).divider} />
              
              <View style={styles(theme).contactRow}>
                <View style={styles(theme).contactItem}>
                  <Ionicons name="call-outline" size={14} color={theme.colors.subtext} />
                  <Text style={[styles(theme).contactText, { color: theme.colors.subtext }]}>{item.contact}</Text>
                </View>
                <View style={styles(theme).contactItem}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.subtext} />
                  <Text style={[styles(theme).contactText, { color: theme.colors.subtext }]}>{item.operatingHours}</Text>
                </View>
              </View>
              
              <View style={styles(theme).recentActivities}>
                <Text style={[styles(theme).sectionTitle, { color: theme.colors.text }]}>Recent Activities:</Text>
                {item.recentActivities.slice(0, 2).map((activity, index) => (
                  <View key={index} style={styles(theme).activityItem}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={theme.colors.primary} />
                    <Text style={[styles(theme).activityText, { color: theme.colors.subtext }]}>{activity}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles(theme).actionRow}>
                <Button mode="outlined" style={styles(theme).button} textColor={theme.colors.primary} icon="phone">Call</Button>
                <Button mode="outlined" style={styles(theme).button} textColor={theme.colors.primary} icon="account-plus">Volunteer</Button>
                <Button mode="contained" buttonColor={theme.colors.primary} textColor={theme.colors.card} style={styles(theme).button} icon="heart">Donate</Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getStatusColor = (status: string, theme: any) => {
    switch (status.toLowerCase()) {
      case "available": return { backgroundColor: theme.colors.low };
      case "busy": return { backgroundColor: theme.colors.high };
      case "emergency-only": return { backgroundColor: theme.colors.critical };
      default: return { backgroundColor: theme.colors.accent };
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <View style={[styles(theme).container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.card, theme.colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles(theme).header}
      >
        <View style={styles(theme).headerContent}>
          <Text style={[styles(theme).karunaTitle, { color: theme.colors.primary }]}>NGOs Listing</Text>
          <IconButton
            icon="filter"
            iconColor={theme.colors.primary}
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>
        <Searchbar
          placeholder="Search NGOs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles(theme).searchBarExpanded, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]}
          iconColor={theme.colors.primary}
          inputStyle={{ color: theme.colors.text }}
        />
      </LinearGradient>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles(theme).modalContainer}>
          <View style={[styles(theme).modalContent, { backgroundColor: theme.colors.card }]}>
            <Text variant="titleLarge" style={[styles(theme).modalTitle, { color: theme.colors.primary }]}>Filter NGOs</Text>
            <View style={styles(theme).filterRow}>
              {availableFilters.map((filter) => (
                <Chip
                  key={filter}
                  style={[
                    styles(theme).filterChip,
                    { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary },
                    selectedFilters.includes(filter) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  textStyle={[styles(theme).filterChipText, { color: theme.colors.text }]}
                  onPress={() => toggleFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
            </View>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.card}
              style={styles(theme).modalButton}
              onPress={() => setFilterModalVisible(false)}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>

      {/* NGO Cards */}
      <FlatList
        data={filteredNGOs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles(theme).listContent}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: theme.spacing.margin * 2,
  },
  header: {
    paddingHorizontal: theme.spacing.padding,
    paddingTop: 40,
    paddingBottom: theme.spacing.padding - 2,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    elevation: 8,
    zIndex: 10,
    backgroundColor: theme.colors.tabBackground1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  karunaTitle: {
    fontWeight: "bold",
    fontSize: 28,
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  searchBarExpanded: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    height: 48,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    borderWidth: 1,
  },
  filterChipText: {
    fontWeight: "500",
  },
  modalButton: {
    borderRadius: 8,
  },
  listContent: {
    padding: theme.spacing.padding,
    paddingBottom: theme.spacing.margin * 2.5,
  },
  card: {
    marginBottom: theme.spacing.margin,
    borderRadius: theme.spacing.radius,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: theme.spacing.radius,
    borderTopRightRadius: theme.spacing.radius,
  },
  urgentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  title: {
    fontWeight: "bold",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
  },
  statusChip: {
    borderRadius: 8,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: theme.colors.accent,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactText: {
    fontSize: 12,
    marginLeft: 4,
  },
  recentActivities: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 12,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  textMuted: {
    fontSize: 14,
    marginBottom: 4,
  },
});