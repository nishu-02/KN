import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import UserHomeScreen from '../user/UserHomeScreen';
import DonationsScreen from '../user/DonationsScreen';
import NGOListScreen from '../user/NGOListScreen';
import UploadRescueScreen from '../user/UploadRescueScreen';
import ProfileScreen from '../user/UserProfileScreen';

export default function UserBottomTabs() {
  const [index, setIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  const routes = [
    { key: 'home', icon: 'home' },
    { key: 'donations', icon: 'heart' },
    { key: 'ngos', icon: 'people' },
    { key: 'profile', icon: 'person' },
  ];

  const renderScene = () => {
    if (showCamera) return <UploadRescueScreen />;
    switch (index) {
      case 0: return <UserHomeScreen />;
      case 1: return <DonationsScreen />;
      case 2: return <NGOListScreen />;
      case 3: return <ProfileScreen />;
      default: return <UserHomeScreen />;
    }
  };

  const handleCameraPress = () => {
    setShowCamera(true);
    setTimeout(() => setShowCamera(false), 100);
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>{renderScene()}</View>

      <View style={styles.bottomTabContainer}>
        <LinearGradient
          colors={['#F5F5DC', '#DEB887', '#D2B48C', '#CD853F']}
          style={styles.tabBarGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.tabBarContent}>
            <TouchableOpacity
              style={styles.tabItemTouchable}
              onPress={() => setIndex(0)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={index === 0 ? 'home' : 'home-outline'}
                size={26}
                color={index === 0 ? '#8B4513' : '#A0826D'}
              />
              {index === 0 && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItemTouchable}
              onPress={() => setIndex(1)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={index === 1 ? 'heart' : 'heart-outline'}
                size={26}
                color={index === 1 ? '#8B4513' : '#A0826D'}
              />
              {index === 1 && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <View style={styles.cameraSpace} />

            <TouchableOpacity
              style={styles.tabItemTouchable}
              onPress={() => setIndex(2)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={index === 2 ? 'people' : 'people-outline'}
                size={26}
                color={index === 2 ? '#8B4513' : '#A0826D'}
              />
              {index === 2 && <View style={styles.activeDot} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItemTouchable}
              onPress={() => setIndex(3)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={index === 3 ? 'person' : 'person-outline'}
                size={26}
                color={index === 3 ? '#8B4513' : '#A0826D'}
              />
              {index === 3 && <View style={styles.activeDot} />}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Floating Camera Button */}
        <View style={styles.cameraButtonContainer}>
          <LinearGradient
            colors={['#D2691E', '#8B4513', '#654321']}
            style={styles.cameraGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FAB
              icon={() => (
                <Ionicons name="camera" size={25} color="#F5F5DC"  />
              )}
              onPress={handleCameraPress}
              style={styles.cameraFab}
            />
          </LinearGradient>
        </View>
      </View>

      <SafeAreaView style={styles.safeArea} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 100,
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
    height: 90,
    justifyContent: 'center',
  },
  tabBarGradient: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 25,
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 70,
  },
  tabItemTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraSpace: {
    width: 70,
    flex: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B4513',
    marginTop: 4,
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 35,
    left: '50%',
    transform: [{ translateX: -35 }],
    zIndex: 1001,
  },
  cameraGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F5F5DC',
    shadowColor: '#8B4513',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 15,
  },
  cameraFab: {
    backgroundColor: 'transparent',
    // width: 62,
    alignItems: 'center',
    height: 62,
    borderRadius: 31,
    elevation: 2,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
});
