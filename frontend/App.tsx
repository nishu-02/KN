import React, { useEffect, useState, useMemo } from "react";
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
import store, { RootState, useAppDispatch } from "./core/redux/store";
import { initSession } from "./core/redux/slices/authSlice";
import LoginScreen from "./screens/LoginScreen";
import RegisterPage from "./screens/RegisterScreen";
import RegisterNGOScreen from "./screens/RegisterNGOScreen";
import RegisterIndividualScreen from "./screens/RegisterIndividualScreen";
import NGODashboardScreen from "./screens/NGODashboardScreen";
import UserDashboardScreen from "./screens/user/UploadRescueScreen";
import { registerForPushNotificationsAsync } from "./PushTokenRegister";

// import CameraScreen from "./screens/user/camera/CameraScreen";
import UploadRescueScreen from "./screens/user/camera/UploadRescueScreen";
import SplashScreen from "./screens/user/SplashScreen";

import UserBottomTabs from "./screens/navigation/UserBottomTabs";
import { ThemeContext, lightTheme, darkTheme } from "./theme";

function stripCustomThemeKeys(theme: any) {
  const { cardShadow, spacing, ...rest } = theme;
  return rest;
}

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
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function RootNavigator() {
  const dispatch = useAppDispatch();
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
      notificationListener.remove();
      responseListener.remove();
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
    <>
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
           <Stack.Screen name="BottomTabs" component={UserBottomTabs} />
      <Stack.Screen name="UploadRescue" component={UploadRescueScreen} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true); // <-- Add this
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);
  const toggleTheme = () => setIsDark((prev) => !prev);

  useEffect(() => {
    // Show splash for 2 seconds
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <ReduxProvider store={store}>
        <PaperProvider theme={stripCustomThemeKeys(theme)}>
          <NavigationContainer theme={stripCustomThemeKeys(theme)}>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </ReduxProvider>
    </ThemeContext.Provider>
  );
}
