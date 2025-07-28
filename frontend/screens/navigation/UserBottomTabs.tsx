import React, { useState } from "react";
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { FAB, Surface, useTheme } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import UserHomeScreen from "../user/UserHomeScreen";
import DonationsScreen from "../user/DonationsScreen";
import NGOListScreen from "../user/NGOListScreen";
import UploadRescueScreen from "../user/UploadRescueScreen";
import ProfileScreen from "../user/UserProfileScreen";

export default function UserBottomTabs() {
  const [index, setIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const theme = useTheme();

  const routes = [
    { key: "home", icon: "home" },
    { key: "donations", icon: "heart" },
    { key: "ngos", icon: "people" },
    { key: "profile", icon: "person" },
  ];

  const renderScene = () => {
    if (showCamera) return <UploadRescueScreen />;
    switch (index) {
      case 0:
        return <UserHomeScreen />;
      case 1:
        return <DonationsScreen />;
      case 2:
        return <NGOListScreen />;
      case 3:
        return <ProfileScreen />;
      default:
        return <UserHomeScreen />;
    }
  };

  const navigation = useNavigation<any>();

  const handleCameraPress = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take pictures. Please enable it in your device settings.",
        [{ text: "OK" }]
      );
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Navigate to UploadRescueScreen with the captured image
      navigation.navigate("UploadRescue", { imageUri: result.assets[0].uri });
    } else if (result.canceled) {
      // User canceled the camera
      Alert.alert("Cancelled", "No image was captured.");
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>{renderScene()}</View>

      {/* Bottom Navigation with Centered Camera */}
      <Surface style={styles.bottomNavigation} elevation={4}>
        <View style={styles.navContent}>
          {/* First two tabs */}
          <TouchableOpacity
            style={[styles.navItem, index === 0 && styles.navItemActive]}
            onPress={() => setIndex(0)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={index === 0 ? "home" as any : "home-outline" as any}
              size={24}
              color={index === 0 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, index === 1 && styles.navItemActive]}
            onPress={() => setIndex(1)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={index === 1 ? "heart" as any : "heart-outline" as any}
              size={24}
              color={index === 1 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          {/* Centered Camera Button */}
          <View style={styles.cameraContainer}>
            <FAB
              icon={() => <Ionicons name="camera" size={24} color={theme.colors.onPrimary} />}
              onPress={handleCameraPress}
              style={[styles.cameraFab, { backgroundColor: theme.colors.primary }]}
              size="normal"
            />
          </View>

          {/* Last two tabs */}
          <TouchableOpacity
            style={[styles.navItem, index === 2 && styles.navItemActive]}
            onPress={() => setIndex(2)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={index === 2 ? "people" as any : "people-outline" as any}
              size={24}
              color={index === 2 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navItem, index === 3 && styles.navItemActive]}
            onPress={() => setIndex(3)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={index === 3 ? "person" as any : "person-outline" as any}
              size={24}
              color={index === 3 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        </View>
      </Surface>

      <SafeAreaView style={styles.safeArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
  },
  bottomNavigation: {
    position: "absolute",
    height: 75,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 8,
  },
  navContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  navItemActive: {
    backgroundColor: "rgba(98, 0, 238, 0.08)",
  },
  cameraContainer: {
    
    alignItems: "center",
    justifyContent: "center",
    marginTop: -50, // Pull camera button up to overlap
  },
  cameraFab: {
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  safeArea: {
    backgroundColor: "#ffffff",
  },
});
