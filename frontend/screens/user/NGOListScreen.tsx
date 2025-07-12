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
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ngoData = [
  {
    id: "1",
    image: "https://give.do/blog/wp-content/uploads/2023/12/Healing-paws-the-mission-of-an-animal-NGO-in-India-to-rescue-stray-dogs-from-cruelty-Give-blog.png",
    name: "Paw Protectors NGO",
    description: "Dedicated to rescuing and rehabilitating stray animals with a focus on urban areas.",
    distance: "2.5 km",
    status: "Available",
    specialization: ["Dogs", "Medical"],
    responseTime: "15 mins",
    successRate: "90%",
    rating: 4.6,
    reviews: 32,
  },
  {
    id: "2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkzs6FL_tjvAVoPzWvbuexa7Veicr4G-XqO28rzu-IlE8uiKA-lFC9ymbE03HbfSIzLRY",
    name: "Hope for Paws",
    description: "Focused on emergency rescues and sheltering animals in critical conditions.",
    distance: "5.1 km",
    status: "Emergency-only",
    specialization: ["Cats", "Critical Care"],
    responseTime: "22 mins",
    successRate: "87%",
    rating: 4.8,
    reviews: 48,
  },
  {
    id: "3",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfduRrwM-6wCp2z9LA_fTdF95v258HhdxaDzB44LHfnmrEFwlCwb61YL4mcEdRoycJ5ao",
    name: "Animal Aid Unlimited",
    description: "Providing veterinary aid and rescue services to birds and large animals.",
    distance: "7.8 km",
    status: "Busy",
    specialization: ["Birds", "Large Animals", "Medical"],
    responseTime: "40 mins",
    successRate: "93%",
    rating: 4.9,
    reviews: 67,
  },
];

export default function NGOListScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const availableFilters = ["Dogs", "Cats", "Birds", "Large Animals", "Medical", "Critical Care"];

  const filteredNGOs = ngoData.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilters.length === 0 || selectedFilters.every(filter => ngo.specialization.includes(filter)))
  );

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
          <Card style={styles.card} mode="elevated">
            <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
            <Card.Content>
              <Text variant="titleLarge" style={styles.title}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.rowSpaceBetween}>
                <Text style={styles.textMuted}>Distance: {item.distance}</Text>
                <Chip style={[styles.statusChip, getStatusColor(item.status)]}>{item.status}</Chip>
              </View>
              <View style={styles.tagRow}>
                {item.specialization.map((tag, i) => (
                  <Chip key={i} style={styles.tag} textStyle={styles.tagText}>{tag}</Chip>
                ))}
              </View>
              <Text style={styles.textMuted}>Response Time: {item.responseTime} | Success Rate: {item.successRate}</Text>
              <Text style={styles.textMuted}>⭐ {item.rating} ({item.reviews} reviews)</Text>
              <View style={styles.actionRow}>
                <Button mode="outlined" style={styles.button} textColor="#8B4513">Volunteer</Button>
                <Button mode="contained" buttonColor="#8B4513" textColor="#fff" style={styles.button}>Donate</Button>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return { backgroundColor: '#A3D9A5' };
      case "busy": return { backgroundColor: '#FFD580' };
      case "emergency-only": return { backgroundColor: '#FF9999' };
      default: return { backgroundColor: '#D3D3D3' };
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
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#8B4513", "#D2B48C"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.karunaTitle}>NGOs Listing</Text>
          <IconButton
            icon="filter"
            iconColor="#FFF"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>
        <Searchbar
          placeholder="Search NGOs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBarExpanded}
          iconColor="#8B4513"
          inputStyle={{ color: "#4E3629" }}
        />
      </LinearGradient>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text variant="titleLarge" style={styles.modalTitle}>Filter NGOs</Text>
            <View style={styles.filterRow}>
              {availableFilters.map((filter) => (
                <Chip
                  key={filter}
                  style={[
                    styles.filterChip,
                    selectedFilters.includes(filter) && styles.filterChipSelected,
                  ]}
                  textStyle={styles.filterChipText}
                  onPress={() => toggleFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
            </View>
            <Button
              mode="contained"
              buttonColor="#8B4513"
              textColor="#fff"
              style={styles.modalButton}
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
        contentContainerStyle={styles.listContent}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5E1",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  logo: {
    backgroundColor: "#FFF",
  },
  karunaTitle: {
    fontWeight: "bold",
    fontSize: 28,
    color: "#FFF",
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  searchBarExpanded: {
    backgroundColor: "#FDF1DC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D2B48C",
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
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    color: "#5C4033",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: "#F5F5DC",
    borderWidth: 1,
    borderColor: "#D2B48C",
  },
  filterChipSelected: {
    backgroundColor: "#8B4513",
    borderColor: "#8B4513",
  },
  filterChipText: {
    color: "#5C4033",
  },
  modalButton: {
    borderRadius: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FAF3E0",
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    color: "#5C4033",
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },
  description: {
    color: "#6B4F3A",
    marginBottom: 8,
    lineHeight: 20,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#FFF5E1",
    borderWidth: 1,
    borderColor: "#D2B48C",
    borderRadius: 8,
  },
  tagText: {
    color: "#6B4F3A",
    fontSize: 12,
  },
  statusChip: {
    borderRadius: 8,
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
    borderColor: "#8B4513",
  },
  textMuted: {
    color: "#7C5C42",
    fontSize: 14,
    marginBottom: 4,
  },
});