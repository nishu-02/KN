import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
  Share,
  Modal,
  Linking,
  RefreshControl,
  Text as RNText,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  Chip,
  Divider,
  List,
  IconButton,
  ProgressBar,
  Switch,
  SegmentedButtons,
  Surface,
  Button,
  ActivityIndicator,
  TextInput,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import { useThemeContext } from '../../theme';
import SettingsScreen from './SettingsScreen';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch } from '../../core/redux/store';
import { logoutUser } from '../../core/redux/slices/authSlice';
import { usersApi } from '../../api/usersApi'; // Adjust path based on your API files
import AuthService from '../../api/authService';

const screenWidth = Dimensions.get("window").width;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  progress: number;
  date: string;
}

interface Rescue {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  impact: string;
  duration: string;
  cost: string;
  status: string;
}

interface UserProfile {
  name: string;
  title?: string;
  joinDate?: string;
  location?: string;
  phone?: string;
  email: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  certifications?: string[];
  availability?: { days: string[]; timeSlots: string[] };
  transportCapacity?: string;
  specializations?: string[];
}

interface RescueStats {
  totalRescues: number;
  successRate: number;
  averageResponseTime: string;
  monthlyGoal: number;
  monthlyProgress: number;
  categories: { name: string; count: number; color: string }[];
}

const AnimatedTouchable = ({
  children,
  onPressIn,
  onPressOut,
  scaleAnim,
  fadeAnim,
}: {
  children: React.ReactNode;
  onPressIn: () => void;
  onPressOut: () => void;
  scaleAnim: Animated.Value;
  fadeAnim: Animated.Value;
}) => (
  <TouchableOpacity
    onPressIn={onPressIn}
    onPressOut={onPressOut}
    activeOpacity={0.9}
  >
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}
    >
      {children}
    </Animated.View>
  </TouchableOpacity>
);

