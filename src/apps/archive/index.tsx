import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Home from './Home';
import Tasks from './Tasks';
import Characters from './Characters';
import Character from './Character';
import Recaps from './Recaps';
import Recap from './Recap';

const Stack = createStackNavigator();

/** Archive app (Adam's phone): hub of case tools — tasks, characters, timeline and recaps. */
export default function Archive({ route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor(theme.myphone.archive.colors.notificationBar);
    }, [setNotiBarColor]),
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
      <Stack.Screen name="home" component={Home} />
      <Stack.Screen name="tasks" component={Tasks} />
      <Stack.Screen name="characters" component={Characters} />
      <Stack.Screen name="character" component={Character} />
      <Stack.Screen name="recaps" component={Recaps} />
      <Stack.Screen name="recap" component={Recap} />
    </Stack.Navigator>
  );
}
