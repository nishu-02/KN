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
  Surface,
  Badge,
  ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const screenWidth = Dimensions.get("window").width;

// Constants for styling
const COLORS = {
  primary: "#8B4513",
  secondary: "#D2B48C",
  background: "#FFF8F0",
  card: "#FFFFFF",
  text: "#333",
  subtext: "#666",
  critical: "#FF4444",
  high: "#FF8800",
  moderate: "#FFA500",
  low: "#4CAF50",
  accent: "#F5F5DC",
};

const SIZES = {
  radius: 16,
  padding: 16,
  margin: 16,
  fontLarge: 20,
  fontMedium: 16,
  fontSmall: 14,
  fontTiny: 12,
};

// Interfaces
interface RescueCase {
  id: string;
  title: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  weight: string;
  severity: string;
  injurySummary: string;
  symptoms: string[];
  vitals: { temperature: string; heartRate: string; breathing: string };
  medicalHistory: string;
  time: string;
  ngo: string;
  volunteer: string;
  estimatedCost: string;
  location: { latitude: number; longitude: number };
  image: string;
  rescueProgress: number;
}

interface Location {
  city: string;
  time: string;
}

// Data
const rescueCases: RescueCase[] = [
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
    vitals: { temperature: "103°F", heartRate: "120 bpm", breathing: "Rapid" },
    medicalHistory: "No vaccination records available",
    time: "2 mins ago",
    ngo: "Awaiting Rescue",
    volunteer: "Dr. Sarah Ahmed",
    estimatedCost: "₹2,500 - ₹5,000",
    location: { latitude: 37.78825, longitude: -122.4324 },
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-8XeubbWjvWPFpml9ElUu9H74aal0LBkpzICWcoX-l6Zs8vhy-fgkkJqsKVZVfru34Lc",
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
    vitals: { temperature: "Normal", heartRate: "Fast", breathing: "Stable" },
    medicalHistory: "Wild bird, no prior medical records",
    time: "5 mins ago",
    ngo: "Hope for Paws",
    volunteer: "Rahul Sharma",
    estimatedCost: "₹800 - ₹1,500",
    location: { latitude: 37.78925, longitude: -122.4344 },
    image: "https://www.shutterstock.com/image-photo/injured-sparrow-one-leg-260nw-1569750835.jpg",
    rescueProgress: 0.6,
  },
];

const radiusOptions = ["1 km", "2 km", "5 km", "10 km", "15 km", "25 km"];

// Utility Functions
const getSeverityStyles = (severity: string) => ({
  color:
    {
      Critical: COLORS.critical,
      High: COLORS.high,
      Moderate: COLORS.moderate,
      Low: COLORS.low,
    }[severity] || COLORS.subtext,
  icon:
    {
      Critical: "alert-circle",
      High: "alert",
      Moderate: "alert-outline",
      Low: "check-circle",
    }[severity] || "help-circle",
});

