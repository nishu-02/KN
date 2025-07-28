// Animal Rescue User Home Screen
// Enhanced UI, explicit types, and linter fixes

import * as React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Linking,
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
  Tooltip, // Add Tooltip for info icons
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from "react-native-maps";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useThemeContext } from '../../theme';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

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
// AnimatedTouchable with explicit types
const AnimatedTouchable: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
}> = ({ children, onPress }: { children: React.ReactNode; onPress: () => void }) => {
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

// SectionHeader with explicit types
const SectionHeader: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  themedStyles: any;
}> = ({ title, icon, theme, themedStyles }: { title: string; icon: keyof typeof Ionicons.glyphMap; theme: any; themedStyles: any }) => (
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

// Redesigned Stray Rescue Card with improved UI and explicit types
interface StrayRescueCardProps {
  rescue: RescueCase;
  theme: any;
  themedStyles: any;
}

const StrayRescueCard: React.FC<StrayRescueCardProps> = ({ rescue, theme, themedStyles }) => {
  const aiConfidence = 0.9; // 90%
  const ageProgress = 0.8; // 80%
  const severityProgress = 0.75; // 75%
  const urgencyProgress = 0.7; // 70%
  const behaviorProgress = 0.85; // 85%
  const [expanded, setExpanded] = React.useState(false);
  const [address, setAddress] = React.useState<string>("Locating...");

  React.useEffect(() => {
    (async () => {
      try {
        const geo = await Location.reverseGeocodeAsync(rescue.location);
        if (geo && geo.length > 0) {
          const g = geo[0];
          setAddress([g.name, g.street, g.district, g.city, g.region].filter(Boolean).join(', '));
        } else {
          setAddress("Unknown location");
        }
      } catch {
        setAddress("Unknown location");
      }
    })();
  }, [rescue.location]);

  const openInMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${rescue.location.latitude},${rescue.location.longitude}`;
    Linking.openURL(url);
  };

  // In StrayRescueCard, update the color assignments for the summary bar:
  // Replace theme.colors.critical, theme.colors.high, theme.colors.low, theme.colors.moderate with darker, more saturated colors for light mode.

  // Example color assignments for better visibility in light mode:
  const summaryColors = {
    severity: theme.isDark ? '#FF8A80' : '#D32F2F',      // Red 700
    urgency: theme.isDark ? '#FFD180' : '#F9A825',       // Amber 800
    behavior: theme.isDark ? '#A5D6A7' : '#388E3C',      // Green 700
    age: theme.isDark ? '#FFF59D' : '#FBC02D',           // Yellow 800
    ai: theme.isDark ? '#A5D6A7' : '#388E3C',            // Green 700 for AI confidence
  };

  return (
    <Card style={[themedStyles.card, { marginBottom: 16, borderWidth: 1, borderColor: theme.colors.accent }]} elevation={3}>
      {/* Card Header: Title, Species, Location, Time */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <Image source={{ uri: rescue.image }} style={{ width: 70, height: 70, borderRadius: 12, marginRight: 12, borderWidth: 2, borderColor: theme.colors.critical }} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.colors.text }}>
            {rescue.title} <Text style={{ fontSize: 15 }}>{rescue.species === 'Canine' ? '🐶' : rescue.species === 'Avian' ? '🐦' : '🐾'}</Text>
          </Text>
          <TouchableOpacity onPress={openInMaps} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Ionicons name="location-outline" size={14} color={theme.colors.tabInactive} style={{ marginRight: 4 }} />
            <Text style={{ color: theme.colors.tabInactive, fontSize: 13, textDecorationLine: 'underline', flexWrap: 'wrap', flex: 1 }}>
              {address}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: theme.colors.tabInactive, fontSize: 13 }}>
            🕒 {rescue.time}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Tooltip title="AI Confidence: How sure the AI is about the analysis" enterTouchDelay={0}>
            <Ionicons name="information-circle-outline" size={16} color={summaryColors.ai} style={{ marginBottom: 2 }} />
          </Tooltip>
          <Text style={{ fontSize: 12, color: theme.colors.tabInactive }}>AI Confidence</Text>
          <Text style={{ fontWeight: 'bold', color: summaryColors.ai }}>{Math.round(aiConfidence * 100)}%</Text>
          <ProgressBar progress={aiConfidence} color={summaryColors.ai} style={{ width: 40, height: 6, borderRadius: 3, marginTop: 2 }} />
        </View>
      </View>
      <Divider />
      {/* Visual Summary Bar for Severity, Urgency, Age, Behavior */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8 }}>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Tooltip title="Severity: How serious the injury is" enterTouchDelay={0}>
            <Ionicons name="alert-circle-outline" size={18} color={summaryColors.severity} />
          </Tooltip>
          <ProgressBar progress={severityProgress} color={summaryColors.severity} style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }} />
          <Text style={{ fontSize: 11, color: summaryColors.severity, marginTop: 2 }}>Severity</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Tooltip title="Urgency: How quickly action is needed" enterTouchDelay={0}>
            <Ionicons name="timer-outline" size={18} color={summaryColors.urgency} />
          </Tooltip>
          <ProgressBar progress={urgencyProgress} color={summaryColors.urgency} style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }} />
          <Text style={{ fontSize: 11, color: summaryColors.urgency, marginTop: 2 }}>Urgency</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Tooltip title="Behavior: How calm or aggressive the animal is" enterTouchDelay={0}>
            <Ionicons name="paw-outline" size={18} color={summaryColors.behavior} />
          </Tooltip>
          <ProgressBar progress={behaviorProgress} color={summaryColors.behavior} style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }} />
          <Text style={{ fontSize: 11, color: summaryColors.behavior, marginTop: 2 }}>Behavior</Text>
            </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Tooltip title="Age: Estimated age of the animal" enterTouchDelay={0}>
            <Ionicons name="calendar-outline" size={18} color={summaryColors.age} />
          </Tooltip>
          <ProgressBar progress={ageProgress} color={summaryColors.age} style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }} />
          <Text style={{ fontSize: 11, color: summaryColors.age, marginTop: 2 }}>Age</Text>
        </View>
      </View>
      <Divider />
      {/* Injury, Symptoms, Vet Timeline, Context */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ fontSize: 13, color: theme.colors.text, fontWeight: 'bold', marginBottom: 2 }}>🩹 Injury</Text>
        <Text
          numberOfLines={expanded ? undefined : 2}
          ellipsizeMode={expanded ? undefined : 'tail'}
          onPress={() => setExpanded((e) => !e)}
          style={{ color: theme.colors.text, fontWeight: 'normal', textDecorationLine: expanded ? 'underline' : 'none', marginBottom: 4 }}
        >
          {rescue.injurySummary || 'Wound'}
        </Text>
        {!expanded && rescue.injurySummary && rescue.injurySummary.length > 40 && (
          <Text style={{ color: theme.colors.primary }} onPress={() => setExpanded(true)}> ...more</Text>
        )}
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>🩸 <Text style={{ fontWeight: 'bold' }}>Symptoms:</Text> {rescue.symptoms.slice(0, 3).join(', ')}</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>🕒 <Text style={{ fontWeight: 'bold' }}>Vet Timeline:</Text> 1-2 hrs</Text>
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>🏞️ <Text style={{ fontWeight: 'bold' }}>Context:</Text> Stray</Text>
          </View>
      <Divider />
      {/* Actions and Care Tips */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: theme.colors.text, fontWeight: 'bold' }}>Actions:</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>🛑 Approach gently</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>📞 Call for help</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>📸 Take a photo</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: theme.colors.text, fontWeight: 'bold' }}>Care Tips:</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>💦 Give water</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>🍗 Offer food</Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>🧣 Keep warm</Text>
        </View>
      </View>
      <Divider />
      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 }}>
        <Button mode="outlined" icon="send" style={{ flex: 1, marginRight: 8 }} onPress={() => {}}>
          Send to Volunteer
        </Button>
        <Button mode="contained" icon="check" style={{ flex: 1 }} buttonColor={summaryColors.ai} onPress={() => {}}>
          I Will Take It
        </Button>
      </View>
      <Divider />
      {/* Disclaimer */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 12, color: theme.colors.tabInactive }}>
          ⚠️ AI-based, see vet. Injury area highlighted in image. Empathy saves lives.
        </Text>
      </View>
    </Card>
  );
};

export default function UserHomeScreen() {
  const { theme } = useThemeContext();
  const themedStyles = styles(theme);
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [radius, setRadius] = React.useState("5 km");
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = React.useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [address, setAddress] = React.useState<string>("Locating...");
  const [currentTime, setCurrentTime] = React.useState<string>(new Date().toLocaleTimeString());
  const [refreshing, setRefreshing] = React.useState(false);
  const [rescueCasesState, setRescueCasesState] = React.useState(rescueCases);

  // Accept new rescue card from navigation params
  useFocusEffect(
    React.useCallback(() => {
      if (route.params && route.params.newRescue) {
        console.log('Adding new rescue card:', route.params.newRescue);
        setRescueCasesState(prev => [route.params.newRescue, ...prev]);
        // Clear the params to prevent re-adding on subsequent focuses
        navigation.setParams(undefined);
      }
    }, [route.params, navigation])
  );

  // Fetch location and address (non-blocking, update UI when ready)
  const fetchLocationAndAddress = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        let geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        if (geo && geo.length > 0) {
          const g = geo[0];
          const addr = [g.name, g.street, g.district, g.city, g.region].filter(Boolean).join(', ');
          setAddress(addr);
        } else {
          setAddress("Unknown location");
        }
      } else {
        setAddress("Location Permission Denied");
      }
    } catch (e) {
      setAddress("Location Error");
    }
  };
  React.useEffect(() => {
    fetchLocationAndAddress();
  }, []);
  // Real-time clock
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);
  // Pull-to-refresh handler with max timeout
  const onRefresh = async () => {
    setRefreshing(true);
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) setRefreshing(false);
    }, 2000);
    await fetchLocationAndAddress();
    setCurrentTime(new Date().toLocaleTimeString());
    finished = true;
    setRefreshing(false);
    clearTimeout(timeout);
  };
  // Convert radius string to meters
  const getRadiusMeters = (radiusStr: string) => {
    const num = parseFloat(radiusStr);
    if (radiusStr.includes('km')) return num * 1000;
    if (radiusStr.includes('m')) return num;
    return 5000; // default 5km
  };
  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.margin * 7.5 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
                size={14}
                color={theme.colors.subtext}
                style={themedStyles.iconSpacing}
              />
              <Text style={themedStyles.subText}>{address}</Text>
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

      {/* Combined Live Rescue Feed & Alert Radius Card */}
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
            latitude: userLocation?.latitude || 28.6139,
            longitude: userLocation?.longitude || 77.209,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          region={userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          } : undefined}
          showsUserLocation={!!userLocation}
        >
          {/* User location pin and radius */}
          {userLocation && (
            <>
              <Marker
                coordinate={userLocation}
                title="You are here"
                pinColor={theme.colors.primary}
              />
              <Circle
                center={userLocation}
                radius={getRadiusMeters(radius)}
                strokeColor={theme.colors.primary}
                fillColor={theme.colors.primary + '20'}
                
              />
            </>
          )}
          {rescueCasesState.map((rescue) => {
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
        {/* Alert Radius Row at the bottom of the card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: theme.colors.accent }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={theme.colors.subtext} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: 'black', fontWeight: '600' }}>Alert Radius :-   </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 8 }}>
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
          </ScrollView>
        </View>
      </Surface>

      {/* Rescue Cases */}
      <View style={themedStyles.casesSection}>
        <SectionHeader title="Nearby Rescue Cases" icon="heart-outline" theme={theme} themedStyles={themedStyles} />
        {rescueCasesState.map((rescue) => (
          <StrayRescueCard key={rescue.id} rescue={rescue} theme={theme} themedStyles={themedStyles} />
        ))}
      </View>

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
  headerTextContainer: { flex: 1, flexWrap: 'wrap' },
  greeting: {
    fontFamily: 'cursive',
    fontSize: (theme.spacing.fontLarge ? theme.spacing.fontLarge + 6 : 36),
    color: theme.colors.text,
    fontWeight: "600",
  },
  boldText: { fontWeight: "condensedBold", fontSize: (theme.spacing.fontLarge ? theme.spacing.fontLarge + 10 : 30), color: theme.colors.text },
  headerSubRow: { flexDirection: "row", alignItems: "center", marginTop: 6, color: 'black' },
  subText: {
    fontSize: 14,
    color: 'black',
    fontWeight: "500",
    flexWrap: 'wrap',
    paddingRight: 25,
    flex: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.tabActive,
    marginHorizontal: 8,
  },
  iconSpacing: { marginHorizontal: 2 },
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
    color: theme.colors.subtext,
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
    // borderColor: theme.colors.tabActive,
  },
  radiusOptionText: {
    fontSize: 14,
    color: 'black',
    fontWeight: "500",
  },
  radiusOptionTextSelected: { color: '#ffb259ff' },
  radiusInfo: { flexDirection: "row", alignItems: "center", gap: 8, color: theme.colors.subtext },
  radiusInfoText: { fontSize: 12, color: 'black', flex: 1 },
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
