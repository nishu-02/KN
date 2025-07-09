// UserDashboard.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  Button,
  Divider,
  List,
  IconButton,
  Avatar,
  TextInput,
  Surface,
  Badge,
  ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";

const screenWidth = Dimensions.get("window").width;

const rescueCases = [
  {
    id: "r1",
    title: "Injured Street Dog",
    species: "Canine",
    breed: "Indian Pariah",
    age: "Adult (3-5 years)",
    gender: "Male",
    weight: "15-20 kg",
    severity: "Critical",
    injurySummary: "Deep laceration on right hind leg, signs of infection",
    symptoms: ["Limping", "Bleeding", "Fever", "Lethargy"],
    vitals: {
      temperature: "103°F",
      heartRate: "120 bpm",
      breathing: "Rapid",
    },
    medicalHistory: "No vaccination records available",
    time: "2 mins ago",
    ngo: "Awaiting Rescue",
    volunteer: "Dr. Sarah Ahmed",
    estimatedCost: "₹2,500 - ₹5,000",
    location: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    image: "https://via.placeholder.com/100x100/8B4513/FFFFFF?text=DOG",
    rescueProgress: 0.2,
  },
  {
    id: "r2",
    title: "Injured House Sparrow",
    species: "Avian",
    breed: "House Sparrow",
    age: "Juvenile (2-3 months)",
    gender: "Unknown",
    weight: "25-30 grams",
    severity: "Moderate",
    injurySummary: "Suspected wing fracture, possible collision with window",
    symptoms: ["Wing drooping", "Unable to fly", "Stress"],
    vitals: {
      temperature: "Normal",
      heartRate: "Fast",
      breathing: "Stable",
    },
    medicalHistory: "Wild bird, no prior medical records",
    time: "5 mins ago",
    ngo: "Hope for Paws",
    volunteer: "Rahul Sharma",
    estimatedCost: "₹800 - ₹1,500",
    location: {
      latitude: 37.78925,
      longitude: -122.4344,
    },
    image: "https://via.placeholder.com/100x100/8B4513/FFFFFF?text=BIRD",
    rescueProgress: 0.6,
  },
];

const radiusOptions = ["1 km", "2 km", "5 km", "10 km", "15 km", "25 km"];

