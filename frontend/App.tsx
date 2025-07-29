import React, { useEffect, useState, useMemo, useCallback } from "react";
import { StatusBar, View } from "react-native";
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
import { createStackNavigator } from "@react-navigation/stack";
import * as Notifications from "expo-notifications";
import store, { RootState, useAppDispatch } from "./core/redux/store";
import { initSession } from "./core/redux/slices/authSlice";
import LoginScreen from "./screens/LoginScreen";
import NGODashboardScreen from "./screens/ngo/NGODashboardScreen";
import { registerForPushNotificationsAsync } from "./PushTokenRegister";

import UploadRescueScreen from "./screens/user/camera/UploadRescueScreen";
import SplashScreen from "./screens/user/SplashScreen";
import SettingsScreen from './screens/user/SettingsScreen';
import NotificationScreen from './screens/user/NotificationScreen';

import UserBottomTabs from "./screens/navigation/UserBottomTabs";
import { ThemeContext, lightTheme, darkTheme } from "./theme";

function stripCustomThemeKeys(theme: any) {
  const { cardShadow, spacing, ...rest } = theme;
  return rest;
}

const Stack = createStackNavigator();

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

// Move RootNavigator outside App component to prevent recreation
const RootNavigator = React.memo(() => {
  const dispatch = useAppDispatch();
  const { initialized, authenticated, loading, user, accountType } = useSelector(
    (s: RootState) => s.auth
  );

  // Memoize the initialization effect
  const initializeSession = useCallback(() => {
    dispatch(initSession());
  }, [dispatch]);

  useEffect(() => {
    // Initialize session on app start
    initializeSession();
  }, [initializeSession]);

  // Memoize push notification registration
  const registerNotifications = useCallback(() => {
    if (authenticated && user?.$id) {
      registerForPushNotificationsAsync(user.$id);
    }
  }, [authenticated, user]);

  // Register for push notifications when user is authenticated
  useEffect(() => {
    registerNotifications();
  }, [registerNotifications]);

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
        <View style={{ flex: 1 }}>
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
        </View>
      </PaperProvider>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {!authenticated ? (
          <Stack.Screen
            name="SignIn"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : accountType === 'ngo' ? (
          <>
            <Stack.Screen
              name="NGOAdminDashboard"
              component={NGODashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="UserHome"
              component={UserBottomTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="UploadRescue" component={UploadRescueScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
            <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
});

RootNavigator.displayName = 'RootNavigator';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark]);
  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

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
