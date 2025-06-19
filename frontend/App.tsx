import { View, Text } from 'react-native'
import LoginScreen from './screens/LoginScreen'
import React from 'react'
import RegisterPage from './screens/register'

export default function App() {
  return (
    <View style={{ flex: 1}}>
      {/* <RegisterPage /> */}
      <LoginScreen />
    </View>
  )
}