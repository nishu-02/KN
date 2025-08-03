import React, { useState } from "react";
import { View, ScrollView, Image, Alert } from "react-native";
import { Text, Button, TextInput } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function UploadRescueScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const imageUri = route.params?.imageUri;

  // State for user-editable fields
  const [fields, setFields] = useState({
    title: "",
    description: "",
    species: "Unknown",
    age: "Unknown",
    gender: "Unknown",
    weight: "Unknown",
    severity: "Unknown",
    injurySummary: "",
    urgency: "Unknown",
    behavior: "Unknown",
    context: "Unknown",
    vetTimeline: "Unknown",
    careTips: [],
    actions: [],
    symptoms: [],
    image: imageUri,
    location: { latitude: 0, longitude: 0 },
    time: new Date().toLocaleString(),
  });

  // Submit handler
  const handleSubmit = () => {
    if (!fields.title || !fields.injurySummary) {
      Alert.alert("Missing Information", "Please fill in title and injury summary before submitting.");
      return;
    }

    const cardData = {
      id: `rescue_${Date.now()}`,
      title: fields.title,
      description: fields.description,
      species: fields.species,
      age: fields.age,
      gender: fields.gender,
      weight: fields.weight,
      severity: fields.severity,
      injurySummary: fields.injurySummary,
      urgency: fields.urgency,
      behavior: fields.behavior,
      context: fields.context,
      vetTimeline: fields.vetTimeline,
      careTips: fields.careTips,
      actions: fields.actions,
      symptoms: fields.symptoms,
      image: fields.image,
      location: fields.location,
      time: fields.time,
    };

    console.log("Submitting rescue report:", cardData);
    navigation.navigate("UserHome", { newRescue: cardData });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>Upload Rescue Report</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: "100%", height: 250, borderRadius: 10, marginBottom: 16 }} />
      ) : (
        <Text style={{ textAlign: "center", marginBottom: 16, color: "gray" }}>No image selected</Text>
      )}

      {/* Input fields */}
      <TextInput
        label="Title"
        value={fields.title}
        onChangeText={v => setFields(f => ({ ...f, title: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Description"
        value={fields.description}
        onChangeText={v => setFields(f => ({ ...f, description: v }))}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Species"
        value={fields.species}
        onChangeText={v => setFields(f => ({ ...f, species: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Age"
        value={fields.age}
        onChangeText={v => setFields(f => ({ ...f, age: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Gender"
        value={fields.gender}
        onChangeText={v => setFields(f => ({ ...f, gender: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Weight"
        value={fields.weight}
        onChangeText={v => setFields(f => ({ ...f, weight: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Severity"
        value={fields.severity}
        onChangeText={v => setFields(f => ({ ...f, severity: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Injury Summary"
        value={fields.injurySummary}
        onChangeText={v => setFields(f => ({ ...f, injurySummary: v }))}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Urgency"
        value={fields.urgency}
        onChangeText={v => setFields(f => ({ ...f, urgency: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Behavior"
        value={fields.behavior}
        onChangeText={v => setFields(f => ({ ...f, behavior: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Context"
        value={fields.context}
        onChangeText={v => setFields(f => ({ ...f, context: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      <TextInput
        label="Vet Timeline"
        value={fields.vetTimeline}
        onChangeText={v => setFields(f => ({ ...f, vetTimeline: v }))}
        mode="outlined"
        style={{ marginBottom: 12 }}
      />

      {/* Submit button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        accessibilityLabel="Submit rescue report"
      >
        Submit Rescue Report
      </Button>
    </ScrollView>
  );
}
