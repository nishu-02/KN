import React, { useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Animated, Modal } from "react-native";
import { Text, Card, Button, ProgressBar, Searchbar, IconButton, Chip, Avatar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from '../../theme';

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
  const { theme } = useThemeContext();
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
          <Card style={[styles(theme).card, theme.cardShadow, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]} mode="elevated">
            <Card.Cover source={{ uri: item.image }} style={styles(theme).cardImage} />
            <Card.Content>
              <Text variant="titleLarge" style={[styles(theme).title, { color: theme.colors.text }]}>{item.title}</Text>
              <Text variant="bodyMedium" style={[styles(theme).description, { color: theme.colors.subtext }]}>{item.description}</Text>
              <Text style={[styles(theme).ngo, { color: theme.colors.subtext }]}>NGO: {item.ngo}</Text>
              <Chip style={[styles(theme).categoryChip, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]} textStyle={[styles(theme).categoryChipText, { color: theme.colors.primary }]}>{item.category}</Chip>
              <ProgressBar progress={progress} color={theme.colors.primary} style={styles(theme).progress} />
              <Text style={[styles(theme).raised, { color: theme.colors.text }]}>₹{item.raised} raised of ₹{item.goal}</Text>
              <Text style={[styles(theme).deadline, { color: theme.colors.subtext }]}>Deadline: {item.deadline}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.card}
                style={styles(theme).button}
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
    <View style={[styles(theme).container, { backgroundColor: theme.colors.background }]}> 
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.card, theme.colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles(theme).header}
      >
        <View style={styles(theme).headerContent}>
          <Text style={[styles(theme).karunaTitle, { color: theme.colors.primary }]}>Donations</Text>
          <View style={styles(theme).headerIcons}>
            <IconButton
              icon="filter"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setFilterModalVisible(true)}
            />
            <IconButton
              icon="magnify"
              iconColor={theme.colors.primary}
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
            style={[styles(theme).searchBarExpanded, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]}
            iconColor={theme.colors.primary}
            inputStyle={{ color: theme.colors.text }}
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
        <View style={styles(theme).modalContainer}>
          <View style={[styles(theme).modalContent, { backgroundColor: theme.colors.card }]}> 
            <Text variant="titleLarge" style={[styles(theme).modalTitle, { color: theme.colors.primary }]}>Filter Donations</Text>
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

      {/* Donation List */}
      <FlatList
        data={filteredDonations}
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
    paddingBottom: theme.spacing.margin * 5,
  },
  header: {
    paddingHorizontal: theme.spacing.padding,
    paddingTop: 40,
    paddingBottom: theme.spacing.padding - 2,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    elevation: 8,
    zIndex: 10,
    backgroundColor: theme.colors.card,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  karunaTitle: {
    fontWeight: "bold",
    fontSize: 28,
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
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
  cardImage: {
    height: 200,
    borderTopLeftRadius: theme.spacing.radius,
    borderTopRightRadius: theme.spacing.radius,
  },
  title: {
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "bold",
  },
  description: {
    marginBottom: 8,
    lineHeight: 20,
  },
  ngo: {
    fontStyle: "italic",
    marginBottom: 6,
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  categoryChipText: {
    fontSize: 12,
  },
  progress: {
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginBottom: 6,
  },
  raised: {
    fontWeight: "500",
    marginBottom: 4,
  },
  deadline: {
    marginBottom: 8,
  },
  button: {
    borderRadius: 8,
  },
});