// Reusable Components
const AnimatedTouchable: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
}> = ({ children, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => (scale.value = 0.95)}
      onPressOut={() => (scale.value = 1)}
      activeOpacity={0.8}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

const SectionHeader: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = ({ title, icon }) => (
  <View style={styles.sectionHeader}>
    <Ionicons
      name={icon as keyof typeof Ionicons.glyphMap}
      size={SIZES.fontLarge}
      color={COLORS.primary}
      style={styles.sectionIcon}
    />
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

const RescueCaseCard: React.FC<{ rescue: RescueCase }> = ({ rescue }) => {
  const { color, icon } = getSeverityStyles(rescue.severity);

  return (
    <Card style={styles.card} elevation={3}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Image source={{ uri: rescue.image }} style={styles.animalImage} />
          <View style={styles.cardHeaderText}>
            <Text style={styles.cardTitle}>{rescue.title}</Text>
            <Text
              style={styles.cardSubtitle}
            >{`${rescue.species} • ${rescue.breed}`}</Text>
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <Chip
            icon={icon}
            style={[styles.severityChip, { backgroundColor: color }]}
            textStyle={styles.chipText}
          >
            {rescue.severity}
          </Chip>
          <Text style={styles.timeStamp}>{rescue.time}</Text>
        </View>
      </View>

      <Divider style={styles.cardDivider} />

      <View style={styles.animalInfo}>
        <Text style={styles.infoSectionTitle}>Animal Information</Text>
        <View style={styles.infoGrid}>
          {[
            { label: "Age", value: rescue.age },
            { label: "Gender", value: rescue.gender },
            { label: "Weight", value: rescue.weight },
            { label: "Species", value: rescue.species },
          ].map(({ label, value }, index) => (
            <View key={index} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{`${label}:`}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

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
                textStyle={styles.chipText}
              >
                {symptom}
              </Chip>
            ))}
          </View>
        </View>
        <View style={styles.vitalsContainer}>
          <Text style={styles.vitalsTitle}>Vital Signs:</Text>
          <View style={styles.vitalsGrid}>
            {[
              { label: "Temp", value: rescue.vitals.temperature },
              { label: "Heart", value: rescue.vitals.heartRate },
              { label: "Breathing", value: rescue.vitals.breathing },
            ].map(({ label, value }, index) => (
              <View key={index} style={styles.vitalItem}>
                <Text style={styles.vitalLabel}>{`${label}:`}</Text>
                <Text style={styles.vitalValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.progressTitle}>Rescue Progress</Text>
        <ProgressBar
          progress={rescue.rescueProgress}
          color={color}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>{`${Math.round(
          rescue.rescueProgress * 100
        )}% Complete`}</Text>
      </View>

      <View style={styles.rescueTeamInfo}>
        {[
          { icon: "business-outline", text: `NGO: ${rescue.ngo}` },
          { icon: "person-outline", text: `Volunteer: ${rescue.volunteer}` },
          { icon: "card-outline", text: `Est. Cost: ${rescue.estimatedCost}` },
        ].map(({ icon, text }, index) => (
          <View key={index} style={styles.teamItem}>
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={SIZES.fontSmall}
              color={COLORS.subtext}
            />
            <Text style={styles.teamText}>{text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cardActions}>
        {[
          {
            icon: "check-circle-outline",
            text: "Mark Helped",
            mode: "contained" as "contained",
            color: COLORS.low,
          },
          {
            icon: "alert-circle-outline",
            text: "Report Again",
            mode: "outlined" as "outlined",
            textColor: COLORS.high,
          },
          {
            icon: "share-outline",
            text: "Share",
            mode: "text" as "text",
            textColor: COLORS.primary,
          },
        ].map(({ icon, text, mode, color, textColor }, index) => (
          <Button
            key={index}
            mode={mode}
            icon={icon}
            style={styles.actionButton}
            buttonColor={color}
            textColor={textColor || COLORS.text}
          >
            {text}
          </Button>
        ))}
      </View>
    </Card>
  );
};

export default function UserDashboard() {
  const [radius, setRadius] = useState("5 km");
  const [location, setLocation] = useState<Location>({
    city: "New Delhi",
    time: "8:35 AM",
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              Good Morning, <Text style={styles.boldText}>Anya</Text>
            </Text>
            <View style={styles.headerSubRow}>
              <Ionicons
                name="location-outline"
                size={SIZES.fontSmall}
                color={COLORS.accent}
                style={styles.iconSpacing}
              />
              <Text style={styles.subText}>{location.city}</Text>
              <View style={styles.dot} />
              <Ionicons
                name="time-outline"
                size={SIZES.fontSmall}
                color={COLORS.accent}
                style={styles.iconSpacing}
              />
              <Text style={styles.subText}>{location.time}</Text>
            </View>
          </View>
          <AnimatedTouchable onPress={() => {}}>
            <View style={styles.headerNotifContainer}>
              <Ionicons
                name="notifications-outline"
                size={28}
                color={COLORS.primary}
              />
              <Badge style={styles.notifBadge}>2</Badge>
            </View>
          </AnimatedTouchable>
        </View>
      </LinearGradient>

      {/* Radius Control */}
      <Surface style={styles.radiusSection} elevation={2}>
        <SectionHeader title="Alert Radius" icon="location-outline" />
        <Text style={styles.radiusDescription}>
          Set your preferred radius to receive animal rescue alerts
        </Text>
        <View style={styles.radiusOptionsContainer}>
          {radiusOptions.map((option) => (
            <AnimatedTouchable key={option} onPress={() => setRadius(option)}>
              <View
                style={[
                  styles.radiusOption,
                  radius === option && styles.radiusOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.radiusOptionText,
                    radius === option && styles.radiusOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </AnimatedTouchable>
          ))}
        </View>
        <View style={styles.radiusInfo}>
          <Ionicons
            name="information-circle-outline"
            size={SIZES.fontSmall}
            color={COLORS.subtext}
          />
          <Text style={styles.radiusInfoText}>
            Currently covering approximately {radius} around your location
          </Text>
        </View>
      </Surface>

      {/* Map View */}
      <Surface style={styles.mapSection} elevation={3}>
        <View style={styles.mapHeader}>
          <SectionHeader title="Live Rescue Feed" icon="map-outline" />
          <Chip icon="refresh" onPress={() => {}} style={styles.refreshChip}>
            Refresh
          </Chip>
        </View>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {rescueCases.map((rescue) => (
            <Marker
              key={rescue.id}
              coordinate={rescue.location}
              pinColor={getSeverityStyles(rescue.severity).color}
              title={rescue.title}
            >
              <View
                style={[
                  styles.customMarker,
                  { backgroundColor: getSeverityStyles(rescue.severity).color },
                ]}
              >
                <Ionicons
                  iconname={getSeverityStyles(rescue.severity).icon}
                  size={20}
                  color="#fff"
                />
              </View>
            </Marker>
          ))}
        </MapView>
      </Surface>

      {/* Rescue Cases */}
      <View style={styles.casesSection}>
        <SectionHeader title="Nearby Rescue Cases" icon="heart-outline" />
        {rescueCases.map((rescue) => (
          <RescueCaseCard key={rescue.id} rescue={rescue} />
        ))}
      </View>

      {/* Status Updates */}
      <Surface style={styles.statusSection} elevation={2}>
        <SectionHeader title="Your Reports" icon="list-outline" />
        <Card style={styles.statusCard} elevation={1}>
          <Card.Content>
            {[
              {
                title: "Injured Cow Near Red Fort",
                description: "NGO: Animal Aid • Status: In Progress",
                icon: "alert",
                iconColor: COLORS.high,
                badge: "Active",
                badgeColor: COLORS.low,
              },
              {
                title: "Stray Pup with Broken Leg",
                description: "NGO: Awaiting Response • Status: Reported",
                icon: "paw",
                iconColor: COLORS.primary,
                badge: "Pending",
                badgeColor: COLORS.moderate,
              },
            ].map(
              (
                { title, description, icon, iconColor, badge, badgeColor },
                index
              ) => (
                <View key={index}>
                  <List.Item
                    title={title}
                    description={description}
                    left={(props) => (
                      <List.Icon {...props} icon={icon} color={iconColor} />
                    )}
                    right={() => (
                      <View style={styles.statusRight}>
                        <Badge
                          style={[
                            styles.statusBadge,
                            { backgroundColor: badgeColor },
                          ]}
                        >
                          {badge}
                        </Badge>
                        <IconButton icon="chevron-right" />
                      </View>
                    )}
                  />
                  {index < 1 && <Divider />}
                </View>
              )
            )}
          </Card.Content>
        </Card>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingTop: 40,
    paddingBottom: SIZES.padding,
    paddingHorizontal: SIZES.padding,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: { flex: 1 },
  greeting: {
    fontSize: SIZES.fontLarge + 10,
    color: "#fff",
    fontFamily: "cursive",
  },
  boldText: { fontWeight: "bold", fontFamily: "cursive" },


  headerSubRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  subText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.accent,
    fontWeight: "600",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 8,
  },
  iconSpacing: { marginHorizontal: 4 },
  headerNotifContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.critical,
    color: "#fff",
    fontSize: SIZES.fontTiny,
    paddingHorizontal: 4,
  },
  radiusSection: {
    margin: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: SIZES.fontLarge,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  sectionIcon: { marginRight: 8 },
  radiusDescription: {
    fontSize: SIZES.fontSmall,
    color: COLORS.subtext,
    marginBottom: 12,
  },
  radiusOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  radiusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  radiusOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  radiusOptionText: {
    fontSize: SIZES.fontSmall,
    color: COLORS.subtext,
    fontWeight: "500",
  },
  radiusOptionTextSelected: { color: "#fff" },
  radiusInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  radiusInfoText: { fontSize: SIZES.fontTiny, color: COLORS.subtext, flex: 1 },
  mapSection: {
    margin: SIZES.margin,
    borderRadius: SIZES.radius,
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SIZES.padding,
    paddingBottom: 8,
  },
  map: { width: "100%", height: 220 },
  customMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  refreshChip: { backgroundColor: COLORS.accent },
  casesSection: { paddingHorizontal: SIZES.margin },
  card: {
    backgroundColor: COLORS.card,
    marginBottom: SIZES.margin,
    borderRadius: SIZES.radius,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: SIZES.padding,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  animalImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontSize: SIZES.fontMedium,
    fontWeight: "bold",
    color: COLORS.text,
  },
  cardSubtitle: {
    fontSize: SIZES.fontSmall,
    color: COLORS.subtext,
    marginTop: 2,
  },
  cardHeaderRight: { alignItems: "flex-end" },
  severityChip: { marginBottom: 4 },
  chipText: { color: "#fff", fontSize: SIZES.fontTiny },
  timeStamp: { fontSize: SIZES.fontTiny, color: COLORS.subtext },
  cardDivider: { marginHorizontal: SIZES.padding },
  animalInfo: { padding: SIZES.padding, paddingBottom: 8 },
  infoSectionTitle: {
    fontSize: SIZES.fontSmall,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoItem: { flex: 1, minWidth: "45%" },
  infoLabel: { fontSize: SIZES.fontTiny, color: COLORS.subtext },
  infoValue: {
    fontSize: SIZES.fontSmall,
    fontWeight: "500",
    color: COLORS.text,
  },
  medicalInfo: { padding: SIZES.padding, paddingTop: 8 },
  injurySummary: {
    fontSize: SIZES.fontSmall,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  symptomsContainer: { marginBottom: 12 },
  symptomsTitle: {
    fontSize: SIZES.fontTiny,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  symptomsChips: { flexDirection: "row", flexWrap: "wrap", gap: 4},
  symptomChip: { backgroundColor: "#ff6868ff" },
  vitalsContainer: { marginBottom: 8 },
  vitalsTitle: {
    fontSize: SIZES.fontTiny,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  vitalsGrid: { flexDirection: "row", gap: 16 },
  vitalItem: { flex: 1 },
  vitalLabel: { fontSize: SIZES.fontTiny, color: COLORS.subtext },
  vitalValue: {
    fontSize: SIZES.fontSmall,
    fontWeight: "500",
    color: COLORS.text,
  },
  progressSection: { padding: SIZES.padding, paddingTop: 8 },
  progressTitle: {
    fontSize: SIZES.fontTiny,
    color: COLORS.subtext,
    marginBottom: 6,
  },
  progressBar: { height: 6, borderRadius: 3, marginBottom: 4 },
  progressText: {
    fontSize: SIZES.fontTiny,
    color: COLORS.subtext,
    textAlign: "right",
  },
  rescueTeamInfo: { padding: SIZES.padding, paddingTop: 8, gap: 8 },
  teamItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  teamText: { fontSize: SIZES.fontSmall, color: COLORS.text },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    padding: SIZES.padding,
    paddingTop: 8,
  },
  actionButton: { flex: 1 },
  statusSection: {
    margin: SIZES.margin,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.card,
  },
  statusCard: { backgroundColor: COLORS.accent, borderRadius: 12 },
  statusRight: { flexDirection: "row", alignItems: "center" },
  statusBadge: { backgroundColor: COLORS.low, color: "#fff", marginRight: 8 },
});
