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
// Commented out Google Maps imports - keeping for reference
// import MapView, { Marker, Circle } from "react-native-maps";
import { WebView } from 'react-native-webview';
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

interface Location {
  city: string;
  time: string;
}

// Data - Random locations around Ramesh Nagar, West Delhi
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
    location: { latitude: 28.6523, longitude: 77.1187 }, // Random location within 1km
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-8XeubbWjvWPFpml9ElUu9H74aal0LBkpzICWcoX-l6Zs8vhy-fgkkJqsKVZVfru34Lc",
    rescueProgress: 0.2,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef0",
    user_id: "user_123",
    image_url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-8XeubbWjvWPFpml9ElUu9H74aal0LBkpzICWcoX-l6Zs8vhy-fgkkJqsKVZVfru34Lc",
    status: "pending",
    created_at: "2025-07-28T12:34:56Z",
    updated_at: "2025-07-28T12:34:56Z",
    location_string: "{\"latitude\":28.6523,\"longitude\":77.1187,\"address\":\"Ramesh Nagar Market Area, West Delhi\"}",
    latitude: 28.6523,
    longitude: 77.1187,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A medium-sized brown dog with a visible wound on its left hind leg, lying on the roadside.",
    urgency: "High",
    behavior: "Calm but wary",
    context: "Street Stray",
    confidence_score: 8,
    care_tips: ["Keep wound clean and dry", "Provide fresh water", "Minimize movement"],
    report_data: {},
    ai_analysis: {
      severity_score: 8,
      urgency_score: 7,
      behavior_score: 6,
      age_score: 7,
      overall_confidence: 8
    }
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
    location: { latitude: 28.6478, longitude: 77.1134 }, // Random location within 1km
    image: "https://www.shutterstock.com/image-photo/injured-sparrow-one-leg-260nw-1569750835.jpg",
    rescueProgress: 0.6,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef1",
    user_id: "user_123",
    image_url: "https://www.shutterstock.com/image-photo/injured-sparrow-one-leg-260nw-1569750835.jpg",
    status: "pending",
    created_at: "2025-07-28T12:35:56Z",
    updated_at: "2025-07-28T12:35:56Z",
    location_string: "{\"latitude\":28.6478,\"longitude\":77.1134,\"address\":\"Near Ramesh Nagar Metro Station, West Delhi\"}",
    latitude: 28.6478,
    longitude: 77.1134,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A small sparrow with drooping wing, possibly injured from window collision.",
    urgency: "Moderate",
    behavior: "Scared and defensive",
    context: "Street Stray",
    confidence_score: 6,
    care_tips: ["Handle very gently", "Keep warm and quiet", "Contact wildlife rescue"],
    report_data: {},
    ai_analysis: {
      severity_score: 5,
      urgency_score: 6,
      behavior_score: 4,
      age_score: 8,
      overall_confidence: 6
    }
  },
  {
    id: "r3",
    title: "Malnourished Kitten",
    species: "Feline",
    breed: "Domestic Short Hair",
    age: "Kitten (2-3 months)",
    gender: "Female",
    weight: "1-1.5 kg",
    severity: "High",
    injurySummary: "Severely underweight, dehydrated, weak condition",
    symptoms: ["Extreme thinness", "Dehydration", "Weakness", "Lethargy"],
    vitals: { temperature: "Low", heartRate: "Slow", breathing: "Shallow" },
    medicalHistory: "No previous medical records",
    time: "8 mins ago",
    ngo: "Cat Care Society",
    volunteer: "Priya Singh",
    estimatedCost: "₹1,500 - ₹3,000",
    location: { latitude: 28.6541, longitude: 77.1267 }, // Random location within 1km
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    rescueProgress: 0.4,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef2",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400",
    status: "pending",
    created_at: "2025-07-28T12:38:56Z",
    updated_at: "2025-07-28T12:38:56Z",
    location_string: "{\"latitude\":28.6541,\"longitude\":77.1267,\"address\":\"Ramesh Nagar Colony, West Delhi\"}",
    latitude: 28.6541,
    longitude: 77.1267,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A tiny, malnourished kitten found in a corner, barely moving.",
    urgency: "Critical",
    behavior: "Lethargic and weak",
    context: "Abandoned Pet",
    confidence_score: 9,
    care_tips: ["Provide warm milk", "Keep in warm place", "Contact vet immediately"],
    report_data: {},
    ai_analysis: {
      severity_score: 9,
      urgency_score: 9,
      behavior_score: 8,
      age_score: 9,
      overall_confidence: 9
    }
  },
  {
    id: "r4",
    title: "Injured Pigeon",
    species: "Avian",
    breed: "Rock Pigeon",
    age: "Adult (1-2 years)",
    gender: "Unknown",
    weight: "300-400 grams",
    severity: "Moderate",
    injurySummary: "Broken wing, unable to fly, found near building",
    symptoms: ["Broken wing", "Unable to fly", "Stress", "Dehydration"],
    vitals: { temperature: "Normal", heartRate: "Fast", breathing: "Stable" },
    medicalHistory: "Wild bird, no prior records",
    time: "12 mins ago",
    ngo: "Bird Rescue Delhi",
    volunteer: "Amit Kumar",
    estimatedCost: "₹500 - ₹1,200",
    location: { latitude: 28.6392, longitude: 77.1098 }, // Random location within 1km
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    rescueProgress: 0.3,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef3",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    status: "pending",
    created_at: "2025-07-28T12:42:56Z",
    updated_at: "2025-07-28T12:42:56Z",
    location_string: "{\"latitude\":28.6392,\"longitude\":77.1098,\"address\":\"Near Ramesh Nagar Park, West Delhi\"}",
    latitude: 28.6392,
    longitude: 77.1098,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A pigeon with clearly broken wing, sitting helplessly on the ground.",
    urgency: "High",
    behavior: "Scared but approachable",
    context: "Street Stray",
    confidence_score: 7,
    care_tips: ["Handle with care", "Keep in dark box", "Contact bird rescue"],
    report_data: {},
    ai_analysis: {
      severity_score: 6,
      urgency_score: 7,
      behavior_score: 7,
      age_score: 6,
      overall_confidence: 7
    }
  },
  {
    id: "r5",
    title: "Sick Street Puppy",
    species: "Canine",
    breed: "Mixed Breed",
    age: "Puppy (4-6 months)",
    gender: "Male",
    weight: "8-10 kg",
    severity: "High",
    injurySummary: "Severe skin infection, mange, malnutrition",
    symptoms: ["Hair loss", "Skin lesions", "Itching", "Weakness"],
    vitals: { temperature: "Elevated", heartRate: "Fast", breathing: "Rapid" },
    medicalHistory: "No vaccination records",
    time: "15 mins ago",
    ngo: "Street Dog Care",
    volunteer: "Neha Sharma",
    estimatedCost: "₹2,000 - ₹4,000",
    location: { latitude: 28.6612, longitude: 77.1324 }, // Random location within 1km
    image: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400",
    rescueProgress: 0.1,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef4",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?w=400",
    status: "pending",
    created_at: "2025-07-28T12:45:56Z",
    updated_at: "2025-07-28T12:45:56Z",
    location_string: "{\"latitude\":28.6612,\"longitude\":77.1324,\"address\":\"Ramesh Nagar Extension, West Delhi\"}",
    latitude: 28.6612,
    longitude: 77.1324,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A young puppy with severe skin condition, scratching constantly.",
    urgency: "High",
    behavior: "Friendly but in pain",
    context: "Street Stray",
    confidence_score: 8,
    care_tips: ["Don't touch without gloves", "Keep isolated", "Contact vet"],
    report_data: {},
    ai_analysis: {
      severity_score: 7,
      urgency_score: 8,
      behavior_score: 8,
      age_score: 8,
      overall_confidence: 8
    }
  },
  {
    id: "r6",
    title: "Injured Cat",
    species: "Feline",
    breed: "Domestic Long Hair",
    age: "Adult (2-3 years)",
    gender: "Female",
    weight: "3-4 kg",
    severity: "Moderate",
    injurySummary: "Tail injury, possible road accident",
    symptoms: ["Tail dragging", "Pain", "Limping", "Stress"],
    vitals: { temperature: "Normal", heartRate: "Fast", breathing: "Stable" },
    medicalHistory: "No previous records",
    time: "20 mins ago",
    ngo: "Cat Rescue Delhi",
    volunteer: "Anjali Patel",
    estimatedCost: "₹1,800 - ₹3,500",
    location: { latitude: 28.6750, longitude: 77.1400 }, // ~3km away
    image: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400",
    rescueProgress: 0.2,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef5",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400",
    status: "pending",
    created_at: "2025-07-28T12:50:56Z",
    updated_at: "2025-07-28T12:50:56Z",
    location_string: "{\"latitude\":28.6750,\"longitude\":77.1400,\"address\":\"Rajouri Garden, West Delhi\"}",
    latitude: 28.6750,
    longitude: 77.1400,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A cat with injured tail, possibly hit by a vehicle.",
    urgency: "Moderate",
    behavior: "Scared and defensive",
    context: "Street Stray",
    confidence_score: 7,
    care_tips: ["Handle gently", "Keep in quiet place", "Contact vet"],
    report_data: {},
    ai_analysis: {
      severity_score: 6,
      urgency_score: 6,
      behavior_score: 5,
      age_score: 7,
      overall_confidence: 7
    }
  },
  {
    id: "r7",
    title: "Sick Parrot",
    species: "Avian",
    breed: "Indian Ringneck",
    age: "Adult (1-2 years)",
    gender: "Unknown",
    weight: "120-150 grams",
    severity: "High",
    injurySummary: "Respiratory infection, lethargic",
    symptoms: ["Difficulty breathing", "Lethargy", "Loss of appetite", "Discharge"],
    vitals: { temperature: "Elevated", heartRate: "Fast", breathing: "Labored" },
    medicalHistory: "Pet bird, escaped from home",
    time: "25 mins ago",
    ngo: "Bird Care Delhi",
    volunteer: "Rajesh Kumar",
    estimatedCost: "₹2,500 - ₹4,000",
    location: { latitude: 28.6900, longitude: 77.1500 }, // ~4km away
    image: "https://images.unsplash.com/photo-1552728089-57bde15b3820?w=400",
    rescueProgress: 0.1,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef6",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1552728089-57bde15b3820?w=400",
    status: "pending",
    created_at: "2025-07-28T12:55:56Z",
    updated_at: "2025-07-28T12:55:56Z",
    location_string: "{\"latitude\":28.6900,\"longitude\":77.1500,\"address\":\"Tagore Garden, West Delhi\"}",
    latitude: 28.6900,
    longitude: 77.1500,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A pet parrot found sick and weak, possibly escaped from home.",
    urgency: "High",
    behavior: "Weak but approachable",
    context: "Lost Pet",
    confidence_score: 8,
    care_tips: ["Keep warm", "Provide water", "Contact avian vet"],
    report_data: {},
    ai_analysis: {
      severity_score: 7,
      urgency_score: 8,
      behavior_score: 7,
      age_score: 8,
      overall_confidence: 8
    }
  },
  {
    id: "r8",
    title: "Injured Street Dog",
    species: "Canine",
    breed: "Indian Pariah",
    age: "Adult (4-6 years)",
    gender: "Female",
    weight: "18-22 kg",
    severity: "Critical",
    injurySummary: "Severe head injury, bleeding from ear",
    symptoms: ["Head trauma", "Bleeding", "Disorientation", "Weakness"],
    vitals: { temperature: "Low", heartRate: "Slow", breathing: "Shallow" },
    medicalHistory: "No vaccination records",
    time: "30 mins ago",
    ngo: "Emergency Rescue",
    volunteer: "Dr. Meera Singh",
    estimatedCost: "₹5,000 - ₹8,000",
    location: { latitude: 28.7100, longitude: 77.1600 }, // ~6km away (outside 5km)
    image: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    rescueProgress: 0.0,
    
    // API-specific fields
    report_id: "b1a2c3d4-e5f6-7890-1234-56789abcdef7",
    user_id: "user_123",
    image_url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400",
    status: "pending",
    created_at: "2025-07-28T13:00:56Z",
    updated_at: "2025-07-28T13:00:56Z",
    location_string: "{\"latitude\":28.7100,\"longitude\":77.1600,\"address\":\"Janakpuri, West Delhi\"}",
    latitude: 28.7100,
    longitude: 77.1600,
    ngo_assigned: null,
    volunteer_assigned: null,
    ngo_name: null,
    volunteer_name: null,
    description: "A street dog with severe head injury, possibly hit by vehicle.",
    urgency: "Critical",
    behavior: "Unconscious",
    context: "Street Stray",
    confidence_score: 9,
    care_tips: ["Do not move", "Call emergency", "Keep warm"],
    report_data: {},
    ai_analysis: {
      severity_score: 9,
      urgency_score: 10,
      behavior_score: 10,
      age_score: 7,
      overall_confidence: 9
    }
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

// Leaflet Map Component
interface LeafletMapProps {
  userLocation: { latitude: number; longitude: number } | null;
  rescueCases: RescueCase[];
  radius: string;
  theme: any;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ userLocation, rescueCases, radius, theme }) => {
  const getRadiusMeters = (radiusStr: string) => {
    const num = parseFloat(radiusStr);
    if (radiusStr.includes('km')) return num * 1000;
    if (radiusStr.includes('m')) return num;
    return 1000; // default 1km
  };

  const getMapZoomLevel = (radiusStr: string): number => {
    const radiusKm = parseFloat(radiusStr.split(' ')[0]);
    // Calculate zoom level to show the entire radius circle
    // Formula: zoom = 14 - log2(radius_km)
    // This ensures the radius circle is fully visible
    const zoom = 14 - Math.log2(radiusKm);
    return Math.max(8, Math.min(16, Math.round(zoom))); // Clamp between 8 and 16
  };

  const radiusMeters = getRadiusMeters(radius);
  const zoomLevel = getMapZoomLevel(radius);
  const centerLat = userLocation?.latitude || 28.6500; // Ramesh Nagar, West Delhi
  const centerLng = userLocation?.longitude || 77.1200;

  // Create HTML for Leaflet map
  const createMapHTML = () => {
    const markers = rescueCases.map((rescue, index) => {
      const { color, icon, textColor } = getSeverityStyles(rescue.severity, theme);
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
    }).join('');

    const userMarker = userLocation ? `
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
    ` : '';

    // Calculate bounds to show the entire radius circle
    const radiusKm = parseFloat(radius.split(' ')[0]);
    const radiusDegrees = radiusKm / 111; // Approximate degrees per km
    const bounds = userLocation ? [
      [userLocation.latitude - radiusDegrees, userLocation.longitude - radiusDegrees],
      [userLocation.latitude + radiusDegrees, userLocation.longitude + radiusDegrees]
    ] : [
      [centerLat - radiusDegrees, centerLng - radiusDegrees],
      [centerLat + radiusDegrees, centerLng + radiusDegrees]
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
      style={{ width: '100%', height: 200 }}
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

const StrayRescueCard: React.FC<StrayRescueCardProps> = ({ rescue, theme, themedStyles }) => {
  // Use API data if available, otherwise fallback to defaults
  const aiConfidence = rescue.ai_analysis?.overall_confidence ? rescue.ai_analysis.overall_confidence / 10 : 0.9;
  const ageProgress = rescue.ai_analysis?.age_score ? rescue.ai_analysis.age_score / 10 : 0.8;
  const severityProgress = rescue.ai_analysis?.severity_score ? rescue.ai_analysis.severity_score / 10 : 0.75;
  const urgencyProgress = rescue.ai_analysis?.urgency_score ? rescue.ai_analysis.urgency_score / 10 : 0.7;
  const behaviorProgress = rescue.ai_analysis?.behavior_score ? rescue.ai_analysis.behavior_score / 10 : 0.85;
  const [expanded, setExpanded] = React.useState(false);
  const [address, setAddress] = React.useState<string>("Locating...");
  const [distance, setDistance] = React.useState<string>("");

  // Calculate distance from user location
  React.useEffect(() => {
    const userLocation = { latitude: 28.6500, longitude: 77.1200 }; // Default Ramesh Nagar
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c; // Distance in kilometers
    };
    
    const dist = calculateDistance(userLocation.latitude, userLocation.longitude, rescue.location.latitude, rescue.location.longitude);
    setDistance(`${dist.toFixed(1)} km away`);
  }, [rescue.location]);

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
            🕒 {rescue.time} • 📍 {distance}
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Tooltip title="AI Confidence: How sure the AI is about the analysis" enterTouchDelay={0}>
            <Ionicons name="information-circle-outline" size={16} color={summaryColors.ai} style={{ marginBottom: 2 }} />
          </Tooltip>
          <Text style={{ fontSize: 12, color: theme.colors.tabInactive }}>AI Confidence</Text>
          <Text style={{ fontWeight: 'bold', color: summaryColors.ai }}>
            {rescue.confidence_score ? `${rescue.confidence_score}/10` : `${Math.round(aiConfidence * 100)}%`}
          </Text>
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
          {rescue.injurySummary || rescue.description || 'Wound'}
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
          {rescue.care_tips && rescue.care_tips.length > 0 ? (
            rescue.care_tips.slice(0, 3).map((tip, index) => (
              <Text key={index} style={{ fontSize: 13, color: theme.colors.text }}>💡 {tip}</Text>
            ))
          ) : (
            <>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>💦 Give water</Text>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>🍗 Offer food</Text>
              <Text style={{ fontSize: 13, color: theme.colors.text }}>🧣 Keep warm</Text>
            </>
          )}
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
  const [radius, setRadius] = React.useState("1 km");
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = React.useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [address, setAddress] = React.useState<string>("Locating...");
  const [currentTime, setCurrentTime] = React.useState<string>(new Date().toLocaleTimeString());
  const [refreshing, setRefreshing] = React.useState(false);
  const [mapRefreshing, setMapRefreshing] = React.useState(false);
  const [rescueCasesState, setRescueCasesState] = React.useState(rescueCases);

  // Function to calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Function to sort rescue cases by distance from user location
  const sortRescueCasesByDistance = (cases: RescueCase[], userLoc: { latitude: number; longitude: number } | null): RescueCase[] => {
    if (!userLoc) return cases;
    
    return [...cases].sort((a, b) => {
      const distanceA = calculateDistance(userLoc.latitude, userLoc.longitude, a.location.latitude, a.location.longitude);
      const distanceB = calculateDistance(userLoc.latitude, userLoc.longitude, b.location.latitude, b.location.longitude);
      return distanceA - distanceB;
    });
  };

  // Function to filter rescue cases by radius
  const filterRescueCasesByRadius = (cases: RescueCase[], userLoc: { latitude: number; longitude: number } | null, radiusKm: number): RescueCase[] => {
    if (!userLoc) return cases;
    
    return cases.filter(case_ => {
      const distance = calculateDistance(userLoc.latitude, userLoc.longitude, case_.location.latitude, case_.location.longitude);
      return distance <= radiusKm;
    });
  };

  // Function to get map zoom level based on radius to show the entire circle
  const getMapZoomLevel = (radiusKm: number): number => {
    // Calculate zoom level to show the entire radius circle
    // Formula: zoom = 14 - log2(radius_km)
    // This ensures the radius circle is fully visible
    const zoom = 14 - Math.log2(radiusKm);
    return Math.max(8, Math.min(16, Math.round(zoom))); // Clamp between 8 and 16
  };

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

  // Sort and filter rescue cases by distance and radius when user location or radius changes
  React.useEffect(() => {
    if (userLocation) {
      const radiusKm = parseFloat(radius.split(' ')[0]); // Extract number from "1 km"
      const filteredCases = filterRescueCasesByRadius(rescueCases, userLocation, radiusKm);
      const sortedCases = sortRescueCasesByDistance(filteredCases, userLocation);
      setRescueCasesState(sortedCases);
    }
  }, [userLocation, radius]);
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

  // Map refresh handler
  const onMapRefresh = async () => {
    setMapRefreshing(true);
    try {
      // Refresh location
      await fetchLocationAndAddress();
      // Filter and sort rescue cases by distance and radius after location update
      if (userLocation) {
        const radiusKm = parseFloat(radius.split(' ')[0]);
        const filteredCases = filterRescueCasesByRadius(rescueCases, userLocation, radiusKm);
        const sortedCases = sortRescueCasesByDistance(filteredCases, userLocation);
        setRescueCasesState(sortedCases);
      }
      setTimeout(() => {
        setMapRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Map refresh error:', error);
      setMapRefreshing(false);
    }
  };
  // Convert radius string to meters
  const getRadiusMeters = (radiusStr: string) => {
    const num = parseFloat(radiusStr);
    if (radiusStr.includes('km')) return num * 1000;
    if (radiusStr.includes('m')) return num;
    return 1000; // default 1km
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
          <SectionHeader title="Live Rescue Feed" icon="map-outline" theme={theme} themedStyles={themedStyles} />
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
          <View style={{ height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.tabBackground2 }}>
            <Text style={{ color: theme.colors.text, fontSize: 16 }}>Refreshing map...</Text>
          </View>
        ) : (
          <LeafletMap 
            userLocation={userLocation}
            rescueCases={rescueCasesState}
            radius={radius}
            theme={theme}
          />
        )}
        
        {/* COMMENTED OUT: Original Google Maps Implementation */}
        {/*
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
          <!- User location pin and radius ->
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
        */}
        
        {/* Alert Radius Row at the bottom of the card */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderColor: theme.colors.accent }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location-outline" size={16} color={theme.colors.subtext} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 14, color: 'black', fontWeight: '600' }}>Alert Radius : </Text>
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
    color: 'black',
    fontWeight: "500",
  },
  radiusOptionTextSelected: { color: 'white' },
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
  refreshChip: { backgroundColor: theme.colors.tabBackground2, borderWidth: 1, borderColor: theme.colors.primary },
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
  statusCard: { backgroundColor: theme.colors.tabBackground2, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.tabBackground2 },
  statusRight: { flexDirection: "row", alignItems: "center" },
  statusBadge: { backgroundColor: theme.colors.low, color: theme.colors.text, marginRight: 8, borderRadius: 8 },
}); 