import React from 'react';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { AppProps } from '../types';
import File from './File';
import Home from './Home';

const Stack = createStackNavigator();

/** Files app: the file list and a viewer that slides in over it. */
export default function Files({ phone, route, setNotiBarColor }: AppProps) {
  return (
    <Stack.Navigator
      initialRouteName="home"
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
        cardStyleInterpolator: route.params?.disabledAnim
          ? CardStyleInterpolators.forNoAnimation
          : CardStyleInterpolators.forHorizontalIOS,
        cardStyle: { backgroundColor: 'transparent', opacity: 1 },
      }}>
      <Stack.Screen name="home">
        {(props: any) => <Home {...props} phone={phone} setNotiBarColor={setNotiBarColor} />}
      </Stack.Screen>
      <Stack.Screen name="file">
        {(props: any) => <File {...props} phone={phone} setNotiBarColor={setNotiBarColor} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
