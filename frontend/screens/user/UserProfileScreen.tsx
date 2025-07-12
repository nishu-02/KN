import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Animated,
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
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
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
  title: string;
  joinDate: string;
  location: string;
  phone: string;
  email: string;
  emergencyContact: { name: string; phone: string; relation: string };
  certifications: string[];
  availability: { days: string[]; timeSlots: string[] };
  transportCapacity: string;
  specializations: string[];
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
}> = ({ item, parentFadeAnim }) => {
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
      <Surface style={styles.achievementCard} elevation={2}>
        <View style={[styles.achievementIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon as any} size={24} color="#fff" />
        </View>
        <Text style={styles.achievementTitle}>{item.title}</Text>
        <Text style={styles.achievementDesc}>{item.description}</Text>
        <View style={styles.achievementProgress}>
          <ProgressBar
            progress={item.progress}
            color={item.color}
            style={styles.achievementBar}
          />
          <Text style={styles.achievementDate}>{item.date}</Text>
        </View>
      </Surface>
    </AnimatedTouchable>
  );
};

const RescueItem: React.FC<{
  item: Rescue;
  parentFadeAnim: Animated.Value;
}> = ({ item, parentFadeAnim }) => {
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
      <Card style={styles.rescueCard}>
        <Card.Cover source={{ uri: item.image }} style={styles.rescueImage} />
        <Card.Content style={styles.rescueContent}>
          <Text style={styles.rescueTitle}>{item.title}</Text>
          <View style={styles.rescueDetails}>
            {[
              { icon: "calendar-outline", text: item.date },
              { icon: "location-outline", text: item.location },
              { icon: "time-outline", text: item.duration },
            ].map(({ icon, text }, index) => (
              <View key={index} style={styles.rescueDetailItem}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={12} color="#666" />
                <Text style={styles.rescueDetailText}>{text}</Text>
              </View>
            ))}
          </View>
          <View style={styles.rescueFooter}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: getStatusColor(item.status) },
              ]}
              textStyle={{ color: "#fff", fontSize: 10 }}
            >
              {item.status}
            </Chip>
            <Text style={styles.rescueCost}>{item.cost}</Text>
          </View>
        </Card.Content>
      </Card>
    </AnimatedTouchable>
  );
};

const SectionCard: React.FC<{
  title: string;
  icon: string;
  iconColor: string;
  expanded: boolean;
  toggle: () => void;
  children: React.ReactNode;
  fadeAnim: Animated.Value;
}> = ({ title, icon, iconColor, expanded, toggle, children, fadeAnim }) => (
  <Animated.View style={{ opacity: fadeAnim }}>
    <Card style={styles.card}>
      <Card.Title
        title={title}
        left={(props) => <List.Icon {...props} icon={icon} color={iconColor} />}
        right={() => (
          <IconButton
            icon={expanded ? "chevron-up" : "chevron-down"}
            onPress={toggle}
          />
        )}
      />
      {expanded && <Card.Content>{children}</Card.Content>}
    </Card>
  </Animated.View>
);

