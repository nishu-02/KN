import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, Button, TextInput, HelperText } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { reportsApi } from '../../api/reportsApi';

export default function UploadRescueScreen() {
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [species, setSpecies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  const handleSubmit = async () => {
    if (!image || !title || !description) {
      setError('Please fill all fields and select an image');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const location = await getCurrentLocation();
      if (!location) {
        setError('Unable to get location. Please enable location services.');
        setLoading(false);
        return;
      }

      // In a real app, you'd upload the image to a service and get a URL
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'rescue_image.jpg',
      } as any);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('species', species);
      formData.append('location', JSON.stringify(location));

      // For now, we'll create a report with a placeholder image URL
      const reportData = {
        title,
        description,
        species,
        location: JSON.stringify(location),
        image_url: image.uri, // In production, this would be a proper URL after upload
      };

      const response = await reportsApi.createReport(reportData);
      
      if (response.report_id) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setSpecies('');
        setImage(null);
        Alert.alert('Success', 'Report submitted successfully!');
      } else {
        setError(response.error || 'Failed to submit report');
      }
    } catch (err) {
      setError('Failed to submit report');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Report Animal Rescue</Text>
      
      {image && (
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      )}
      
      <View style={styles.buttonRow}>
        <Button mode="outlined" onPress={takePhoto} style={styles.button}>
          Take Photo
        </Button>
        <Button mode="outlined" onPress={pickImage} style={styles.button}>
          Choose from Gallery
        </Button>
      </View>

      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      
      <TextInput
        label="Species (Dog, Cat, Bird, etc.)"
        value={species}
        onChangeText={setSpecies}
        style={styles.input}
      />

      {error ? <HelperText type="error">{error}</HelperText> : null}
      {success ? <HelperText type="info">Report submitted successfully!</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={!image || !title || !description}
        style={styles.submitButton}
      >
        Submit Report
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 16,
  },
});