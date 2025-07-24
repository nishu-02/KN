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
import { useThemeContext } from '../../theme';

const screenWidth = Dimensions.get("window").width;

// Constants for styling
const COLORS = {
  primary: "#6D4C41", // Softer brown
  secondary: "#BCAAA4", // Muted tan
  background: "#FAFAFA", // Very light gray
  card: "#FFFFFF",
  text: "#222",
  subtext: "#888",
  critical: "#FFCDD2", // Pastel red
  high: "#FFE0B2", // Pastel orange
  moderate: "#FFF9C4", // Pastel yellow
  low: "#C8E6C9", // Pastel green
  accent: "#F5F5F5", // Subtle accent
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
const getSeverityStyles = (severity: string, theme: any) => ({
  color:
    {
      Critical: theme.colors.critical,
      High: theme.colors.high,
      Moderate: theme.colors.moderate,
      Low: theme.colors.low,
    }[severity] || theme.colors.subtext,
  icon:
    {
      Critical: "alert-circle-outline",
      High: "alert-outline",
      Moderate: "alert-outline",
      Low: "checkmark-circle-outline",
    }[severity] || "help-circle-outline",
  textColor:
    {
      Critical: "#B71C1C",
      High: "#E65100",
      Moderate: "#F9A825",
      Low: "#388E3C",
    }[severity] || theme.colors.subtext,
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
  theme: any;
  themedStyles: any;
}> = ({ title, icon, theme, themedStyles }) => (
  <View style={themedStyles.sectionHeader}>
    <Ionicons
      name={icon}
      size={theme.spacing.fontMedium || 16}
      color={theme.colors.tabActive}
      style={themedStyles.sectionIcon}
    />
    <Text style={themedStyles.sectionTitle}>{title}</Text>
  </View>
);

const RescueCaseCard: React.FC<{ rescue: RescueCase; theme: any; themedStyles: any }> = ({ rescue, theme, themedStyles }) => {
  const { color, icon, textColor } = getSeverityStyles(rescue.severity, theme);

  return (
    <Card style={themedStyles.card} elevation={0}>
      <View style={themedStyles.cardHeader}>
        <View style={themedStyles.cardHeaderLeft}>
          <Image source={{ uri: rescue.image }} style={themedStyles.animalImage} />
          <View style={themedStyles.cardHeaderText}>
            <Text style={themedStyles.cardTitle}>{rescue.title}</Text>
            <Text style={themedStyles.cardSubtitle}>{`${rescue.species} • ${rescue.breed}`}</Text>
          </View>
        </View>
        <View style={themedStyles.cardHeaderRight}>
          <Chip
            icon={icon as any}
            style={[themedStyles.severityChip, { backgroundColor: color, borderWidth: 1, borderColor: textColor }]}
            textStyle={[themedStyles.chipText, { color: textColor }]}
          >
            {rescue.severity}
          </Chip>
          <Text style={themedStyles.timeStamp}>{rescue.time}</Text>
        </View>
      </View>
      <Divider style={themedStyles.cardDivider} />
      <View style={themedStyles.animalInfo}>
        <Text style={themedStyles.infoSectionTitle}>Animal Information</Text>
        <View style={themedStyles.infoGrid}>
          {[
            { label: "Age", value: rescue.age },
            { label: "Gender", value: rescue.gender },
            { label: "Weight", value: rescue.weight },
            { label: "Species", value: rescue.species },
          ].map(({ label, value }, index) => (
            <View key={index} style={themedStyles.infoItem}>
              <Text style={themedStyles.infoLabel}>{`${label}:`}</Text>
              <Text style={themedStyles.infoValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={themedStyles.medicalInfo}>
        <Text style={themedStyles.infoSectionTitle}>Medical Status</Text>
        <Text style={themedStyles.injurySummary}>{rescue.injurySummary}</Text>
        <View style={themedStyles.symptomsContainer}>
          <Text style={themedStyles.symptomsTitle}>Symptoms:</Text>
          <View style={themedStyles.symptomsChips}>
            {rescue.symptoms.map((symptom, index) => (
              <Chip
                key={index}
                style={themedStyles.symptomChip}
                textStyle={themedStyles.chipText}
              >
                {symptom}
              </Chip>
            ))}
          </View>
        </View>
        <View style={themedStyles.vitalsContainer}>
          <Text style={themedStyles.vitalsTitle}>Vital Signs:</Text>
          <View style={themedStyles.vitalsGrid}>
            {[
              { label: "Temp", value: rescue.vitals.temperature },
              { label: "Heart", value: rescue.vitals.heartRate },
              { label: "Breathing", value: rescue.vitals.breathing },
            ].map(({ label, value }, index) => (
              <View key={index} style={themedStyles.vitalItem}>
                <Text style={themedStyles.vitalLabel}>{`${label}:`}</Text>
                <Text style={themedStyles.vitalValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={themedStyles.progressSection}>
        <Text style={themedStyles.progressTitle}>Rescue Progress</Text>
        <ProgressBar
          progress={rescue.rescueProgress}
          color={color}
          style={themedStyles.progressBar}
        />
        <Text style={themedStyles.progressText}>{`${Math.round(
          rescue.rescueProgress * 100
        )}% Complete`}</Text>
      </View>
      <View style={themedStyles.rescueTeamInfo}>
        {[
          { icon: "business-outline", text: `NGO: ${rescue.ngo}` },
          { icon: "person-outline", text: `Volunteer: ${rescue.volunteer}` },
          { icon: "card-outline", text: `Est. Cost: ${rescue.estimatedCost}` },
        ].map(({ icon, text }, index) => (
          <View key={index} style={themedStyles.teamItem}>
            <Ionicons
              name={icon as any}
              size={theme.spacing.fontSmall || 14}
              color={theme.colors.tabInactive}
            />
            <Text style={themedStyles.teamText}>{text}</Text>
          </View>
        ))}
      </View>
      <View style={themedStyles.cardActions}>
        {[
          {
            icon: "check-circle-outline",
            text: "Mark Helped",
            mode: "contained" as "contained",
            color: theme.colors.low,
          },
          {
            icon: "alert-circle-outline",
            text: "Report Again",
            mode: "outlined" as "outlined",
            textColor: theme.colors.high,
          },
          {
            icon: "share-outline",
            text: "Share",
            mode: "text" as "text",
            textColor: theme.colors.primary,
          },
        ].map(({ icon, text, mode, color, textColor }, index) => (
          <Button
            key={index}
            mode={mode}
            icon={icon as any}
            style={themedStyles.actionButton}
            buttonColor={color}
            textColor={textColor || theme.colors.text}
          >
            {text}
          </Button>
        ))}
      </View>
    </Card>
  );
};

export default function UserDashboard() {
  const { theme } = useThemeContext();
  const themedStyles = styles(theme);
  const [radius, setRadius] = useState("5 km");
  const [location, setLocation] = useState<Location>({
    city: "New Delhi",
    time: "8:35 AM",
  });

  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.margin * 7.5 }}
    >
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.tabBackground1, theme.colors.tabBackground2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={themedStyles.header}
      >
        <View style={themedStyles.headerRow}>
          <View style={themedStyles.headerTextContainer}>
            <Text style={themedStyles.greeting}>
              Good Morning, <Text style={themedStyles.boldText}>Sean</Text>
            </Text>
            <View style={themedStyles.headerSubRow}>
              <Ionicons
                name="location-outline"
                size={theme.spacing.fontSmall || 14}
                color={theme.colors.tabInactive}
                style={themedStyles.iconSpacing}
              />
              <Text style={themedStyles.subText}>{location.city}</Text>
              <View style={themedStyles.dot} />
              <Ionicons
                name="time-outline"
                size={theme.spacing.fontSmall || 14}
                color={theme.colors.tabInactive}
                style={themedStyles.iconSpacing}
              />
              <Text style={themedStyles.subText}>{location.time}</Text>
            </View>
          </View>
          <AnimatedTouchable onPress={() => {}}>
            <View style={themedStyles.headerNotifContainer}>
              <Ionicons
                name="notifications-outline"
                size={28}
                color={theme.colors.tabActive}
              />
              <Badge style={themedStyles.notifBadge}>2</Badge>
            </View>
          </AnimatedTouchable>
        </View>
      </LinearGradient>

      {/* Radius Control */}
      <Surface style={themedStyles.radiusSection} elevation={0}>
        <SectionHeader title="Alert Radius" icon="location-outline" theme={theme} themedStyles={themedStyles} />
        <Text style={themedStyles.radiusDescription}>
          Set your preferred radius to receive animal rescue alerts
        </Text>
        <View style={themedStyles.radiusOptionsContainer}>
          {radiusOptions.map((option) => (
            <AnimatedTouchable key={option} onPress={() => setRadius(option)}>
              <View
                style={[
                  themedStyles.radiusOption,
                  radius === option && themedStyles.radiusOptionSelected,
                ]}
              >
                <Text
                  style={[
                    themedStyles.radiusOptionText,
                    radius === option && themedStyles.radiusOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </View>
            </AnimatedTouchable>
          ))}
        </View>
        <View style={themedStyles.radiusInfo}>
          <Ionicons
            name="information-circle-outline"
            size={theme.spacing.fontSmall || 14}
            color={theme.colors.tabInactive}
          />
          <Text style={themedStyles.radiusInfoText}>
            Currently covering approximately {radius} around your location
          </Text>
        </View>
      </Surface>

      {/* Map View */}
      <Surface style={themedStyles.mapSection} elevation={0}>
        <View style={themedStyles.mapHeader}>
          <SectionHeader title="Live Rescue Feed" icon="map-outline" theme={theme} themedStyles={themedStyles} />
          <Chip icon="refresh" onPress={() => {}} style={themedStyles.refreshChip}>
            Refresh
          </Chip>
        </View>
        <MapView
          style={themedStyles.map}
          initialRegion={{
            latitude: 28.6139,
            longitude: 77.209,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {rescueCases.map((rescue) => {
            const { color, icon, textColor } = getSeverityStyles(rescue.severity, theme);
            return (
            <Marker
              key={rescue.id}
              coordinate={rescue.location}
                pinColor={color}
              title={rescue.title}
            >
              <View
                style={[
                    themedStyles.customMarker,
                    { backgroundColor: color },
                ]}
              >
                <Ionicons
                    name={icon as any}
                  size={16}
                    color={textColor}
                />
              </View>
            </Marker>
            );
          })}
        </MapView>
      </Surface>

      {/* Rescue Cases */}
      <View style={themedStyles.casesSection}>
        <SectionHeader title="Nearby Rescue Cases" icon="heart-outline" theme={theme} themedStyles={themedStyles} />
        {rescueCases.map((rescue) => (
          <RescueCaseCard key={rescue.id} rescue={rescue} theme={theme} themedStyles={themedStyles} />
        ))}
      </View>

      {/* Status Updates */}
      <Surface style={themedStyles.statusSection} elevation={0}>
        <SectionHeader title="Your Reports" icon="list-outline" theme={theme} themedStyles={themedStyles} />
        <Card style={themedStyles.statusCard} elevation={0}>
          <Card.Content>
            {[
              {
                title: "Injured Cow Near Red Fort",
                description: "NGO: Animal Aid • Status: In Progress",
                icon: "alert",
                iconColor: theme.colors.high,
                badge: "Active",
                badgeColor: theme.colors.low,
              },
              {
                title: "Stray Pup with Broken Leg",
                description: "NGO: Awaiting Response • Status: Reported",
                icon: "paw",
                iconColor: theme.colors.primary,
                badge: "Pending",
                badgeColor: theme.colors.moderate,
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
                      <List.Icon {...props} icon={icon as any} color={iconColor} />
                    )}
                    right={() => (
                      <View style={themedStyles.statusRight}>
                        <Badge
                          style={[
                            themedStyles.statusBadge,
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

const styles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 40,
    paddingBottom: theme.spacing.padding,
    paddingHorizontal: theme.spacing.padding,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    backgroundColor: theme.colors.tabBackground1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTextContainer: { flex: 1 },
  greeting: {
    fontSize: (theme.spacing.fontLarge ? theme.spacing.fontLarge + 6 : 26),
    color: theme.colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  boldText: { fontWeight: "bold", fontSize: (theme.spacing.fontLarge ? theme.spacing.fontLarge + 10 : 30), color: theme.colors.text },
  headerSubRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  subText: {
    fontSize: 14,
    color: theme.colors.tabInactive,
    fontWeight: "500",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tabActive,
    marginHorizontal: 8,
  },
  iconSpacing: { marginHorizontal: 4 },
  headerNotifContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.critical,
    color: theme.colors.text,
    fontSize: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.card,
  },
  radiusSection: {
    margin: theme.spacing.margin,
    padding: theme.spacing.padding,
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.tabActive,
  },
  sectionIcon: { marginRight: 8 },
  radiusDescription: {
    fontSize: 14,
    color: theme.colors.tabInactive,
    marginBottom: 10,
  },
  radiusOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  radiusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.tabBackground2,
    borderWidth: 1,
    borderColor: theme.colors.tabBackground2,
  },
  radiusOptionSelected: {
    backgroundColor: theme.colors.tabActive,
    borderColor: theme.colors.tabActive,
  },
  radiusOptionText: {
    fontSize: 14,
    color: theme.colors.tabInactive,
    fontWeight: "500",
  },
  radiusOptionTextSelected: { color: theme.colors.card },
  radiusInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  radiusInfoText: { fontSize: 12, color: theme.colors.tabInactive, flex: 1 },
  mapSection: {
    margin: theme.spacing.margin,
    borderRadius: theme.spacing.radius,
    overflow: "hidden",
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  mapHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.padding,
    paddingBottom: 8,
  },
  map: { width: "100%", height: 200 },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.card,
    backgroundColor: theme.colors.tabBackground2,
  },
  refreshChip: { backgroundColor: theme.colors.tabBackground2, borderWidth: 1, borderColor: theme.colors.tabActive },
  casesSection: { paddingHorizontal: theme.spacing.margin },
  card: {
    backgroundColor: theme.colors.card,
    marginBottom: theme.spacing.margin,
    borderRadius: theme.spacing.radius,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: theme.spacing.padding,
    paddingBottom: 0,
  },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  animalImage: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.colors.tabInactive,
    marginTop: 2,
  },
  cardHeaderRight: { alignItems: "flex-end" },
  severityChip: { marginBottom: 4, borderRadius: 8 },
  chipText: { fontSize: 12, fontWeight: "bold" },
  timeStamp: { fontSize: 12, color: theme.colors.tabInactive },
  cardDivider: { marginHorizontal: theme.spacing.padding },
  animalInfo: { padding: theme.spacing.padding, paddingBottom: 8 },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.tabActive,
    marginBottom: 8,
  },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  infoItem: { flex: 1, minWidth: "45%" },
  infoLabel: { fontSize: 12, color: theme.colors.tabInactive },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  medicalInfo: { padding: theme.spacing.padding, paddingTop: 8 },
  injurySummary: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 10,
    lineHeight: 18,
  },
  symptomsContainer: { marginBottom: 10 },
  symptomsTitle: {
    fontSize: 12,
    color: theme.colors.tabInactive,
    marginBottom: 4,
  },
  symptomsChips: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  symptomChip: { backgroundColor: theme.colors.critical },
  vitalsContainer: { marginBottom: 8 },
  vitalsTitle: {
    fontSize: 12,
    color: theme.colors.tabInactive,
    marginBottom: 4,
  },
  vitalsGrid: { flexDirection: "row", gap: 12 },
  vitalItem: { flex: 1 },
  vitalLabel: { fontSize: 12, color: theme.colors.tabInactive },
  vitalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  progressSection: { padding: theme.spacing.padding, paddingTop: 8 },
  progressTitle: {
    fontSize: 12,
    color: theme.colors.tabInactive,
    marginBottom: 4,
  },
  progressBar: { height: 4, borderRadius: 2, marginBottom: 2 },
  progressText: {
    fontSize: 12,
    color: theme.colors.tabInactive,
    textAlign: "right",
  },
  rescueTeamInfo: { padding: theme.spacing.padding, paddingTop: 8, gap: 6 },
  teamItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  teamText: { fontSize: 14, color: theme.colors.text },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    padding: theme.spacing.padding,
    paddingTop: 8,
  },
  actionButton: { flex: 1 },
  statusSection: {
    margin: theme.spacing.margin,
    padding: theme.spacing.padding,
    borderRadius: theme.spacing.radius,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.accent,
  },
  statusCard: { backgroundColor: theme.colors.tabBackground2, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.tabBackground2 },
  statusRight: { flexDirection: "row", alignItems: "center" },
  statusBadge: { backgroundColor: theme.colors.low, color: theme.colors.text, marginRight: 8, borderRadius: 8 },
});
