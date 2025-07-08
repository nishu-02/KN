import React, { useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Animated } from "react-native";
import { Text, Card, Button, ProgressBar, Searchbar } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const donationData = [
  {
    id: "1",
    image: "https://placekitten.com/300/200",
    title: "Rescue Injured Stray Cat",
    description: "Help us treat an injured stray cat needing urgent surgery.",
    ngo: "Paw Protectors NGO",
    raised: 4500,
    goal: 10000,
    deadline: "10 July 2025",
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
  },
  {
    id: "3",
    image: "https://placekitten.com/301/200",
    title: "Vaccinate Street Pups",
    description: "Support vaccination drive for stray puppies in the city.",
    ngo: "Safe Tails",
    raised: 3200,
    goal: 7000,
    deadline: "20 July 2025",
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
  },
  {
    id: "5",
    image: "https://placekitten.com/302/200",
    title: "Medical Aid for Injured Cow",
    description: "Urgent surgery and care for an injured stray cow.",
    ngo: "Animal Aid Unlimited",
    raised: 6000,
    goal: 12000,
    deadline: "30 July 2025",
  },
];

export default function DonationsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const filteredDonations = donationData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: typeof donationData[0] }) => {
    const progress = item.raised / item.goal;

    return (
      <Card style={styles.card} mode="elevated">
        <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
          <Text variant="bodyMedium" style={styles.description}>{item.description}</Text>
          <Text style={styles.ngo}>NGO: {item.ngo}</Text>
          <ProgressBar progress={progress} color="#8B4513" style={styles.progress} />
          <Text style={styles.raised}>₹{item.raised} raised of ₹{item.goal}</Text>
          <Text style={styles.deadline}>Deadline: {item.deadline}</Text>
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" buttonColor="#8B4513" textColor="#fff">
            Pay Now
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <LinearGradient
        colors={["#8B4513", "#F5F5DC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        {searchActive ? (
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
        ) : (
          <>
            <View style={{ flex: 1 }} />
            <Text style={styles.karunaTitle}>Karuna Nidhan</Text>
            <TouchableOpacity
              style={styles.searchIconContainer}
              onPress={() => setSearchActive(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={26} color="#8B4513" />
            </TouchableOpacity>
          </>
        )}
      </LinearGradient>

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
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 14,
    minHeight: 80,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    elevation: 4,
    zIndex: 10,
  },
  karunaTitle: {
    flex: 2,
    textAlign: "center",
    fontSize: 26,
    color: "#8B4513",
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  searchIconContainer: {
    flex: 1,
    alignItems: "flex-end",
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
    paddingBottom: 80,
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
    marginBottom: 4,
  },
  ngo: {
    color: "#8B5E3C",
    fontStyle: "italic",
    marginBottom: 4,
  },
  progress: {
    height: 8,
    borderRadius: 5,
    marginTop: 6,
    marginBottom: 4,
    backgroundColor: "#EDE0C8",
  },
  raised: {
    color: "#5E3D2B",
    fontWeight: "500",
    marginBottom: 2,
  },
  deadline: {
    color: "#7C5C42",
    marginBottom: 6,
  },
});