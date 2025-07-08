import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Avatar,
  Chip,
  Divider,
  List,
  Badge,
  Button,
  Switch,
  SegmentedButtons,
  Surface,
  IconButton,
  ProgressBar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function UserProfileScreen() {
  const [notificationRange, setNotificationRange] = useState("25");
  const [isPrivate, setIsPrivate] = useState(false);
  const [language, setLanguage] = useState("english");
  const [autoAcceptRescues, setAutoAcceptRescues] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);

  const userProfile = {
    name: "John Doe",
    title: "Animal Rescuer | Community Volunteer",
    joinDate: "March 2023",
    location: "New Delhi, India",
    phone: "+91-9876543210",
    email: "john.doe@email.com",
    emergencyContact: {
      name: "Sarah Doe",
      phone: "+91-9876543211",
      relation: "Sister"
    },
    certifications: [
      "First Aid Certified",
      "Animal Handling License",
      "Wildlife Rescue Training"
    ],
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Saturday", "Sunday"],
      timeSlots: ["Morning", "Evening"]
    },
    transportCapacity: "2-3 medium animals",
    specializations: ["Dogs", "Cats", "Birds", "Emergency Care"]
  };

  const achievements = [
    {
      id: "a1",
      title: "Hero Badge",
      description: "Saved 25+ animals",
      icon: "medal",
      color: "#FFD700",
      progress: 1.0,
      date: "Jan 2025"
    },
    {
      id: "a2",
      title: "Speed Rescuer",
      description: "Response time under 15 mins",
      icon: "flash",
      color: "#FF6B35",
      progress: 0.8,
      date: "Dec 2024"
    },
    {
      id: "a3",
      title: "Community Champion",
      description: "100+ lives touched",
      icon: "people",
      color: "#4ECDC4",
      progress: 1.0,
      date: "Nov 2024"
    },
    {
      id: "a4",
      title: "Night Guardian",
      description: "24/7 Emergency responder",
      icon: "moon",
      color: "#45B7D1",
      progress: 0.6,
      date: "In Progress"
    }
  ];

  const rescueStats = {
    totalRescues: 28,
    successRate: 96,
    averageResponseTime: "12 mins",
    monthlyGoal: 35,
    monthlyProgress: 0.8,
    categories: [
      { name: "Dogs", count: 15, color: "#8B4513" },
      { name: "Cats", count: 8, color: "#FF8C00" },
      { name: "Birds", count: 3, color: "#32CD32" },
      { name: "Others", count: 2, color: "#4169E1" }
    ]
  };

  const dummyRescues = [
    {
      id: "r1",
      title: "Saved a Puppy from Drain",
      image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      date: "12 Mar 2025",
      location: "Delhi, India",
      impact: "Life Saved",
      duration: "2 hours",
      cost: "₹1,200",
      status: "Recovered"
    },
    {
      id: "r2",
      title: "Fed 40+ Stray Dogs in One Day",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6QSbH6DJb5dl3keQpVGijHJxpk44GdUm-HA&s",
      date: "04 Jan 2025",
      location: "Noida, India",
      impact: "Community Care",
      duration: "8 hours",
      cost: "₹2,500",
      status: "Ongoing"
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
      status: "Completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Recovered": return "#4CAF50";
      case "Ongoing": return "#FF9800";
      case "Completed": return "#2196F3";
      default: return "#666";
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Enhanced Profile Banner */}
      <View style={styles.bannerContainer}>
        <ImageBackground
          source={{
            uri: "https://www.onehealth.org/hubfs/blog/what-is-veterinary-social-work.jpg",
          }}
          style={styles.banner}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.bannerOverlay}
          />
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={100}
              source={{
                uri: "https://t3.ftcdn.net/jpg/00/82/95/24/360_F_82952482_4zuOUVaXEmSOckrfuoLSd12cm4b3ZEzU.jpg",
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.title}>{userProfile.title}</Text>
            <View style={styles.profileMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color="#fff" />
                <Text style={styles.metaText}>{userProfile.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color="#fff" />
                <Text style={styles.metaText}>Joined {userProfile.joinDate}</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
        
        {/* Profile Actions */}
        <View style={styles.profileActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color="#8B4513" />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color="#8B4513" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={20} color="#8B4513" />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Enhanced Stats */}
      <Surface style={styles.statsContainer} elevation={4}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>850</Text>
          <Text style={styles.statLabel}>Karma Points</Text>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={16} color="#FFD700" />
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{rescueStats.totalRescues}</Text>
          <Text style={styles.statLabel}>Animals Saved</Text>
          <View style={styles.statIcon}>
            <Ionicons name="heart" size={16} color="#FF6B6B" />
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>103</Text>
          <Text style={styles.statLabel}>Lives Touched</Text>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={16} color="#4ECDC4" />
          </View>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{rescueStats.successRate}%</Text>
          <Text style={styles.statLabel}>Success Rate</Text>
          <View style={styles.statIcon}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          </View>
        </View>
      </Surface>

      {/* Monthly Goals */}
      <Card style={styles.card}>
        <Card.Title
          title="Monthly Goals"
          left={(props) => <List.Icon {...props} icon="target" color="#8B4513" />}
          right={(props) => <IconButton {...props} icon="chevron-right" />}
        />
        <Card.Content>
          <View style={styles.goalContainer}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalText}>
                {Math.round(rescueStats.monthlyProgress * rescueStats.monthlyGoal)} of {rescueStats.monthlyGoal} rescues
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
              {rescueStats.monthlyGoal - Math.round(rescueStats.monthlyProgress * rescueStats.monthlyGoal)} more to reach your goal
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Achievements */}
      <Card style={styles.card}>
        <Card.Title
          title="Achievements"
          left={(props) => <List.Icon {...props} icon="trophy" color="#FFD700" />}
          right={(props) => <IconButton {...props} icon="chevron-right" />}
        />
        <Card.Content>
          <FlatList
            data={achievements}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
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
            )}
          />
        </Card.Content>
      </Card>

      {/* Rescue Categories */}
      <Card style={styles.card}>
        <Card.Title
          title="Rescue Categories"
          left={(props) => <List.Icon {...props} icon="chart-pie" color="#8B4513" />}
        />
        <Card.Content>
          <View style={styles.categoriesContainer}>
            {rescueStats.categories.map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
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
        </Card.Content>
      </Card>

      {/* Professional Info */}
      <Card style={styles.card}>
        <Card.Title
          title="Professional Information"
          left={(props) => <List.Icon {...props} icon="account-tie" color="#8B4513" />}
        />
        <Card.Content>
          <View style={styles.professionalGrid}>
            <View style={styles.professionalItem}>
              <Text style={styles.professionalLabel}>Specializations</Text>
              <View style={styles.specializationChips}>
                {userProfile.specializations.map((spec, index) => (
                  <Chip key={index} style={styles.specChip} textStyle={{ fontSize: 12 }}>
                    {spec}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.professionalItem}>
              <Text style={styles.professionalLabel}>Transport Capacity</Text>
              <Text style={styles.professionalValue}>{userProfile.transportCapacity}</Text>
            </View>
            
            <View style={styles.professionalItem}>
              <Text style={styles.professionalLabel}>Availability</Text>
              <View style={styles.availabilityContainer}>
                <Text style={styles.availabilityText}>
                  {userProfile.availability.days.join(', ')}
                </Text>
                <Text style={styles.availabilityTime}>
                  {userProfile.availability.timeSlots.join(' & ')}
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
        </Card.Content>
      </Card>

      {/* Enhanced Skills */}
      <Card style={styles.card}>
        <Card.Title
          title="Skills & Capabilities"
          left={(props) => <List.Icon {...props} icon="tools" color="#8B4513" />}
        />
        <Card.Content style={styles.skillsContainer}>
          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>Primary Skills</Text>
            <View style={styles.chipContainer}>
              <Chip style={styles.primaryChip} icon="car">Can Transport</Chip>
              <Chip style={styles.primaryChip} icon="medical-bag">Medical Knowledge</Chip>
              <Chip style={styles.primaryChip} icon="paw">Animal Handling</Chip>
            </View>
          </View>
          
          <View style={styles.skillCategory}>
            <Text style={styles.skillCategoryTitle}>Secondary Skills</Text>
            <View style={styles.chipContainer}>
              <Chip style={styles.secondaryChip}>Fundraising</Chip>
              <Chip style={styles.secondaryChip}>Vaccination Support</Chip>
              <Chip style={styles.secondaryChip}>Emergency Response</Chip>
              <Chip style={styles.secondaryChip}>Community Outreach</Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Enhanced Rescue History */}
      <Card style={styles.card}>
        <Card.Title
          title="Recent Rescues"
          left={(props) => <List.Icon {...props} icon="history" color="#8B4513" />}
          right={(props) => <IconButton {...props} icon="chevron-right" />}
        />
        <Card.Content>
          <FlatList
            data={dummyRescues}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={styles.rescueCard}>
                <Card.Cover
                  source={{ uri: item.image }}
                  style={styles.rescueImage}
                />
                <Card.Content style={styles.rescueContent}>
                  <Text style={styles.rescueTitle}>{item.title}</Text>
                  <View style={styles.rescueDetails}>
                    <View style={styles.rescueDetailItem}>
                      <Ionicons name="calendar-outline" size={12} color="#666" />
                      <Text style={styles.rescueDetailText}>{item.date}</Text>
                    </View>
                    <View style={styles.rescueDetailItem}>
                      <Ionicons name="location-outline" size={12} color="#666" />
                      <Text style={styles.rescueDetailText}>{item.location}</Text>
                    </View>
                    <View style={styles.rescueDetailItem}>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text style={styles.rescueDetailText}>{item.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.rescueFooter}>
                    <Chip 
                      style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
                      textStyle={{ color: '#fff', fontSize: 10 }}
                    >
                      {item.status}
                    </Chip>
                    <Text style={styles.rescueCost}>{item.cost}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          />
        </Card.Content>
      </Card>

      {/* Enhanced Settings */}
      <Card style={styles.card}>
        <Card.Title
          title="Preferences & Settings"
          left={(props) => <List.Icon {...props} icon="cog" color="#8B4513" />}
        />
        <Card.Content>
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>Notification Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#8B4513" />
                <Text style={styles.settingLabel}>Auto-Accept Rescues</Text>
              </View>
              <Switch
                value={autoAcceptRescues}
                onValueChange={setAutoAcceptRescues}
                thumbColor={autoAcceptRescues ? "#8B4513" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="alert-circle-outline" size={20} color="#FF4444" />
                <Text style={styles.settingLabel}>Emergency Mode</Text>
              </View>
              <Switch
                value={emergencyMode}
                onValueChange={setEmergencyMode}
                thumbColor={emergencyMode ? "#FF4444" : "#f4f3f4"}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="eye-off-outline" size={20} color="#8B4513" />
                <Text style={styles.settingLabel}>Privacy Mode</Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                thumbColor={isPrivate ? "#8B4513" : "#f4f3f4"}
              />
            </View>
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.settingSection}>
            <Text style={styles.settingSectionTitle}>Range & Language</Text>
            
            <View style={styles.settingRowVertical}>
              <View style={styles.settingLeft}>
                <Ionicons name="location-outline" size={20} color="#8B4513" />
                <Text style={styles.settingLabel}>Notification Range</Text>
              </View>
              <SegmentedButtons
                value={notificationRange}
                onValueChange={setNotificationRange}
                buttons={[
                  { value: "5", label: "5 km" },
                  { value: "25", label: "25 km" },
                  { value: "50", label: "50 km" },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
            
            <View style={styles.settingRowVertical}>
              <View style={styles.settingLeft}>
                <Ionicons name="language-outline" size={20} color="#8B4513" />
                <Text style={styles.settingLabel}>Preferred Language</Text>
              </View>
              <SegmentedButtons
                value={language}
                onValueChange={setLanguage}
                buttons={[
                  { value: "english", label: "English" },
                  { value: "hindi", label: "Hindi" },
                ]}
                style={styles.segmentedButtons}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Enhanced Emergency Contact */}
      <Card style={styles.card}>
        <Card.Title
          title="Emergency Contact"
          left={(props) => <List.Icon {...props} icon="phone" color="#FF4444" />}
        />
        <Card.Content>
          <View style={styles.emergencyContact}>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{userProfile.emergencyContact.name}</Text>
              <Text style={styles.contactRelation}>{userProfile.emergencyContact.relation}</Text>
              <Text style={styles.contactPhone}>{userProfile.emergencyContact.phone}</Text>
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
        </Card.Content>
      </Card>

      {/* Enhanced Referral Program */}
      <Card style={styles.card}>
        <Card.Title
          title="Referral Program"
          left={(props) => <List.Icon {...props} icon="gift" color="#8B4513" />}
        />
        <Card.Content>
          <View style={styles.referralContainer}>
            <View style={styles.referralHeader}>
              <Text style={styles.referralTitle}>Invite Friends & Earn Rewards</Text>
              <Text style={styles.referralDescription}>
                Get 100 karma points for each successful referral
              </Text>
            </View>
            
            <View style={styles.referralCodeContainer}>
              <Text style={styles.referralCodeLabel}>Your Referral Code:</Text>
              <View style={styles.referralCode}>
                <Text style={styles.referralCodeText}>KRAVEN123</Text>
                <IconButton
                  icon="content-copy"
                  size={20}
                  iconColor="#8B4513"
                  onPress={() => {}}
                />
              </View>
            </View>
            
            <View style={styles.referralStats}>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>12</Text>
                <Text style={styles.referralStatLabel}>Invites Sent</Text>
              </View>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>8</Text>
                <Text style={styles.referralStatLabel}>Joined</Text>
              </View>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>800</Text>
                <Text style={styles.referralStatLabel}>Points Earned</Text>
              </View>
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
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8F0",
    flex: 1,
  },
  bannerContainer: {
    position: 'relative',
  },
  banner: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  avatarContainer: {
    alignItems: "center",
    zIndex: 1,
  },
  avatar: {
    borderWidth: 4,
    borderColor: "#fff",
    elevation: 4,
  },
  name: {
    marginTop: 12,
    fontWeight: "bold",
    fontSize: 24,
    color: "#fff",
    textAlign: 'center',
  },
  title: {
    color: "#f0f0f0",
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  profileMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: "#f0f0f0",
    fontSize: 12,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 4,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: "#8B4513",
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
  },
  statBox: {
    alignItems: "center",
    position: 'relative',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statIcon: {
    position: 'absolute',
    top: -4,
    right: -8,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 2,
  },
  goalContainer: {
    gap: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: "#333",
  },
  goalPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#8B4513",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalSubtext: {
    fontSize: 12,
    color: "#666",
  },
  achievementCard: {
    width: 140,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#333",
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 10,
    color: "#666",
    textAlign: 'center',
    marginBottom: 8,
  },
  achievementProgress: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  achievementBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
  },
  achievementDate: {
    fontSize: 10,
    color: "#666",
  },
  categoriesContainer: {
    gap: 12,
  },
  categoryItem: {
    gap: 6,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: "#333",
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#8B4513",
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
  },
  professionalGrid: {
    gap: 16,
  },
  professionalItem: {
    marginBottom: 12,
  },
  professionalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#333",
    marginBottom: 6,
  },
  professionalValue: {
    fontSize: 14,
    color: "#555",
  },
  specializationChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specChip: {
    backgroundColor: '#f0e5da',
    borderRadius: 12,
  },
  availabilityContainer: {
    gap: 4,
  },
  availabilityText: {
    fontSize: 13,
    color: "#444",
  },
  availabilityTime: {
    fontSize: 12,
    color: "#666",
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  certificationText: {
    fontSize: 13,
    color: "#444",
  },
  skillsContainer: {
    gap: 16,
  },
  skillCategory: {
    gap: 6,
  },
  skillCategoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#333",
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  primaryChip: {
    backgroundColor: "#e8f5e9",
  },
  secondaryChip: {
    backgroundColor: "#fce4ec",
  },
  rescueCard: {
    width: 250,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  rescueImage: {
    height: 120,
  },
  rescueContent: {
    gap: 6,
    paddingTop: 8,
  },
  rescueTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#333",
  },
  rescueDetails: {
    gap: 4,
  },
  rescueDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rescueDetailText: {
    fontSize: 12,
    color: "#666",
  },
  rescueFooter: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    height: 22,
    borderRadius: 10,
    justifyContent: 'center',
  },
  rescueCost: {
    fontSize: 12,
    fontWeight: 'bold',
    color: "#8B4513",
  },
  settingSection: {
    marginBottom: 16,
    gap: 12,
  },
  settingSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#333",
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 13,
    color: "#444",
  },
  settingRowVertical: {
    gap: 8,
  },
  segmentedButtons: {
    marginTop: 4,
  },
  settingDivider: {
    marginVertical: 12,
  },
  emergencyContact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    gap: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#333",
  },
  contactRelation: {
    fontSize: 13,
    color: "#666",
  },
  contactPhone: {
    fontSize: 14,
    color: "#8B4513",
  },
  contactActions: {
    flexDirection: 'row',
    gap: 4,
  },
  contactButton: {
    backgroundColor: "#f5f5f5",
  },
  referralContainer: {
    gap: 16,
  },
  referralHeader: {
    gap: 4,
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#333",
  },
  referralDescription: {
    fontSize: 13,
    color: "#666",
  },
  referralCodeContainer: {
    gap: 6,
  },
  referralCodeLabel: {
    fontSize: 13,
    color: "#555",
  },
  referralCode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#f0e5da",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  referralCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: "#8B4513",
  },
  referralStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  referralStat: {
    alignItems: 'center',
  },
  referralStatNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: "#8B4513",
  },
  referralStatLabel: {
    fontSize: 12,
    color: "#666",
  },
  shareButton: {
    marginTop: 8,
    borderRadius: 12,
  },
});
