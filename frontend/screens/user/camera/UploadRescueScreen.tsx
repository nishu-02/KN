import React from "react";
import { View, StyleSheet, Image, ScrollView } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { useRoute } from "@react-navigation/native";

export default function UploadRescueScreen() {
  const route = useRoute<any>();
  const imageUri = route.params?.imageUri;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upload Rescue Case</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <Text style={styles.noImageText}>No image selected</Text>
      )}
      <TextInput
        label="Title"
        mode="outlined"
        style={styles.input}
        theme={{ colors: { primary: "#8B4513" } }}
      />
      <TextInput
        label="Description"
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.input}
        theme={{ colors: { primary: "#8B4513" } }}
      />
      <Button
        mode="contained"
        style={styles.submitButton}
        buttonColor="#8B4513"
        onPress={() => {}}
      >
        Submit Rescue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  noImageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#FFF",
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 8,
  },
});