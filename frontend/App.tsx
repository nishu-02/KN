import { View, Text } from 'react-native'
import LoginScreen from './screens/login'
import React from 'react'

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LoginScreen />
    </View>
  )
}