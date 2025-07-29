import React, { useState } from "react";
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Animated, Modal } from "react-native";
import { Text, Card, Button, ProgressBar, Searchbar, IconButton, Chip, Avatar, Divider, Badge } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemeContext } from '../../theme';

const donationData = [
  {
    id: "1",
    image: "https://images.squarespace-cdn.com/content/v1/5d24f5e3aefb9e000198ee86/1565709204449-141YPXR3S507ZY487LYE/Injured+cat.jpg?format=1000w",
    title: "Rescue Injured Stray Cat",
    description: "Help us treat an injured stray cat needing urgent surgery. This poor soul was found with severe injuries and needs immediate medical attention.",
    ngo: "Paw Protectors NGO",
    raised: 4500,
    goal: 10000,
    deadline: "10 July 2025",
    category: "Medical",
    urgency: "High",
    donors: 45,
    daysLeft: 5,
    story: "Found abandoned with deep wounds, this cat needs surgery to survive. Your donation can save a life.",
    impact: "Will provide surgery, medication, and 2 weeks of care",
    testimonials: [
      { name: "Sarah K.", amount: 500, message: "Hope this helps the little one!" },
      { name: "Mike R.", amount: 200, message: "Every bit counts!" }
    ],
    updates: [
      "Cat admitted to veterinary hospital",
      "Surgery scheduled for tomorrow",
      "Recovery progressing well"
    ],
    verified: true,
    featured: true,
  },
  {
    id: "2",
    image: "https://www.livemint.com/lm-img/img/2025/07/17/600x338/New-Delhi--India--April-08--2020--People-feed-stra_1752723130968_1752723137660.jpg",
    title: "Feed Homeless Dogs",
    description: "Daily meals for over 100 rescued dogs across shelters. Many dogs go hungry without regular feeding programs.",
    ngo: "Brown Paw Foundation",
    raised: 8000,
    goal: 15000,
    deadline: "15 July 2025",
    category: "Food",
    urgency: "Medium",
    donors: 78,
    daysLeft: 10,
    story: "These dogs depend on us for their daily meals. Your contribution ensures they don't go hungry.",
    impact: "Will feed 100 dogs for 3 months",
    testimonials: [
      { name: "Lisa M.", amount: 1000, message: "Happy to help these beautiful souls!" },
      { name: "John D.", amount: 300, message: "Keep up the great work!" }
    ],
    updates: [
      "Food supplies delivered to shelters",
      "New feeding schedule implemented",
      "Dogs showing improved health"
    ],
    verified: true,
    featured: false,
  },
  {
    id: "3",
    image: "https://static.vecteezy.com/system/resources/thumbnails/010/923/973/small/two-homeless-puppies-dogs-sit-together-in-the-grass-photo.jpg",
    title: "Vaccinate Street Pups",
    description: "Support vaccination drive for stray puppies in the city. Prevention is better than cure for these vulnerable animals.",
    ngo: "Safe Tails",
    raised: 3200,
    goal: 7000,
    deadline: "20 July 2025",
    category: "Vaccination",
    urgency: "Medium",
    donors: 32,
    daysLeft: 15,
    story: "These puppies are at risk of deadly diseases. Vaccination can protect them and prevent outbreaks.",
    impact: "Will vaccinate 50 puppies against common diseases",
    testimonials: [
      { name: "Emma W.", amount: 400, message: "Protecting the little ones!" },
      { name: "David L.", amount: 150, message: "Great initiative!" }
    ],
    updates: [
      "Vaccination team assembled",
      "First batch of vaccines procured",
      "Community awareness started"
    ],
    verified: true,
    featured: false,
  },
  {
    id: "4",
    image: "https://nishabd.org/wp-content/uploads/2024/06/Nishabd-blogs-9.jpg",
    title: "Shelter for Abandoned Pets",
    description: "Help us build a new shelter for abandoned pets. Many animals need a safe place to call home.",
    ngo: "Hope for Paws",
    raised: 12000,
    goal: 25000,
    deadline: "25 July 2025",
    category: "Shelter",
    urgency: "Low",
    donors: 95,
    daysLeft: 20,
    story: "This shelter will provide a safe haven for abandoned pets and help them find forever homes.",
    impact: "Will build shelter with capacity for 200 animals",
    testimonials: [
      { name: "Rachel G.", amount: 2000, message: "This is such an important project!" },
      { name: "Tom B.", amount: 800, message: "Can't wait to see it completed!" }
    ],
    updates: [
      "Land acquired for shelter",
      "Construction plans finalized",
      "Building permits obtained"
    ],
    verified: true,
    featured: true,
  },
  {
    id: "5",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbQoV5rL2V_XrHKjy_wksTNL462sFZcxljJ_cLQwzxzK4SAP3twAYfduCFyr-BeWHSRZ0&usqp=CAUr",
    title: "Medical Aid for Injured Cow",
    description: "Urgent surgery and care for an injured stray cow. This gentle giant needs immediate medical attention.",
    ngo: "Animal Aid Unlimited",
    raised: 6000,
    goal: 12000,
    deadline: "30 July 2025",
    category: "Medical",
    urgency: "High",
    donors: 56,
    daysLeft: 25,
    story: "Found with severe injuries, this cow needs specialized care and surgery to recover fully.",
    impact: "Will provide surgery, medication, and rehabilitation",
    testimonials: [
      { name: "Priya S.", amount: 750, message: "Praying for quick recovery!" },
      { name: "Amit K.", amount: 500, message: "Hope this helps!" }
    ],
    updates: [
      "Cow admitted to veterinary hospital",
      "Surgery completed successfully",
      "Recovery progressing well"
    ],
    verified: true,
    featured: false,
  },
];

