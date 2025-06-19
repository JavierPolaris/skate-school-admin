import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../LoginScreen';
import StudentDashboardScreen from '../StudentDashboardScreen';
import StudentClassesScreen from '../StudentClassesScreen';
import StudentPaymentsScreen from '../StudentPaymentsScreen';
import StudentTricksScreen from '../StudentTricksScreen';

export type RootStackParamList = {
  Login: undefined;
  StudentDashboard: undefined;
  StudentClasses: undefined;
  StudentPayments: undefined;
  StudentTricks: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
        <Stack.Screen name="StudentClasses" component={StudentClassesScreen} />
        <Stack.Screen name="StudentPayments" component={StudentPaymentsScreen} />
        <Stack.Screen name="StudentTricks" component={StudentTricksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
