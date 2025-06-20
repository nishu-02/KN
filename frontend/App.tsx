import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import store, { RootState } from './core/redux/store';
import { setUser, setInitialized } from './core/redux/slices/authSlice';
import AppwriteService from './appwrite/service';

import LoginScreen from './screens/LoginScreen';
// import SplashScreen from './src/screens/SplashScreen';
// import SignInScreen from './src/screens/SignInScreen';
// import SignUpScreen from './src/screens/SignUpScreen';
// import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: 'white' } };

function RootNavigator() {
  const dispatch = useDispatch();
  const { initialized, authenticated } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    (async () => {
      const svc = new AppwriteService();
      try {
        const user = await svc.getCurrentUser();
        if (user) {
          dispatch(setUser({ id: user.$id, name: user.name, email: user.email }));
        }
      } catch (err) {
        console.log("No active session");
      } finally {
        dispatch(setInitialized(true));
      }
    })();
  }, []);

  if (!initialized) return null; // or a loading screen

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator>
        {!authenticated ? (
          <>
            <Stack.Screen name="SignIn" component={LoginScreen} options={{ headerShown: false }} />
            {/* <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} /> */}
          </>
        ) : (
          <>
            {/* <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} /> */}
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
        <RootNavigator/>
      </PaperProvider>
    </ReduxProvider>
  );
}
