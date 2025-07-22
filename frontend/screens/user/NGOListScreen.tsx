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
import { useThemeContext } from '../../theme';

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
  const { theme } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const availableFilters = ["Dogs", "Cats", "Birds", "Large Animals", "Medical", "Critical Care"];
  
  
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
            <Card.Cover source={{ uri: item.image }} style={styles(theme).cardImage} />
            <Card.Content>
              <Text variant="titleLarge" style={[styles(theme).title, { color: theme.colors.text }]}>{item.name}</Text>
              <Text style={[styles(theme).description, { color: theme.colors.subtext }]}>{item.description}</Text>
              <View style={styles(theme).rowSpaceBetween}>
                <Text style={[styles(theme).textMuted, { color: theme.colors.subtext }]}>Distance: {item.distance}</Text>
                <Chip style={[styles(theme).statusChip, getStatusColor(item.status, theme)]} textStyle={{ color: theme.colors.text }}>{item.status}</Chip>
              </View>
              <View style={styles(theme).tagRow}>
                {item.specialization.map((tag, i) => (
                  <Chip key={i} style={[styles(theme).tag, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]} textStyle={[styles(theme).tagText, { color: theme.colors.primary }]}>{tag}</Chip>
                ))}
              </View>
              <Text style={[styles(theme).textMuted, { color: theme.colors.subtext }]}>Response Time: {item.responseTime} | Success Rate: {item.successRate}</Text>
              <Text style={[styles(theme).textMuted, { color: theme.colors.subtext }]}>★ {item.rating} ({item.reviews} reviews)</Text>
              <View style={styles(theme).actionRow}>
                <Button mode="outlined" style={styles(theme).button} textColor={theme.colors.primary}>Volunteer</Button>
                <Button mode="contained" buttonColor={theme.colors.primary} textColor={theme.colors.card} style={styles(theme).button}>Donate</Button>
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
    borderWidth: 1,
    borderRadius: 8,
  },
  tagText: {
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
  },
  textMuted: {
    fontSize: 14,
    marginBottom: 4,
  },
});