export default function UserDashboard() {
  const [radius, setRadius] = useState("5 km");
  const [location, setLocation] = useState({
    city: "New Delhi",
    time: "8:35 AM",
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "#FF4444";
      case "High":
        return "#FF8800";
      case "Moderate":
        return "#FFA500";
      case "Low":
        return "#4CAF50";
      default:
        return "#666";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "alert-circle";
      case "High":
        return "alert";
      case "Moderate":
        return "alert-outline";
      case "Low":
        return "check-circle";
      default:
        return "help-circle";
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Enhanced Header */}
      <LinearGradient
        colors={["#8B4513", "#D2B48C", "#F5F5DC"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerEnhanced}
      >
        <View style={styles.headerRow}>
          {/* Greeting and Info */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.greetingEnhanced}>
              Good Morning, <Text style={{ fontWeight: "bold", fontFamily: "monospace"}}>Anya</Text>
            </Text>
            <View style={styles.headerSubRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#brown"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.cityText}>{location.city}</Text>
              <View style={styles.dot} />
              <Ionicons
                name="time-outline"
                size={16}
                color="#brown"
                style={{ marginRight: 4, marginLeft: 8 }}
              />
              <Text style={styles.timeText}>{location.time}</Text>
            </View>
          </View>
          {/* Notification Icon */}
          <TouchableOpacity
            style={styles.headerNotifContainer}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={28} color="#8B4513" />
            <Badge style={styles.notifBadge}>2</Badge>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Radius Control */}
      <Surface style={styles.radiusSection} elevation={2}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="location-outline" size={20} color="#8B4513" /> Alert
          Radius
        </Text>
        <Text style={styles.radiusDescription}>
          Set your preferred radius to receive animal rescue alerts
        </Text>
        <View style={styles.radiusOptionsContainer}>
          {radiusOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radiusOption,
                radius === option && styles.radiusOptionSelected,
              ]}
              onPress={() => setRadius(option)}
            >
              <Text
                style={[
                  styles.radiusOptionText,
                  radius === option && styles.radiusOptionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.radiusInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.radiusInfoText}>
            Currently covering approximately {radius} around your location
          </Text>
        </View>
      </Surface>

      {/* Enhanced Map View */}
      <Surface style={styles.mapSection} elevation={4}>
        <View style={styles.mapHeader}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="map-outline" size={20} color="#8B4513" /> Live
            Rescue Feed
          </Text>
          <Chip icon="refresh" onPress={() => {}}>
            Refresh
          </Chip>
        </View>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.6139, // Latitude of central Delhi (near India Gate)
            longitude: 77.209, // Longitude of central Delhi
            latitudeDelta: 0.1, // Zoom level (adjustable)
            longitudeDelta: 0.1,
          }}
        >
          {rescueCases.map((rescue) => (
            <Marker
              key={rescue.id}
              coordinate={rescue.location}
              pinColor={getSeverityColor(rescue.severity)}
              title={rescue.title}
            />
          ))}
        </MapView>
      </Surface>

      {/* Enhanced Rescue Case Cards */}
      <View style={styles.casesSection}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="heart-outline" size={20} color="#8B4513" /> Nearby
          Rescue Cases
        </Text>
        {rescueCases.map((rescue) => (
          <Card style={styles.enhancedCard} key={rescue.id} elevation={4}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderLeft}>
                <Image
                  source={{ uri: rescue.image }}
                  style={styles.animalImage}
                />
                <View style={styles.cardHeaderText}>
                  <Text style={styles.cardTitle}>{rescue.title}</Text>
                  <Text style={styles.cardSubtitle}>
                    {rescue.species} • {rescue.breed}
                  </Text>
                </View>
              </View>
              <View style={styles.cardHeaderRight}>
                <Chip
                  icon={getSeverityIcon(rescue.severity)}
                  style={[
                    styles.severityChip,
                    { backgroundColor: getSeverityColor(rescue.severity) },
                  ]}
                  textStyle={{ color: "white", fontSize: 12 }}
                >
                  {rescue.severity}
                </Chip>
                <Text style={styles.timeStamp}>{rescue.time}</Text>
              </View>
            </View>

            <Divider style={styles.cardDivider} />

            {/* Animal Information */}
            <View style={styles.animalInfo}>
              <Text style={styles.infoSectionTitle}>Animal Information</Text>
              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Age:</Text>
                  <Text style={styles.infoValue}>{rescue.age}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Gender:</Text>
                  <Text style={styles.infoValue}>{rescue.gender}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Weight:</Text>
                  <Text style={styles.infoValue}>{rescue.weight}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Species:</Text>
                  <Text style={styles.infoValue}>{rescue.species}</Text>
                </View>
              </View>
            </View>

            {/* Medical Information */}
            <View style={styles.medicalInfo}>
              <Text style={styles.infoSectionTitle}>Medical Status</Text>
              <Text style={styles.injurySummary}>{rescue.injurySummary}</Text>

              <View style={styles.symptomsContainer}>
                <Text style={styles.symptomsTitle}>Symptoms:</Text>
                <View style={styles.symptomsChips}>
                  {rescue.symptoms.map((symptom, index) => (
                    <Chip
                      key={index}
                      style={styles.symptomChip}
                      textStyle={{ fontSize: 12 }}
                    >
                      {symptom}
                    </Chip>
                  ))}
                </View>
              </View>

              <View style={styles.vitalsContainer}>
                <Text style={styles.vitalsTitle}>Vital Signs:</Text>
                <View style={styles.vitalsGrid}>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Temp:</Text>
                    <Text style={styles.vitalValue}>
                      {rescue.vitals.temperature}
                    </Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Heart:</Text>
                    <Text style={styles.vitalValue}>
                      {rescue.vitals.heartRate}
                    </Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Breathing:</Text>
                    <Text style={styles.vitalValue}>
                      {rescue.vitals.breathing}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Rescue Progress */}
            <View style={styles.progressSection}>
              <Text style={styles.progressTitle}>Rescue Progress</Text>
              <ProgressBar
                progress={rescue.rescueProgress}
                color={getSeverityColor(rescue.severity)}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(rescue.rescueProgress * 100)}% Complete
              </Text>
            </View>

            {/* Rescue Team Info */}
            <View style={styles.rescueTeamInfo}>
              <View style={styles.teamItem}>
                <Ionicons name="business-outline" size={16} color="#666" />
                <Text style={styles.teamText}>NGO: {rescue.ngo}</Text>
              </View>
              <View style={styles.teamItem}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.teamText}>
                  Volunteer: {rescue.volunteer}
                </Text>
              </View>
              <View style={styles.teamItem}>
                <Ionicons name="card-outline" size={16} color="#666" />
                <Text style={styles.teamText}>
                  Est. Cost: {rescue.estimatedCost}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.cardActions}>
              <Button
                mode="contained"
                icon="check-circle-outline"
                style={styles.actionButton}
                buttonColor="#4CAF50"
              >
                Mark Helped
              </Button>
              <Button
                mode="outlined"
                icon="alert-circle-outline"
                style={styles.actionButton}
                textColor="#FF8800"
              >
                Report Again
              </Button>
              <Button
                mode="text"
                icon="share-outline"
                style={styles.actionButton}
              >
                Share
              </Button>
            </View>
          </Card>
        ))}
      </View>

      {/* Enhanced Status Updates Section */}
      <Surface style={styles.statusSection} elevation={2}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="list-outline" size={20} color="#8B4513" /> Your
          Reports
        </Text>
        <Card style={styles.statusCard}>
          <Card.Content>
            <List.Item
              title="Injured Cow Near Red Fort"
              description="NGO: Animal Aid • Status: In Progress"
              left={(props) => (
                <List.Icon {...props} icon="alert" color="#FF8800" />
              )}
              right={(props) => (
                <View style={styles.statusRight}>
                  <Badge style={styles.statusBadge}>Active</Badge>
                  <IconButton {...props} icon="chevron-right" />
                </View>
              )}
            />
            <Divider />
            <List.Item
              title="Stray Pup with Broken Leg"
              description="NGO: Awaiting Response • Status: Reported"
              left={(props) => (
                <List.Icon {...props} icon="paw" color="#8B4513" />
              )}
              right={(props) => (
                <View style={styles.statusRight}>
                  <Badge
                    style={[styles.statusBadge, { backgroundColor: "#FFA500" }]}
                  >
                    Pending
                  </Badge>
                  <IconButton {...props} icon="chevron-right" />
                </View>
              )}
            />
          </Card.Content>
        </Card>
      </Surface>

      {/* Bottom Padding */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  headerEnhanced: {
    paddingTop: 34,
    paddingBottom: 24,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 10,
    shadowColor: "#8B4513",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // headerAvatarContainer: {
  //   marginRight: 12,
  // },
  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  greetingEnhanced: {
    fontSize: 30,
    color: "#fff",
    fontFamily: "cursive", // or your preferred font
    marginBottom: 2,
  },
  headerSubRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  cityText: {
    fontSize: 15,
    color: "white",
    fontWeight: "600",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8B4513",
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 15,
    color: "white",
    fontWeight: "600",
  },
  headerNotifContainer: {
    marginLeft: 12,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF4444",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 0,
    zIndex: 2,
  },
  header: {
    paddingVertical: 30,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subInfo: {
    fontSize: 16,
    color: "#f0e2c8",
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "#f0e2c8",
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#5C4033",
    flexDirection: "row",
    alignItems: "center",
  },
  radiusSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  radiusDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  radiusOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  radiusOptionSelected: {
    backgroundColor: "#8B4513",
    borderColor: "#8B4513",
  },
  radiusOptionText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  radiusOptionTextSelected: {
    color: "#fff",
  },
  radiusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radiusInfoText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
  mapSection: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 8,
  },
  map: {
    width: "100%",
    height: 200,
  },
  casesSection: {
    paddingHorizontal: 16,
  },
  enhancedCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  animalImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cardHeaderRight: {
    alignItems: "flex-end",
  },
  severityChip: {
    marginBottom: 4,
  },
  timeStamp: {
    fontSize: 12,
    color: "#666",
  },
  cardDivider: {
    marginHorizontal: 16,
  },
  animalInfo: {
    padding: 16,
    paddingBottom: 8,
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 8,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: "45%",
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  medicalInfo: {
    padding: 16,
    paddingTop: 8,
  },
  injurySummary: {
    fontSize: 14,
    color: "#333",
    marginBottom: 12,
    lineHeight: 20,
  },
  symptomsContainer: {
    marginBottom: 12,
  },
  symptomsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  symptomsChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  symptomChip: {
    backgroundColor: "#FFE5E5",
  },
  vitalsContainer: {
    marginBottom: 8,
  },
  vitalsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  vitalsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  vitalItem: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 12,
    color: "#666",
  },
  vitalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  progressSection: {
    padding: 16,
    paddingTop: 8,
  },
  progressTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  rescueTeamInfo: {
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teamText: {
    fontSize: 14,
    color: "#333",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    padding: 16,
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  statusSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  statusCard: {
    backgroundColor: "#FAFAFA",
    borderRadius: 12,
  },
  statusRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    backgroundColor: "#4CAF50",
    color: "#fff",
    marginRight: 8,
  },
});
