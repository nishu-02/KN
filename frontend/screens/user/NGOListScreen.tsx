// NGOListScreen.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Button,
  Chip,
  Avatar,
  Searchbar,
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

  const filteredNGOs = ngoData.filter((ngo) =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof ngoData[0] }) => {
    return (
      <Card style={styles.card} mode="elevated">
        <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <View style={styles.rowSpaceBetween}>
            <Text style={styles.textMuted}>Distance: {item.distance}</Text>
            <Chip style={[styles.statusChip, getStatusColor(item.status)]}>{item.status}</Chip>
          </View>
          <View style={styles.tagRow}>
            {item.specialization.map((tag, i) => (
              <Chip key={i} style={styles.tag}>{tag}</Chip>
            ))}
          </View>
          <Text style={styles.textMuted}>Response Time: {item.responseTime} | Success Rate: {item.successRate}</Text>
          <Text style={styles.textMuted}>⭐ {item.rating} ({item.reviews} reviews)</Text>
          <View style={styles.actionRow}>
            <Button mode="outlined" style={styles.button}>Volunteer</Button>
            <Button mode="contained" buttonColor="#8B4513" textColor="#fff" style={styles.button}>Donate</Button>
          </View>
        </Card.Content>
      </Card>
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

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <LinearGradient
        colors={["#8B4513", "#F5F5DC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <Searchbar
          placeholder="Search NGOs..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBarExpanded}
          iconColor="#8B4513"
          inputStyle={{ color: "#4E3629" }}
        />
      </LinearGradient>

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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    minHeight: 50,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 8,
    zIndex: 10,
  },
  karunaTitle: {
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 36,
    color: "white",
    fontFamily: 'cursive',
    letterSpacing: 1
  },
  searchIconContainer: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 15,
    justifyContent: "center",
  },
  searchBarExpanded: {
    flex: 1,
    backgroundColor: "#FDF1DC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D2B48C",
    marginLeft: 0,
    marginRight: 0,
    elevation: 2,
    height: 44,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FAF3E0",
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardImage: {
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    color: "#5C4033",
    marginTop: 8,
    marginBottom: 4,
  },
  description: {
    color: "#6B4F3A",
    marginBottom: 6,
  },
  rowSpaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },
  tag: {
    color: "#6B4F3A",
    marginRight: 6,
    marginBottom: 4,
  },
  statusChip: {
    color: "white",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  textMuted: {
    color: "#7C5C42",
    fontSize: 13,
  },
});