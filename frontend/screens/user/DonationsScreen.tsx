import React, { useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Animated, Modal } from "react-native";
import { Text, Card, Button, ProgressBar, Searchbar, IconButton, Chip, Avatar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const donationData = [
  {
    id: "1",
    image: "https://cdn.britannica.com/59/173659-050-250F5491/Animal-Mammal-Goat-Ruminant-goat-Capra-aegagrus.jpg",
    title: "Rescue Injured Stray Cat",
    description: "Help us treat an injured stray cat needing urgent surgery.",
    ngo: "Paw Protectors NGO",
    raised: 4500,
    goal: 10000,
    deadline: "10 July 2025",
    category: "Medical",
  },
  {
    id: "2",
    image: "https://placebear.com/300/200",
    title: "Feed Homeless Dogs",
    description: "Daily meals for over 100 rescued dogs across shelters.",
    ngo: "Brown Paw Foundation",
    raised: 8000,
    goal: 15000,
    deadline: "15 July 2025",
    category: "Food",
  },
  {
    id: "3",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Cow_female_black_white.jpg/1200px-Cow_female_black_white.jpg",
    title: "Vaccinate Street Pups",
    description: "Support vaccination drive for stray puppies in the city.",
    ngo: "Safe Tails",
    raised: 3200,
    goal: 7000,
    deadline: "20 July 2025",
    category: "Vaccination",
  },
  {
    id: "4",
    image: "https://placebear.com/301/200",
    title: "Shelter for Abandoned Pets",
    description: "Help us build a new shelter for abandoned pets.",
    ngo: "Hope for Paws",
    raised: 12000,
    goal: 25000,
    deadline: "25 July 2025",
    category: "Shelter",
  },
  {
    id: "5",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkACOybTvnYEEyAzWhSfDP5YYlQU2U0yDTJ01Rls-7waKrAyNUxFOjF0qv6fkB2S7PjdA&usqp=CAU",
    title: "Medical Aid for Injured Cow",
    description: "Urgent surgery and care for an injured stray cow.",
    ngo: "Animal Aid Unlimited",
    raised: 6000,
    goal: 12000,
    deadline: "30 July 2025",
    category: "Medical",
  },
];

export default function DonationsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
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

  const availableFilters = ["Medical", "Food", "Vaccination", "Shelter"];

  const filteredDonations = donationData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilters.length === 0 || selectedFilters.includes(item.category))
  );

  const renderItem = ({ item }: { item: typeof donationData[0] }) => {
    const progress = item.raised / item.goal;
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
              <Text variant="titleLarge" style={styles.title}>{item.title}</Text>
              <Text variant="bodyMedium" style={styles.description}>{item.description}</Text>
              <Text style={styles.ngo}>NGO: {item.ngo}</Text>
              <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                {item.category}
              </Chip>
              <ProgressBar progress={progress} color="#8B4513" style={styles.progress} />
              <Text style={styles.raised}>₹{item.raised} raised of ₹{item.goal}</Text>
              <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor="#8B4513"
                textColor="#fff"
                style={styles.button}
              >
                Pay Now
              </Button>
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
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
          <Text style={styles.karunaTitle}>Donations</Text>
          <View style={styles.headerIcons}>
            <IconButton
              icon="filter"
              iconColor="#FFF"
              size={24}
              onPress={() => setFilterModalVisible(true)}
            />
            <IconButton
              icon="magnify"
              iconColor="#FFF"
              size={24}
              onPress={() => setSearchActive(true)}
            />
          </View>
        </View>
        {searchActive && (
          <Searchbar
            placeholder="Search donations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBarExpanded}
            iconColor="#8B4513"
            inputStyle={{ color: "#4E3629" }}
            autoFocus
            onBlur={() => setSearchActive(false)}
          />
        )}
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
            <Text variant="titleLarge" style={styles.modalTitle}>Filter Donations</Text>
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

      {/* Donation List */}
      <FlatList
        data={filteredDonations}
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
    paddingBottom: 80,

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
    marginBottom: 5,
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
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
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
  ngo: {
    color: "#8B5E3C",
    fontStyle: "italic",
    marginBottom: 6,
  },
  categoryChip: {
    backgroundColor: "#FFF5E1",
    borderWidth: 1,
    borderColor: "#D2B48C",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryChipText: {
    color: "#6B4F3A",
    fontSize: 12,
  },
  progress: {
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginBottom: 6,
    backgroundColor: "#EDE0C8",
  },
  raised: {
    color: "#5E3D2B",
    fontWeight: "500",
    marginBottom: 4,
  },
  deadline: {
    color: "#7C5C42",
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
  },
});