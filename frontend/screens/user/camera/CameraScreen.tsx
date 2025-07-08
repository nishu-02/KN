// screens/CameraScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Camera } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      navigation.navigate("Post", { photo });
    }
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false)
    return <Text>No access to camera. Please allow permission.</Text>;

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef} />
      <View style={styles.controls}>
        <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
          <Ionicons name="camera" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  captureButton: {
    backgroundColor: "#8B4513",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
  },
});