const AchievementItem: React.FC<{
  item: Achievement;
  parentFadeAnim: Animated.Value;
  theme: any;
  themedStyles: any;
}> = ({ item, parentFadeAnim, theme, themedStyles }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      scaleAnim={scaleAnim}
      fadeAnim={parentFadeAnim}
    >
      <Surface style={themedStyles.achievementCard} elevation={2}>
        <View style={[themedStyles.achievementIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="#fff" />
        </View>
        <Text style={themedStyles.achievementTitle}>{item.title}</Text>
        <Text style={themedStyles.achievementDesc}>{item.description}</Text>
        <View style={themedStyles.achievementProgress}>
          <ProgressBar
            progress={item.progress}
            color={item.color}
            style={themedStyles.achievementBar}
          />
          <Text style={themedStyles.achievementDate}>{item.date}</Text>
        </View>
      </Surface>
    </AnimatedTouchable>
  );
};

const RescueItem: React.FC<{
  item: Rescue;
  parentFadeAnim: Animated.Value;
  theme: any;
  themedStyles: any;
}> = ({ item, parentFadeAnim, theme, themedStyles }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const getStatusColor = (status: string) =>
    ({
      Recovered: "#4CAF50",
      Ongoing: "#FF9800",
      Completed: "#2196F3",
    }[status] || "#666");

  return (
    <AnimatedTouchable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      scaleAnim={scaleAnim}
      fadeAnim={parentFadeAnim}
    >
      <Card style={themedStyles.rescueCard}>
        <Card.Cover source={{ uri: item.image }} style={themedStyles.rescueImage} />
        <Card.Content style={themedStyles.rescueContent}>
          <Text style={themedStyles.rescueTitle}>{item.title}</Text>
          <View style={themedStyles.rescueDetails}>
            {[
              { icon: "calendar-outline", text: item.date },
              { icon: "location-outline", text: item.location },
              { icon: "time-outline", text: item.duration },
            ].map(({ icon, text }, index) => (
              <View key={index} style={themedStyles.rescueDetailItem}>
                <Ionicons name={icon} size={12} color="#666" />
                <Text style={themedStyles.rescueDetailText}>{text}</Text>
              </View>
            ))}
          </View>
          <View style={themedStyles.rescueFooter}>
            <Chip
              style={[
                themedStyles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
              textStyle={{ color: "#fff", fontSize: 10 }}
            >
              {item.status}
            </Chip>
            <Text style={themedStyles.rescueCost}>{item.cost}</Text>
          </View>
        </Card.Content>
      </Card>
    </AnimatedTouchable>
  );
};

const SectionCard: React.FC<{
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  expanded: boolean;
  toggle: () => void;
  children: React.ReactNode;
  fadeAnim: Animated.Value;
  themedStyles: any;
}> = ({ title, icon, iconColor, expanded, toggle, children, fadeAnim, themedStyles }) => (
  <Animated.View style={{ opacity: fadeAnim }}>
    <Card style={themedStyles.card}>
      <Card.Title
        title={title}
        left={(props) => <List.Icon {...props} icon={icon} color={iconColor} />}
        right={() => (
          <IconButton
            icon={expanded ? "chevron-up" : "chevron-down"}
            onPress={toggle}
            accessibilityLabel={`Toggle ${title} section`}
            accessibilityRole="button"
          />
        )}
      />
      {expanded && <Card.Content>{children}</Card.Content>}
    </Card>
  </Animated.View>
);

export default function UserProfileScreen() {
  const themeContext = useThemeContext();
  const { theme } = themeContext || { theme: {
    colors: {
      background: '#FAFAFA',
      primary: '#ffa041ff',
      card: '#FFFFFF',
      text: '#212121',
      subtext: '#757575',
      accent: '#F5F5F5',
      tabBackground1: '#FFFFFF',
      tabBackground2: '#F8F9FA',
      tabBackground3: '#E0E0E0',
      tabActive: '#212121',
      tabInactive: '#757575',
      critical: '#FFCDD2',
      error: '#B00020',
    },
    spacing: { padding: 16, margin: 12, radius: 12 }
  }};
  const dispatch = useAppDispatch();
  const [notificationRange, setNotificationRange] = useState("25");
  const [isPrivate, setIsPrivate] = useState(false);
  const [language, setLanguage] = useState("english");
  const [autoAcceptRescues, setAutoAcceptRescues] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    professionalInfo: true,
    skills: true,
    settings: true,
    emergencyContact: true,
    referral: true,
    achievements: true,
    rescues: true,
    goals: true,
    categories: true,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [editProfile, setEditProfile] = useState<UserProfile | null>(null);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const navigation = useNavigation<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    fetchUserProfile();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(avatarScale, {
        toValue: 1.05,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start(() =>
      Animated.spring(avatarScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start()
    );
  }, []);

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const data = await usersApi.getProfile();
      console.log('Profile data loaded:', data);
      setUserProfile(data);
    } catch (err: any) {
      console.error('Profile loading failed:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) { // Extended to handle 403
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryData = await usersApi.getProfile();
            setUserProfile(retryData);
            handled = true;
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setProfileError(err.message?.includes('403') ? 'Access denied (403). Check permissions or token validity.' : 'Failed to load profile. Please try again.');
      }
      setUserProfile(null);
    } finally {
      setProfileLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  const handleEditProfile = () => {
    setEditProfile(userProfile);
    setEditModalVisible(true);
    setEditError('');
    setEditSuccess(false);
  };

  const handleSaveProfile = async () => {
    setEditError('');
    setEditSuccess(false);
    try {
      const res = await usersApi.updateProfile(editProfile);
      console.log('Profile update response:', res);
      if (res && res.name) {
        setEditSuccess(true);
        setEditModalVisible(false);
        fetchUserProfile();
      } else {
        setEditError(res.error || 'Update failed');
      }
    } catch (err: any) {
      console.error('Profile update failed:', err);
      let handled = false;
      if (err.message?.includes('401') || err.message?.includes('403')) { // Extended to handle 403
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryRes = await usersApi.updateProfile(editProfile);
            if (retryRes && retryRes.name) {
              setEditSuccess(true);
              setEditModalVisible(false);
              fetchUserProfile();
              handled = true;
            }
          } catch (retryErr) {
            console.error('Retry failed after token refresh:', retryErr);
          }
        }
      }
      if (!handled) {
        setEditError('Update failed');
      }
    }
  };

  const achievements: Achievement[] = useMemo(() => [
    {
      id: "a1",
      title: "Hero Badge",
      description: "Saved 25+ animals",
      icon: "medal",
      color: "#FFD700",
      progress: 1.0,
      date: "Jan 2025",
    },
    {
      id: "a2",
      title: "Speed Rescuer",
      description: "Response time under 15 mins",
      icon: "flash",
      color: "#FF6B35",
      progress: 0.8,
      date: "Dec 2024",
    },
    {
      id: "a3",
      title: "Community Champion",
      description: "100+ lives touched",
      icon: "people",
      color: "#4ECDC4",
      progress: 1.0,
      date: "Nov 2024",
    },
    {
      id: "a4",
      title: "Night Guardian",
      description: "24/7 Emergency responder",
      icon: "moon",
      color: "#45B7D1",
      progress: 0.6,
      date: "In Progress",
    },
  ], []);

  const rescueStats: RescueStats = useMemo(() => ({
    totalRescues: 28,
    successRate: 96,
    averageResponseTime: "12 mins",
    monthlyGoal: 35,
    monthlyProgress: 0.8,
    categories: [
      { name: "Dogs", count: 15, color: "#8B4513" },
      { name: "Cats", count: 8, color: "#FF8C00" },
      { name: "Birds", count: 3, color: "#32CD32" },
      { name: "Others", count: 2, color: "#4169E1" },
    ],
  }), []);

  const dummyRescues: Rescue[] = useMemo(() => [
    {
      id: "r1",
      title: "Saved a Puppy from Drain",
      image:
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      date: "12 Mar 2025",
      location: "Delhi, India",
      impact: "Life Saved",
      duration: "2 hours",
      cost: "₹1,200",
      status: "Recovered",
    },
    {
      id: "r2",
      title: "Fed 40+ Stray Dogs in One Day",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6QSbH6DJb5dl3keQpVGijHJxpk44GdUm-HA&s",
      date: "04 Jan 2025",
      location: "Noida, India",
      impact: "Community Care",
      duration: "8 hours",
      cost: "₹2,500",
      status: "Ongoing",
    },
    {
      id: "r3",
      title: "Helped with Dog Vaccination Drive",
      image: "https://placebear.com/300/200",
      date: "25 Dec 2024",
      location: "Gurgaon, India",
      impact: "Prevention",
      duration: "6 hours",
      cost: "₹0 (Volunteer)",
      status: "Completed",
    },
  ], []);

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const themedStyles = styles(theme);

  const handleShareProfile = async () => {
    try {
      const profileLink = `https://karunanidhan.org/certificate/${encodeURIComponent(userProfile.name.replace(/\s+/g, '-').toLowerCase())}`;
      const message = `🐾 Animal Rescue Certificate 🐾\n\nThis certifies that ${userProfile.name} (${userProfile.title || 'Animal Rescuer'}) has made a significant impact in animal rescue.\n\nLocation: ${userProfile.location || 'Location not set'}\nKarma Points: 850\nAnimals Saved: ${rescueStats.totalRescues}\nSuccess Rate: ${rescueStats.successRate}%\nReferral Code: GOODBOY497\n\nView certificate: ${profileLink}`;
      await Share.share({ message, url: profileLink });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isOffline) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  if (profileLoading) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" accessibilityLabel="Loading profile" />
      </View>
    );
  }

  if (profileError || !userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: theme.colors.error }}>{profileError || 'Profile not found.'}</Text>
        <Button onPress={fetchUserProfile} accessibilityLabel="Retry loading profile" accessibilityRole="button">
          Retry
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={themedStyles.container}
      contentContainerStyle={{ paddingBottom: theme.spacing.margin * 7.5 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Profile Banner */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={themedStyles.bannerContainer}>
          <ImageBackground
            source={{
              uri: "https://www.onehealth.org/hubfs/blog/what-is-veterinary-social-work.jpg",
            }}
            style={themedStyles.banner}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[theme.colors.primary, 'rgba(0,0,0.7,0)']}
              style={themedStyles.bannerOverlay}
            />
            <View style={themedStyles.avatarContainer}>
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                <Avatar.Image
                  size={100}
                  source={{
                    uri: "https://t3.ftcdn.net/jpg/00/82/95/24/360_F_82952482_4zuOUVaXEmSOckrfuoLSd12cm4b3ZEzU.jpg",
                  }}
                  style={themedStyles.avatar}
                />
              </Animated.View>
              <Text style={themedStyles.name}>{userProfile.name}</Text>
              <Text style={themedStyles.title}>{userProfile.title || 'Animal Rescuer'}</Text>
              <View style={themedStyles.profileMeta}>
                <View style={themedStyles.metaItem}>
                  <Ionicons name="location-outline" size={14} color={theme.colors.card} />
                  <Text style={themedStyles.metaText}>{userProfile.location || 'Location not set'}</Text>
                </View>
                <View style={themedStyles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={theme.colors.card} />
                  <Text style={themedStyles.metaText}>
                    Joined {userProfile.joinDate}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
          <View style={themedStyles.profileActions}>
            {[
              { icon: "create-outline", label: "Edit", onPress: handleEditProfile },
              { icon: "share-outline", label: "Share", onPress: handleShareProfile },
              { icon: "settings-outline", label: "Settings", onPress: handleSettings },
            ].map(({ icon, label, onPress }, index) => (
              <TouchableOpacity key={index} style={themedStyles.actionButton} onPress={onPress}>
                <Ionicons name={icon} size={20} color={theme.colors.primary} />
                <Text style={themedStyles.actionText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '90%' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Edit Profile</Text>
            <TextInput
              label="Name"
              value={editProfile?.name || ''}
              onChangeText={v => setEditProfile(p => ({ ...p, name: v }))}
              style={{ marginBottom: 12 }}
              accessibilityLabel="Edit name"
            />
            <TextInput
              label="Title"
              value={editProfile?.title || ''}
              onChangeText={v => setEditProfile(p => ({ ...p, title: v }))}
              style={{ marginBottom: 12 }}
              accessibilityLabel="Edit title"
            />
            <TextInput
              label="Location"
              value={editProfile?.location || ''}
              onChangeText={v => setEditProfile(p => ({ ...p, location: v }))}
              style={{ marginBottom: 12 }}
              accessibilityLabel="Edit location"
            />
            <TextInput
              label="Phone"
              value={editProfile?.phone || ''}
              onChangeText={v => setEditProfile(p => ({ ...p, phone: v }))}
              style={{ marginBottom: 12 }}
              accessibilityLabel="Edit phone"
            />
            <TextInput
              label="Email"
              value={editProfile?.email || ''}
              onChangeText={v => setEditProfile(p => ({ ...p, email: v }))}
              style={{ marginBottom: 12 }}
              accessibilityLabel="Edit email"
            />
            {editError ? <Text style={{ color: 'red', marginBottom: 8 }}>{editError}</Text> : null}
            {editSuccess ? <Text style={{ color: 'green', marginBottom: 8 }}>Profile updated!</Text> : null}
            <Button mode="contained" onPress={handleSaveProfile} style={{ marginBottom: 8 }} accessibilityLabel="Save profile changes" accessibilityRole="button">
              Save
            </Button>
            <Button onPress={() => setEditModalVisible(false)} accessibilityLabel="Cancel editing" accessibilityRole="button">
              Cancel
            </Button>
          </View>
        </View>
      </Modal>

      {/* Stats */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Surface style={themedStyles.statsContainer} elevation={4}>
          {[
            {
              number: 850,
              label: "Karma Points",
              icon: "star",
              color: "#FFD700",
            },
            {
              number: rescueStats.totalRescues,
              label: "Animals Saved",
              icon: "heart",
              color: "red",
            },
            {
              number: 103,
              label: "Lives Touched",
              icon: "people",
              color: "pink",
            },
            {
              number: `${rescueStats.successRate}%`,
              label: "Success Rate",
              icon: "checkmark-circle",
              color: "green",
            },
          ].map(({ number, label, icon, color }, index) => (
            <View key={index} style={themedStyles.statBox}>
              <Text style={themedStyles.statNumber}>{number}</Text>
              <Text style={themedStyles.statLabel}>{label}</Text>
              <View style={themedStyles.statIcon}>
                <Ionicons name={icon} size={16} color={color} />
              </View>
            </View>
          ))}
        </Surface>
      </Animated.View>

      {/* Monthly Goals */}
      <SectionCard
        title="Monthly Goals"
        icon="target"
        iconColor="#8B4513"
        expanded={expandedSections.goals}
        toggle={() => toggleSection("goals")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.goalContainer}>
          <View style={themedStyles.goalHeader}>
            <Text style={themedStyles.goalText}>
              {Math.round(
                rescueStats.monthlyProgress * rescueStats.monthlyGoal
              )}{" "}
              of {rescueStats.monthlyGoal} rescues
            </Text>
            <Text style={themedStyles.goalPercentage}>
              {Math.round(rescueStats.monthlyProgress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={rescueStats.monthlyProgress}
            color="#8B4513"
            style={themedStyles.progressBar}
          />
          <Text style={themedStyles.goalSubtext}>
            {rescueStats.monthlyGoal -
              Math.round(
                rescueStats.monthlyProgress * rescueStats.monthlyGoal
              )}{" "}
            more to reach your goal
          </Text>
        </View>
      </SectionCard>

      {/* Achievements */}
      <SectionCard
        title="Achievements"
        icon="trophy"
        iconColor="#FFD700"
        expanded={expandedSections.achievements}
        toggle={() => toggleSection("achievements")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <FlatList
          data={achievements}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AchievementItem item={item} parentFadeAnim={fadeAnim} theme={theme} themedStyles={themedStyles} />
          )}
        />
      </SectionCard>

      {/* Rescue Categories */}
      <SectionCard
        title="Rescue Categories"
        icon="chart-pie"
        iconColor="#8B4513"
        expanded={expandedSections.categories}
        toggle={() => toggleSection("categories")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.categoriesContainer}>
          {rescueStats.categories.map((category, index) => (
            <View key={index} style={themedStyles.categoryItem}>
              <View style={themedStyles.categoryHeader}>
                <View
                  style={[
                    themedStyles.categoryDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={themedStyles.categoryName}>{category.name}</Text>
                <Text style={themedStyles.categoryCount}>{category.count}</Text>
              </View>
              <ProgressBar
                progress={category.count / rescueStats.totalRescues}
                color={category.color}
                style={themedStyles.categoryBar}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Recent Rescues */}
      <SectionCard
        title="Recent Rescues"
        icon="history"
        iconColor="#8B4513"
        expanded={expandedSections.rescues}
        toggle={() => toggleSection("rescues")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <FlatList
          data={dummyRescues}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RescueItem item={item} parentFadeAnim={fadeAnim} theme={theme} themedStyles={themedStyles} />
          )}
        />
      </SectionCard>

      {/* Professional Info */}
      <SectionCard
        title="Professional Information"
        icon="account-tie"
        iconColor="#8B4513"
        expanded={expandedSections.professionalInfo}
        toggle={() => toggleSection("professionalInfo")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.professionalGrid}>
          <View style={themedStyles.professionalItem}>
            <Text style={themedStyles.professionalLabel}>Specializations</Text>
            <View style={themedStyles.specializationChips}>
              {(userProfile.specializations || []).map((spec, index) => (
                <Chip
                  key={index}
                  style={themedStyles.specChip}
                  textStyle={{ fontSize: 12, color: "#6B4F3A" }}
                >
                  {spec}
                </Chip>
              ))}
            </View>
          </View>
          <View style={themedStyles.professionalItem}>
            <Text style={themedStyles.professionalLabel}>Transport Capacity</Text>
            <Text style={themedStyles.professionalValue}>
              {userProfile.transportCapacity || 'Not specified'}
            </Text>
          </View>
          <View style={themedStyles.professionalItem}>
            <Text style={themedStyles.professionalLabel}>Availability</Text>
            <View style={themedStyles.availabilityContainer}>
              <Text style={themedStyles.availabilityText}>
                {(userProfile.availability?.days || []).join(", ")}
              </Text>
              <Text style={themedStyles.availabilityTime}>
                {(userProfile.availability?.timeSlots || []).join(" & ")}
              </Text>
            </View>
          </View>
          <View style={themedStyles.professionalItem}>
            <Text style={themedStyles.professionalLabel}>Certifications</Text>
            {(userProfile.certifications || []).map((cert, index) => (
              <View key={index} style={themedStyles.certificationItem}>
                <Ionicons name="ribbon" size={14} color="#8B4513" />
                <Text style={themedStyles.certificationText}>{cert}</Text>
              </View>
            ))}
          </View>
        </View>
      </SectionCard>

      {/* Skills & Capabilities */}
      <SectionCard
        title="Skills & Capabilities"
        icon="tools"
        iconColor="#8B4513"
        expanded={expandedSections.skills}
        toggle={() => toggleSection("skills")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.skillsContainer}>
          {[
            {
              title: "Primary Skills",
              chips: [
                { icon: "car", text: "Can Transport" },
                { icon: "medical-bag", text: "Medical Knowledge" },
                { icon: "paw", text: "Animal Handling" },
              ],
              style: themedStyles.primaryChip,
            },
            {
              title: "Secondary Skills",
              chips: [
                { icon: undefined, text: "Fundraising" },
                { icon: undefined, text: "Vaccination Support" },
                { icon: undefined, text: "Emergency Response" },
                { icon: undefined, text: "Community Outreach" },
              ],
              style: themedStyles.secondaryChip,
            },
          ].map(({ title, chips, style }, index) => (
            <View key={index} style={themedStyles.skillCategory}>
              <Text style={themedStyles.skillCategoryTitle}>{title}</Text>
              <View style={themedStyles.chipContainer}>
                {chips.map(({ text, icon }, i) => (
                  <Chip key={i} style={style} icon={icon}>
                    {text}
                  </Chip>
                ))}
              </View>
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Emergency Contact */}
      <SectionCard
        title="Emergency Contact"
        icon="phone"
        iconColor="#FF4444"
        expanded={expandedSections.emergencyContact}
        toggle={() => toggleSection("emergencyContact")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.emergencyContact}>
          <View style={themedStyles.contactInfo}>
            <Text style={themedStyles.contactName}>
              {userProfile.emergencyContact?.name || 'Not set'}
            </Text>
            <Text style={themedStyles.contactRelation}>
              {userProfile.emergencyContact?.relation || 'Not set'}
            </Text>
            <Text style={themedStyles.contactPhone}>
              {userProfile.emergencyContact?.phone || 'Not set'}
            </Text>
          </View>
          <View style={themedStyles.contactActions}>
            <IconButton
              icon="phone"
              iconColor="#4CAF50"
              size={24}
              style={themedStyles.contactButton}
              onPress={() => {}}
              accessibilityLabel="Call emergency contact"
              accessibilityRole="button"
            />
            <IconButton
              icon="pencil"
              iconColor="#8B4513"
              size={24}
              style={themedStyles.contactButton}
              onPress={() => {}}
              accessibilityLabel="Edit emergency contact"
              accessibilityRole="button"
            />
          </View>
        </View>
      </SectionCard>

      {/* Referral Program */}
      <SectionCard
        title="Referral Program"
        icon="gift"
        iconColor="#8B4513"
        expanded={expandedSections.referral}
        toggle={() => toggleSection("referral")}
        fadeAnim={fadeAnim}
        themedStyles={themedStyles}
      >
        <View style={themedStyles.referralContainer}>
          <View style={themedStyles.referralHeader}>
            <Text style={themedStyles.referralTitle}>
              Invite Friends & Earn Rewards
            </Text>
            <Text style={themedStyles.referralDescription}>
              Get 100 karma points for each successful referral
            </Text>
          </View>
          <View style={themedStyles.referralCodeContainer}>
            <Text style={themedStyles.referralCodeLabel}>Your Referral Code:</Text>
            <View style={themedStyles.referralCode}>
              <Text style={themedStyles.referralCodeText}>GOODBOY497</Text>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor="#8B4513"
                onPress={() => {}}
                accessibilityLabel="Copy referral code"
                accessibilityRole="button"
              />
            </View>
          </View>
          <View style={themedStyles.referralStats}>
            {[
              { number: 12, label: "Invites Sent" },
              { number: 8, label: "Joined" },
              { number: 800, label: "Points Earned" },
            ].map(({ number, label }, index) => (
              <View key={index} style={themedStyles.referralStat}>
                <Text style={themedStyles.referralStatNumber}>{number}</Text>
                <Text style={themedStyles.referralStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Button
            icon="share-variant"
            mode="contained"
            style={themedStyles.shareButton}
            buttonColor="#8B4513"
            onPress={() => {}}
            accessibilityLabel="Share referral code"
            accessibilityRole="button"
          >
            Share Referral Code
          </Button>
        </View>
      </SectionCard>

      {/* Logout Section */}
      <Card style={themedStyles.logoutCard}>
        <Card.Content>
          <Button
            mode="contained"
            buttonColor="#FF4444"
            textColor="white"
            style={themedStyles.logoutButton}
            icon="logout"
            onPress={handleLogout}
            accessibilityLabel="Log out"
            accessibilityRole="button"
          >
            Log Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = (theme: any) => StyleSheet.create({
  container: { backgroundColor: theme.colors.background, flex: 1 },
  bannerContainer: { position: "relative" },
  banner: { height: 260, justifyContent: "center", alignItems: "center", paddingTop: 38 },
  bannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  avatarContainer: { alignItems: "center", zIndex: 2 },
  avatar: {
    borderColor: theme.colors.card,
    elevation: 10,
    backgroundColor: theme.colors.card,
  },
  name: {
    marginTop: 1,
    fontWeight: "bold",
    fontSize: 26,
    color: theme.colors.card,
    textShadowColor: 'black', 
    textShadowRadius: 4,
    textAlign: "center",
    fontFamily: "cursive",
  },
  title: { color: 'white', textShadowColor: 'black', textShadowRadius: 4, fontSize: 16, textAlign: "center", marginTop: 1 },
  profileMeta: { flexDirection: "row", marginTop: 1, gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: 'white', textShadowColor: 'black', textShadowRadius: 4, fontSize: 13 },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: theme.colors.card,
    paddingVertical: 10,
    marginTop: -20,
    marginHorizontal: theme.spacing.margin,
    borderRadius: theme.spacing.radius,
    elevation: 4,
  },
  actionButton: { alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, color: theme.colors.tabActive, fontWeight: "600" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.margin,
    marginTop: 12,
    borderRadius: theme.spacing.radius,
    elevation: 4,
  },
  statBox: { alignItems: "center", position: "relative" },
  statNumber: { fontSize: 22, fontWeight: "bold", color: theme.colors.tabActive },
  statLabel: { fontSize: 12, color: theme.colors.tabInactive, marginTop: 4 },
  statIcon: { position: "absolute", top: -4, right: -8 },
  card: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.margin,
    marginVertical: 8,
    borderRadius: theme.spacing.radius,
    elevation: 4,
    overflow: "hidden",
  },
  goalContainer: { gap: 10 },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalText: { fontSize: 16, fontWeight: "600", color: theme.colors.tabInactive },
  goalPercentage: { fontSize: 16, fontWeight: "bold", color: theme.colors.tabActive },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: theme.colors.tabBackground2 },
  goalSubtext: { fontSize: 13, color: theme.colors.tabInactive },
  achievementCard: {
    width: 150,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.tabBackground1,
    alignItems: "center",
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    backgroundColor: theme.colors.tabBackground2,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.tabActive,
    textAlign: "center",
    marginBottom: 6,
  },
  achievementDesc: {
    fontSize: 11,
    color: theme.colors.tabInactive,
    textAlign: "center",
    marginBottom: 8,
  },
  achievementProgress: { width: "100%", alignItems: "center", gap: 6 },
  achievementBar: { width: "100%", height: 5, borderRadius: 3, backgroundColor: theme.colors.tabBackground3 },
  achievementDate: { fontSize: 11, color: theme.colors.tabInactive },
  categoriesContainer: { gap: 12, },
  categoryItem: { gap: 8 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  categoryName: { flex: 1, fontSize: 15, fontWeight: "500", color: theme.colors.tabActive },
  categoryCount: { fontSize: 15, fontWeight: "bold", color: theme.colors.tabActive },
  categoryBar: { height: 8, borderRadius: 4, backgroundColor: "#e9e9e9ff" },
  professionalGrid: { gap: 16 },
  professionalItem: { marginBottom: 12 },
  professionalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.tabActive,
    marginBottom: 8,
  },
  professionalValue: { fontSize: 14, color: theme.colors.tabInactive },
  specializationChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specChip: {
    backgroundColor: theme.colors.tabBackground1,
    borderWidth: 1,
    borderColor: theme.colors.tabBackground3,
    borderRadius: 8,
  },
  availabilityContainer: { gap: 6 },
  availabilityText: { fontSize: 14, color: theme.colors.tabInactive },
  availabilityTime: { fontSize: 13, color: theme.colors.tabInactive },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  certificationText: { fontSize: 14, color: theme.colors.tabInactive },
  skillsContainer: { gap: 16 },
  skillCategory: { gap: 8 },
  skillCategoryTitle: { fontSize: 15, fontWeight: "bold", color: theme.colors.tabActive },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryChip: {
    backgroundColor: theme.colors.tabBackground1,
    borderWidth: 1,
    borderColor: theme.colors.tabBackground3,
    borderRadius: 8,
  },
  secondaryChip: {
    backgroundColor: theme.colors.tabBackground2,
    borderWidth: 1,
    borderColor: theme.colors.tabBackground3,
    borderRadius: 8,
  },
  rescueCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.colors.tabBackground1,
  },
  rescueImage: { height: 140 },
  rescueContent: { gap: 8, paddingTop: 10 },
  rescueTitle: { fontSize: 15, fontWeight: "bold", color: theme.colors.tabActive },
  rescueDetails: { gap: 6 },
  rescueDetailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  rescueDetailText: { fontSize: 13, color: theme.colors.tabInactive },
  rescueFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusChip: { height: 24, borderRadius: 12, justifyContent: "center" },
  rescueCost: { fontSize: 13, fontWeight: "bold", color: theme.colors.tabActive },
  settingSection: { marginBottom: 16, gap: 12 },
  settingSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.tabActive,
    marginBottom: 6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingLabel: { fontSize: 14, color: theme.colors.tabInactive },
  settingRowVertical: { gap: 10 },
  segmentedButtons: { marginTop: 6 },
  settingDivider: { marginVertical: 12, backgroundColor: theme.colors.tabBackground3 },
  emergencyContact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactInfo: { gap: 6 },
  contactName: { fontSize: 16, fontWeight: "bold", color: theme.colors.tabActive },
  contactRelation: { fontSize: 13, color: theme.colors.tabInactive },
  contactPhone: { fontSize: 14, color: theme.colors.tabActive },
  contactActions: { flexDirection: "row", gap: 6 },
  contactButton: { backgroundColor: theme.colors.tabBackground1, borderRadius: 12 },
  referralContainer: { gap: 10 },
  referralHeader: { gap: 6 },
  referralTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.tabActive },
  referralDescription: { fontSize: 13, color: theme.colors.tabInactive },
  referralCodeContainer: { gap: 8 },
  referralCodeLabel: { fontSize: 14, color: theme.colors.tabInactive },
  referralCode: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.tabBackground1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.tabBackground3,
  },
  referralCodeText: { fontSize: 15, fontWeight: "bold", color: theme.colors.tabActive },
  referralStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  referralStat: { alignItems: "center" },
  referralStatNumber: { fontSize: 16, fontWeight: "bold", color: theme.colors.tabActive },
  referralStatLabel: { fontSize: 12, color: theme.colors.tabInactive },
  shareButton: { marginTop: 10, borderRadius: 8, backgroundColor: theme.colors.tabActive },
  logoutCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.margin,
    marginVertical: 8,
    borderRadius: theme.spacing.radius,
    elevation: 4,
    overflow: "hidden",
  },
  logoutButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
