// screens/PostScreen.tsx
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

export default function PostScreen() {
  const route = useRoute();
  const { photo } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captured Image:</Text>
      <Image source={{ uri: photo.uri }} style={styles.image} />
      {/* Add form / submit button here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, marginBottom: 20 },
  image: { width: 300, height: 400, borderRadius: 10 },
});