export default function DonationsScreen() {
  const { theme } = useThemeContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const availableFilters = ["Medical", "Food", "Vaccination", "Shelter"];

  const filteredDonations = donationData.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedFilters.length === 0 || selectedFilters.includes(item.category))
  );

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high": return "#FF4444";
      case "medium": return "#FF9800";
      case "low": return "#4CAF50";
      default: return theme.colors.subtext;
    }
  };

  const renderItem = ({ item }: { item: typeof donationData[0] }) => {
    const progress = item.raised / item.goal;
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <Card style={[styles(theme).card, theme.cardShadow, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]} mode="elevated">
            <View style={styles(theme).imageContainer}>
              <Card.Cover source={{ uri: item.image }} style={styles(theme).cardImage} />
              {item.featured && (
                <View style={styles(theme).featuredBadge}>
                  <Text style={styles(theme).featuredText}>FEATURED</Text>
                </View>
              )}
              {item.verified && (
                <View style={styles(theme).verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="white" />
                </View>
              )}
              <View style={[styles(theme).urgencyBadge, { backgroundColor: getUrgencyColor(item.urgency) }]}>
                <Text style={styles(theme).urgencyText}>{item.urgency.toUpperCase()}</Text>
              </View>
            </View>
            
            <Card.Content>
              <View style={styles(theme).headerRow}>
                <Text variant="titleLarge" style={[styles(theme).title, { color: theme.colors.text }]}>{item.title}</Text>
                <Chip style={[styles(theme).categoryChip, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]} textStyle={[styles(theme).categoryChipText, { color: theme.colors.primary }]}>{item.category}</Chip>
              </View>
              
              <Text variant="bodyMedium" style={[styles(theme).description, { color: theme.colors.subtext }]}>{item.description}</Text>
              
              <View style={styles(theme).storySection}>
                <Text style={[styles(theme).sectionTitle, { color: theme.colors.text }]}>Story:</Text>
                <Text style={[styles(theme).storyText, { color: theme.colors.subtext }]}>{item.story}</Text>
              </View>
              
              <View style={styles(theme).impactSection}>
                <Text style={[styles(theme).sectionTitle, { color: theme.colors.text }]}>Impact:</Text>
                <Text style={[styles(theme).impactText, { color: theme.colors.subtext }]}>{item.impact}</Text>
              </View>
              
              <View style={styles(theme).statsRow}>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{item.donors}</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Donors</Text>
                </View>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{item.daysLeft}</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Days Left</Text>
                </View>
                <View style={styles(theme).statItem}>
                  <Text style={[styles(theme).statNumber, { color: theme.colors.primary }]}>{Math.round(progress * 100)}%</Text>
                  <Text style={[styles(theme).statLabel, { color: theme.colors.subtext }]}>Funded</Text>
                </View>
              </View>
              
              <ProgressBar progress={progress} color={theme.colors.primary} style={styles(theme).progress} />
              <Text style={[styles(theme).raised, { color: theme.colors.text }]}>₹{item.raised.toLocaleString()} raised of ₹{item.goal.toLocaleString()}</Text>
              
              <Divider style={styles(theme).divider} />
              
              <View style={styles(theme).testimonialsSection}>
                <Text style={[styles(theme).sectionTitle, { color: theme.colors.text }]}>Recent Donors:</Text>
                {item.testimonials.map((testimonial, index) => (
                  <View key={index} style={styles(theme).testimonialItem}>
                    <Avatar.Text size={24} label={testimonial.name.charAt(0)} style={{ backgroundColor: theme.colors.primary }} />
                    <View style={styles(theme).testimonialContent}>
                      <Text style={[styles(theme).testimonialName, { color: theme.colors.text }]}>{testimonial.name}</Text>
                      <Text style={[styles(theme).testimonialAmount, { color: theme.colors.primary }]}>₹{testimonial.amount}</Text>
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles(theme).updatesSection}>
                <Text style={[styles(theme).sectionTitle, { color: theme.colors.text }]}>Updates:</Text>
                {item.updates.slice(0, 2).map((update, index) => (
                  <View key={index} style={styles(theme).updateItem}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={theme.colors.primary} />
                    <Text style={[styles(theme).updateText, { color: theme.colors.subtext }]}>{update}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={[styles(theme).deadline, { color: theme.colors.subtext }]}>Deadline: {item.deadline}</Text>
            </Card.Content>
            
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor={theme.colors.primary}
                textColor={theme.colors.card}
                style={styles(theme).button}
                icon="heart"
              >
                Donate Now
              </Button>
            </Card.Actions>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <View style={[styles(theme).container, { backgroundColor: theme.colors.background }]}> 
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.card, theme.colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles(theme).header}
      >
        <View style={styles(theme).headerContent}>
          <Text style={[styles(theme).karunaTitle, { color: theme.colors.primary }]}>Donations</Text>
          <View style={styles(theme).headerIcons}>
            <IconButton
              icon="filter"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setFilterModalVisible(true)}
            />
            <IconButton
              icon="magnify"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setSearchActive(true)}
            />
          </View>
        </View>
        {searchActive && (
          <Searchbar
            placeholder="Search donations..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles(theme).searchBarExpanded, { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary }]}
            iconColor={theme.colors.primary}
            inputStyle={{ color: theme.colors.text }}
            autoFocus
            onBlur={() => setSearchActive(false)}
          />
        )}
      </LinearGradient>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles(theme).modalContainer}>
          <View style={[styles(theme).modalContent, { backgroundColor: theme.colors.card }]}> 
            <Text variant="titleLarge" style={[styles(theme).modalTitle, { color: theme.colors.primary }]}>Filter Donations</Text>
            <View style={styles(theme).filterRow}>
              {availableFilters.map((filter) => (
                <Chip
                  key={filter}
                  style={[
                    styles(theme).filterChip,
                    { backgroundColor: theme.colors.accent, borderColor: theme.colors.secondary },
                    selectedFilters.includes(filter) && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                  ]}
                  textStyle={[styles(theme).filterChipText, { color: theme.colors.text }]}
                  onPress={() => toggleFilter(filter)}
                >
                  {filter}
                </Chip>
              ))}
            </View>
            <Button
              mode="contained"
              buttonColor={theme.colors.primary}
              textColor={theme.colors.card}
              style={styles(theme).modalButton}
              onPress={() => setFilterModalVisible(false)}
            >
              Apply Filters
            </Button>
          </View>
        </View>
      </Modal>

      {/* Donation List */}
      <FlatList
        data={filteredDonations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles(theme).listContent}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: theme.spacing.margin * 3,
  },
  header: {
    paddingHorizontal: theme.spacing.padding,
    paddingTop: 40,
    paddingBottom: theme.spacing.padding - 2,
    borderBottomLeftRadius: theme.spacing.radius,
    borderBottomRightRadius: theme.spacing.radius,
    elevation: 8,
    zIndex: 10,
    backgroundColor: theme.colors.tabBackground1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  karunaTitle: {
    fontWeight: "bold",
    fontSize: 28,
    fontFamily: "cursive",
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarExpanded: {
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    height: 48,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    borderWidth: 1,
  },
  filterChipText: {
    fontWeight: "500",
  },
  modalButton: {
    borderRadius: 8,
  },
  listContent: {
    padding: theme.spacing.padding,
    paddingBottom: theme.spacing.margin * 2.5,
  },
  card: {
    marginBottom: theme.spacing.margin,
    borderRadius: theme.spacing.radius,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: theme.spacing.radius,
    borderTopRightRadius: theme.spacing.radius,
  },
  featuredBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 4,
  },
  urgencyBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  title: {
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  description: {
    marginBottom: 12,
    lineHeight: 20,
  },
  storySection: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  storyText: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.subtext,
  },
  impactSection: {
    marginBottom: 12,
  },
  impactText: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.subtext,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.accent,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  progress: {
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
  raised: {
    fontWeight: "500",
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: theme.colors.accent,
  },
  testimonialsSection: {
    marginBottom: 12,
  },
  testimonialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  testimonialContent: {
    marginLeft: 8,
    flex: 1,
  },
  testimonialName: {
    fontSize: 12,
    fontWeight: '500',
  },
  testimonialAmount: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  updatesSection: {
    marginBottom: 12,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  updateText: {
    fontSize: 12,
    marginLeft: 6,
    color: theme.colors.subtext,
  },
  deadline: {
    marginBottom: 8,
    fontStyle: 'italic',
  },
  categoryChip: {
    borderWidth: 1,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 12,
  },
  button: {
    borderRadius: 8,
  },
});