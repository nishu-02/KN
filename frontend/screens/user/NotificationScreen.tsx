import React, { useState, useEffect } from "react";
import { View, ScrollView, Image, Alert } from "react-native";
import { Text, Button, TextInput, ProgressBar } from "react-native-paper";
import { useRoute, useNavigation } from "@react-navigation/native";
import { reportsApi } from '../../api/reportsApi';

export default function UploadRescueScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const imageUri = route.params?.imageUri;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    careTips: [] as string[],
    actions: [] as string[],
    symptoms: [] as string[],
    image: imageUri,
    location: { latitude: 0, longitude: 0 },
    time: new Date().toLocaleString(),
  });

  useEffect(() => {
    if (imageUri) {
      analyzeImage();
    }
  }, [imageUri]);

  const analyzeImage = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current location - assume you have a way to get it (e.g., expo-location)
      const location = { latitude: 0, longitude: 0 }; // Replace with actual location fetching

      // Prepare form data for backend
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg', // Adjust based on image type
        name: 'rescue.jpg',
      } as any);
      formData.append('user_id', 'current_user_id'); // Replace with actual user ID
      formData.append('location', JSON.stringify(location));

      const response = await reportsApi.createReport(formData); // Assume your API wrapper handles multipart form

      if (response.report) {
        const aiData = response.report.ai_analysis || {};
        setFields(prev => ({
          ...prev,
          title: response.report.title || prev.title,
          description: response.report.description || prev.description,
          species: response.report.species || prev.species,
          age: response.report.age || prev.age,
          gender: response.report.gender || prev.gender,
          weight: response.report.weight || prev.weight,
          severity: response.report.severity || prev.severity,
          injurySummary: response.report.injury_summary || prev.injurySummary,
          urgency: response.report.urgency || prev.urgency,
          behavior: response.report.behavior || prev.behavior,
          context: response.report.context || prev.context,
          vetTimeline: response.report.vet_timeline || prev.vetTimeline,
          careTips: response.report.care_tips || prev.careTips,
          actions: response.report.immediate_actions || prev.actions,
          symptoms: response.report.symptoms || prev.symptoms,
          location: response.report.location ? JSON.parse(response.report.location) : prev.location,
        }));
      } else {
        setError('Failed to analyze image');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ProgressBar indeterminate />
        <Text>Analyzing image...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{error}</Text>
        <Button onPress={analyzeImage}>Retry</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" }}>Upload Rescue Report</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: "100%", height: 250, borderRadius: 10, marginBottom: 16 }} />
      ) : (
        <Text style={{ textAlign: "center", marginBottom: 16, color: "gray" }}>No image selected</Text>
      )}

      {/* Input fields - populated from backend analysis, editable */}
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

      {/* Submit Button */}
      <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 20 }}>
        Submit Rescue Report
      </Button>
    </ScrollView>
  );
}
