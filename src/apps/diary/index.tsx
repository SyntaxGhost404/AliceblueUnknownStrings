import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Home from './Home';

const Stack = createStackNavigator();

/** Diary app: the page list; opening a page grows it over the list instead of pushing a screen. */
export default function Diary({ phone, route, setNotiBarColor, setDisableNotiBar }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].diary.colors.notificationBar);
    }, [phone, setNotiBarColor]),
  );

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
        {(props: any) => <Home {...props} phone={phone} setDisableNotiBar={setDisableNotiBar} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
