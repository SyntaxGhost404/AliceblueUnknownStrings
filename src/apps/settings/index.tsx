import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Home from './Home';

const Stack = createStackNavigator();

/** Settings app (both phones): a single stack screen, themed per phone. */
export default function Settings({ phone, route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].settings.colors.notificationBar);
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
      <Stack.Screen name="home">{(props: any) => <Home {...props} phone={phone} />}</Stack.Screen>
    </Stack.Navigator>
  );
}
