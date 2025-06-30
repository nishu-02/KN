import React, { useEffect } from "react";
import { StatusBar } from "react-native";
import {
  Provider as ReduxProvider,
  useDispatch,
  useSelector,
} from "react-redux";

import {
  Provider as PaperProvider,
  ActivityIndicator,
} from "react-native-paper";

import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import store, { RootState } from "./core/redux/store";
import { initSession } from "./core/redux/slices/authSlice";
import LoginScreen from "./screens/LoginScreen";
import RegisterPage from "./screens/RegisterScreen";
import RegisterNGOScreen from "./screens/RegisterNGOScreen";
import RegisterIndividualScreen from "./screens/RegisterIndividualScreen";
import NGODashboardScreen from "./screens/NGODashboardScreen";
import UserDashboardScreen from "./screens/user/UploadRescueScreen";
import { registerForPushNotificationsAsync } from "./PushTokenRegister";

import UserBottomTabs from "./screens/navigation/UserBottomTabs";


const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
  },
};

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function RootNavigator() {
  ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  });
  const dispatch = useDispatch();
  const { initialized, authenticated, loading, user } = useSelector(
    (s: RootState) => s.auth
  );

  useEffect(() => {
    // Initialize session on app start
    dispatch(initSession());
  }, [dispatch]);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    if (authenticated && user?.$id) {
      registerForPushNotificationsAsync(user.$id);
    }
  }, [authenticated, user]);

  // Set up notification listeners
  useEffect(() => {
    // Handle notification received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    // Handle notification response (when user taps on notification)
    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // navigation.navigate('SpecificScreen', { data: response.notification.request.content.data });
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Show loading screen while initializing
  if (!initialized || loading) {
    return (
      <PaperProvider>
        <StatusBar barStyle="dark-content" />
        <React.Fragment>
          <ActivityIndicator
            animating
            size="large"
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 100,
            }}
          />
        </React.Fragment>
      </PaperProvider>
    );
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {!authenticated ? (
          <>
            <Stack.Screen
              name="SignIn"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterPage}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterNGO"
              component={RegisterNGOScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterIndividual"
              component={RegisterIndividualScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="UserHome"
              component={UserBottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NGODashboard"
              component={NGODashboardScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <RootNavigator />
      </PaperProvider>
    </ReduxProvider>
  );
}