export default function UserProfileScreen() {
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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
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

  const userProfile: UserProfile = {
    name: "John Doe",
    title: "Animal Rescuer | Community Volunteer",
    joinDate: "March 2023",
    location: "New Delhi, India",
    phone: "+91-9876543210",
    email: "john.doe@email.com",
    emergencyContact: {
      name: "Sarah Doe",
      phone: "+91-9876543211",
      relation: "Sister",
    },
    certifications: [
      "First Aid Certified",
      "Animal Handling License",
      "Wildlife Rescue Training",
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
      timeSlots: ["Morning", "Evening"],
    },
    transportCapacity: "2-3 medium animals",
    specializations: ["Dogs", "Cats", "Birds", "Emergency Care"],
  };

  const achievements: Achievement[] = [
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
  ];

  const rescueStats: RescueStats = {
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
  };

  const dummyRescues: Rescue[] = [
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
  ];

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Profile Banner */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{
              uri: "https://www.onehealth.org/hubfs/blog/what-is-veterinary-social-work.jpg",
            }}
            style={styles.banner}
            resizeMode="cover"
          >
            <LinearGradient
              colors={["#8B4513", "rgba(0,0,0,0.7)"]}
              style={styles.bannerOverlay}
            />
            <View style={styles.avatarContainer}>
              <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                <Avatar.Image
                  size={100}
                  source={{
                    uri: "https://t3.ftcdn.net/jpg/00/82/95/24/360_F_82952482_4zuOUVaXEmSOckrfuoLSd12cm4b3ZEzU.jpg",
                  }}
                  style={styles.avatar}
                />
              </Animated.View>
              <Text style={styles.name}>{userProfile.name}</Text>
              <Text style={styles.title}>{userProfile.title}</Text>
              <View style={styles.profileMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} color="#fff" />
                  <Text style={styles.metaText}>{userProfile.location}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color="#fff" />
                  <Text style={styles.metaText}>
                    Joined {userProfile.joinDate}
                  </Text>
                </View>
              </View>
            </View>
          </ImageBackground>
          <View style={styles.profileActions}>
            {["create-outline", "share-outline", "settings-outline"].map(
              (icon, index) => (
                <TouchableOpacity key={index} style={styles.actionButton}>
                  <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color="#8B4513" />
                  <Text style={styles.actionText}>
                    {["Edit", "Share", "Settings"][index]}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </Animated.View>

      {/* Stats */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Surface style={styles.statsContainer} elevation={4}>
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
              color: "#FF6B6B",
            },
            {
              number: 103,
              label: "Lives Touched",
              icon: "people",
              color: "#4ECDC4",
            },
            {
              number: `${rescueStats.successRate}%`,
              label: "Success Rate",
              icon: "checkmark-circle",
              color: "#4CAF50",
            },
          ].map(({ number, label, icon, color }, index) => (
            <View key={index} style={styles.statBox}>
              <Text style={styles.statNumber}>{number}</Text>
              <Text style={styles.statLabel}>{label}</Text>
              <View style={styles.statIcon}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={color} />
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
      >
        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalText}>
              {Math.round(
                rescueStats.monthlyProgress * rescueStats.monthlyGoal
              )}{" "}
              of {rescueStats.monthlyGoal} rescues
            </Text>
            <Text style={styles.goalPercentage}>
              {Math.round(rescueStats.monthlyProgress * 100)}%
            </Text>
          </View>
          <ProgressBar
            progress={rescueStats.monthlyProgress}
            color="#8B4513"
            style={styles.progressBar}
          />
          <Text style={styles.goalSubtext}>
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
      >
        <FlatList
          data={achievements}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AchievementItem item={item} parentFadeAnim={fadeAnim} />
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
      >
        <View style={styles.categoriesContainer}>
          {rescueStats.categories.map((category, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryHeader}>
                <View
                  style={[
                    styles.categoryDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </View>
              <ProgressBar
                progress={category.count / rescueStats.totalRescues}
                color={category.color}
                style={styles.categoryBar}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      {/* Professional Info */}
      <SectionCard
        title="Professional Information"
        icon="account-tie"
        iconColor="#8B4513"
        expanded={expandedSections.professionalInfo}
        toggle={() => toggleSection("professionalInfo")}
        fadeAnim={fadeAnim}
      >
        <View style={styles.professionalGrid}>
          <View style={styles.professionalItem}>
            <Text style={styles.professionalLabel}>Specializations</Text>
            <View style={styles.specializationChips}>
              {userProfile.specializations.map((spec, index) => (
                <Chip
                  key={index}
                  style={styles.specChip}
                  textStyle={{ fontSize: 12, color: "#6B4F3A" }}
                >
                  {spec}
                </Chip>
              ))}
            </View>
          </View>
          <View style={styles.professionalItem}>
            <Text style={styles.professionalLabel}>Transport Capacity</Text>
            <Text style={styles.professionalValue}>
              {userProfile.transportCapacity}
            </Text>
          </View>
          <View style={styles.professionalItem}>
            <Text style={styles.professionalLabel}>Availability</Text>
            <View style={styles.availabilityContainer}>
              <Text style={styles.availabilityText}>
                {userProfile.availability.days.join(", ")}
              </Text>
              <Text style={styles.availabilityTime}>
                {userProfile.availability.timeSlots.join(" & ")}
              </Text>
            </View>
          </View>
          <View style={styles.professionalItem}>
            <Text style={styles.professionalLabel}>Certifications</Text>
            {userProfile.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationItem}>
                <Ionicons name="ribbon" size={14} color="#8B4513" />
                <Text style={styles.certificationText}>{cert}</Text>
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
      >
        <View style={styles.skillsContainer}>
          {[
            {
              title: "Primary Skills",
              chips: [
                { icon: "car", text: "Can Transport" },
                { icon: "medical-bag", text: "Medical Knowledge" },
                { icon: "paw", text: "Animal Handling" },
              ],
              style: styles.primaryChip,
            },
            {
              title: "Secondary Skills",
              chips: [
                { icon: undefined, text: "Fundraising" },
                { icon: undefined, text: "Vaccination Support" },
                { icon: undefined, text: "Emergency Response" },
                { icon: undefined, text: "Community Outreach" },
              ],
              style: styles.secondaryChip,
            },
          ].map(({ title, chips, style }, index) => (
            <View key={index} style={styles.skillCategory}>
              <Text style={styles.skillCategoryTitle}>{title}</Text>
              <View style={styles.chipContainer}>
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

      {/* Recent Rescues */}
      <SectionCard
        title="Recent Rescues"
        icon="history"
        iconColor="#8B4513"
        expanded={expandedSections.rescues}
        toggle={() => toggleSection("rescues")}
        fadeAnim={fadeAnim}
      >
        <FlatList
          data={dummyRescues}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RescueItem item={item} parentFadeAnim={fadeAnim} />
          )}
        />
      </SectionCard>

      {/* Preferences & Settings */}
      <SectionCard
        title="Preferences & Settings"
        icon="cog"
        iconColor="#8B4513"
        expanded={expandedSections.settings}
        toggle={() => toggleSection("settings")}
        fadeAnim={fadeAnim}
      >
        <View style={styles.settingSection}>
          <Text style={styles.settingSectionTitle}>Notification Settings</Text>
          {[
            {
              icon: "notifications-outline",
              label: "Auto-Accept Rescues",
              value: autoAcceptRescues,
              onChange: setAutoAcceptRescues,
              thumbColor: "#8B4513",
            },
            {
              icon: "alert-circle-outline",
              label: "Emergency Mode",
              value: emergencyMode,
              onChange: setEmergencyMode,
              thumbColor: "#FF4444",
            },
            {
              icon: "eye-off-outline",
              label: "Privacy Mode",
              value: isPrivate,
              onChange: setIsPrivate,
              thumbColor: "#8B4513",
            },
          ].map(({ icon, label, value, onChange, thumbColor }, index) => (
            <View key={index} style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color={thumbColor} />
                <Text style={styles.settingLabel}>{label}</Text>
              </View>
              <Switch
                value={value}
                onValueChange={onChange}
                thumbColor={value ? thumbColor : "#f4f3f4"}
              />
            </View>
          ))}
        </View>
        <Divider style={styles.settingDivider} />
        <View style={styles.settingSection}>
          <Text style={styles.settingSectionTitle}>Range & Language</Text>
          {[
            {
              icon: "location-outline",
              label: "Notification Range",
              value: notificationRange,
              onChange: setNotificationRange,
              buttons: [
                { value: "5", label: "5 km" },
                { value: "25", label: "25 km" },
                { value: "50", label: "50 km" },
              ],
            },
            {
              icon: "language-outline",
              label: "Preferred Language",
              value: language,
              onChange: setLanguage,
              buttons: [
                { value: "english", label: "English" },
                { value: "hindi", label: "Hindi" },
              ],
            },
          ].map(({ icon, label, value, onChange, buttons }, index) => (
            <View key={index} style={styles.settingRowVertical}>
              <View style={styles.settingLeft}>
                <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={20} color="#8B4513" />
                <Text style={styles.settingLabel}>{label}</Text>
              </View>
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={buttons}
                style={styles.segmentedButtons}
              />
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
      >
        <View style={styles.emergencyContact}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>
              {userProfile.emergencyContact.name}
            </Text>
            <Text style={styles.contactRelation}>
              {userProfile.emergencyContact.relation}
            </Text>
            <Text style={styles.contactPhone}>
              {userProfile.emergencyContact.phone}
            </Text>
          </View>
          <View style={styles.contactActions}>
            <IconButton
              icon="phone"
              iconColor="#4CAF50"
              size={24}
              style={styles.contactButton}
              onPress={() => {}}
            />
            <IconButton
              icon="pencil"
              iconColor="#8B4513"
              size={24}
              style={styles.contactButton}
              onPress={() => {}}
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
      >
        <View style={styles.referralContainer}>
          <View style={styles.referralHeader}>
            <Text style={styles.referralTitle}>
              Invite Friends & Earn Rewards
            </Text>
            <Text style={styles.referralDescription}>
              Get 100 karma points for each successful referral
            </Text>
          </View>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCodeLabel}>Your Referral Code:</Text>
            <View style={styles.referralCode}>
              <Text style={styles.referralCodeText}>GOODBOY497</Text>
              <IconButton
                icon="content-copy"
                size={20}
                iconColor="#8B4513"
                onPress={() => {}}
              />
            </View>
          </View>
          <View style={styles.referralStats}>
            {[
              { number: 12, label: "Invites Sent" },
              { number: 8, label: "Joined" },
              { number: 800, label: "Points Earned" },
            ].map(({ number, label }, index) => (
              <View key={index} style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>{number}</Text>
                <Text style={styles.referralStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
          <Button
            icon="share-variant"
            mode="contained"
            style={styles.shareButton}
            buttonColor="#8B4513"
            onPress={() => {}}
          >
            Share Referral Code
          </Button>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#FFF5E1", flex: 1 },
  bannerContainer: { position: "relative" },
  banner: { height: 260, justifyContent: "center", alignItems: "center" },
  bannerOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  avatarContainer: { alignItems: "center", zIndex: 2 },
  avatar: {
    borderColor: "#fff",
    elevation: 10,
    backgroundColor: "#FFF",
  },
  name: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 26,
    color: "#fff",
    textAlign: "center",
    fontFamily: "cursive",
  },
  title: { color: "#f0f0f0", fontSize: 16, textAlign: "center", marginTop: 6 },
  profileMeta: { flexDirection: "row", marginTop: 10, gap: 16 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#f0f0f0", fontSize: 13 },
  profileActions: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#fff",
    paddingVertical: 12,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 4,
  },
  actionButton: { alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, color: "#8B4513", fontWeight: "600" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    elevation: 4,
  },
  statBox: { alignItems: "center", position: "relative" },
  statNumber: { fontSize: 22, fontWeight: "bold", color: "#8B4513" },
  statLabel: { fontSize: 12, color: "#6B4F3A", marginTop: 4 },
  statIcon: { position: "absolute", top: -4, right: -8 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  goalContainer: { gap: 10 },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalText: { fontSize: 16, fontWeight: "600", color: "#5C4033" },
  goalPercentage: { fontSize: 16, fontWeight: "bold", color: "#8B4513" },
  progressBar: { height: 10, borderRadius: 5, backgroundColor: "#EDE0C8" },
  goalSubtext: { fontSize: 13, color: "#7C5C42" },
  achievementCard: {
    width: 150,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#FAF3E0",
    alignItems: "center",
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5C4033",
    textAlign: "center",
    marginBottom: 6,
  },
  achievementDesc: {
    fontSize: 11,
    color: "#6B4F3A",
    textAlign: "center",
    marginBottom: 8,
  },
  achievementProgress: { width: "100%", alignItems: "center", gap: 6 },
  achievementBar: { width: "100%", height: 5, borderRadius: 3 },
  achievementDate: { fontSize: 11, color: "#7C5C42" },
  categoriesContainer: { gap: 12 },
  categoryItem: { gap: 8 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  categoryName: { flex: 1, fontSize: 15, fontWeight: "500", color: "#5C4033" },
  categoryCount: { fontSize: 15, fontWeight: "bold", color: "#8B4513" },
  categoryBar: { height: 8, borderRadius: 4 },
  professionalGrid: { gap: 16 },
  professionalItem: { marginBottom: 12 },
  professionalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5C4033",
    marginBottom: 8,
  },
  professionalValue: { fontSize: 14, color: "#6B4F3A" },
  specializationChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  specChip: {
    backgroundColor: "#FFF5E1",
    borderWidth: 1,
    borderColor: "#D2B48C",
    borderRadius: 8,
  },
  availabilityContainer: { gap: 6 },
  availabilityText: { fontSize: 14, color: "#6B4F3A" },
  availabilityTime: { fontSize: 13, color: "#7C5C42" },
  certificationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 4,
  },
  certificationText: { fontSize: 14, color: "#6B4F3A" },
  skillsContainer: { gap: 16 },
  skillCategory: { gap: 8 },
  skillCategoryTitle: { fontSize: 15, fontWeight: "bold", color: "#5C4033" },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryChip: {
    backgroundColor: "#FFF5E1",
    borderWidth: 1,
    borderColor: "#D2B48C",
    borderRadius: 8,
  },
  secondaryChip: {
    backgroundColor: "#F5F5DC",
    borderWidth: 1,
    borderColor: "#D2B48C",
    borderRadius: 8,
  },
  rescueCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FAF3E0",
  },
  rescueImage: { height: 140 },
  rescueContent: { gap: 8, paddingTop: 10 },
  rescueTitle: { fontSize: 15, fontWeight: "bold", color: "#5C4033" },
  rescueDetails: { gap: 6 },
  rescueDetailItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  rescueDetailText: { fontSize: 13, color: "#7C5C42" },
  rescueFooter: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusChip: { height: 24, borderRadius: 12, justifyContent: "center" },
  rescueCost: { fontSize: 13, fontWeight: "bold", color: "#8B4513" },
  settingSection: { marginBottom: 16, gap: 12 },
  settingSectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#5C4033",
    marginBottom: 6,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingLabel: { fontSize: 14, color: "#6B4F3A" },
  settingRowVertical: { gap: 10 },
  segmentedButtons: { marginTop: 6 },
  settingDivider: { marginVertical: 12, backgroundColor: "#EDE0C8" },
  emergencyContact: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactInfo: { gap: 6 },
  contactName: { fontSize: 16, fontWeight: "bold", color: "#5C4033" },
  contactRelation: { fontSize: 13, color: "#7C5C42" },
  contactPhone: { fontSize: 14, color: "#8B4513" },
  contactActions: { flexDirection: "row", gap: 6 },
  contactButton: { backgroundColor: "#FFF5E1", borderRadius: 12 },
  referralContainer: { gap: 16 },
  referralHeader: { gap: 6 },
  referralTitle: { fontSize: 16, fontWeight: "bold", color: "#5C4033" },
  referralDescription: { fontSize: 13, color: "#7C5C42" },
  referralCodeContainer: { gap: 8 },
  referralCodeLabel: { fontSize: 14, color: "#6B4F3A" },
  referralCode: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF5E1",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D2B48C",
  },
  referralCodeText: { fontSize: 15, fontWeight: "bold", color: "#8B4513" },
  referralStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  referralStat: { alignItems: "center" },
  referralStatNumber: { fontSize: 16, fontWeight: "bold", color: "#8B4513" },
  referralStatLabel: { fontSize: 12, color: "#7C5C42" },
  shareButton: { marginTop: 10, borderRadius: 8 },
});
