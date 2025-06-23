import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { Provider as PaperProvider, ActivityIndicator } from 'react-native-paper';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import store, { RootState } from './core/redux/store';
import { initSession } from './core/redux/slices/authSlice';
import LoginScreen from './screens/LoginScreen';
import RegisterPage from './screens/RegisterScreen';
import RegisterNGOScreen from './screens/RegisterNGOScreen';
import RegisterIndividualScreen from './screens/RegisterIndividualScreen';
import NGODashboardScreen from './screens/NGODashboardScreen';
import UserDashboardScreen from './screens/UserDashboardScreen';

const Stack = createNativeStackNavigator();
const theme = { 
  ...DefaultTheme, 
  colors: { 
    ...DefaultTheme.colors, 
    background: 'white' 
  } 
};

function RootNavigator() {
  const dispatch = useDispatch();
  const { initialized, authenticated, loading } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    // Initialize session on app start
    dispatch(initSession());
  }, [dispatch]);

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
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: 100 
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
              name="UserDashboard"
              component={UserDashboardScreen}
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