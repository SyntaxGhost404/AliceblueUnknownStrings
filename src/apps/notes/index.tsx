import React, { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import theme from '../../theme/theme';
import { AppProps } from '../types';
import Home from './Home';
import NoteContainer from './NoteContainer';

const Stack = createStackNavigator();

/** Notes app (Adam's phone): the list and a single-note editor sliding over it. */
export default function Notes({ phone, route, setNotiBarColor }: AppProps) {
  useFocusEffect(
    useCallback(() => {
      setNotiBarColor((theme as any)[phone].notes.colors.notificationBar);
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
      <Stack.Screen name="note">{(props: any) => <NoteContainer {...props} phone={phone} />}</Stack.Screen>
    </Stack.Navigator>
  );
}
