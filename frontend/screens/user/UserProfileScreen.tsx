import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList,
  Image,
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
} from "react-native-paper";

export default function UserProfileScreen() {
  const [notificationRange, setNotificationRange] = useState("25");
  const [isPrivate, setIsPrivate] = useState(false);
  const [language, setLanguage] = useState("english");

  const dummyRescues = [
    {
      id: "r1",
      title: "Saved a Puppy from Drain",
      image:
        "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      date: "12 Mar 2025",
      location: "Delhi, India",
    },
    {
      id: "r2",
      title: "Fed 40+ Stray Dogs in One Day",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6QSbH6DJb5dl3keQpVGijHJxpk44GdUm-HA&s",
      date: "04 Jan 2025",
      location: "Noida, India",
    },
    {
      id: "r3",
      title: "Helped with Dog Vaccination Drive",
      image: "https://placebear.com/300/200",
      date: "25 Dec 2024",
      location: "Gurgaon, India",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Profile Banner */}
      <ImageBackground
        source={{
          uri: "https://www.onehealth.org/hubfs/blog/what-is-veterinary-social-work.jpg",
        }}
        style={styles.banner}
        resizeMode="cover"
      >
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={90}
            source={{
              uri: "https://t3.ftcdn.net/jpg/00/82/95/24/360_F_82952482_4zuOUVaXEmSOckrfuoLSd12cm4b3ZEzU.jpg",
            }}
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.title}>Animal Rescuer | Community Volunteer</Text>
        </View>
      </ImageBackground>

      {/* Badges and Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>850</Text>
          <Text style={styles.statLabel}>User Points</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>Animals Saved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>103</Text>
          <Text style={styles.statLabel}>Lives Touched</Text>
        </View>
      </View>

      {/* Skill Tags */}
      <Card style={styles.card}>
        <Card.Title
          title="Your Skills"
          left={(props) => <List.Icon {...props} icon="tools" />}
        />
        <Card.Content style={styles.chipContainer}>
          <Chip style={styles.chip}>Can Transport</Chip>
          <Chip style={styles.chip}>Medical Knowledge</Chip>
          <Chip style={styles.chip}>Animal Handling</Chip>
          <Chip style={styles.chip}>Fundraising</Chip>
          <Chip style={styles.chip}>Vaccination Support</Chip>
        </Card.Content>
      </Card>

      {/* Rescue History */}
      <Card style={styles.card}>
        <Card.Title
          title="Recent Rescues"
          left={(props) => <List.Icon {...props} icon="paw" />}
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
                <Card.Content>
                  <Text variant="titleSmall">{item.title}</Text>
                  <Text style={styles.meta}>
                    {item.date} • {item.location}
                  </Text>
                </Card.Content>
              </Card>
            )}
          />
        </Card.Content>
      </Card>

      {/* Rescue Heatmap */}
      <Card style={styles.card}>
        <Card.Title
          title="Rescue Heatmap"
          left={(props) => <List.Icon {...props} icon="map" />}
        />
        <Card.Content>
          <Image
            source={{
              uri: "https://raw.githubusercontent.com/plotly/datasets/master/images/heatmap_example.png",
            }}
            style={{ height: 180, width: "100%", borderRadius: 12 }}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.card}>
        <Card.Title
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog" />}
        />
        <Card.Content>
          <View style={styles.settingRow}>
            <Text>Privacy Mode</Text>
            <Switch
              value={isPrivate}
              onValueChange={() => setIsPrivate(!isPrivate)}
            />
          </View>
          <View style={styles.settingRow}>
            <Text>Notification Range</Text>
            <SegmentedButtons
              value={notificationRange}
              onValueChange={(val) => setNotificationRange(val)}
              buttons={[
                { value: "5", label: "5 km" },
                { value: "25", label: "25 km" },
                { value: "50", label: "50 km" },
              ]}
            />
          </View>
          <View style={styles.settingRow}>
            <Text>Preferred Language</Text>
            <SegmentedButtons
              value={language}
              onValueChange={setLanguage}
              buttons={[
                { value: "english", label: "English" },
                { value: "hindi", label: "Hindi" },
              ]}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Emergency Contact */}
      <Card style={styles.card}>
        <Card.Title
          title="Emergency Contact"
          left={(props) => <List.Icon {...props} icon="phone" />}
        />
        <Card.Content>
          <Text>Name: Rescue Admin</Text>
          <Text>Phone: +91-9876543210</Text>
          <Button mode="outlined" style={{ marginTop: 8 }}>
            Edit Contact
          </Button>
        </Card.Content>
      </Card>

      {/* Referral Code */}
      <Card style={styles.card}>
        <Card.Title
          title="Referral Program"
          left={(props) => <List.Icon {...props} icon="gift" />}
        />
        <Card.Content>
          <Text>Share your code & earn rewards:</Text>
          <Chip style={styles.chip}>KRAVEN123</Chip>
          <Button
            icon="share-variant"
            mode="contained"
            style={{ marginTop: 10 }}
            buttonColor="#8B4513"
          >
            Share Now
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF5E1",
    flex: 1,
  },
  banner: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    // backgroundColor: "rgba(255,255,255,0.8)",
    backgroundColor: "transparent",
    padding: 10,
    borderRadius: 12,
  },
  name: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 18,
    color: "#5C4033",
    textShadowColor: "white",
    textShadowRadius: 10,
  },
  title: {
    color: "#6B4F3A",
    fontStyle: "italic",
    textShadowColor: "white",
    fontWeight: "condensed",
    textShadowRadius: 10,
  },
  statsContainer: {
    paddingLeft: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingVertical: 10,
    backgroundColor: "#FDF1DC",
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },
  statLabel: {
    fontSize: 12,
    color: "#7B5B3B",
  },
  card: {
    backgroundColor: "#FAF3E0",
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: "#EED8B9",
  },
  rescueCard: {
    width: 200,
    marginRight: 12,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
  },
  rescueImage: {
    height: 120,
  },
  meta: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
  },
  heatmap: {
    height: 150,
    width: "100%",
    borderRadius: 10,
    marginTop: 8,
  },
  settingRow: {
    marginVertical: 8,
  },
});
