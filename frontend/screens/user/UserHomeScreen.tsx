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
  Alert,
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
  Tooltip,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useThemeContext } from "../../theme";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo"; // Add for offline detection

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

  // API-specific fields
  report_id?: string;
  user_id?: string;
  image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  location_string?: string;
  latitude?: number;
  longitude?: number;
  ngo_assigned?: string | null;
  volunteer_assigned?: string | null;
  ngo_name?: string | null;
  volunteer_name?: string | null;
  description?: string;
  urgency?: string;
  behavior?: string;
  context?: string;
  confidence_score?: number;
  care_tips?: string[];
  report_data?: any;
  ai_analysis?: {
    severity_score?: number;
    urgency_score?: number;
    behavior_score?: number;
    age_score?: number;
    overall_confidence?: number;
  };
}

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

// Leaflet Map Component
interface LeafletMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  rescueCases: RescueCase[];
  radius: string;
  theme: any;
  onRefresh: () => void;
  refreshing: boolean;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  userLocation,
  rescueCases,
  radius,
  theme,
  onRefresh,
  refreshing,
}) => {
  const getRadiusMeters = (radiusStr: string) => {
    const num = parseFloat(radiusStr);
    if (radiusStr.includes("km")) return num * 1000;
    if (radiusStr.includes("m")) return num;
    return 1000; // default 1km
  };

  const getMapZoomLevel = (radiusStr: string): number => {
    const radiusKm = parseFloat(radiusStr.split(" ")[0]);
    const zoom = 14 - Math.log2(radiusKm);
    return Math.max(8, Math.min(16, Math.round(zoom))); // Clamp between 8 and 16
  };

  const radiusMeters = getRadiusMeters(radius);
  const zoomLevel = getMapZoomLevel(radius);
  const centerLat = userLocation?.latitude || 28.65; // Ramesh Nagar, West Delhi
  const centerLng = userLocation?.longitude || 77.12;

  // Create HTML for Leaflet map
  const createMapHTML = () => {
    const markers = rescueCases
      .map((rescue, index) => {
        const { color, icon, textColor } = getSeverityStyles(
          rescue.severity,
          theme
        );
        return `
        L.marker([${rescue.location.latitude}, ${rescue.location.longitude}], {
          icon: L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-${icon}" style="color: ${textColor}; font-size: 12px;"></i></div>',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        }).addTo(map).bindPopup('<b>${rescue.title}</b><br>${rescue.species} - ${rescue.severity}');
      `;
      })
      .join("");

    const userMarker = userLocation
      ? `
      L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
        icon: L.divIcon({
          className: 'user-marker',
          html: '<div style="background-color: ${theme.colors.primary}; width: 20px; height: 20px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-user" style="color: white; font-size: 10px;"></i></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map).bindPopup('<b>You are here</b>');
      
      L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
        color: '${theme.colors.primary}',
        fillColor: '${theme.colors.primary}',
        fillOpacity: 0.2,
        radius: ${radiusMeters}
      }).addTo(map);
    `
      : "";

    // Calculate bounds to show the entire radius circle
    const radiusKm = parseFloat(radius.split(" ")[0]);
    const radiusDegrees = radiusKm / 111; // Approximate degrees per km
    const bounds = userLocation
      ? [
          [
            userLocation.latitude - radiusDegrees,
            userLocation.longitude - radiusDegrees,
          ],
          [
            userLocation.latitude + radiusDegrees,
            userLocation.longitude + radiusDegrees,
          ],
        ]
      : [
          [centerLat - radiusDegrees, centerLng - radiusDegrees],
          [centerLat + radiusDegrees, centerLng + radiusDegrees],
        ];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rescue Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .custom-marker { background: transparent; border: none; }
          .user-marker { background: transparent; border: none; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([${centerLat}, ${centerLng}], ${zoomLevel});
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          ${userMarker}
          ${markers}
          
          // Fit map to show the entire radius circle
          map.fitBounds([${bounds[0]}, ${bounds[1]}], { padding: [10, 10] });
        </script>
      </body>
      </html>
    `;
  };

  return (
    <WebView
      source={{ html: createMapHTML() }}
      style={{ width: "100%", height: 200 }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
    />
  );
};

// Reusable Components
// AnimatedTouchable with explicit types
const AnimatedTouchable: React.FC<{
  children: React.ReactNode;
  onPress: () => void;
}> = ({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) => {
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
}> = ({
  title,
  icon,
  theme,
  themedStyles,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
  themedStyles: any;
}) => (
  <View style={themedStyles.sectionHeader}>
    <Ionicons
      name={icon}
      size={theme.spacing.fontMedium || 16}
      color={theme.colors.primary}
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

const StrayRescueCard: React.FC<StrayRescueCardProps> = ({
  rescue,
  theme,
  themedStyles,
}) => {
  // Use API data if available, otherwise fallback to defaults
  const aiConfidence = rescue.ai_analysis?.overall_confidence
    ? rescue.ai_analysis.overall_confidence / 10
    : 0.9;
  const ageProgress = rescue.ai_analysis?.age_score
    ? rescue.ai_analysis.age_score / 10
    : 0.8;
  const severityProgress = rescue.ai_analysis?.severity_score
    ? rescue.ai_analysis.severity_score / 10
    : 0.75;
  const urgencyProgress = rescue.ai_analysis?.urgency_score
    ? rescue.ai_analysis.urgency_score / 10
    : 0.7;
  const behaviorProgress = rescue.ai_analysis?.behavior_score
    ? rescue.ai_analysis.behavior_score / 10
    : 0.85;
  const [expanded, setExpanded] = React.useState(false);
  const [address, setAddress] = React.useState<string>("Locating...");
  const [distance, setDistance] = React.useState<string>("");

  // Calculate distance from user location
  React.useEffect(() => {
    const userLocation = { latitude: 28.65, longitude: 77.12 }; // Default Ramesh Nagar
    const calculateDistance = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in kilometers
    };

    const dist = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      rescue.location.latitude,
      rescue.location.longitude
    );
    setDistance(`${dist.toFixed(1)} km away`);
  }, [rescue.location]);

  React.useEffect(() => {
    (async () => {
      try {
        const geo = await Location.reverseGeocodeAsync(rescue.location);
        if (geo && geo.length > 0) {
          const g = geo[0];
          setAddress(
            [g.name, g.street, g.district, g.city, g.region]
              .filter(Boolean)
              .join(", ")
          );
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

  // Example color assignments for better visibility in light mode:
  const summaryColors = {
    severity: theme.isDark ? "#FF8A80" : "#D32F2F", // Red 700
    urgency: theme.isDark ? "#FFD180" : "#F9A825", // Amber 800
    behavior: theme.isDark ? "#A5D6A7" : "#388E3C", // Green 700
    age: theme.isDark ? "#FFF59D" : "#FBC02D", // Yellow 800
    ai: theme.isDark ? "#A5D6A7" : "#388E3C", // Green 700 for AI confidence
  };

  return (
    <Card
      style={[
        themedStyles.card,
        { marginBottom: 16, borderWidth: 1, borderColor: theme.colors.accent },
      ]}
      elevation={3}
    >
      {/* Card Header: Title, Species, Location, Time */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12 }}>
        <Image
          source={{ uri: rescue.image }}
          style={{
            width: 70,
            height: 70,
            borderRadius: 12,
            marginRight: 12,
            borderWidth: 2,
            borderColor: theme.colors.critical,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: theme.colors.text,
            }}
          >
            {rescue.title}{" "}
            <Text style={{ fontSize: 15 }}>
              {rescue.species === "Canine"
                ? "🐶"
                : rescue.species === "Avian"
                ? "🐦"
                : "🐾"}
            </Text>
          </Text>
          <TouchableOpacity
            onPress={openInMaps}
            activeOpacity={0.7}
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.tabInactive}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: theme.colors.tabInactive,
                fontSize: 13,
                textDecorationLine: "underline",
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {address}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: theme.colors.tabInactive, fontSize: 13 }}>
            🕒 {rescue.time} • 📍 {distance}
          </Text>
        </View>
        <View style={{ alignItems: "center" }}>
          <Tooltip
            title="AI Confidence: How sure the AI is about the analysis"
            enterTouchDelay={0}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={summaryColors.ai}
              style={{ marginBottom: 2 }}
            />
          </Tooltip>
          <Text style={{ fontSize: 12, color: theme.colors.tabInactive }}>
            AI Confidence
          </Text>
          <Text style={{ fontWeight: "bold", color: summaryColors.ai }}>
            {rescue.confidence_score
              ? `${rescue.confidence_score}/10`
              : `${Math.round(aiConfidence * 100)}%`}
          </Text>
          <ProgressBar
            progress={aiConfidence}
            color={summaryColors.ai}
            style={{ width: 40, height: 6, borderRadius: 3, marginTop: 2 }}
          />
        </View>
      </View>
      <Divider />
      {/* Visual Summary Bar for Severity, Urgency, Age, Behavior */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
          gap: 8,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Tooltip
            title="Severity: How serious the injury is"
            enterTouchDelay={0}
          >
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={summaryColors.severity}
            />
          </Tooltip>
          <ProgressBar
            progress={severityProgress}
            color={summaryColors.severity}
            style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }}
          />
          <Text
            style={{
              fontSize: 11,
              color: summaryColors.severity,
              marginTop: 2,
            }}
          >
            Severity
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Tooltip
            title="Urgency: How quickly action is needed"
            enterTouchDelay={0}
          >
            <Ionicons
              name="timer-outline"
              size={18}
              color={summaryColors.urgency}
            />
          </Tooltip>
          <ProgressBar
            progress={urgencyProgress}
            color={summaryColors.urgency}
            style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }}
          />
          <Text
            style={{ fontSize: 11, color: summaryColors.urgency, marginTop: 2 }}
          >
            Urgency
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Tooltip
            title="Behavior: How calm or aggressive the animal is"
            enterTouchDelay={0}
          >
            <Ionicons
              name="paw-outline"
              size={18}
              color={summaryColors.behavior}
            />
          </Tooltip>
          <ProgressBar
            progress={behaviorProgress}
            color={summaryColors.behavior}
            style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }}
          />
          <Text
            style={{
              fontSize: 11,
              color: summaryColors.behavior,
              marginTop: 2,
            }}
          >
            Behavior
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Tooltip title="Age: Estimated age of the animal" enterTouchDelay={0}>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={summaryColors.age}
            />
          </Tooltip>
          <ProgressBar
            progress={ageProgress}
            color={summaryColors.age}
            style={{ width: 50, height: 6, borderRadius: 3, marginTop: 2 }}
          />
          <Text
            style={{ fontSize: 11, color: summaryColors.age, marginTop: 2 }}
          >
            Age
          </Text>
        </View>
      </View>
      <Divider />
      {/* Injury, Symptoms, Vet Timeline, Context */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text
          style={{
            fontSize: 13,
            color: theme.colors.text,
            fontWeight: "bold",
            marginBottom: 2,
          }}
        >
          🩹 Injury
        </Text>
        <Text
          numberOfLines={expanded ? undefined : 2}
          ellipsizeMode={expanded ? undefined : "tail"}
          onPress={() => setExpanded((e) => !e)}
          style={{
            color: theme.colors.text,
            fontWeight: "normal",
            textDecorationLine: expanded ? "underline" : "none",
            marginBottom: 4,
          }}
        >
          {rescue.injurySummary || rescue.description || "Wound"}
        </Text>
        {!expanded &&
          rescue.injurySummary &&
          rescue.injurySummary.length > 40 && (
            <Text
              style={{ color: theme.colors.primary }}
              onPress={() => setExpanded(true)}
            >
              {" "}
              ...more
            </Text>
          )}
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>
          🩸 <Text style={{ fontWeight: "bold" }}>Symptoms:</Text>{" "}
          {rescue.symptoms.slice(0, 3).join(", ")}
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>
          🕒 <Text style={{ fontWeight: "bold" }}>Vet Timeline:</Text> 1-2 hrs
        </Text>
        <Text style={{ fontSize: 13, color: theme.colors.text, marginTop: 2 }}>
          🏞️ <Text style={{ fontWeight: "bold" }}>Context:</Text> Stray
        </Text>
      </View>
      <Divider />
      {/* Actions and Care Tips */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.text,
              fontWeight: "bold",
            }}
          >
            Actions:
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>
            🛑 Approach gently
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>
            📞 Call for help
          </Text>
          <Text style={{ fontSize: 13, color: theme.colors.text }}>
            📸 Take a photo
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 13,
              color: theme.colors.text,
              fontWeight: "bold",
            }}
          >
            Care Tips:
          </Text>
          {rescue.care_tips && rescue.care_tips.length > 0 ? (
            rescue.care_tips.slice(0, 3).map((tip, index) => (
              <Text
                key={index}
                style={{ fontSize: 13, color: theme.colors.text }}
              >
                💡 {tip}
              </Text>
            ))
          ) : (
            <>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>
                💦 Give water
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>
                🍗 Offer food
              </Text>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>
                🧣 Keep warm
              </Text>
            </>
          )}
        </View>
      </View>
      <Divider />
      {/* Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Button
          mode="outlined"
          icon="send"
          style={{ flex: 1, marginRight: 8 }}
          onPress={() => {}}
        >
          Send to Volunteer
        </Button>
        <Button
          mode="contained"
          icon="check"
          style={{ flex: 1 }}
          buttonColor={summaryColors.ai}
          onPress={() => {}}
        >
          I Will Take It
        </Button>
      </View>
      <Divider />
      {/* Disclaimer */}
      <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
        <Text style={{ fontSize: 12, color: theme.colors.tabInactive }}>
          ⚠️ AI-based, see vet. Injury area highlighted in image. Empathy saves
          lives.
        </Text>
      </View>
    </Card>
  );
};

export default function UserHomeScreen() {
  const { theme } = useThemeContext();
  const themedStyles = styles(theme);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [radius, setRadius] = React.useState("1 km");
  const [userLocation, setUserLocation] = React.useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = React.useState<
    "granted" | "denied" | "undetermined"
  >("undetermined");
  const [address, setAddress] = React.useState<string>("Locating...");
  const [currentTime, setCurrentTime] = React.useState<string>(
    new Date().toLocaleTimeString()
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const [mapRefreshing, setMapRefreshing] = React.useState(false);
  const [rescueCasesState, setRescueCasesState] = React.useState(rescueCases);
  const [isOffline, setIsOffline] = React.useState(false);

  // Function to calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  };

  // Function to sort rescue cases by distance from user location
  const sortRescueCasesByDistance = (
    cases: RescueCase[],
    userLoc: { latitude: number; longitude: number } | null
  ): RescueCase[] => {
    if (!userLoc) return cases;

    return [...cases].sort((a, b) => {
      const distanceA = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distanceB = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        b.location.latitude,
        b.location.longitude
      );
      return distanceA - distanceB;
    });
  };

  // Function to filter rescue cases by radius
  const filterRescueCasesByRadius = (
    cases: RescueCase[],
    userLoc: { latitude: number; longitude: number } | null,
    radiusKm: number
  ): RescueCase[] => {
    if (!userLoc) return cases;

    return cases.filter((case_) => {
      const distance = calculateDistance(
        userLoc.latitude,
        userLoc.longitude,
        case_.location.latitude,
        case_.location.longitude
      );
      return distance <= radiusKm;
    });
  };

  // Accept new rescue card from navigation params
  useFocusEffect(
    React.useCallback(() => {
      if (route.params && route.params.newRescue) {
        console.log("Adding new rescue card:", route.params.newRescue);
        setRescueCasesState((prev) => [route.params.newRescue, ...prev]);
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
      if (status === "granted") {
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        let geo = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        if (geo && geo.length > 0) {
          const g = geo[0];
          const addr = [g.name, g.street, g.district, g.city, g.region]
            .filter(Boolean)
            .join(", ");
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
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Sort and filter rescue cases by distance and radius when user location or radius changes
  React.useEffect(() => {
    if (userLocation) {
      const radiusKm = parseFloat(radius.split(" ")[0]); // Extract number from "1 km"
      const filteredCases = filterRescueCasesByRadius(
        rescueCases,
        userLocation,
        radiusKm
      );
      const sortedCases = sortRescueCasesByDistance(
        filteredCases,
        userLocation
      );
      setRescueCasesState(sortedCases);
    }
  }, [userLocation, radius]);

  // Real-time clock
  React.useEffect(() => {
    const timer = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString()),
      1000
    );
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

  // Map refresh handler
  const onMapRefresh = async () => {
    setMapRefreshing(true);
    try {
      // Refresh location
      await fetchLocationAndAddress();
      // Filter and sort rescue cases by distance and radius after location update
      if (userLocation) {
        const radiusKm = parseFloat(radius.split(" ")[0]);
        const filteredCases = filterRescueCasesByRadius(
          rescueCases,
          userLocation,
          radiusKm
        );
        const sortedCases = sortRescueCasesByDistance(
          filteredCases,
          userLocation
        );
        setRescueCasesState(sortedCases);
      }
      setTimeout(() => {
        setMapRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error("Map refresh error:", error);
      setMapRefreshing(false);
    }
  };

  // Convert radius string to meters
  const getRadiusMeters = (radiusStr: string) => {
    const num = parseFloat(radiusStr);
    if (radiusStr.includes("km")) return num * 1000;
    if (radiusStr.includes("m")) return num;
    return 1000; // default 1km
  };

  if (isOffline) {
    return (
      <View style={themedStyles.loadingContainer}>
        <Text>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.margin * 7.5 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
                color={theme.colors.primary}
              />
              <Badge style={themedStyles.notifBadge}>2</Badge>
            </View>
          </AnimatedTouchable>
        </View>
      </LinearGradient>

      {/* Combined Live Rescue Feed & Alert Radius Card */}
      <Surface style={themedStyles.mapSection} elevation={0}>
        <View style={themedStyles.mapHeader}>
          <SectionHeader
            title="Live Rescue Feed"
            icon="map-outline"
            theme={theme}
            themedStyles={themedStyles}
          />
          <Chip
            icon={mapRefreshing ? "loading" : "refresh"}
            onPress={onMapRefresh}
            style={themedStyles.refreshChip}
            disabled={mapRefreshing}
          >
            {mapRefreshing ? "Refreshing..." : "Refresh"}
          </Chip>
        </View>

        {/* NEW: Leaflet Map Implementation */}
        {mapRefreshing ? (
          <View
            style={{
              height: 200,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: theme.colors.tabBackground2,
            }}
          >
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>
              Refreshing map...
            </Text>
          </View>
        ) : (
          <LeafletMap
            userLocation={userLocation}
            rescueCases={rescueCasesState}
            radius={radius}
            theme={theme}
            onRefresh={onMapRefresh}
            refreshing={mapRefreshing}
          />
        )}

        {/* Alert Radius Row at the bottom of the card */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderColor: theme.colors.accent,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="location-outline"
              size={16}
              color={theme.colors.subtext}
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 14, color: "black", fontWeight: "600" }}>
              Alert Radius :{" "}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexDirection: "row", gap: 8 }}
          >
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
                      radius === option &&
                        themedStyles.radiusOptionTextSelected,
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
        <SectionHeader
          title="Nearby Rescue Cases"
          icon="heart-outline"
          theme={theme}
          themedStyles={themedStyles}
        />
        {rescueCasesState.map((rescue) => (
          <StrayRescueCard
            key={rescue.id}
            rescue={rescue}
            theme={theme}
            themedStyles={themedStyles}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
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
    headerTextContainer: { flex: 1, flexWrap: "wrap" },
    greeting: {
      fontFamily: "cursive",
      fontSize: theme.spacing.fontLarge ? theme.spacing.fontLarge + 6 : 36,
      color: theme.colors.text,
      fontWeight: "600",
    },
    boldText: {
      fontWeight: "condensedBold",
      fontSize: theme.spacing.fontLarge ? theme.spacing.fontLarge + 10 : 30,
      color: theme.colors.text,
    },
    headerSubRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      color: "black",
    },
    subText: {
      fontSize: 14,
      color: "black",
      fontWeight: "500",
      flexWrap: "wrap",
      paddingRight: 25,
      flex: 1,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
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
      color: theme.colors.primary,
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
      backgroundColor: theme.colors.primary,
      // borderColor: theme.colors.primary,
    },
    radiusOptionText: {
      fontSize: 14,
      color: "black",
      fontWeight: "500",
    },
    radiusOptionTextSelected: { color: "white" },
    radiusInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      color: theme.colors.subtext,
    },
    radiusInfoText: { fontSize: 12, color: "black", flex: 1 },
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
    refreshChip: {
      backgroundColor: theme.colors.tabBackground2,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
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
      color: theme.colors.primary,
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
    statusCard: {
      backgroundColor: theme.colors.tabBackground2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.tabBackground2,
    },
    statusRight: { flexDirection: "row", alignItems: "center" },
    statusBadge: {
      backgroundColor: theme.colors.low,
      color: theme.colors.text,
      marginRight: 8,
      borderRadius: 8,
    },
  });
